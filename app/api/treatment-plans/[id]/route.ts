// app/api/treatment-plans/[id]/route.ts
// API para operaciones individuales de planes de tratamiento

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole, validateTenantAccess } from '@/lib/auth/protect';
import { planTratamientoSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/treatment-plans/[id]
 * Obtener detalles de un plan de tratamiento
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
      return response!;
    }

    const supabase = await createServerClient();

    const { data: plan, error } = await supabase
      .from('plan_tratamientos')
      .select(`
        *,
        pacientes(id, nombre, apellidos)
      `)
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !plan) {
      return NextResponse.json(
        { error: 'Plan de tratamiento no encontrado' },
        { status: 404 }
      );
    }

    // Validar acceso al tenant
    if (!validateTenantAccess(user!.tenantId, plan.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a este plan' },
        { status: 403 }
      );
    }

    return NextResponse.json(plan, { status: 200 });
  } catch (error) {
    console.error('Get treatment plan error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/treatment-plans/[id]
 * Actualizar plan de tratamiento
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
    const validation = planTratamientoSchema.safeParse(body);

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

    // Verificar que el plan existe
    const { data: plan } = await supabase
      .from('plan_tratamientos')
      .select('tenant_id')
      .eq('id', params.id)
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan de tratamiento no encontrado' },
        { status: 404 }
      );
    }

    // Validar acceso
    if (!validateTenantAccess(user!.tenantId, plan.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a este plan' },
        { status: 403 }
      );
    }

    // Actualizar plan
    const { data: updated, error } = await supabase
      .from('plan_tratamientos')
      .update({
        descripcion: validation.data.descripcion,
        costo_total: validation.data.costo_total,
        estado: validation.data.estado || 'pendiente',
        fecha_inicio_estimada: validation.data.fecha_inicio_estimada || null,
        fecha_fin_estimada: validation.data.fecha_fin_estimada || null,
        notas: validation.data.notas || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar plan' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Plan de tratamiento actualizado exitosamente',
        plan: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update treatment plan error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/treatment-plans/[id]
 * Eliminar plan de tratamiento (soft delete)
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

    // Verificar que el plan existe
    const { data: plan } = await supabase
      .from('plan_tratamientos')
      .select('tenant_id')
      .eq('id', params.id)
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan de tratamiento no encontrado' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, plan.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a este plan' },
        { status: 403 }
      );
    }

    // Soft delete
    const { error } = await supabase
      .from('plan_tratamientos')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user!.id,
      })
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al eliminar plan' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Plan de tratamiento eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete treatment plan error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
