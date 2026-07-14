// app/api/appointments/[id]/route.ts
// API para operaciones individuales de citas (GET, PUT, DELETE)

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole, validateTenantAccess } from '@/lib/auth/protect';
import { citaSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/appointments/[id]
 * Obtener detalles de una cita
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

    const { data: appointment, error } = await supabase
      .from('citas')
      .select(`
        *,
        pacientes(id, nombre, apellidos),
        users(id, full_name)
      `)
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    // Validar acceso al tenant
    if (!validateTenantAccess(user!.tenantId, appointment.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      );
    }

    return NextResponse.json(appointment, { status: 200 });
  } catch (error) {
    console.error('Get appointment error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/appointments/[id]
 * Actualizar cita
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
      return response!;
    }

    const body = await request.json();
    const validation = citaSchema.safeParse(body);

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

    // Verificar que la cita existe y pertenece al consultorio
    const { data: appointment } = await supabase
      .from('citas')
      .select('tenant_id')
      .eq('id', params.id)
      .single();

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, appointment.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      );
    }

    // Actualizar cita
    const { data: updated, error } = await supabase
      .from('citas')
      .update({
        paciente_id: validation.data.paciente_id,
        fecha: validation.data.fecha,
        hora_inicio: validation.data.hora_inicio,
        hora_fin: validation.data.hora_fin,
        tipo_cita: validation.data.tipo_cita,
        estado: validation.data.estado,
        notas: validation.data.notas || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar cita' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cita actualizada exitosamente',
        appointment: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update appointment error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/appointments/[id]
 * Eliminar cita (soft delete)
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
      return response!;
    }

    const supabase = await createServerClient();

    // Verificar que la cita existe y pertenece al consultorio
    const { data: appointment } = await supabase
      .from('citas')
      .select('tenant_id')
      .eq('id', params.id)
      .single();

    if (!appointment) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, appointment.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a esta cita' },
        { status: 403 }
      );
    }

    // Soft delete
    const { error } = await supabase
      .from('citas')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user!.id,
      })
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al eliminar cita' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Cita eliminada exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete appointment error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
