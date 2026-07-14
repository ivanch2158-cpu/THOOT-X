// app/api/patients/[id]/route.ts
// API para operaciones individuales de pacientes (GET, PUT, DELETE)

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole, validateTenantAccess } from '@/lib/auth/protect';
import { pacienteSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/patients/[id]
 * Obtener detalles de un paciente
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

    // Obtener paciente
    const { data: patient, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .single();

    if (error || !patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    // Validar acceso al tenant
    if (!validateTenantAccess(user!.tenantId, patient.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a este paciente' },
        { status: 403 }
      );
    }

    return NextResponse.json(patient, { status: 200 });
  } catch (error) {
    console.error('Get patient error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/patients/[id]
 * Actualizar paciente
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

    // Verificar que el paciente existe y pertenece al consultorio
    const { data: patient } = await supabase
      .from('pacientes')
      .select('tenant_id')
      .eq('id', params.id)
      .single();

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, patient.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a este paciente' },
        { status: 403 }
      );
    }

    // Actualizar paciente
    const { data: updated, error } = await supabase
      .from('pacientes')
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al actualizar paciente' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Paciente actualizado exitosamente',
        patient: updated,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update patient error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/patients/[id]
 * Eliminar paciente (soft delete)
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

    // Verificar que el paciente existe y pertenece al consultorio
    const { data: patient } = await supabase
      .from('pacientes')
      .select('tenant_id')
      .eq('id', params.id)
      .single();

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    if (!validateTenantAccess(user!.tenantId, patient.tenant_id)) {
      return NextResponse.json(
        { error: 'No tienes acceso a este paciente' },
        { status: 403 }
      );
    }

    // Soft delete (marcar como inactivo)
    const { error } = await supabase
      .from('pacientes')
      .update({
        is_active: false,
        deleted_at: new Date().toISOString(),
        deleted_by: user!.id,
      })
      .eq('id', params.id);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al eliminar paciente' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Paciente eliminado exitosamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete patient error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
