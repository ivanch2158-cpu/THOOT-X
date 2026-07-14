// app/api/financial/expenses/route.ts
// API para listar y crear gastos

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { gastoSchema } from '@/lib/financial/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/financial/expenses
 * Listar gastos del consultorio con filtros
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
    const categoria = request.nextUrl.searchParams.get('categoria');
    const tipo = request.nextUrl.searchParams.get('tipo');
    const desde = request.nextUrl.searchParams.get('desde');
    const hasta = request.nextUrl.searchParams.get('hasta');

    let query = supabase
      .from('gastos')
      .select('*')
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true);

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    if (tipo) {
      query = query.eq('tipo', tipo);
    }

    if (desde) {
      query = query.gte('fecha', desde);
    }

    if (hasta) {
      query = query.lte('fecha', hasta);
    }

    const { data: gastos, error } = await query.order('fecha', {
      ascending: false,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener gastos' },
        { status: 500 }
      );
    }

    // Calcular totales
    const total = (gastos || []).reduce((sum, gasto) => sum + gasto.monto, 0);
    const gastosFijos = (gastos || [])
      .filter((g) => g.tipo === 'fijo')
      .reduce((sum, g) => sum + g.monto, 0);
    const gastosVariables = (gastos || [])
      .filter((g) => g.tipo === 'variable')
      .reduce((sum, g) => sum + g.monto, 0);

    return NextResponse.json(
      {
        gastos: gastos || [],
        count: gastos?.length || 0,
        total,
        gastos_fijos: gastosFijos,
        gastos_variables: gastosVariables,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get expenses error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/financial/expenses
 * Crear nuevo gasto
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
    const validation = gastoSchema.safeParse(body);

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

    // Crear gasto
    const { data: gasto, error } = await supabase
      .from('gastos')
      .insert({
        tenant_id: user!.tenantId,
        categoria: validation.data.categoria,
        tipo: validation.data.tipo,
        descripcion: validation.data.descripcion,
        monto: validation.data.monto,
        fecha: validation.data.fecha,
        paciente_id: validation.data.paciente_id || null,
        recurrente: validation.data.recurrente || false,
        notas: validation.data.notas || null,
        registrado_por: user!.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al crear gasto' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Gasto registrado exitosamente',
        gasto,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
