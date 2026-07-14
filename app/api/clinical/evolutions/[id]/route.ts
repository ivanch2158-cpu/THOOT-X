// app/api/clinical/evolutions/[id]/route.ts
// API para operaciones individuales de evoluciones (GET, PUT, DELETE)

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole, validateTenantAccess } from '@/lib/auth/protect';
import { evolucionSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/clinical/evolutions/[id]
 * Obtener detalles de una evolución
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
    ]);

    if (!isValid) {
      return response;
    }

    const supabase = await createServerClient();

    const { data: evolution, error } = await supabase
      .from('evoluciones')
      .select(`
        *,
        users(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !evolution) {
      return NextResponse.json(
        { error: 'Evolución no encontrada' },
        { status: 404 }
      );
    }

    // Validar acceso al tenant
    if (!validateTenantAccess(user!.tenantId, evolution.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta evolución' },
        { status: 403 }
      );
    }

    return NextResponse.json(evolution, { status: 200 });
  } catch (error) {
    console.error('Get evolution error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/clinical/evolutions/[id]
 * Actualizar evolución
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
    ]);

    if (!isValid) {
      return response;
    }

    const body = await request.json();
    const validation = evolucionSchema.safeParse(body);

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

    // Verificar que la evolución existe
    const { data: evolution } = await supabase
      .from('evoluciones')
      .select('tenant_id, user_id')
      .eq('id', params.id)
      .single();

    if (!evolution) {
      return NextResponse.json(
        { error: 'Evolución no encontrada' },
        { status: 404 }
      );
    }

    // Validar acceso
    if (!validateTenantAccess(user!.tenantId, evolution.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta evolución' },
        { status: 403 }
      );
    }

    // Actualizar evolución
    const { data: updated, error } = await supabase
      .from('evoluciones')
      .update({
        diagnostico: validation.data.diagnostico,
        tratamiento_realizado: validation.data.tratamiento_realizado,
        observaciones: validation.data.observaciones || null,
        proxima_cita_recomendada: validation.data.proxima_cita_recomendada || null,
        presion_arterial: validation.data.presion_arterial || null,
        frecuencia_cardiaca: validation.data.frecuencia_cardiaca || null,
        temperatura: validation.data.temperatura || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar evolución' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Evolución actualizada exitosamente',
        evolution: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update evolution error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/clinical/evolutions/[id]
 * Eliminar evolución (soft delete)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
    ]);

    if (!isValid) {
      return response;
    }

    const supabase = await createServerClient();

    // Verificar que la evolución existe
    const { data: evolution } = await supabase
      .from('evoluciones')
      .select('tenant_id')
      .eq('id', params.id)
      .single();

    if (!evolution) {
      return NextResponse.json(
        { error: 'Evolución no encontrada' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, evolution.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta evolución' },
        { status: 403 }
      );
    }

    // Soft delete
    const { error } = await supabase
      .from('evoluciones')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user!.id,
      })
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al eliminar evolución' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Evolución eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete evolution error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
