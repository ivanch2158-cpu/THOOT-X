// lib/finance/plCalculator.ts
// Motor de cálculo del Estado de Resultados (P&L) para TOOTH X
// Calcula ingresos, costos directos, gastos fijos/variables, depreciación y resultado neto

import { createServerClient } from '@/lib/supabase/server';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

export interface Periodo {
  desde: Date;
  hasta: Date;
}

export interface EquipoDepreciacion {
  equipo_id: string;
  nombre: string;
  depreciacion_mensual: number;
  depreciacion_periodo: number;
  valor_en_libros: number;
}

export interface PLResult {
  periodo: { desde: Date; hasta: Date };
  ingresos: {
    total: number;
  };
  costos_directos: {
    laboratorio: number;
    insumos: number;
    total: number;
  };
  utilidad_bruta: number;
  margen_bruto: number;
  gastos_fijos: {
    desglose: Record<string, number>;
    total: number;
  };
  gastos_variables: {
    desglose: Record<string, number>;
    total: number;
  };
  depreciacion: {
    detalle: EquipoDepreciacion[];
    total: number;
  };
  resultado_neto: number;
  margen_neto: number;
  es_ganancia: boolean;
}

// ── FUNCIONES DE PERÍODO ──────────────────────────────────────────────────────

/**
 * Obtiene el período de un mes completo (día 1 00:00:00 → último día 23:59:59)
 */
export function getPeriodoMensual(anio: number, mes: number): Periodo {
  const desde = new Date(anio, mes - 1, 1, 0, 0, 0);
  const hasta = new Date(anio, mes, 0, 23, 59, 59);
  return { desde, hasta };
}

/**
 * Construye un período personalizado a partir de strings 'YYYY-MM-DD'
 */
export function getPeriodoPersonalizado(desde: string, hasta: string): Periodo {
  return {
    desde: new Date(`${desde}T00:00:00`),
    hasta: new Date(`${hasta}T23:59:59`),
  };
}

// ── FUNCIONES AUXILIARES ──────────────────────────────────────────────────────

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

/**
 * Calcula los meses (incluyendo fracción de días) entre dos fechas.
 * Mínimo 1 día (1/30 de mes).
 */
function calcularMesesEntreFechas(inicio: Date, fin: Date): number {
  const años = fin.getFullYear() - inicio.getFullYear();
  const meses = fin.getMonth() - inicio.getMonth();
  const total = años * 12 + meses;
  const diasExtra = fin.getDate() / 30;
  return Math.max(total + diasExtra, 1 / 30);
}

// ── MOTOR PRINCIPAL P&L ───────────────────────────────────────────────────────

/**
 * Calcula el Estado de Resultados completo para el tenant y período dados.
 * Usa Supabase directamente (Server Component context).
 */
export async function calcularPL(
  tenant_id: string,
  periodo: Periodo
): Promise<PLResult> {
  const supabase = await createServerClient();
  const desdeISO = periodo.desde.toISOString();
  const hastaISO = periodo.hasta.toISOString();

  // ── 1. INGRESOS (monto efectivamente cobrado) ──────────────────────────────
  const { data: facturaData } = await supabase
    .from('facturas')
    .select('monto_pagado')
    .eq('tenant_id', tenant_id)
    .in('estado', ['parcial', 'pagada'])
    .eq('is_active', true)
    .gte('fecha_emision', desdeISO)
    .lte('fecha_emision', hastaISO);

  const totalIngresos = redondear(
    (facturaData ?? []).reduce((acc, f) => acc + Number(f.monto_pagado ?? 0), 0)
  );

  // ── 2. COSTOS DIRECTOS ─────────────────────────────────────────────────────

  // 2a. Laboratorio dental
  const { data: laboratorioData } = await supabase
    .from('gastos')
    .select('monto')
    .eq('tenant_id', tenant_id)
    .eq('categoria', 'laboratorio')
    .eq('is_active', true)
    .gte('fecha', desdeISO.substring(0, 10))
    .lte('fecha', hastaISO.substring(0, 10));

  const costoLaboratorio = redondear(
    (laboratorioData ?? []).reduce((acc, g) => acc + Number(g.monto ?? 0), 0)
  );

  // 2b. Insumos consumidos (salidas del inventario)
  const { data: movimientosSalida } = await supabase
    .from('movimientos_insumo')
    .select('cantidad, precio_unitario_entrada, insumos(precio_unitario)')
    .eq('tenant_id', tenant_id)
    .eq('tipo', 'salida')
    .gte('fecha', desdeISO)
    .lte('fecha', hastaISO);

  const costosInsumos = redondear(
    (movimientosSalida ?? []).reduce((acc, mov) => {
      const precio = Number(
        (mov as any).precio_unitario_entrada ??
          (mov as any).insumos?.precio_unitario ??
          0
      );
      return acc + Number(mov.cantidad ?? 0) * precio;
    }, 0)
  );

  const totalCostosDirectos = redondear(costoLaboratorio + costosInsumos);

  // ── 3. UTILIDAD BRUTA ──────────────────────────────────────────────────────
  const utilidadBruta = redondear(totalIngresos - totalCostosDirectos);
  const margenBruto =
    totalIngresos > 0
      ? redondear((utilidadBruta / totalIngresos) * 100)
      : 0;

  // ── 4. GASTOS FIJOS ────────────────────────────────────────────────────────
  const { data: gastosFijosData } = await supabase
    .from('gastos')
    .select('categoria, monto')
    .eq('tenant_id', tenant_id)
    .eq('tipo', 'fijo')
    .neq('categoria', 'laboratorio')
    .eq('is_active', true)
    .gte('fecha', desdeISO.substring(0, 10))
    .lte('fecha', hastaISO.substring(0, 10));

  const desgloseFijos = (gastosFijosData ?? []).reduce(
    (acc, g) => ({
      ...acc,
      [g.categoria]: redondear((acc[g.categoria] ?? 0) + Number(g.monto ?? 0)),
    }),
    {} as Record<string, number>
  );
  const totalGastosFijos = redondear(
    Object.values(desgloseFijos).reduce((a, b) => a + b, 0)
  );

  // ── 5. GASTOS VARIABLES ────────────────────────────────────────────────────
  const { data: gastosVariablesData } = await supabase
    .from('gastos')
    .select('categoria, monto')
    .eq('tenant_id', tenant_id)
    .eq('tipo', 'variable')
    .eq('is_active', true)
    .gte('fecha', desdeISO.substring(0, 10))
    .lte('fecha', hastaISO.substring(0, 10));

  const desgloseVariables = (gastosVariablesData ?? []).reduce(
    (acc, g) => ({
      ...acc,
      [g.categoria]: redondear((acc[g.categoria] ?? 0) + Number(g.monto ?? 0)),
    }),
    {} as Record<string, number>
  );
  const totalGastosVariables = redondear(
    Object.values(desgloseVariables).reduce((a, b) => a + b, 0)
  );

  // ── 6. DEPRECIACIÓN DE EQUIPOS ─────────────────────────────────────────────
  const { data: equipos } = await supabase
    .from('equipos')
    .select(
      'id, nombre, valor_compra, valor_residual, vida_util_anios, fecha_compra'
    )
    .eq('tenant_id', tenant_id)
    .eq('estado', 'activo')
    .eq('is_active', true)
    .lte('fecha_compra', hastaISO.substring(0, 10))
    .not('vida_util_anios', 'is', null);

  const mesesPeriodo = calcularMesesEntreFechas(periodo.desde, periodo.hasta);

  const depreciacionDetalle: EquipoDepreciacion[] = (equipos ?? []).map((eq) => {
    const vc = Number(eq.valor_compra ?? 0);
    const vr = Number(eq.valor_residual ?? 0);
    const vidaMeses = ((eq.vida_util_anios as number) ?? 1) * 12;
    const depMensual = (vc - vr) / vidaMeses;
    const depPeriodo = redondear(depMensual * mesesPeriodo);

    const mesesEnUso = calcularMesesEntreFechas(
      new Date(eq.fecha_compra as string),
      periodo.hasta
    );
    const depAcumulada = Math.min(depMensual * mesesEnUso, vc - vr);
    const valorEnLibros = redondear(Math.max(vc - depAcumulada, vr));

    return {
      equipo_id: eq.id,
      nombre: eq.nombre,
      depreciacion_mensual: redondear(depMensual),
      depreciacion_periodo: depPeriodo,
      valor_en_libros: valorEnLibros,
    };
  });

  const totalDepreciacion = redondear(
    depreciacionDetalle.reduce((a, e) => a + e.depreciacion_periodo, 0)
  );

  // ── 7. RESULTADO NETO ──────────────────────────────────────────────────────
  const resultadoNeto = redondear(
    utilidadBruta - totalGastosFijos - totalGastosVariables - totalDepreciacion
  );
  const margenNeto =
    totalIngresos > 0
      ? redondear((resultadoNeto / totalIngresos) * 100)
      : 0;

  return {
    periodo,
    ingresos: { total: totalIngresos },
    costos_directos: {
      laboratorio: costoLaboratorio,
      insumos: costosInsumos,
      total: totalCostosDirectos,
    },
    utilidad_bruta: utilidadBruta,
    margen_bruto: margenBruto,
    gastos_fijos: { desglose: desgloseFijos, total: totalGastosFijos },
    gastos_variables: {
      desglose: desgloseVariables,
      total: totalGastosVariables,
    },
    depreciacion: { detalle: depreciacionDetalle, total: totalDepreciacion },
    resultado_neto: resultadoNeto,
    margen_neto: margenNeto,
    es_ganancia: resultadoNeto >= 0,
  };
}

// ── MÉTRICAS DE RESUMEN PARA EL DASHBOARD ─────────────────────────────────────

export interface DashboardSummary {
  ingresos_hoy: number;
  ingresos_mes: number;
  gastos_mes: number;
  cartera_pendiente: number;
  num_facturas_pendientes: number;
  variacion_ingresos: number | null;
  resultado_mes: number;
  es_ganancia_mes: boolean;
  ingresos_por_mes: { mes: string; ingresos: number; gastos: number }[];
}

/**
 * Calcula las métricas del panel de control financiero para el mes actual.
 */
export async function calcularResumenDashboard(
  tenant_id: string
): Promise<DashboardSummary> {
  const supabase = await createServerClient();
  const hoy = new Date();

  // Período mes actual y mes anterior
  const mesActual = getPeriodoMensual(hoy.getFullYear(), hoy.getMonth() + 1);
  const mesAnteriorDate = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
  const mesAnterior = getPeriodoMensual(
    mesAnteriorDate.getFullYear(),
    mesAnteriorDate.getMonth() + 1
  );

  // Período hoy
  const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 0, 0, 0);
  const finDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate(), 23, 59, 59);

  // Ingresos de hoy
  const { data: facturasHoy } = await supabase
    .from('facturas')
    .select('monto_pagado')
    .eq('tenant_id', tenant_id)
    .in('estado', ['parcial', 'pagada'])
    .eq('is_active', true)
    .gte('fecha_emision', inicioDia.toISOString())
    .lte('fecha_emision', finDia.toISOString());

  const ingresosHoy = redondear(
    (facturasHoy ?? []).reduce((acc, f) => acc + Number(f.monto_pagado ?? 0), 0)
  );

  // Cartera pendiente
  const { data: facturasPendientes } = await supabase
    .from('facturas')
    .select('id, saldo_pendiente')
    .eq('tenant_id', tenant_id)
    .in('estado', ['pendiente', 'parcial'])
    .eq('is_active', true);

  const carteraPendiente = redondear(
    (facturasPendientes ?? []).reduce(
      (acc, f) => acc + Number((f as any).saldo_pendiente ?? 0),
      0
    )
  );
  const numFacturasPendientes = (facturasPendientes ?? []).length;

  // P&L mes actual y anterior (en paralelo)
  const [plActual, plAnterior] = await Promise.all([
    calcularPL(tenant_id, mesActual),
    calcularPL(tenant_id, mesAnterior),
  ]);

  const variacionIngresos =
    plAnterior.ingresos.total > 0
      ? redondear(
          ((plActual.ingresos.total - plAnterior.ingresos.total) /
            plAnterior.ingresos.total) *
            100
        )
      : null;

  // Ingresos y gastos por mes (últimos 6 meses)
  const ingresosPorMes: { mes: string; ingresos: number; gastos: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    const periodo = getPeriodoMensual(date.getFullYear(), date.getMonth() + 1);

    const [facturasMs, gastosMs] = await Promise.all([
      supabase
        .from('facturas')
        .select('monto_pagado')
        .eq('tenant_id', tenant_id)
        .in('estado', ['parcial', 'pagada'])
        .eq('is_active', true)
        .gte('fecha_emision', periodo.desde.toISOString())
        .lte('fecha_emision', periodo.hasta.toISOString()),
      supabase
        .from('gastos')
        .select('monto')
        .eq('tenant_id', tenant_id)
        .eq('is_active', true)
        .gte('fecha', periodo.desde.toISOString().substring(0, 10))
        .lte('fecha', periodo.hasta.toISOString().substring(0, 10)),
    ]);

    const ingMs = redondear(
      (facturasMs.data ?? []).reduce((a, f) => a + Number(f.monto_pagado ?? 0), 0)
    );
    const gasMs = redondear(
      (gastosMs.data ?? []).reduce((a, g) => a + Number(g.monto ?? 0), 0)
    );

    const mesLabel = date.toLocaleDateString('es-PE', {
      month: 'short',
      year: '2-digit',
    });
    ingresosPorMes.push({ mes: mesLabel, ingresos: ingMs, gastos: gasMs });
  }

  return {
    ingresos_hoy: ingresosHoy,
    ingresos_mes: plActual.ingresos.total,
    gastos_mes: redondear(
      plActual.gastos_fijos.total + plActual.gastos_variables.total
    ),
    cartera_pendiente: carteraPendiente,
    num_facturas_pendientes: numFacturasPendientes,
    variacion_ingresos: variacionIngresos,
    resultado_mes: plActual.resultado_neto,
    es_ganancia_mes: plActual.es_ganancia,
    ingresos_por_mes: ingresosPorMes,
  };
}
