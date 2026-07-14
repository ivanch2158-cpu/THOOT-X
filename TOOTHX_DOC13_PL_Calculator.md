# DOCUMENTO 13 — MOTOR DE CÁLCULO P&L (ESTADO DE RESULTADOS)

## TOOTH X · Fórmulas del Estado de Resultados y Métricas Financieras

-----

|Campo          |Detalle                                               |
|---------------|------------------------------------------------------|
|**Proyecto**   |TOOTH X                                               |
|**Versión**    |v1.0                                                  |
|**Fecha**      |Junio 2026                                            |
|**Módulo**     |Fase 3D — Gestión Financiera y Rentabilidad (F3-44 a F3-55)|
|**Propósito**  |Definir campo por campo cómo se calcula el Estado de Resultados|

-----

## 1. ESTRUCTURA DEL ESTADO DE RESULTADOS (P&L)

```
TOOTH X — Estado de Resultados
Consultorio: [Nombre del Consultorio]
Período: [Mes/Año o Rango de fechas]
══════════════════════════════════════════════════════════

(+) INGRESOS TOTALES                              S/. XX,XXX.XX
    ├── Ingresos por servicios cobrados
    └── [Facturas en estado 'pagada' del período]

(-) COSTOS DIRECTOS                               S/. XX,XXX.XX
    ├── Laboratorio dental (prótesis, coronas, aparatos)
    └── Insumos consumidos en atención

                                                  ─────────────
(=) UTILIDAD BRUTA                                S/. XX,XXX.XX
    Margen bruto: XX.X%

(-) GASTOS OPERATIVOS FIJOS                       S/. XX,XXX.XX
    ├── Arriendo / alquiler del local
    ├── Sueldos del personal
    ├── Servicios (agua, luz, internet, teléfono)
    ├── Seguros
    ├── Suscripciones (TOOTH X, software, etc.)
    └── Otros gastos fijos

(-) GASTOS OPERATIVOS VARIABLES                   S/. XX,XXX.XX
    ├── Mantenimiento de equipos
    ├── Marketing y publicidad
    ├── Capacitaciones
    └── Otros gastos variables

(-) DEPRECIACIÓN DE EQUIPOS                       S/. XX,XXX.XX
    └── [Calculada por cada equipo del inventario]

                                                  ═════════════
(=) RESULTADO NETO                                S/. XX,XXX.XX
    Margen neto: XX.X%
    Estado: ✅ GANANCIA / ❌ PÉRDIDA
══════════════════════════════════════════════════════════
```

-----

## 2. FÓRMULAS CAMPO POR CAMPO

### 2.1 Período de análisis

```typescript
interface Periodo {
  desde: Date;   // Primer día del período a las 00:00:00
  hasta: Date;   // Último día del período a las 23:59:59
}

// Período mensual
function getPeriodoMensual(anio: number, mes: number): Periodo {
  const desde = new Date(anio, mes - 1, 1, 0, 0, 0);
  const hasta = new Date(anio, mes, 0, 23, 59, 59); // día 0 del mes siguiente = último día del mes actual
  return { desde, hasta };
}

// Período personalizado
function getPeriodoPersonalizado(desde: string, hasta: string): Periodo {
  return {
    desde: new Date(`${desde}T00:00:00`),
    hasta: new Date(`${hasta}T23:59:59`),
  };
}
```

-----

### 2.2 INGRESOS POR SERVICIOS COBRADOS

**Definición:** Suma de los montos totales de facturas pagadas (completa o parcialmente) en el período.

```
Ingresos = SUM(facturas.monto_pagado)
  WHERE tenant_id = :tenant_id
    AND fecha_emision BETWEEN :desde AND :hasta
    AND estado IN ('parcial', 'pagada')
    AND is_active = true
```

> **Decisión de diseño:** Se contabiliza `monto_pagado` (lo efectivamente cobrado), no `total` (lo facturado). Esto refleja el flujo de caja real del consultorio, no la cartera.

```typescript
// Consulta Prisma
const ingresos = await prisma.factura.aggregate({
  where: {
    tenant_id,
    fecha_emision: { gte: periodo.desde, lte: periodo.hasta },
    estado: { in: ['parcial', 'pagada'] },
    is_active: true,
  },
  _sum: { monto_pagado: true },
});

const totalIngresos = Number(ingresos._sum.monto_pagado ?? 0);
```

-----

### 2.3 COSTOS DIRECTOS

#### 2.3.1 Laboratorio dental

**Definición:** Gastos registrados en la categoría `laboratorio` del período. Incluye trabajos de laboratorio dental: prótesis, coronas, aparatos ortopédicos, etc.

```
Laboratorio = SUM(gastos.monto)
  WHERE tenant_id = :tenant_id
    AND categoria = 'laboratorio'
    AND fecha BETWEEN :desde AND :hasta
    AND is_active = true
```

#### 2.3.2 Insumos consumidos

**Definición:** Valor monetario de los insumos que salieron del inventario en el período, calculado a precio unitario de compra.

```
Insumos consumidos = SUM(movimientos_insumo.cantidad × insumos.precio_unitario)
  WHERE movimientos_insumo.tenant_id = :tenant_id
    AND movimientos_insumo.tipo = 'salida'
    AND movimientos_insumo.fecha BETWEEN :desde AND :hasta
```

> Si el insumo tiene movimientos con distintos precios de entrada, usar el `precio_unitario_entrada` del movimiento de salida más reciente (FIFO aproximado) o el precio actual del insumo como simplificación.

```typescript
const movimientosSalida = await prisma.movimientoInsumo.findMany({
  where: {
    tenant_id,
    tipo: 'salida',
    fecha: { gte: periodo.desde, lte: periodo.hasta },
  },
  include: { insumo: { select: { precio_unitario: true } } },
});

const costosInsumos = movimientosSalida.reduce((acc, mov) => {
  const precio = Number(mov.precio_unitario_entrada ?? mov.insumo.precio_unitario);
  return acc + Number(mov.cantidad) * precio;
}, 0);
```

#### 2.3.3 Total costos directos

```typescript
const costosDirectos = costoLaboratorio + costosInsumos;
```

-----

### 2.4 UTILIDAD BRUTA

```typescript
const utilidadBruta = totalIngresos - costosDirectos;
const margenBruto = totalIngresos > 0
  ? (utilidadBruta / totalIngresos) * 100
  : 0;
```

-----

### 2.5 GASTOS OPERATIVOS FIJOS

**Definición:** Gastos de tipo `fijo` registrados en el período, excluyendo `laboratorio` (que va en costos directos).

Categorías incluidas: `arriendo`, `sueldos`, `servicios`, `seguros`, `suscripciones`, `otros_fijos`

```
Gastos Fijos = SUM(gastos.monto)
  WHERE tenant_id = :tenant_id
    AND tipo = 'fijo'
    AND categoria != 'laboratorio'
    AND fecha BETWEEN :desde AND :hasta
    AND is_active = true
```

```typescript
const gastosFijosResult = await prisma.gasto.groupBy({
  by: ['categoria'],
  where: {
    tenant_id,
    tipo: 'fijo',
    categoria: { not: 'laboratorio' },
    fecha: { gte: periodo.desde, lte: periodo.hasta },
    is_active: true,
  },
  _sum: { monto: true },
});

// Desglose por categoría (para el gráfico de torta)
const desgloseFijos = gastosFijosResult.reduce((acc, g) => ({
  ...acc,
  [g.categoria]: Number(g._sum.monto ?? 0),
}), {} as Record<string, number>);

const totalGastosFijos = Object.values(desgloseFijos).reduce((a, b) => a + b, 0);
```

-----

### 2.6 GASTOS OPERATIVOS VARIABLES

Categorías incluidas: `mantenimiento`, `marketing`, `capacitacion`, `otros_variables`

```
Gastos Variables = SUM(gastos.monto)
  WHERE tenant_id = :tenant_id
    AND tipo = 'variable'
    AND fecha BETWEEN :desde AND :hasta
    AND is_active = true
```

```typescript
const gastosVariablesResult = await prisma.gasto.groupBy({
  by: ['categoria'],
  where: {
    tenant_id,
    tipo: 'variable',
    fecha: { gte: periodo.desde, lte: periodo.hasta },
    is_active: true,
  },
  _sum: { monto: true },
});

const desgloseVariables = gastosVariablesResult.reduce((acc, g) => ({
  ...acc,
  [g.categoria]: Number(g._sum.monto ?? 0),
}), {} as Record<string, number>);

const totalGastosVariables = Object.values(desgloseVariables).reduce((a, b) => a + b, 0);
```

-----

### 2.7 DEPRECIACIÓN DE EQUIPOS DEL PERÍODO

**Método:** Depreciación lineal mensual por cada equipo activo.

**Fórmula por equipo:**
```
Depreciación mensual = (valor_compra - valor_residual) / (vida_util_anios × 12)
```

**Para un período de N meses:**
```
Depreciación del período = depreciación_mensual × N_meses_del_período
```

```typescript
const equiposActivos = await prisma.equipo.findMany({
  where: {
    tenant_id,
    estado: 'activo',
    is_active: true,
    fecha_compra: { lte: periodo.hasta }, // Solo equipos adquiridos antes del fin del período
    vida_util_anios: { not: null },
  },
  select: {
    id: true,
    nombre: true,
    valor_compra: true,
    valor_residual: true,
    vida_util_anios: true,
    fecha_compra: true,
  },
});

// Calcular cuántos meses cubre el período
const mesesPeriodo = calcularMesesEntreFechas(periodo.desde, periodo.hasta);

const depreciacionDetalle = equiposActivos.map((equipo) => {
  const valorCompra = Number(equipo.valor_compra ?? 0);
  const valorResidual = Number(equipo.valor_residual ?? 0);
  const vidaUtilMeses = (equipo.vida_util_anios ?? 1) * 12;

  const depreciacionMensual = (valorCompra - valorResidual) / vidaUtilMeses;
  const depreciacionPeriodo = depreciacionMensual * mesesPeriodo;

  // Valor en libros al final del período
  const mesesEnUso = calcularMesesEntreFechas(new Date(equipo.fecha_compra!), periodo.hasta);
  const depreciacionAcumulada = Math.min(depreciacionMensual * mesesEnUso, valorCompra - valorResidual);
  const valorEnLibros = Math.max(valorCompra - depreciacionAcumulada, valorResidual);

  return {
    equipo_id: equipo.id,
    nombre: equipo.nombre,
    depreciacion_mensual: redondear(depreciacionMensual),
    depreciacion_periodo: redondear(depreciacionPeriodo),
    valor_en_libros: redondear(valorEnLibros),
  };
});

const totalDepreciacion = depreciacionDetalle.reduce(
  (acc, e) => acc + e.depreciacion_periodo, 0
);
```

-----

### 2.8 RESULTADO NETO

```typescript
const resultadoNeto = utilidadBruta - totalGastosFijos - totalGastosVariables - totalDepreciacion;
const margenNeto = totalIngresos > 0
  ? (resultadoNeto / totalIngresos) * 100
  : 0;
const esGanancia = resultadoNeto >= 0;
```

-----

## 3. FUNCIÓN COMPLETA DEL MOTOR P&L

```typescript
// lib/finance/plCalculator.ts

import { prisma } from '@/lib/prisma/client';

interface PLResult {
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
  margen_bruto: number; // porcentaje
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
  margen_neto: number; // porcentaje
  es_ganancia: boolean;
}

interface EquipoDepreciacion {
  equipo_id: string;
  nombre: string;
  depreciacion_mensual: number;
  depreciacion_periodo: number;
  valor_en_libros: number;
}

export async function calcularPL(tenant_id: string, periodo: Periodo): Promise<PLResult> {
  // ── 1. INGRESOS ────────────────────────────────────────────
  const ingresosAgg = await prisma.factura.aggregate({
    where: {
      tenant_id,
      fecha_emision: { gte: periodo.desde, lte: periodo.hasta },
      estado: { in: ['parcial', 'pagada'] },
      is_active: true,
    },
    _sum: { monto_pagado: true },
  });
  const totalIngresos = redondear(Number(ingresosAgg._sum.monto_pagado ?? 0));

  // ── 2. COSTOS DIRECTOS ─────────────────────────────────────
  const laboratorioAgg = await prisma.gasto.aggregate({
    where: {
      tenant_id,
      categoria: 'laboratorio',
      fecha: { gte: periodo.desde, lte: periodo.hasta },
      is_active: true,
    },
    _sum: { monto: true },
  });
  const costoLaboratorio = redondear(Number(laboratorioAgg._sum.monto ?? 0));

  const movSalida = await prisma.movimientoInsumo.findMany({
    where: {
      tenant_id,
      tipo: 'salida',
      fecha: { gte: periodo.desde, lte: periodo.hasta },
    },
    include: { insumo: { select: { precio_unitario: true } } },
  });
  const costosInsumos = redondear(
    movSalida.reduce((acc, m) => {
      const precio = Number(m.precio_unitario_entrada ?? m.insumo.precio_unitario);
      return acc + Number(m.cantidad) * precio;
    }, 0)
  );

  const totalCostosDirectos = redondear(costoLaboratorio + costosInsumos);

  // ── 3. UTILIDAD BRUTA ─────────────────────────────────────
  const utilidadBruta = redondear(totalIngresos - totalCostosDirectos);
  const margenBruto = totalIngresos > 0
    ? redondear((utilidadBruta / totalIngresos) * 100) : 0;

  // ── 4. GASTOS FIJOS ────────────────────────────────────────
  const gastosFijosGrupos = await prisma.gasto.groupBy({
    by: ['categoria'],
    where: {
      tenant_id,
      tipo: 'fijo',
      categoria: { not: 'laboratorio' },
      fecha: { gte: periodo.desde, lte: periodo.hasta },
      is_active: true,
    },
    _sum: { monto: true },
  });
  const desgloseFijos = gastosFijosGrupos.reduce((acc, g) => ({
    ...acc, [g.categoria]: redondear(Number(g._sum.monto ?? 0)),
  }), {} as Record<string, number>);
  const totalGastosFijos = redondear(Object.values(desgloseFijos).reduce((a, b) => a + b, 0));

  // ── 5. GASTOS VARIABLES ────────────────────────────────────
  const gastosVarGrupos = await prisma.gasto.groupBy({
    by: ['categoria'],
    where: {
      tenant_id,
      tipo: 'variable',
      fecha: { gte: periodo.desde, lte: periodo.hasta },
      is_active: true,
    },
    _sum: { monto: true },
  });
  const desgloseVariables = gastosVarGrupos.reduce((acc, g) => ({
    ...acc, [g.categoria]: redondear(Number(g._sum.monto ?? 0)),
  }), {} as Record<string, number>);
  const totalGastosVariables = redondear(Object.values(desgloseVariables).reduce((a, b) => a + b, 0));

  // ── 6. DEPRECIACIÓN ────────────────────────────────────────
  const mesesPeriodo = calcularMesesEntreFechas(periodo.desde, periodo.hasta);
  const equipos = await prisma.equipo.findMany({
    where: {
      tenant_id,
      estado: 'activo',
      is_active: true,
      fecha_compra: { lte: periodo.hasta },
      vida_util_anios: { not: null },
    },
  });

  const depreciacionDetalle: EquipoDepreciacion[] = equipos.map((eq) => {
    const vc = Number(eq.valor_compra ?? 0);
    const vr = Number(eq.valor_residual ?? 0);
    const vidaMeses = (eq.vida_util_anios ?? 1) * 12;
    const depMensual = (vc - vr) / vidaMeses;
    const depPeriodo = redondear(depMensual * mesesPeriodo);
    const mesesEnUso = calcularMesesEntreFechas(new Date(eq.fecha_compra!), periodo.hasta);
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

  const totalDepreciacion = redondear(depreciacionDetalle.reduce((a, e) => a + e.depreciacion_periodo, 0));

  // ── 7. RESULTADO NETO ──────────────────────────────────────
  const resultadoNeto = redondear(
    utilidadBruta - totalGastosFijos - totalGastosVariables - totalDepreciacion
  );
  const margenNeto = totalIngresos > 0
    ? redondear((resultadoNeto / totalIngresos) * 100) : 0;

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
    gastos_variables: { desglose: desgloseVariables, total: totalGastosVariables },
    depreciacion: { detalle: depreciacionDetalle, total: totalDepreciacion },
    resultado_neto: resultadoNeto,
    margen_neto: margenNeto,
    es_ganancia: resultadoNeto >= 0,
  };
}

// ── FUNCIONES AUXILIARES ──────────────────────────────────────────────────────

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function calcularMesesEntreFechas(inicio: Date, fin: Date): number {
  const años = fin.getFullYear() - inicio.getFullYear();
  const meses = fin.getMonth() - inicio.getMonth();
  const total = años * 12 + meses;
  // Ajuste fraccionario por días
  const diasExtra = fin.getDate() / 30;
  return Math.max(total + diasExtra, 1 / 30); // mínimo 1 día
}
```

-----

## 4. API ROUTE DEL ESTADO DE RESULTADOS

```typescript
// app/api/financial/income-statement/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint } from '@/lib/auth/protect';
import { calcularPL, getPeriodoMensual, getPeriodoPersonalizado } from '@/lib/finance/plCalculator';

export async function GET(request: NextRequest) {
  const { isValid, user, response } = await protectEndpoint(request, ['admin']);
  if (!isValid) return response;

  const { searchParams } = new URL(request.url);
  const anio  = searchParams.get('anio');
  const mes   = searchParams.get('mes');
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');

  const periodo = (desde && hasta)
    ? getPeriodoPersonalizado(desde, hasta)
    : getPeriodoMensual(
        parseInt(anio  ?? new Date().getFullYear().toString()),
        parseInt(mes   ?? (new Date().getMonth() + 1).toString())
      );

  try {
    const pl = await calcularPL(user!.tenantId, periodo);
    return NextResponse.json(pl);
  } catch (error) {
    console.error('[P&L] Error calculando estado de resultados:', error);
    return NextResponse.json(
      { error: 'No se pudo calcular el estado de resultados' },
      { status: 500 }
    );
  }
}
```

-----

## 5. CASOS BORDE Y REGLAS DE NEGOCIO

| Caso | Regla |
|------|-------|
| Consultorio sin facturas en el período | `ingresos.total = 0`, el resto se calcula igual |
| Consultorio sin gastos registrados | Todos los totales de gastos = 0 |
| Equipo sin `vida_util_anios` definido | Se excluye del cálculo de depreciación |
| Equipo completamente depreciado | `depreciacion_periodo = 0`, `valor_en_libros = valor_residual` |
| Período de 1 día | `meses_periodo = 1/30` — la depreciación diaria es muy pequeña pero correcta |
| Facturas `cancelada` | No se incluyen en ingresos, independientemente de si tienen `monto_pagado > 0` |
| Facturas `pendiente` con abonos | `monto_pagado` sí se incluye si `estado = 'parcial'` |
| Gastos `es_recurrente = true` | Se incluyen normalmente si su `fecha` cae en el período (el sistema los registra el día 1 de cada mes) |

-----

## 6. MÉTRICAS DEL DASHBOARD (TARJETAS RESUMEN)

Métricas adicionales que se calculan a partir del P&L para el Dashboard:

```typescript
// Ingresos del día (para la tarjeta del dashboard principal)
const ingresosHoy = await prisma.factura.aggregate({
  where: {
    tenant_id,
    fecha_emision: {
      gte: new Date(new Date().setHours(0, 0, 0, 0)),
      lte: new Date(new Date().setHours(23, 59, 59, 999)),
    },
    estado: { in: ['parcial', 'pagada'] },
    is_active: true,
  },
  _sum: { monto_pagado: true },
});

// Cartera pendiente de cobro (facturas no pagadas)
const carteraPendiente = await prisma.factura.aggregate({
  where: {
    tenant_id,
    estado: { in: ['pendiente', 'parcial'] },
    is_active: true,
  },
  _sum: { saldo_pendiente: true },
  _count: { id: true },
});

// Ingresos del mes actual vs mes anterior (para la tarjeta comparativa)
const mesActual = getPeriodoMensual(hoy.getFullYear(), hoy.getMonth() + 1);
const mesAnterior = getPeriodoMensual(hoy.getFullYear(), hoy.getMonth()); // getMonth() = mes anterior (0-indexed)

const [plMesActual, plMesAnterior] = await Promise.all([
  calcularPL(tenant_id, mesActual),
  calcularPL(tenant_id, mesAnterior),
]);

const variacionIngresos = plMesAnterior.ingresos.total > 0
  ? ((plMesActual.ingresos.total - plMesAnterior.ingresos.total) / plMesAnterior.ingresos.total) * 100
  : null; // null si no hay referencia anterior
```
