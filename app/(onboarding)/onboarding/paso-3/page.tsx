// app/(onboarding)/onboarding/paso-3/page.tsx
// Wizard paso 3 — Horarios de atención y duración de citas

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

interface DiaSemana {
  activo: boolean;
  inicio: string;
  fin: string;
}

type HorarioSemana = Record<string, DiaSemana>;

const DIAS = [
  { key: 'lunes', label: 'Lunes' },
  { key: 'martes', label: 'Martes' },
  { key: 'miercoles', label: 'Miércoles' },
  { key: 'jueves', label: 'Jueves' },
  { key: 'viernes', label: 'Viernes' },
  { key: 'sabado', label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
];

const HORAS_INICIO_DEFAULT = '08:00';
const HORAS_FIN_DEFAULT = '18:00';

const DURACIONES_CITA = [
  { valor: 15, etiqueta: '15 min' },
  { valor: 30, etiqueta: '30 min' },
  { valor: 45, etiqueta: '45 min' },
  { valor: 60, etiqueta: '1 hora' },
  { valor: 90, etiqueta: '1h 30min' },
];

// ── COMPONENTE ────────────────────────────────────────────────────────────────

export default function Paso3Page() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);
  const [duracion, setDuracion] = useState(45);

  const [horario, setHorario] = useState<HorarioSemana>(() =>
    DIAS.reduce((acc, dia) => ({
      ...acc,
      [dia.key]: {
        activo: dia.key !== 'domingo',
        inicio: HORAS_INICIO_DEFAULT,
        fin: HORAS_FIN_DEFAULT,
      },
    }), {} as HorarioSemana)
  );

  const toggleDia = (key: string) => {
    setHorario((h) => ({
      ...h,
      [key]: { ...h[key], activo: !h[key].activo },
    }));
  };

  const setHoraInicio = (key: string, valor: string) => {
    setHorario((h) => ({ ...h, [key]: { ...h[key], inicio: valor } }));
  };

  const setHoraFin = (key: string, valor: string) => {
    setHorario((h) => ({ ...h, [key]: { ...h[key], fin: valor } }));
  };

  const onSubmit = async () => {
    setGuardando(true);
    try {
      const res = await fetch('/api/tenant/onboarding/paso-3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ horario, duracion_cita_min: duracion }),
      });
      if (!res.ok) throw new Error();
      router.push('/onboarding/paso-4');
    } catch {
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Horarios de atención</h1>
            <p className="text-sm text-gray-500">
              Define cuándo está disponible tu consultorio
            </p>
          </div>
        </div>

        {/* Tabla de días */}
        <div className="space-y-2 mb-6">
          {DIAS.map((dia) => {
            const { activo, inicio, fin } = horario[dia.key];
            return (
              <div
                key={dia.key}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  activo ? 'bg-gray-50' : 'opacity-50'
                }`}
              >
                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => toggleDia(dia.key)}
                  className={`relative w-10 h-5 rounded-full transition-colors flex-shrink-0 ${
                    activo ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                      activo ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {/* Nombre día */}
                <span
                  className={`w-20 text-sm font-medium flex-shrink-0 ${
                    activo ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {dia.label}
                </span>

                {/* Horas */}
                {activo ? (
                  <div className="flex items-center gap-2 flex-1">
                    <input
                      type="time"
                      value={inicio}
                      onChange={(e) => setHoraInicio(dia.key, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
                    />
                    <span className="text-gray-400 text-sm">—</span>
                    <input
                      type="time"
                      value={fin}
                      onChange={(e) => setHoraFin(dia.key, e.target.value)}
                      className="text-sm border border-gray-300 rounded-lg px-2 py-1.5 bg-white"
                    />
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 flex-1">Cerrado</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Duración de citas */}
        <div className="border-t border-gray-100 pt-5">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Duración por defecto de las citas
          </label>
          <div className="flex flex-wrap gap-2">
            {DURACIONES_CITA.map((d) => (
              <button
                key={d.valor}
                type="button"
                onClick={() => setDuracion(d.valor)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                  duracion === d.valor
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {d.etiqueta}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            Se puede modificar al agendar cada cita individualmente
          </p>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push('/onboarding/paso-2')}
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          disabled={guardando}
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {guardando ? 'Guardando...' : 'Continuar'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
