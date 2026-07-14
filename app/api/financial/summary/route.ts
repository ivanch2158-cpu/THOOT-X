// app/api/financial/summary/route.ts
// API para las métricas del panel de control financiero (dashboard)

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { calcularResumenDashboard } from '@/lib/finance/plCalculator';

/**
 * GET /api/financial/summary
 * Retorna el resumen de métricas financieras para el mes actual:
 *   - Ingresos de hoy
 *   - Ingresos del mes
 *   - Gastos del mes
 *   - Cartera pendiente
 *   - Variación respecto al mes anterior
 *   - Ingresos vs gastos por mes (últimos 6 meses)
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

    const resumen = await calcularResumenDashboard(user!.tenantId);

    return NextResponse.json(resumen, { status: 200 });
  } catch (error) {
    console.error('[Summary] Error calculando resumen financiero:', error);
    return NextResponse.json(
      { error: 'No se pudo obtener el resumen financiero' },
      { status: 500 }
    );
  }
}
