// components/treatment/TreatmentPlanForm.tsx
// Formulario para crear/editar planes de tratamiento

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { planTratamientoSchema, type PlanTratamientoInput } from '@/lib/clinical/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';

interface TreatmentPlanFormProps {
  patientId: string;
  isEditing?: boolean;
  initialData?: Partial<PlanTratamientoInput> & { id?: string };
  onClose?: () => void;
  onSuccess?: () => void;
}

export function TreatmentPlanForm({
  patientId,
  isEditing = false,
  initialData,
  onClose,
  onSuccess,
}: TreatmentPlanFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PlanTratamientoInput>({
    resolver: zodResolver(planTratamientoSchema),
    defaultValues: {
      estado: 'pendiente',
      ...initialData,
      paciente_id: patientId,
    },
  });

  const costoTotal = watch('costo_total');

  const onSubmit = async (data: PlanTratamientoInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const url = isEditing
        ? `/api/treatment-plans/${initialData?.id}`
        : '/api/treatment-plans';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al guardar plan de tratamiento');
        return;
      }

      // Éxito
      onSuccess?.();
      onClose?.();
      router.refresh();
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Treatment plan form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Editar Plan de Tratamiento' : 'Nuevo Plan de Tratamiento'}
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

      {/* Descripción */}
      <div className="space-y-2">
        <label htmlFor="descripcion" className="text-sm font-medium text-gray-700">
          Descripción del Plan *
        </label>
        <textarea
          id="descripcion"
          placeholder="Descripción detallada del plan de tratamiento..."
          disabled={isLoading}
          {...register('descripcion')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
        {errors.descripcion && (
          <p className="text-xs text-red-500">{errors.descripcion.message}</p>
        )}
      </div>

      {/* Costo Total */}
      <div className="space-y-2">
        <label htmlFor="costo_total" className="text-sm font-medium text-gray-700">
          Costo Total (S/.) *
        </label>
        <Input
          id="costo_total"
          type="number"
          placeholder="0.00"
          step="0.01"
          disabled={isLoading}
          {...register('costo_total', { valueAsNumber: true })}
          className={errors.costo_total ? 'border-red-500' : ''}
        />
        {errors.costo_total && (
          <p className="text-xs text-red-500">{errors.costo_total.message}</p>
        )}
        {costoTotal !== undefined && (
          <p className="text-sm text-gray-600 font-medium">
            Costo: S/. {costoTotal.toFixed(2)}
          </p>
        )}
      </div>

      {/* Fechas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="fecha_inicio_estimada" className="text-sm font-medium text-gray-700">
            Fecha Inicio Estimada
          </label>
          <Input
            id="fecha_inicio_estimada"
            type="date"
            disabled={isLoading}
            {...register('fecha_inicio_estimada')}
            className={errors.fecha_inicio_estimada ? 'border-red-500' : ''}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="fecha_fin_estimada" className="text-sm font-medium text-gray-700">
            Fecha Fin Estimada
          </label>
          <Input
            id="fecha_fin_estimada"
            type="date"
            disabled={isLoading}
            {...register('fecha_fin_estimada')}
            className={errors.fecha_fin_estimada ? 'border-red-500' : ''}
          />
        </div>
      </div>

      {/* Estado */}
      <div className="space-y-2">
        <label htmlFor="estado" className="text-sm font-medium text-gray-700">
          Estado
        </label>
        <select
          id="estado"
          disabled={isLoading}
          {...register('estado')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="completado">Completado</option>
          <option value="cancelado">Cancelado</option>
        </select>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <label htmlFor="notas" className="text-sm font-medium text-gray-700">
          Notas Adicionales
        </label>
        <textarea
          id="notas"
          placeholder="Notas sobre el plan..."
          disabled={isLoading}
          {...register('notas')}
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
            'Actualizar Plan'
          ) : (
            'Crear Plan'
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
