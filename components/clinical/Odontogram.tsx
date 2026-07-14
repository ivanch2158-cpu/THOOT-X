// components/clinical/Odontogram.tsx
// Odontograma interactivo con SVG para visualizar estado de dientes

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ToothState {
  numero: number;
  estado: string;
  cara?: string;
}

interface OdontogramProps {
  patientId: string;
  initialStates?: ToothState[];
  readonly?: boolean;
  onSave?: (states: ToothState[]) => void;
}

// Colorimetría del odontograma
const TOOTH_COLORS: Record<string, string> = {
  sano: '#F1F5F9',
  caries: '#EF4444',
  obturacion: '#3B82F6',
  corona: '#F59E0B',
  ausente: '#475569',
  fractura: '#F97316',
  implante: '#10B981',
  endodoncia: '#8B5CF6',
  sellante: '#38BDF8',
};

const TOOTH_LABELS: Record<string, string> = {
  sano: 'Sano',
  caries: 'Caries',
  obturacion: 'Obturación',
  corona: 'Corona',
  ausente: 'Ausente',
  fractura: 'Fractura',
  implante: 'Implante',
  endodoncia: 'Endodoncia',
  sellante: 'Sellante',
};

export function Odontogram({
  patientId: _patientId,
  initialStates = [],
  readonly = false,
  onSave,
}: OdontogramProps) {
  const [toothStates, setToothStates] = useState<Map<number, ToothState>>(
    new Map(initialStates.map((ts) => [ts.numero, ts]))
  );
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [selectedState, setSelectedState] = useState<string>('sano');
  const [isSaving, setIsSaving] = useState(false);

  // Números de dientes (notación FDI)
  // Superior: 11-18 (derecha a izquierda), 21-28 (izquierda a derecha)
  // Inferior: 41-48 (izquierda a derecha), 31-38 (derecha a izquierda)
  const toothNumbers = {
    upperRight: [18, 17, 16, 15, 14, 13, 12, 11],
    upperLeft: [21, 22, 23, 24, 25, 26, 27, 28],
    lowerLeft: [38, 37, 36, 35, 34, 33, 32, 31],
    lowerRight: [48, 47, 46, 45, 44, 43, 42, 41],
  };

  const handleToothClick = (toothNumber: number) => {
    if (readonly) return;
    setSelectedTooth(toothNumber);
  };

  const handleStateChange = (state: string) => {
    if (!selectedTooth || readonly) return;

    const newStates = new Map(toothStates);
    newStates.set(selectedTooth, {
      numero: selectedTooth,
      estado: state,
    });
    setToothStates(newStates);
    setSelectedState(state);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const states = Array.from(toothStates.values());
      onSave?.(states);

      // Aquí iría la llamada a la API para guardar
      // await fetch(`/api/clinical/odontogram/${patientId}`, { ... })
    } finally {
      setIsSaving(false);
    }
  };

  const getToothColor = (toothNumber: number): string => {
    const state = toothStates.get(toothNumber);
    return state ? TOOTH_COLORS[state.estado] || TOOTH_COLORS.sano : TOOTH_COLORS.sano;
  };

  const renderToothGrid = (toothNumbers: number[], label: string) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">{label}</h3>
      <div className="flex gap-2 flex-wrap">
        {toothNumbers.map((toothNumber) => (
          <button
            key={toothNumber}
            onClick={() => handleToothClick(toothNumber)}
            disabled={readonly}
            className={`relative w-10 h-12 rounded border-2 transition ${
              selectedTooth === toothNumber
                ? 'border-blue-500 ring-2 ring-blue-300'
                : 'border-gray-300'
            } ${readonly ? 'cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
            style={{ backgroundColor: getToothColor(toothNumber) }}
            title={`Diente ${toothNumber}`}
          >
            <span className="text-xs font-bold text-gray-800">
              {toothNumber}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 bg-white rounded-lg border p-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Odontograma</h2>
        <p className="text-gray-600 text-sm mt-1">
          {readonly
            ? 'Visualización del estado dental'
            : 'Haz clic en los dientes para cambiar su estado'}
        </p>
      </div>

      {/* Grid Superior (Maxilar) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Maxilar Superior</h3>
        <div className="space-y-4">
          {renderToothGrid(toothNumbers.upperRight, 'Lado Derecho →')}
          {renderToothGrid(toothNumbers.upperLeft, '← Lado Izquierdo')}
        </div>
      </div>

      {/* Separador */}
      <div className="border-t-2 border-dashed border-gray-300" />

      {/* Grid Inferior (Mandíbula) */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mandíbula Inferior</h3>
        <div className="space-y-4">
          {renderToothGrid(toothNumbers.lowerLeft, 'Lado Izquierdo →')}
          {renderToothGrid(toothNumbers.lowerRight, '← Lado Derecho')}
        </div>
      </div>

      {/* Panel de control */}
      {!readonly && selectedTooth && (
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Diente #{selectedTooth} - Estado Actual:
            </p>
            <p className="text-lg font-bold text-gray-900">
              {TOOTH_LABELS[selectedState]}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">
              Cambiar Estado:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(TOOTH_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => handleStateChange(key)}
                  className={`px-3 py-2 rounded text-sm font-medium transition ${
                    selectedState === key
                      ? 'ring-2 ring-blue-400'
                      : 'border border-gray-300'
                  }`}
                  style={{
                    backgroundColor: TOOTH_COLORS[key],
                    color: key === 'sano' || key === 'ausente' ? '#000' : '#fff',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Leyenda de colores */}
      <div className="border-t pt-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Colorimetría</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {Object.entries(TOOTH_LABELS).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded border"
                style={{ backgroundColor: TOOTH_COLORS[key] }}
              />
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Botón guardar */}
      {!readonly && (
        <Button
          onClick={handleSave}
          disabled={isSaving || toothStates.size === 0}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isSaving ? 'Guardando...' : 'Guardar Odontograma'}
        </Button>
      )}

      {/* Resumen */}
      {toothStates.size > 0 && (
        <Alert className="bg-blue-50 border-blue-200">
          <AlertDescription className="text-blue-900">
            {toothStates.size} diente(s) con cambios registrados
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
