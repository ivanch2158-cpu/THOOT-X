// components/voice/VoiceConfirmBar.tsx
// Barra de confirmación de hallazgo detectado por voz en el odontograma
// Se muestra sticky en la parte inferior del odontograma cuando hay un comando pendiente

'use client';

import { Check, X, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { OdontogramaCommand } from '@/lib/voice/parser';

// ── MAPAS DE ETIQUETAS ────────────────────────────────────────────────────────

const ETIQUETA_SUPERFICIE: Record<string, string> = {
  oclusal: 'Oclusal (masticatoria)',
  vestibular: 'Vestibular (frontal)',
  palatino: 'Palatino / Lingual',
  mesial: 'Mesial (izquierda)',
  distal: 'Distal (derecha)',
};

const ETIQUETA_CONDICION: Record<string, string> = {
  caries: 'Caries',
  obturacion: 'Obturación / Empaste',
  corona: 'Corona',
  ausente: 'Ausente / Extraído',
  fractura: 'Fractura',
  implante: 'Implante',
  endodoncia: 'Endodoncia',
  sellante: 'Sellante',
  sano: 'Sano',
};

const COLOR_CONDICION: Record<string, string> = {
  caries: '#EF4444',
  obturacion: '#3B82F6',
  corona: '#F59E0B',
  ausente: '#475569',
  fractura: '#F97316',
  implante: '#10B981',
  endodoncia: '#8B5CF6',
  sellante: '#38BDF8',
  sano: '#F1F5F9',
};

// ── COMPONENTE ────────────────────────────────────────────────────────────────

interface VoiceConfirmBarProps {
  /** Comando pendiente de confirmación. Si es null, no se muestra la barra. */
  command: OdontogramaCommand | null;
  /** Mensaje de estado actual del asistente */
  statusMessage: string;
  /** Está escuchando activamente */
  isListening: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function VoiceConfirmBar({
  command,
  statusMessage,
  isListening,
  onConfirm,
  onCancel,
}: VoiceConfirmBarProps) {
  if (!isListening && !command) return null;

  const colorCondicion = command ? COLOR_CONDICION[command.condicion] ?? '#94A3B8' : '#94A3B8';

  return (
    <div
      className="sticky bottom-0 left-0 right-0 rounded-b-xl border-t-4 z-10"
      style={{ borderTopColor: command ? colorCondicion : '#3B82F6', background: '#F8FAFC' }}
    >
      {/* Indicador de escucha */}
      <div className="px-4 py-2 flex items-center gap-2 border-b border-gray-200">
        <span
          className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}
        />
        <span className="text-xs text-gray-500">
          {isListening ? 'Escuchando...' : 'Modo voz inactivo'}
        </span>
        {statusMessage && (
          <span className="text-xs text-gray-600 ml-2 italic">{statusMessage}</span>
        )}
      </div>

      {/* Panel de confirmación */}
      {command && (
        <div className="px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Indicador de color de condición */}
            <div
              className="w-4 h-4 rounded-full flex-shrink-0 border border-white shadow-sm"
              style={{ backgroundColor: colorCondicion }}
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 leading-tight">
                🦷 Diente {command.numero_diente}
              </p>
              <p className="text-xs text-gray-600 truncate">
                {ETIQUETA_SUPERFICIE[command.superficie]} ·{' '}
                <span style={{ color: colorCondicion }}>
                  {ETIQUETA_CONDICION[command.condicion]}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={onCancel}
              size="sm"
              variant="outline"
              className="border-red-200 text-red-600 hover:bg-red-50 gap-1 text-xs"
            >
              <X className="w-3 h-3" />
              Cancelar
            </Button>
            <Button
              onClick={onConfirm}
              size="sm"
              className="gap-1 text-xs"
              style={{ backgroundColor: colorCondicion }}
            >
              <Check className="w-3 h-3" />
              Confirmar
            </Button>
          </div>
        </div>
      )}

      {/* Tip de comandos de control cuando está escuchando pero sin comando pendiente */}
      {isListening && !command && (
        <div className="px-4 pb-3">
          <p className="text-xs text-gray-400 text-center">
            Di: <span className="font-mono bg-gray-100 px-1 rounded">"diente 16 oclusal caries"</span>
          </p>
        </div>
      )}
    </div>
  );
}
