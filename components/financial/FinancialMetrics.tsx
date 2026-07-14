// components/financial/FinancialMetrics.tsx
// Panel de métricas financieras del dashboard — tarjetas resumen + gráficos Recharts

'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface MesDato {
  mes: string;
  ingresos: number;
  gastos: number;
}

interface DashboardSummary {
  ingresos_hoy: number;
  ingresos_mes: number;
  gastos_mes: number;
  cartera_pendiente: number;
  num_facturas_pendientes: number;
  variacion_ingresos: number | null;
  resultado_mes: number;
  es_ganancia_mes: boolean;
  ingresos_por_mes: MesDato[];
}

// ── COLORES ───────────────────────────────────────────────────────────────────

const COLORES_GRAFICO = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6'];

// ── HELPERS ───────────────────────────────────────────────────────────────────

function formatMoneda(valor: number): string {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
  }).format(valor);
}

// ── COMPONENTE TARJETA ────────────────────────────────────────────────────────

interface TarjetaProps {
  titulo: string;
  valor: string;
  icono: React.ReactNode;
  colorFondo: string;
  tendencia?: {
    valor: number | null;
    etiqueta: string;
  };
  subtitulo?: string;
}

function TarjetaMetrica({
  titulo,
  valor,
  icono,
  colorFondo,
  tendencia,
  subtitulo,
}: TarjetaProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{titulo}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorFondo}`}>
          {icono}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 font-mono">{valor}</div>
      {subtitulo && (
        <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>
      )}
      {tendencia?.valor !== undefined && tendencia.valor !== null && (
        <div
          className={`flex items-center gap-1 mt-2 text-xs font-medium ${
            tendencia.valor >= 0 ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {tendencia.valor >= 0 ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <ArrowDownRight className="w-3 h-3" />
          )}
          <span>
            {tendencia.valor >= 0 ? '+' : ''}
            {tendencia.valor.toFixed(1)}% {tendencia.etiqueta}
          </span>
        </div>
      )}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export function FinancialMetrics() {
  const [datos, setDatos] = useState<DashboardSummary | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      try {
        const res = await fetch('/api/financial/summary');
        if (!res.ok) throw new Error('Error al cargar métricas');
        const json = await res.json();
        setDatos(json);
      } catch (err) {
        setError('No se pudieron cargar las métricas financieras');
      } finally {
        setCargando(false);
      }
    }
    cargarDatos();
  }, []);

  // Estado: cargando
  if (cargando) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-3/4" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border p-6 animate-pulse h-64" />
      </div>
    );
  }

  // Estado: error
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  // Estado: sin datos
  if (!datos) return null;

  // Datos para gráfico de torta (gastos del mes)
  const datosTorta = Object.entries({
    Ingresos: datos.ingresos_mes,
    Gastos: datos.gastos_mes,
  })
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* ── Tarjetas de resumen ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaMetrica
          titulo="Ingresos de Hoy"
          valor={formatMoneda(datos.ingresos_hoy)}
          icono={<DollarSign className="w-5 h-5 text-blue-600" />}
          colorFondo="bg-blue-50"
          subtitulo="Cobros registrados hoy"
        />
        <TarjetaMetrica
          titulo="Ingresos del Mes"
          valor={formatMoneda(datos.ingresos_mes)}
          icono={<TrendingUp className="w-5 h-5 text-green-600" />}
          colorFondo="bg-green-50"
          tendencia={
            datos.variacion_ingresos !== null
              ? {
                  valor: datos.variacion_ingresos,
                  etiqueta: 'vs mes anterior',
                }
              : undefined
          }
        />
        <TarjetaMetrica
          titulo="Gastos del Mes"
          valor={formatMoneda(datos.gastos_mes)}
          icono={<TrendingDown className="w-5 h-5 text-red-500" />}
          colorFondo="bg-red-50"
          subtitulo="Fijos + variables"
        />
        <TarjetaMetrica
          titulo="Cartera Pendiente"
          valor={formatMoneda(datos.cartera_pendiente)}
          icono={<Clock className="w-5 h-5 text-amber-600" />}
          colorFondo="bg-amber-50"
          subtitulo={`${datos.num_facturas_pendientes} factura${
            datos.num_facturas_pendientes !== 1 ? 's' : ''
          } por cobrar`}
        />
      </div>

      {/* ── Resultado del mes ── */}
      <div
        className={`rounded-xl border p-5 flex items-center justify-between ${
          datos.es_ganancia_mes
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}
      >
        <div>
          <p className="text-sm text-gray-600">Resultado del Mes</p>
          <p
            className={`text-3xl font-bold font-mono ${
              datos.es_ganancia_mes ? 'text-green-700' : 'text-red-700'
            }`}
          >
            {formatMoneda(datos.resultado_mes)}
          </p>
        </div>
        <div
          className={`text-lg font-semibold flex items-center gap-2 ${
            datos.es_ganancia_mes ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {datos.es_ganancia_mes ? (
            <>
              <TrendingUp className="w-6 h-6" />
              GANANCIA
            </>
          ) : (
            <>
              <TrendingDown className="w-6 h-6" />
              PÉRDIDA
            </>
          )}
        </div>
      </div>

      {/* ── Gráficos ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Barras: Ingresos vs Gastos por mes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Ingresos vs Gastos — Últimos 6 meses
          </h3>
          {datos.ingresos_por_mes.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Sin datos para mostrar
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={datos.ingresos_por_mes}
                margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis
                  dataKey="mes"
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(v) => `S/.${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: number) => [formatMoneda(value), '']}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                />
                <Bar
                  dataKey="ingresos"
                  name="Ingresos"
                  fill="#3B82F6"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="gastos"
                  name="Gastos"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Torta: Ingresos vs Gastos del mes */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Distribución del Mes Actual
          </h3>
          {datosTorta.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
              Sin movimientos este mes
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={datosTorta}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {datosTorta.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORES_GRAFICO[index % COLORES_GRAFICO.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [formatMoneda(value), '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {datosTorta.map((item, i) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor:
                            COLORES_GRAFICO[i % COLORES_GRAFICO.length],
                        }}
                      />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-mono font-medium text-gray-900">
                      {formatMoneda(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
