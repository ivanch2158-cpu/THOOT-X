// app/(dashboard)/dashboard/page.tsx
// Dashboard principal — métricas del día + accesos rápidos

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  ArrowRight,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/utils/format';
import { UserRole } from '@/lib/auth/roles';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface MetricasHoy {
  total_citas: number;
  completadas: number;
  en_curso: number;
  pendientes: number;
  proxima_cita: { paciente_nombre: string; hora: string } | null;
  alertas_stock: number;
}

interface MetricasAdmin {
  ingresos_hoy: number;
  ingresos_mes: number;
  variacion_ingresos: number | null;
  cartera_pendiente: number;
  num_facturas_pendientes: number;
  resultado_mes: number;
  es_ganancia_mes: boolean;
}

// ── TARJETA MÉTRICA ───────────────────────────────────────────────────────────

function TarjetaMetrica({
  titulo,
  valor,
  subtitulo,
  icono,
  colorBorde,
  colorIcono,
  href,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: React.ReactNode;
  colorBorde: string;
  colorIcono: string;
  href?: string;
}) {
  const contenido = (
    <div
      className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow border-l-4"
      style={{ borderLeftColor: colorBorde }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {titulo}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: colorIcono + '20' }}
        >
          <div style={{ color: colorIcono }}>{icono}</div>
        </div>
      </div>
      <p className="text-2xl font-bold text-gray-900 font-mono">{valor}</p>
      {subtitulo && (
        <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>
      )}
    </div>
  );

  return href ? <Link href={href}>{contenido}</Link> : contenido;
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const { role } = useAuth();
  const isAdmin = role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN;

  const [metricasHoy, setMetricasHoy] = useState<MetricasHoy | null>(null);
  const [metricasAdmin, setMetricasAdmin] = useState<MetricasAdmin | null>(null);
  const [cargando, setCargando] = useState(true);

  const hoy = new Date();
  const hora = hoy.getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  useEffect(() => {
    async function cargar() {
      try {
        const [citasRes, summaryRes] = await Promise.all([
          fetch('/api/appointments?filter=hoy'),
          isAdmin ? fetch('/api/financial/summary') : Promise.resolve(null),
        ]);

        if (citasRes.ok) {
          const d = await citasRes.json();
          setMetricasHoy({
            total_citas: d.count ?? 0,
            completadas: d.completadas ?? 0,
            en_curso: d.en_curso ?? 0,
            pendientes: d.pendientes ?? 0,
            proxima_cita: d.proxima ?? null,
            alertas_stock: d.alertas_stock ?? 0,
          });
        }

        if (summaryRes?.ok) {
          setMetricasAdmin(await summaryRes.json());
        }
      } catch {
        // Silenciar errores — los estados quedan en null
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, [isAdmin]);

  if (cargando) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{saludo} 👋</h1>
          <p className="text-gray-500 text-sm mt-1">
            {hoy.toLocaleDateString('es-PE', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <Link
          href="/dashboard/appointments"
          className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          Ver agenda
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Métricas del día */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TarjetaMetrica
          titulo="Citas hoy"
          valor={metricasHoy?.total_citas ?? 0}
          subtitulo="Total agendadas"
          icono={<Calendar className="w-4 h-4" />}
          colorBorde="#3B82F6" colorIcono="#3B82F6"
          href="/dashboard/appointments"
        />
        <TarjetaMetrica
          titulo="Completadas"
          valor={metricasHoy?.completadas ?? 0}
          subtitulo={`${metricasHoy?.en_curso ?? 0} en curso`}
          icono={<CheckCircle2 className="w-4 h-4" />}
          colorBorde="#10B981" colorIcono="#10B981"
        />
        <TarjetaMetrica
          titulo="Pendientes"
          valor={metricasHoy?.pendientes ?? 0}
          subtitulo="Por atender"
          icono={<Clock className="w-4 h-4" />}
          colorBorde="#F59E0B" colorIcono="#F59E0B"
        />
        <TarjetaMetrica
          titulo="Alertas stock"
          valor={metricasHoy?.alertas_stock ?? 0}
          subtitulo="Insumos bajos"
          icono={<AlertTriangle className="w-4 h-4" />}
          colorBorde={metricasHoy?.alertas_stock ? '#EF4444' : '#94A3B8'}
          colorIcono={metricasHoy?.alertas_stock ? '#EF4444' : '#94A3B8'}
          href="/dashboard/billing?tab=inventario"
        />
      </div>

      {/* Próxima cita */}
      {metricasHoy?.proxima_cita && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">Próxima cita</p>
            <p className="text-sm font-semibold text-blue-900">{metricasHoy.proxima_cita.paciente_nombre}</p>
            <p className="text-xs text-blue-600">{metricasHoy.proxima_cita.hora}</p>
          </div>
          <Link href="/dashboard/appointments" className="ml-auto text-blue-600 hover:text-blue-800">
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}

      {/* Métricas financieras — solo Admin */}
      {isAdmin && metricasAdmin && (
        <>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Resumen financiero del mes
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <TarjetaMetrica
              titulo="Ingresos hoy"
              valor={formatCurrency(metricasAdmin.ingresos_hoy)}
              icono={<DollarSign className="w-4 h-4" />}
              colorBorde="#3B82F6" colorIcono="#3B82F6"
              href="/dashboard/billing"
            />
            <TarjetaMetrica
              titulo="Ingresos del mes"
              valor={formatCurrency(metricasAdmin.ingresos_mes)}
              subtitulo={
                metricasAdmin.variacion_ingresos !== null
                  ? `${metricasAdmin.variacion_ingresos >= 0 ? '+' : ''}${metricasAdmin.variacion_ingresos.toFixed(1)}% vs mes anterior`
                  : undefined
              }
              icono={<TrendingUp className="w-4 h-4" />}
              colorBorde="#10B981" colorIcono="#10B981"
              href="/dashboard/billing"
            />
            <TarjetaMetrica
              titulo="Cartera pendiente"
              valor={formatCurrency(metricasAdmin.cartera_pendiente)}
              subtitulo={`${metricasAdmin.num_facturas_pendientes} facturas`}
              icono={<Clock className="w-4 h-4" />}
              colorBorde="#F59E0B" colorIcono="#F59E0B"
              href="/dashboard/billing?tab=facturas"
            />
            <TarjetaMetrica
              titulo="Resultado del mes"
              valor={formatCurrency(metricasAdmin.resultado_mes)}
              subtitulo={metricasAdmin.es_ganancia_mes ? '✅ Ganancia' : '❌ Pérdida'}
              icono={metricasAdmin.es_ganancia_mes ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              colorBorde={metricasAdmin.es_ganancia_mes ? '#10B981' : '#EF4444'}
              colorIcono={metricasAdmin.es_ganancia_mes ? '#10B981' : '#EF4444'}
              href="/dashboard/billing?tab=resultados"
            />
          </div>
        </>
      )}

      {/* Accesos rápidos */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
          Accesos rápidos
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Nueva cita', href: '/dashboard/appointments', color: '#3B82F6', Icono: Calendar },
            { label: 'Nuevo paciente', href: '/dashboard/patients', color: '#8B5CF6', Icono: Users },
            { label: 'Nueva factura', href: '/dashboard/billing?tab=facturas', color: '#10B981', Icono: DollarSign },
            { label: 'Ver agenda', href: '/dashboard/appointments', color: '#F59E0B', Icono: Clock },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all text-center"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: item.color + '18' }}
              >
                <item.Icono className="w-5 h-5" style={{ color: item.color }} />
              </div>
              <span className="text-xs font-medium text-gray-700">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
