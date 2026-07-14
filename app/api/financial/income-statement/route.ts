// app/api/financial/income-statement/route.ts
// API para calcular el Estado de Resultados (P&L) del consultorio

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import {
  calcularPL,
  getPeriodoMensual,
  getPeriodoPersonalizado,
} from '@/lib/finance/plCalculator';

/**
 * GET /api/financial/income-statement
 * Retorna el Estado de Resultados para el período indicado.
 *
 * Query params:
 *   - anio (número, default: año actual)
 *   - mes  (número 1-12, default: mes actual)
 *   - desde (YYYY-MM-DD) + hasta (YYYY-MM-DD) → período personalizado
 */
export async function GET(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
    ]);

    if (!isValid) {
      return response;
    }

    const { searchParams } = new URL(request.url);
    const anio = searchParams.get('anio');
    const mes = searchParams.get('mes');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');

    // Construir período
    const periodo =
      desde && hasta
        ? getPeriodoPersonalizado(desde, hasta)
        : getPeriodoMensual(
            parseInt(anio ?? new Date().getFullYear().toString()),
            parseInt(mes ?? (new Date().getMonth() + 1).toString())
          );

    const pl = await calcularPL(user!.tenantId, periodo);

    return NextResponse.json(pl, { status: 200 });
  } catch (error) {
    console.error('[P&L] Error calculando estado de resultados:', error);
    return NextResponse.json(
      { error: 'No se pudo calcular el estado de resultados' },
      { status: 500 }
    );
  }
}
