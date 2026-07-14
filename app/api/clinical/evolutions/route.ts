// app/api/clinical/evolutions/route.ts
// API para listar y crear evoluciones clínicas

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { evolucionSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/clinical/evolutions
 * Listar evoluciones de un paciente
 */
export async function GET(request: NextRequest) {
  try {
    const { isValid, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
    ]);

    if (!isValid) {
      return response;
    }

    const supabase = await createServerClient();
    const patientId = request.nextUrl.searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId es requerido' },
        { status: 400 }
      );
    }

    // Obtener evoluciones del paciente
    const { data: evolutions, error } = await supabase
      .from('evoluciones')
      .select(`
        *,
        users(id, full_name)
      `)
      .eq('paciente_id', patientId)
      .eq('is_active', true)
      .order('fecha_creacion', { ascending: false });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener evoluciones' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        evolutions: evolutions || [],
        count: evolutions?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get evolutions error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/clinical/evolutions
 * Crear nueva evolución clínica
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

    // Crear evolución
    const { data: evolution, error } = await supabase
      .from('evoluciones')
      .insert({
        tenant_id: user!.tenantId,
        paciente_id: validation.data.paciente_id,
        cita_id: validation.data.cita_id || null,
        user_id: user!.id,
        diagnostico: validation.data.diagnostico,
        tratamiento_realizado: validation.data.tratamiento_realizado,
        observaciones: validation.data.observaciones || null,
        proxima_cita_recomendada: validation.data.proxima_cita_recomendada || null,
        presion_arterial: validation.data.presion_arterial || null,
        frecuencia_cardiaca: validation.data.frecuencia_cardiaca || null,
        temperatura: validation.data.temperatura || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al crear evolución' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Evolución registrada exitosamente',
        evolution,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create evolution error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
