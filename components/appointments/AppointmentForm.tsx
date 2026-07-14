// components/appointments/AppointmentForm.tsx
// Formulario para crear/editar citas

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { citaSchema, type CitaInput } from '@/lib/clinical/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';

interface AppointmentFormProps {
  patientId?: string;
  isEditing?: boolean;
  initialData?: Partial<CitaInput> & { id?: string };
  onClose?: () => void;
  onSuccess?: () => void;
}

export function AppointmentForm({
  patientId,
  isEditing = false,
  initialData,
  onClose,
  onSuccess,
}: AppointmentFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CitaInput>({
    resolver: zodResolver(citaSchema),
    defaultValues: {
      ...initialData,
      paciente_id: patientId || initialData?.paciente_id,
    },
  });

  const onSubmit = async (data: CitaInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const url = isEditing
        ? `/api/appointments/${initialData?.id}`
        : '/api/appointments';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al guardar cita');
        return;
      }

      // Éxito
      onSuccess?.();
      onClose?.();
      router.refresh();
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Appointment form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Editar Cita' : 'Nueva Cita'}
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

      {/* Paciente (solo lectura si se especifica) */}
      {!patientId && (
        <div className="space-y-2">
          <label htmlFor="paciente_id" className="text-sm font-medium text-gray-700">
            Paciente *
          </label>
          <Input
            id="paciente_id"
            placeholder="ID del paciente"
            disabled={isLoading}
            {...register('paciente_id')}
            className={errors.paciente_id ? 'border-red-500' : ''}
          />
          {errors.paciente_id && (
            <p className="text-xs text-red-500">{errors.paciente_id.message}</p>
          )}
        </div>
      )}

      {/* Fecha */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="fecha" className="text-sm font-medium text-gray-700">
            Fecha *
          </label>
          <Input
            id="fecha"
            type="date"
            disabled={isLoading}
            {...register('fecha')}
            className={errors.fecha ? 'border-red-500' : ''}
          />
          {errors.fecha && (
            <p className="text-xs text-red-500">{errors.fecha.message}</p>
          )}
        </div>

        {/* Tipo de Cita */}
        <div className="space-y-2">
          <label htmlFor="tipo_cita" className="text-sm font-medium text-gray-700">
            Tipo de Cita *
          </label>
          <select
            id="tipo_cita"
            disabled={isLoading}
            {...register('tipo_cita')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            <option value="consulta">Consulta</option>
            <option value="limpieza">Limpieza</option>
            <option value="revision">Revisión</option>
            <option value="tratamiento">Tratamiento</option>
            <option value="seguimiento">Seguimiento</option>
          </select>
          {errors.tipo_cita && (
            <p className="text-xs text-red-500">{errors.tipo_cita.message}</p>
          )}
        </div>
      </div>

      {/* Horario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="hora_inicio" className="text-sm font-medium text-gray-700">
            Hora Inicio *
          </label>
          <Input
            id="hora_inicio"
            type="time"
            disabled={isLoading}
            {...register('hora_inicio')}
            className={errors.hora_inicio ? 'border-red-500' : ''}
          />
          {errors.hora_inicio && (
            <p className="text-xs text-red-500">{errors.hora_inicio.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="hora_fin" className="text-sm font-medium text-gray-700">
            Hora Fin *
          </label>
          <Input
            id="hora_fin"
            type="time"
            disabled={isLoading}
            {...register('hora_fin')}
            className={errors.hora_fin ? 'border-red-500' : ''}
          />
          {errors.hora_fin && (
            <p className="text-xs text-red-500">{errors.hora_fin.message}</p>
          )}
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
          <option value="confirmada">Confirmada</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
      </div>

      {/* Notas */}
      <div className="space-y-2">
        <label htmlFor="notas" className="text-sm font-medium text-gray-700">
          Notas
        </label>
        <textarea
          id="notas"
          placeholder="Notas adicionales de la cita"
          disabled={isLoading}
          {...register('notas')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
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
            'Actualizar Cita'
          ) : (
            'Crear Cita'
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
