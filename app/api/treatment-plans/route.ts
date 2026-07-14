// app/api/treatment-plans/route.ts
// API para listar y crear planes de tratamiento

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { planTratamientoSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/treatment-plans
 * Listar planes de tratamiento del consultorio
 */
export async function GET(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
    ]);

    if (!isValid) {
      return response;
    }

    const supabase = await createServerClient();
    const patientId = request.nextUrl.searchParams.get('patientId');

    let query = supabase
      .from('plan_tratamientos')
      .select(`
        *,
        pacientes(id, nombre, apellidos)
      `)
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true);

    if (patientId) {
      query = query.eq('paciente_id', patientId);
    }

    const { data: plans, error } = await query.order('fecha_creacion', {
      ascending: false,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener planes de tratamiento' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        plans: plans || [],
        count: plans?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get treatment plans error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/treatment-plans
 * Crear nuevo plan de tratamiento
 */
export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
    ]);

    if (!isValid) {
      return response;
    }

    // Validar datos
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

    // Crear plan
    const { data: plan, error } = await supabase
      .from('plan_tratamientos')
      .insert({
        tenant_id: user!.tenantId,
        paciente_id: validation.data.paciente_id,
        descripcion: validation.data.descripcion,
        costo_total: validation.data.costo_total,
        estado: validation.data.estado || 'pendiente',
        fecha_inicio_estimada: validation.data.fecha_inicio_estimada || null,
        fecha_fin_estimada: validation.data.fecha_fin_estimada || null,
        notas: validation.data.notas || null,
        created_by: user!.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al crear plan de tratamiento' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Plan de tratamiento creado exitosamente',
        plan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create treatment plan error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
