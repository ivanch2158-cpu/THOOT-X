// app/api/patients/route.ts
// API para listar y crear pacientes

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { pacienteSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/patients
 * Listar todos los pacientes del consultorio del usuario
 */
export async function GET(request: NextRequest) {
  try {
    // Validar autenticación
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);

    if (!isValid) {
      return response;
    }

    const supabase = await createServerClient();

    // Obtener pacientes del consultorio
    const { data: patients, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true)
      .order('nombres', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener pacientes' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        patients: patients || [],
        count: patients?.length || 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get patients error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/patients
 * Crear nuevo paciente
 */
export async function POST(request: NextRequest) {
  try {
    // Validar autenticación
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
    const validation = pacienteSchema.safeParse(body);

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

    // Crear paciente
    const { data: patient, error } = await supabase
      .from('pacientes')
      .insert({
        tenant_id: user!.tenantId,
        created_by: user!.id,
        nombres: validation.data.nombres,
        apellidos: validation.data.apellidos,
        email: validation.data.email || null,
        telefono: validation.data.telefono || null,
        fecha_nacimiento: validation.data.fecha_nacimiento || null,
        sexo: validation.data.sexo || null,
        direccion: validation.data.direccion || null,
        numero_documento: validation.data.numero_documento || null,
        tipo_documento: validation.data.tipo_documento || null,
        alergias: validation.data.alergias || null,
        antecedentes_medicos: validation.data.antecedentes_medicos || null,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al crear paciente' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Paciente creado exitosamente',
        patient,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create patient error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
