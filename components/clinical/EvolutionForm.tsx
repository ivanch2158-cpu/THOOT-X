// components/clinical/EvolutionForm.tsx
// Formulario para crear/editar evoluciones clínicas

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { evolucionSchema, type EvolucionInput } from '@/lib/clinical/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';

interface EvolutionFormProps {
  patientId: string;
  isEditing?: boolean;
  initialData?: Partial<EvolucionInput> & { id?: string };
  onClose?: () => void;
  onSuccess?: () => void;
}

export function EvolutionForm({
  patientId,
  isEditing = false,
  initialData,
  onClose,
  onSuccess,
}: EvolutionFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EvolucionInput>({
    resolver: zodResolver(evolucionSchema),
    defaultValues: {
      ...initialData,
      paciente_id: patientId,
    },
  });

  const onSubmit = async (data: EvolucionInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const url = isEditing
        ? `/api/clinical/evolutions/${initialData?.id}`
        : '/api/clinical/evolutions';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al guardar evolución');
        return;
      }

      // Éxito
      onSuccess?.();
      onClose?.();
      router.refresh();
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Evolution form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Editar Evolución' : 'Nueva Evolución Clínica'}
        </h2>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Alerta de Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Diagnóstico */}
      <div className="space-y-2">
        <label htmlFor="diagnostico" className="text-sm font-medium text-gray-700">
          Diagnóstico *
        </label>
        <textarea
          id="diagnostico"
          placeholder="Descripción del diagnóstico..."
          disabled={isLoading}
          {...register('diagnostico')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        {errors.diagnostico && (
          <p className="text-xs text-red-500">{errors.diagnostico.message}</p>
        )}
      </div>

      {/* Tratamiento Realizado */}
      <div className="space-y-2">
        <label htmlFor="tratamiento_realizado" className="text-sm font-medium text-gray-700">
          Tratamiento Realizado *
        </label>
        <textarea
          id="tratamiento_realizado"
          placeholder="Descripción del tratamiento aplicado..."
          disabled={isLoading}
          {...register('tratamiento_realizado')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        {errors.tratamiento_realizado && (
          <p className="text-xs text-red-500">{errors.tratamiento_realizado.message}</p>
        )}
      </div>

      {/* Próxima Cita Recomendada */}
      <div className="space-y-2">
        <label htmlFor="proxima_cita_recomendada" className="text-sm font-medium text-gray-700">
          Próxima Cita Recomendada
        </label>
        <Input
          id="proxima_cita_recomendada"
          placeholder="Ej: En 2 semanas para seguimiento"
          disabled={isLoading}
          {...register('proxima_cita_recomendada')}
          className={errors.proxima_cita_recomendada ? 'border-red-500' : ''}
        />
      </div>

      {/* Signos Vitales */}
      <div className="border-t pt-4 mt-4">
        <h3 className="font-semibold text-gray-900 mb-4">Signos Vitales (Opcional)</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label htmlFor="presion_arterial" className="text-sm font-medium text-gray-700">
              Presión Arterial
            </label>
            <Input
              id="presion_arterial"
              placeholder="120/80 mmHg"
              disabled={isLoading}
              {...register('presion_arterial')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="frecuencia_cardiaca" className="text-sm font-medium text-gray-700">
              Frecuencia Cardíaca
            </label>
            <Input
              id="frecuencia_cardiaca"
              placeholder="72 bpm"
              disabled={isLoading}
              {...register('frecuencia_cardiaca')}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="temperatura" className="text-sm font-medium text-gray-700">
              Temperatura
            </label>
            <Input
              id="temperatura"
              placeholder="36.5°C"
              disabled={isLoading}
              {...register('temperatura')}
            />
          </div>
        </div>
      </div>

      {/* Observaciones */}
      <div className="space-y-2">
        <label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
          Observaciones Adicionales
        </label>
        <textarea
          id="observaciones"
          placeholder="Notas adicionales..."
          disabled={isLoading}
          {...register('observaciones')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
        />
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Actualizar Evolución'
          ) : (
            'Registrar Evolución'
          )}
        </Button>

        {onClose && (
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancelar
          </Button>
        )}
      </div>
    </form>
  );
}
