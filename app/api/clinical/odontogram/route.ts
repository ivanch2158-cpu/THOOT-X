// app/api/clinical/odontogram/route.ts
// API para guardar estados del odontograma

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { odontogramaItemSchema } from '@/lib/clinical/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/clinical/odontogram
 * Guardar/actualizar estado de dientes
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

    const body = await request.json();
    const { paciente_id, items } = body;

    if (!paciente_id || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'paciente_id e items son requeridos' },
        { status: 400 }
      );
    }

    // Validar cada item
    const validatedItems = [];
    for (const item of items) {
      const validation = odontogramaItemSchema.safeParse(item);
      if (!validation.success) {
        return NextResponse.json(
          {
            error: 'Datos inválidos en algún diente',
            details: validation.error.flatten(),
          },
          { status: 400 }
        );
      }
      validatedItems.push(validation.data);
    }

    const supabase = await createServerClient();

    // Eliminar items previos de este paciente
    await supabase
      .from('odontograma_items')
      .update({ is_active: false })
      .eq('paciente_id', paciente_id)
      .eq('tenant_id', user!.tenantId);

    // Insertar nuevos items
    const { data: odontogramItems, error } = await supabase
      .from('odontograma_items')
      .insert(
        validatedItems.map((item) => ({
          tenant_id: user!.tenantId,
          paciente_id,
          numero_diente: item.numero_diente,
          estado: item.estado,
          cara: item.cara || null,
          profundidad_bolsa: item.profundidad_bolsa || null,
          sangrado: item.sangrado || false,
          movilidad: item.movilidad || null,
          notas: item.notas || null,
          created_by: user!.id,
          is_active: true,
        }))
      )
      .select();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al guardar odontograma' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Odontograma guardado exitosamente',
        items: odontogramItems,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Save odontogram error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/clinical/odontogram
 * Obtener estado del odontograma de un paciente
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
    const patientId = request.nextUrl.searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId es requerido' },
        { status: 400 }
      );
    }

    const { data: odontogramItems, error } = await supabase
      .from('odontograma_items')
      .select('*')
      .eq('paciente_id', patientId)
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener odontograma' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        items: odontogramItems || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get odontogram error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
