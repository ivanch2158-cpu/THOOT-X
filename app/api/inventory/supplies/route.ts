// app/api/inventory/supplies/route.ts
// API para listar y crear insumos

import { createServerClient } from '@/lib/supabase/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { insumoSchema } from '@/lib/financial/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/inventory/supplies
 * Listar insumos con stock actual
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
    const categoria = request.nextUrl.searchParams.get('categoria');
    const bajo_stock = request.nextUrl.searchParams.get('bajo_stock');

    let query = supabase
      .from('insumos')
      .select('*')
      .eq('tenant_id', user!.tenantId)
      .eq('is_active', true);

    if (categoria) {
      query = query.eq('categoria', categoria);
    }

    const { data: insumos, error } = await query.order('nombre', {
      ascending: true,
    });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al obtener insumos' },
        { status: 500 }
      );
    }

    // Obtener movimientos de insumos para calcular stock actual
    let insumosConStock = insumos || [];

    if (bajo_stock === 'true') {
      insumosConStock = insumosConStock.filter(
        (insumo) => insumo.stock_actual <= insumo.stock_minimo
      );
    }

    return NextResponse.json(
      {
        insumos: insumosConStock,
        count: insumosConStock.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get supplies error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/inventory/supplies
 * Crear nuevo insumo
 */
export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
    ]);

    if (!isValid) {
      return response;
    }

    const body = await request.json();
    const validation = insumoSchema.safeParse(body);

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

    // Crear insumo
    const { data: insumo, error } = await supabase
      .from('insumos')
      .insert({
        tenant_id: user!.tenantId,
        nombre: validation.data.nombre,
        categoria: validation.data.categoria,
        unidad_medida: validation.data.unidad_medida,
        stock_minimo: validation.data.stock_minimo,
        stock_actual: 0,
        precio_unitario: validation.data.precio_unitario,
        observaciones: validation.data.observaciones || null,
        created_by: user!.id,
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Error al crear insumo' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Insumo registrado exitosamente',
        insumo,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create supply error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
