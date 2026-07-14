// app/api/inventory/equipment/route.ts
// API para listar y crear equipos

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { equipoSchema } from '@/lib/financial/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/inventory/equipment
 * Listar equipos del consultorio
 */
export async function GET(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
    ]);

    if (!isValid) {
      return response!;
    }

    const supabase = await createServerClient();
    const estado = request.nextUrl.searchParams.get('estado');

    let query = supabase
      .from('equipos')
      .select('*')
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true);

    if (estado) {
      query = query.eq('estado', estado);
    }

    const { data: equipos, error } = await query.order('nombre', {
      ascending: true,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener equipos' },
        { status: 500 }
      );
    }

    // Calcular depreciación actual para cada equipo
    const equiposConDepreciacion = (equipos || []).map((equipo) => {
      const fechaCompra = new Date(equipo.fecha_compra);
      const hoy = new Date();
      const mesesTranscurridos =
        (hoy.getFullYear() - fechaCompra.getFullYear()) * 12 +
        (hoy.getMonth() - fechaCompra.getMonth());
      const anosTranscurridos = mesesTranscurridos / 12;

      const depreciacionAnual =
        (equipo.valor_compra - equipo.valor_residual) / equipo.vida_util_anos;
      const depreciacionAcumulada = Math.min(
        depreciacionAnual * anosTranscurridos,
        equipo.valor_compra - equipo.valor_residual
      );

      return {
        ...equipo,
        depreciacion_acumulada: depreciacionAcumulada,
        valor_en_libros: equipo.valor_compra - depreciacionAcumulada,
      };
    });

    return NextResponse.json(
      {
        equipos: equiposConDepreciacion,
        count: equiposConDepreciacion.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get equipment error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/equipment
 * Crear nuevo equipo
 */
export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
    ]);

    if (!isValid) {
      return response!;
    }

    const body = await request.json();
    const validation = equipoSchema.safeParse(body);

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

    // Crear equipo
    const { data: equipo, error } = await supabase
      .from('equipos')
      .insert({
        tenant_id: user!.tenantId,
        nombre: validation.data.nombre,
        marca: validation.data.marca || null,
        modelo: validation.data.modelo || null,
        serial: validation.data.serial || null,
        categoria: validation.data.categoria,
        fecha_compra: validation.data.fecha_compra,
        valor_compra: validation.data.valor_compra,
        proveedor: validation.data.proveedor || null,
        vida_util_anos: validation.data.vida_util_anos,
        valor_residual: validation.data.valor_residual,
        estado: validation.data.estado || 'activo',
        observaciones: validation.data.observaciones || null,
        created_by: user!.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al crear equipo' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Equipo registrado exitosamente',
        equipo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create equipment error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
