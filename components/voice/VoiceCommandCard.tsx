// components/voice/VoiceCommandCard.tsx
// Modal de referencia de comandos de voz disponibles
// Se activa con el comando "ayuda" o desde el header

'use client';

import { useState } from 'react';
import { Mic, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCommandsByGroup } from '@/lib/voice/commandRegistry';

// ── COMPONENTE ────────────────────────────────────────────────────────────────

interface VoiceCommandCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ICONOS_GRUPO: Record<string, string> = {
  Agenda: '📅',
  Navegación: '🧭',
  Citas: '🦷',
  Tratamiento: '📋',
  Facturación: '🧾',
  Control: '⚙️',
};

export function VoiceCommandCard({ isOpen, onClose }: VoiceCommandCardProps) {
  const [expandidos, setExpandidos] = useState<Record<string, boolean>>({
    Agenda: true,
    Navegación: true,
  });

  const grupos = getCommandsByGroup();

  const toggleGrupo = (grupo: string) => {
    setExpandidos((prev) => ({ ...prev, [grupo]: !prev[grupo] }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-4 top-16 z-50 w-full max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-white" />
            <span className="text-white font-semibold text-base">
              Comandos de Voz
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip de uso */}
        <div className="bg-blue-50 px-5 py-3 border-b border-blue-100">
          <p className="text-xs text-blue-700">
            <strong>Atajo:</strong> Alt + M para activar/desactivar el micrófono
          </p>
        </div>

        {/* Lista de comandos */}
        <div className="overflow-y-auto max-h-[70vh] divide-y divide-gray-100">
          {Object.entries(grupos).map(([grupo, comandos]) => (
            <div key={grupo}>
              <button
                onClick={() => toggleGrupo(grupo)}
                className="w-full flex items-center justify-between px-5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>{ICONOS_GRUPO[grupo] ?? '💬'}</span>
                  {grupo}
                </span>
                {expandidos[grupo] ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {expandidos[grupo] && (
                <div className="px-5 pb-3 space-y-2">
                  {comandos.map((cmd) => (
                    <div key={cmd.id} className="space-y-1">
                      <p className="text-xs text-gray-500">{cmd.descripcion}</p>
                      <div className="flex flex-wrap gap-1">
                        {cmd.ejemplos.slice(0, 2).map((ejemplo, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 text-gray-700 rounded px-2 py-0.5 font-mono"
                          >
                            "{ejemplo}"
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <Button
            onClick={onClose}
            size="sm"
            variant="outline"
            className="w-full"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </>
  );
}
