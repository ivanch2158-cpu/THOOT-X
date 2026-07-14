// app/(onboarding)/onboarding/paso-5/page.tsx
// Wizard paso 5 — ¡Configuración completa! Resumen y acceso al dashboard

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Building2, Palette, Clock, Users, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── RESUMEN ITEMS ─────────────────────────────────────────────────────────────

const ITEMS_RESUMEN = [
  {
    icono: Building2,
    colorFondo: 'bg-blue-50',
    colorIcono: 'text-blue-600',
    titulo: 'Datos del consultorio',
    descripcion: 'Nombre, RUC, teléfono y especialidad guardados',
  },
  {
    icono: Palette,
    colorFondo: 'bg-purple-50',
    colorIcono: 'text-purple-600',
    titulo: 'Identidad visual',
    descripcion: 'Logo, colores y tipografía configurados',
  },
  {
    icono: Clock,
    colorFondo: 'bg-green-50',
    colorIcono: 'text-green-600',
    titulo: 'Horarios de atención',
    descripcion: 'Días y horas de atención definidos',
  },
  {
    icono: Users,
    colorFondo: 'bg-orange-50',
    colorIcono: 'text-orange-600',
    titulo: 'Equipo',
    descripcion: 'Invitaciones enviadas a los miembros',
  },
];

// ── COMPONENTE ────────────────────────────────────────────────────────────────

export default function Paso5Page() {
  const router = useRouter();
  const [completando, setCompletando] = useState(false);
  const [completado, setCompletado] = useState(false);

  useEffect(() => {
    // Marcar onboarding como completo automáticamente al llegar a este paso
    async function marcarCompleto() {
      try {
        await fetch('/api/tenant/onboarding/completar', { method: 'POST' });
        setCompletado(true);
      } catch {
        setCompletado(true); // Continuar de todas formas
      }
    }
    marcarCompleto();
  }, []);

  const irAlDashboard = async () => {
    setCompletando(true);
    router.push('/dashboard');
  };

  return (
    <div className="text-center">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {/* Ícono de éxito */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
            {completado ? (
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            ) : (
              <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          ¡Todo listo!
        </h1>
        <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
          Tu consultorio está configurado. Ya puedes empezar a gestionar tus citas,
          pacientes y más desde el dashboard.
        </p>

        {/* Resumen de lo configurado */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
          {ITEMS_RESUMEN.map((item) => (
            <div
              key={item.titulo}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${item.colorFondo}`}
              >
                <item.icono className={`w-4 h-4 ${item.colorIcono}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{item.titulo}</p>
                <p className="text-xs text-gray-500">{item.descripcion}</p>
              </div>
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0 ml-auto mt-0.5" />
            </div>
          ))}
        </div>

        {/* Botón principal */}
        <Button
          onClick={irAlDashboard}
          disabled={completando || !completado}
          className="w-full gap-2 bg-blue-600 hover:bg-blue-700 text-base py-3"
        >
          {completando ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Cargando...
            </>
          ) : (
            <>
              Ir al Dashboard
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400 mt-4">
        Puedes editar toda esta información en cualquier momento desde{' '}
        <span className="font-medium">Configuración</span>
      </p>
    </div>
  );
}
