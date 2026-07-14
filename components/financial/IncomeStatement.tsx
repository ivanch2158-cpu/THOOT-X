// components/financial/IncomeStatement.tsx
// Vista del Estado de Resultados (P&L) del consultorio

'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface EquipoDepreciacion {
  equipo_id: string;
  nombre: string;
  depreciacion_mensual: number;
  depreciacion_periodo: number;
  valor_en_libros: number;
}

interface PLResult {
  periodo: { desde: string; hasta: string };
  ingresos: { total: number };
  costos_directos: {
    laboratorio: number;
    insumos: number;
    total: number;
  };
  utilidad_bruta: number;
  margen_bruto: number;
  gastos_fijos: { desglose: Record<string, number>; total: number };
  gastos_variables: { desglose: Record<string, number>; total: number };
  depreciacion: { detalle: EquipoDepreciacion[]; total: number };
  resultado_neto: number;
  margen_neto: number;
  es_ganancia: boolean;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatMoneda(valor: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(valor);
}

function formatPorcentaje(valor: number): string {
  return `${valor >= 0 ? '+' : ''}${valor.toFixed(1)}%`;
}

const ETIQUETAS_CATEGORIA: Record<string, string> = {
  arriendo: 'Arriendo / Alquiler',
  sueldos: 'Sueldos del Personal',
  servicios: 'Servicios (agua, luz, etc.)',
  seguros: 'Seguros',
  suscripciones: 'Suscripciones',
  otros_fijos: 'Otros Gastos Fijos',
  mantenimiento: 'Mantenimiento de Equipos',
  marketing: 'Marketing y Publicidad',
  capacitacion: 'Capacitaciones',
  otros_variables: 'Otros Gastos Variables',
};

// ── FILA DE CONCEPTO ──────────────────────────────────────────────────────────

interface FilaConceptoProps {
  etiqueta: string;
  valor: number;
  nivel?: number;
  negrita?: boolean;
  separador?: boolean;
  signo?: '+' | '-' | '=';
  colorValor?: string;
}

function FilaConcepto({
  etiqueta,
  valor,
  nivel = 0,
  negrita = false,
  separador = false,
  signo,
  colorValor,
}: FilaConceptoProps) {
  const indent = nivel * 16;

  return (
    <>
      {separador && (
        <tr>
          <td colSpan={3} className="py-1">
            <div className="border-t border-gray-300" />
          </td>
        </tr>
      )}
      <tr className={negrita ? 'bg-gray-50' : ''}>
        <td
          className={`py-2 text-sm ${negrita ? 'font-semibold text-gray-900' : 'text-gray-700'}`}
          style={{ paddingLeft: `${12 + indent}px` }}
        >
          {signo && (
            <span
              className={`inline-block w-5 font-mono ${
                signo === '+' ? 'text-green-600' : signo === '-' ? 'text-red-500' : 'text-blue-600'
              }`}
            >
              ({signo})
            </span>
          )}
          {etiqueta}
        </td>
        <td className="py-2 text-right pr-4">
          {valor > 0 && (
            <span
              className={`text-sm font-mono ${
                colorValor ?? (negrita ? 'font-semibold text-gray-900' : 'text-gray-600')
              }`}
            >
              {formatMoneda(valor)}
            </span>
          )}
        </td>
      </tr>
    </>
  );
}

// ── SECCIÓN COLAPSABLE ────────────────────────────────────────────────────────

function SeccionColapsable({
  titulo,
  total,
  desglose,
  signo,
}: {
  titulo: string;
  total: number;
  desglose: Record<string, number>;
  signo: '-';
}) {
  const [expandido, setExpandido] = useState(false);
  const tieneDetalle = Object.keys(desglose).length > 0;

  return (
    <>
      <tr
        className={`hover:bg-gray-50 ${tieneDetalle ? 'cursor-pointer' : ''}`}
        onClick={() => tieneDetalle && setExpandido(!expandido)}
      >
        <td className="py-2 pl-3 text-sm text-gray-700">
          <div className="flex items-center gap-1">
            {tieneDetalle &&
              (expandido ? (
                <ChevronDown className="w-3 h-3 text-gray-400" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-400" />
              ))}
            <span className="inline-block w-5 font-mono text-red-500">({signo})</span>
            {titulo}
          </div>
        </td>
        <td className="py-2 pr-4 text-right">
          <span className="text-sm font-mono text-gray-700">
            {formatMoneda(total)}
          </span>
        </td>
      </tr>
      {expandido &&
        Object.entries(desglose).map(([cat, monto]) => (
          <tr key={cat}>
            <td className="py-1 pl-12 text-xs text-gray-500">
              └ {ETIQUETAS_CATEGORIA[cat] ?? cat}
            </td>
            <td className="py-1 pr-4 text-right text-xs font-mono text-gray-500">
              {formatMoneda(monto)}
            </td>
          </tr>
        ))}
    </>
  );
}

// ── SELECTOR DE PERÍODO ───────────────────────────────────────────────────────

interface SelectorPeriodoProps {
  anio: number;
  mes: number;
  onCambio: (anio: number, mes: number) => void;
}

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function SelectorPeriodo({ anio, mes, onCambio }: SelectorPeriodoProps) {
  const anioActual = new Date().getFullYear();

  return (
    <div className="flex items-center gap-3">
      <select
        value={mes}
        onChange={(e) => onCambio(anio, parseInt(e.target.value))}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
      >
        {MESES.map((nombre, i) => (
          <option key={i + 1} value={i + 1}>
            {nombre}
          </option>
        ))}
      </select>
      <select
        value={anio}
        onChange={(e) => onCambio(parseInt(e.target.value), mes)}
        className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white"
      >
        {[anioActual - 1, anioActual, anioActual + 1].map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export function IncomeStatement() {
  const hoy = new Date();
  const [anio, setAnio] = useState(hoy.getFullYear());
  const [mes, setMes] = useState(hoy.getMonth() + 1);
  const [pl, setPL] = useState<PLResult | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargarPL = useCallback(async (a: number, m: number) => {
    setCargando(true);
    setError(null);
    try {
      const res = await fetch(`/api/financial/income-statement?anio=${a}&mes=${m}`);
      if (!res.ok) throw new Error('Error al cargar');
      const data = await res.json();
      setPL(data);
    } catch {
      setError('No se pudo cargar el estado de resultados');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargarPL(anio, mes);
  }, [anio, mes, cargarPL]);

  const handleCambioPeriodo = (a: number, m: number) => {
    setAnio(a);
    setMes(m);
  };

  // Estado: cargando
  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-3 text-gray-500">Calculando estado de resultados...</span>
      </div>
    );
  }

  // Estado: error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-red-700">{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => cargarPL(anio, mes)}
          className="ml-auto"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  if (!pl) return null;

  const mesNombre = MESES[mes - 1];

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Estado de Resultados
            </h2>
            <p className="text-sm text-gray-500">
              {mesNombre} {anio}
            </p>
          </div>
        </div>
        <SelectorPeriodo anio={anio} mes={mes} onCambio={handleCambioPeriodo} />
      </div>

      {/* Tabla P&L */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left py-3 pl-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Concepto
              </th>
              <th className="text-right py-3 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Monto (S/.)
              </th>
            </tr>
          </thead>
          <tbody>
            {/* INGRESOS */}
            <FilaConcepto
              etiqueta="INGRESOS TOTALES"
              valor={pl.ingresos.total}
              negrita
              signo="+"
              colorValor="text-green-700 font-bold"
            />
            <FilaConcepto
              etiqueta="Servicios cobrados (facturas pagadas/parciales)"
              valor={pl.ingresos.total}
              nivel={1}
            />

            {/* COSTOS DIRECTOS */}
            <FilaConcepto
              etiqueta="COSTOS DIRECTOS"
              valor={pl.costos_directos.total}
              negrita
              separador
              signo="-"
            />
            {pl.costos_directos.laboratorio > 0 && (
              <FilaConcepto
                etiqueta="Laboratorio dental"
                valor={pl.costos_directos.laboratorio}
                nivel={1}
              />
            )}
            {pl.costos_directos.insumos > 0 && (
              <FilaConcepto
                etiqueta="Insumos consumidos"
                valor={pl.costos_directos.insumos}
                nivel={1}
              />
            )}

            {/* UTILIDAD BRUTA */}
            <tr className="bg-blue-50">
              <td className="py-3 pl-3 text-sm font-bold text-blue-800">
                UTILIDAD BRUTA
              </td>
              <td className="py-3 pr-4 text-right">
                <span className="text-sm font-bold font-mono text-blue-800">
                  {formatMoneda(pl.utilidad_bruta)}
                </span>
                <span className="ml-2 text-xs text-blue-500">
                  {formatPorcentaje(pl.margen_bruto)}
                </span>
              </td>
            </tr>

            {/* GASTOS FIJOS */}
            <tr>
              <td colSpan={2} className="py-1">
                <div className="border-t border-gray-200" />
              </td>
            </tr>
            <SeccionColapsable
              titulo="GASTOS OPERATIVOS FIJOS"
              total={pl.gastos_fijos.total}
              desglose={pl.gastos_fijos.desglose}
              signo="-"
            />

            {/* GASTOS VARIABLES */}
            <SeccionColapsable
              titulo="GASTOS OPERATIVOS VARIABLES"
              total={pl.gastos_variables.total}
              desglose={pl.gastos_variables.desglose}
              signo="-"
            />

            {/* DEPRECIACIÓN */}
            {pl.depreciacion.total > 0 && (
              <>
                <tr
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    /* depreciación detalle se puede expandir si se desea */
                  }}
                >
                  <td className="py-2 pl-3 text-sm text-gray-700">
                    <span className="inline-block w-5 font-mono text-red-500">(-)</span>
                    DEPRECIACIÓN DE EQUIPOS
                  </td>
                  <td className="py-2 pr-4 text-right text-sm font-mono text-gray-700">
                    {formatMoneda(pl.depreciacion.total)}
                  </td>
                </tr>
                {pl.depreciacion.detalle.map((eq) => (
                  <tr key={eq.equipo_id}>
                    <td className="py-1 pl-12 text-xs text-gray-500">
                      └ {eq.nombre}
                    </td>
                    <td className="py-1 pr-4 text-right text-xs font-mono text-gray-500">
                      {formatMoneda(eq.depreciacion_periodo)}
                    </td>
                  </tr>
                ))}
              </>
            )}

            {/* RESULTADO NETO */}
            <tr>
              <td colSpan={2} className="py-1">
                <div className="border-t-2 border-gray-400" />
              </td>
            </tr>
            <tr
              className={`${
                pl.es_ganancia ? 'bg-green-50' : 'bg-red-50'
              }`}
            >
              <td className="py-4 pl-3 text-base font-bold">
                <div className="flex items-center gap-2">
                  {pl.es_ganancia ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <span
                    className={pl.es_ganancia ? 'text-green-800' : 'text-red-800'}
                  >
                    RESULTADO NETO — {pl.es_ganancia ? '✅ GANANCIA' : '❌ PÉRDIDA'}
                  </span>
                </div>
              </td>
              <td className="py-4 pr-4 text-right">
                <div
                  className={`text-xl font-bold font-mono ${
                    pl.es_ganancia ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {formatMoneda(pl.resultado_neto)}
                </div>
                <div
                  className={`text-xs mt-1 ${
                    pl.es_ganancia ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  Margen neto: {formatPorcentaje(pl.margen_neto)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detalle de equipos con valor en libros */}
      {pl.depreciacion.detalle.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Valor en Libros de Equipos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-2 text-xs text-gray-500 uppercase">
                    Equipo
                  </th>
                  <th className="text-right pb-2 text-xs text-gray-500 uppercase">
                    Dep. Mensual
                  </th>
                  <th className="text-right pb-2 text-xs text-gray-500 uppercase">
                    Dep. Período
                  </th>
                  <th className="text-right pb-2 text-xs text-gray-500 uppercase">
                    Valor en Libros
                  </th>
                </tr>
              </thead>
              <tbody>
                {pl.depreciacion.detalle.map((eq) => (
                  <tr key={eq.equipo_id} className="border-b border-gray-100">
                    <td className="py-2 text-gray-700">{eq.nombre}</td>
                    <td className="py-2 text-right font-mono text-gray-600">
                      {formatMoneda(eq.depreciacion_mensual)}
                    </td>
                    <td className="py-2 text-right font-mono text-gray-600">
                      {formatMoneda(eq.depreciacion_periodo)}
                    </td>
                    <td className="py-2 text-right font-mono font-semibold text-gray-900">
                      {formatMoneda(eq.valor_en_libros)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
