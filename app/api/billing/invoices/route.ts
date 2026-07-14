// app/api/billing/invoices/route.ts
// API para listar y crear facturas

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole, validateTenantAccess } from '@/lib/auth/protect';
import { facturaSchema } from '@/lib/financial/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/billing/invoices
 * Listar facturas del consultorio con filtros opcionales
 */
export async function GET(request: NextRequest) {
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
    const pacientId = request.nextUrl.searchParams.get('pacienteId');
    const estado = request.nextUrl.searchParams.get('estado');
    const desde = request.nextUrl.searchParams.get('desde');
    const hasta = request.nextUrl.searchParams.get('hasta');

    let query = supabase
      .from('facturas')
      .select(`
        *,
        pacientes(id, nombre, apellidos),
        users(id, full_name)
      `)
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true)
      .order('numero_factura', { ascending: false });

    if (pacientId) {
      query = query.eq('paciente_id', pacientId);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (desde) {
      query = query.gte('fecha_emision', desde);
    }

    if (hasta) {
      query = query.lte('fecha_emision', hasta);
    }

    const { data: facturas, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener facturas' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        facturas: facturas || [],
        count: facturas?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/billing/invoices
 * Crear nueva factura
 */
export async function POST(request: NextRequest) {
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
    const validation = facturaSchema.safeParse(body);

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

    // Verificar que el paciente existe en el tenant
    const { data: paciente } = await supabase
      .from('pacientes')
      .select('id')
      .eq('id', validation.data.paciente_id)
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true)
      .single();

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Calcular totales
    let subtotal = 0;
    let total_descuentos = 0;

    for (const item of validation.data.items) {
      const subtotal_item = item.cantidad * item.precio_unitario;
      const descuento_item = 
        ((item.descuento_porcentaje || 0) / 100) * subtotal_item + (item.descuento_monto || 0);
      subtotal += subtotal_item - descuento_item;
      total_descuentos += descuento_item;
    }

    const descuento_global = validation.data.descuento_global || 0;
    const subtotal_final = subtotal - descuento_global;
    const total_factura = Math.max(0, subtotal_final);

    // Obtener siguiente número de factura
    const { data: lastInvoice } = await supabase
      .from('facturas')
      .select('numero_factura')
      .eq('tenant_id', user!.tenantId)
      .order('numero_factura', { ascending: false })
      .limit(1)
      .single();

    const numero_factura = (lastInvoice?.numero_factura || 0) + 1;

    // Crear factura
    const { data: factura, error: insertError } = await supabase
      .from('facturas')
      .insert({
        tenant_id: user!.tenantId,
        numero_factura,
        paciente_id: validation.data.paciente_id,
        user_id: user!.id,
        subtotal,
        total_descuentos,
        descuento_global,
        total_factura,
        estado: 'emitida',
        metodo_pago: validation.data.metodo_pago,
        notas: validation.data.notas || null,
        fecha_emision: new Date().toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Error al crear factura' },
        { status: 500 }
      );
    }

    // Insertar ítems de la factura
    const itemsData = validation.data.items.map((item) => ({
      factura_id: factura.id,
      descripcion: item.descripcion,
      cantidad: item.cantidad,
      precio_unitario: item.precio_unitario,
      descuento_porcentaje: item.descuento_porcentaje || 0,
      descuento_monto: item.descuento_monto || 0,
      subtotal: item.cantidad * item.precio_unitario,
      is_active: true,
    }));

    const { error: itemsError } = await supabase
      .from('factura_items')
      .insert(itemsData);

    if (itemsError) {
      console.error('Database error:', itemsError);
      // Eliminar factura si falla inserción de ítems
      await supabase.from('facturas').delete().eq('id', factura.id);
      return NextResponse.json(
        { error: 'Error al agregar ítems a la factura' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Factura creada exitosamente',
        factura,
        numero_factura: numero_factura,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
