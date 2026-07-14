// app/(onboarding)/layout.tsx
// Layout especial para el wizard de onboarding — sin sidebar, con indicador de progreso

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';

// ── PASOS DEL WIZARD ──────────────────────────────────────────────────────────

const PASOS = [
  { numero: 1, label: 'Tu consultorio', path: '/onboarding/paso-1' },
  { numero: 2, label: 'Identidad visual', path: '/onboarding/paso-2' },
  { numero: 3, label: 'Horarios', path: '/onboarding/paso-3' },
  { numero: 4, label: 'Equipo', path: '/onboarding/paso-4' },
  { numero: 5, label: 'Listo', path: '/onboarding/paso-5' },
];

function getStepFromPath(pathname: string): number {
  const match = pathname.match(/paso-(\d)/);
  return match ? parseInt(match[1]) : 1;
}

// ── COMPONENTE INDICADOR ──────────────────────────────────────────────────────

function StepIndicator({ pasoActual }: { pasoActual: number }) {
  return (
    <nav className="flex items-center justify-center gap-0" aria-label="Progreso del wizard">
      {PASOS.map((paso, idx) => {
        const completado = paso.numero < pasoActual;
        const activo = paso.numero === pasoActual;

        return (
          <div key={paso.numero} className="flex items-center">
            {/* Línea conectora */}
            {idx > 0 && (
              <div
                className="h-0.5 w-8 sm:w-16 transition-colors duration-300"
                style={{
                  backgroundColor: completado ? 'var(--color-primary, #2563EB)' : '#E2E8F0',
                }}
              />
            )}

            {/* Paso */}
            <div className="flex flex-col items-center gap-1.5">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300"
                style={{
                  backgroundColor: completado || activo
                    ? 'var(--color-primary, #2563EB)'
                    : '#F1F5F9',
                  color: completado || activo ? '#FFFFFF' : '#94A3B8',
                  boxShadow: activo ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
                }}
              >
                {completado ? <CheckCircle2 className="w-4 h-4" /> : paso.numero}
              </div>
              <span
                className="text-xs hidden sm:block font-medium transition-colors"
                style={{ color: activo ? 'var(--color-primary, #2563EB)' : '#94A3B8' }}
              >
                {paso.label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// ── LAYOUT ────────────────────────────────────────────────────────────────────

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const pasoActual = getStepFromPath(pathname);

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: 'var(--color-surface, #F8FAFC)' }}
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex flex-col items-center gap-6">
          {/* Logo TOOTH X */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
              style={{ backgroundColor: 'var(--color-primary, #2563EB)' }}
            >
              TX
            </div>
            <span className="text-lg font-bold text-gray-900">TOOTH X</span>
          </div>

          {/* Indicador de progreso */}
          <StepIndicator pasoActual={pasoActual} />
        </div>
      </header>

      {/* Contenido del paso */}
      <main className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-gray-400">
          TOOTH X · Software para consultorios odontológicos
        </p>
      </footer>
    </div>
  );
}
