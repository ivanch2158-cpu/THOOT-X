// app/api/billing/invoices/[id]/route.ts
// API para operaciones individuales de facturas

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole, validateTenantAccess } from '@/lib/auth/protect';
import { pagoSchema } from '@/lib/financial/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/billing/invoices/[id]
 * Obtener detalles de una factura con sus ítems
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);

    if (!isValid) {
      return response!;
    }

    const supabase = await createServerClient();

    // Obtener factura
    const { data: factura, error: facError } = await supabase
      .from('facturas')
      .select(`
        *,
        pacientes(id, nombre, apellidos, email, telefono),
        users(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (facError || !factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, factura.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta factura' },
        { status: 403 }
      );
    }

    // Obtener ítems de la factura
    const { data: items } = await supabase
      .from('factura_items')
      .select('*')
      .eq('factura_id', params.id)
      .eq('is_active', true);

    // Obtener pagos registrados
    const { data: pagos } = await supabase
      .from('pagos')
      .select('*')
      .eq('factura_id', params.id)
      .eq('is_active', true)
      .order('fecha_pago', { ascending: false });

    return NextResponse.json(
      {
        factura,
        items: items || [],
        pagos: pagos || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get invoice error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/billing/invoices/[id]
 * Registrar pago en factura
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);

    if (!isValid) {
      return response!;
    }

    const body = await request.json();
    const validation = pagoSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const supabase = await createServerClient();

    // Verificar que la factura existe
    const { data: factura } = await supabase
      .from('facturas')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, factura.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta factura' },
        { status: 403 }
      );
    }

    // Obtener pagos previos
    const { data: pagosPrevios } = await supabase
      .from('pagos')
      .select('monto')
      .eq('factura_id', params.id)
      .eq('is_active', true);

    const monto_pagado = (pagosPrevios || []).reduce(
      (sum, pago) => sum + pago.monto,
      0
    );

    const monto_pendiente = factura.total_factura - monto_pagado;

    if (validation.data.monto > monto_pendiente) {
      return NextResponse.json(
        {
          error: `Monto excede saldo pendiente. Pendiente: S/. ${monto_pendiente.toFixed(2)}`,
        },
        { status: 400 }
      );
    }

    // Registrar pago
    const { data: pago, error: pagoError } = await supabase
      .from('pagos')
      .insert({
        factura_id: params.id,
        monto: validation.data.monto,
        metodo_pago: validation.data.metodo_pago,
        referencia: validation.data.referencia || null,
        notas: validation.data.notas || null,
        registrado_por: user!.id,
        fecha_pago: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (pagoError) {
      console.error('Database error:', pagoError);
      return NextResponse.json(
        { error: 'Error al registrar pago' },
        { status: 500 }
      );
    }

    // Calcular nuevo estado de la factura
    const nuevo_monto_pagado = monto_pagado + validation.data.monto;
    const nuevo_estado =
      nuevo_monto_pagado >= factura.total_factura
        ? 'pagada'
        : 'parcial';

    // Actualizar estado de factura
    const { error: updateError } = await supabase
      .from('facturas')
      .update({
        estado: nuevo_estado,
        monto_pagado: nuevo_monto_pagado,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Database error:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar factura' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Pago registrado exitosamente',
        pago,
        nuevo_estado,
        monto_pendiente_actualizado: Math.max(
          0,
          factura.total_factura - nuevo_monto_pagado
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update invoice error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/billing/invoices/[id]
 * Eliminar factura (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
    ]);

    if (!isValid) {
      return response!;
    }

    const supabase = await createServerClient();

    // Verificar que la factura existe
    const { data: factura } = await supabase
      .from('facturas')
      .select('tenant_id, estado')
      .eq('id', params.id)
      .single();

    if (!factura) {
      return NextResponse.json(
        { error: 'Factura no encontrada' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, factura.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta factura' },
        { status: 403 }
      );
    }

    // No permitir eliminar facturas pagadas
    if (factura.estado === 'pagada') {
      return NextResponse.json(
        {
          error: 'No puedes eliminar una factura pagada',
        },
        { status: 400 }
      );
    }

    // Soft delete de factura
    const { error: deleteError } = await supabase
      .from('facturas')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user!.id,
      })
      .eq('id', params.id);

    if (deleteError) {
      console.error('Database error:', deleteError);
      return NextResponse.json(
        { error: 'Error al eliminar factura' },
        { status: 500 }
      );
    }

    // Soft delete de ítems asociados
    await supabase
      .from('factura_items')
      .update({ is_active: false })
      .eq('factura_id', params.id);

    return NextResponse.json(
      { message: 'Factura eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete invoice error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
