// app/api/appointments/route.ts
// API para listar y crear citas

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { citaSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/appointments
 * Listar citas del consultorio (con filtros opcionales)
 */
export async function GET(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);

    if (!isValid) {
      return response;
    }

    const supabase = await createServerClient();

    // Parámetros opcionales de filtro
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const fecha = searchParams.get('fecha');
    const estado = searchParams.get('estado');

    let query = supabase
      .from('citas')
      .select(`
        *,
        pacientes(id, nombre, apellidos),
        users(id, full_name)
      `)
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true);

    // Aplicar filtros
    if (patientId) {
      query = query.eq('paciente_id', patientId);
    }
    if (fecha) {
      query = query.eq('fecha', fecha);
    }
    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data: appointments, error } = await query.order('fecha', {
      ascending: true,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener citas' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        appointments: appointments || [],
        count: appointments?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get appointments error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/appointments
 * Crear nueva cita
 */
export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);

    if (!isValid) {
      return response;
    }

    // Validar datos
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

    // Verificar que el paciente existe y pertenece al consultorio
    const { data: patient } = await supabase
      .from('pacientes')
      .select('id, tenant_id')
      .eq('id', validation.data.paciente_id)
      .single();

    if (!patient || patient.tenant_id !== user!.tenantId) {
      return NextResponse.json(
        { error: 'Paciente no encontrado o acceso denegado' },
        { status: 404 }
      );
    }

    // Crear cita
    const { data: appointment, error } = await supabase
      .from('citas')
      .insert({
        tenant_id: user!.tenantId,
        paciente_id: validation.data.paciente_id,
        fecha: validation.data.fecha,
        hora_inicio: validation.data.hora_inicio,
        hora_fin: validation.data.hora_fin,
        tipo_cita: validation.data.tipo_cita,
        estado: validation.data.estado || 'pendiente',
        notas: validation.data.notas || null,
        odontologist_id: validation.data.odontologist_id || user!.id,
        created_by: user!.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al crear cita' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Cita creada exitosamente',
        appointment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create appointment error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
