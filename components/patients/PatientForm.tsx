// components/patients/PatientForm.tsx
// Formulario para crear/editar paciente

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pacienteSchema, type PacienteInput } from '@/lib/clinical/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, X } from 'lucide-react';

interface PatientFormProps {
  isEditing?: boolean;
  initialData?: Partial<PacienteInput> & { id?: string };
  onClose?: () => void;
}

export function PatientForm({
  isEditing = false,
  initialData,
  onClose,
}: PatientFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PacienteInput>({
    resolver: zodResolver(pacienteSchema),
    defaultValues: initialData,
  });

  const onSubmit = async (data: PacienteInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const url = isEditing
        ? `/api/patients/${initialData?.id}`
        : '/api/patients';

      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al guardar paciente');
        return;
      }

      // Éxito
      router.refresh();
      onClose?.();
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Patient form error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
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

      {/* Nombre */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="nombres" className="text-sm font-medium text-gray-700">
            Nombre *
          </label>
          <Input
            id="nombres"
            placeholder="Juan"
            disabled={isLoading}
            {...register('nombres')}
            className={errors.nombres ? 'border-red-500' : ''}
          />
          {errors.nombres && (
            <p className="text-xs text-red-500">{errors.nombres.message}</p>
          )}
        </div>

        {/* Apellidos */}
        <div className="space-y-2">
          <label htmlFor="apellidos" className="text-sm font-medium text-gray-700">
            Apellidos *
          </label>
          <Input
            id="apellidos"
            placeholder="Pérez García"
            disabled={isLoading}
            {...register('apellidos')}
            className={errors.apellidos ? 'border-red-500' : ''}
          />
          {errors.apellidos && (
            <p className="text-xs text-red-500">{errors.apellidos.message}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="juan@email.com"
            disabled={isLoading}
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div className="space-y-2">
          <label htmlFor="telefono" className="text-sm font-medium text-gray-700">
            Teléfono
          </label>
          <Input
            id="telefono"
            placeholder="+51 999 888 777"
            disabled={isLoading}
            {...register('telefono')}
            className={errors.telefono ? 'border-red-500' : ''}
          />
          {errors.telefono && (
            <p className="text-xs text-red-500">{errors.telefono.message}</p>
          )}
        </div>
      </div>

      {/* Fecha de Nacimiento y Género */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="fecha_nacimiento" className="text-sm font-medium text-gray-700">
            Fecha de Nacimiento
          </label>
          <Input
            id="fecha_nacimiento"
            type="date"
            disabled={isLoading}
            {...register('fecha_nacimiento')}
            className={errors.fecha_nacimiento ? 'border-red-500' : ''}
          />
          {errors.fecha_nacimiento && (
            <p className="text-xs text-red-500">{errors.fecha_nacimiento.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="sexo" className="text-sm font-medium text-gray-700">
            Género
          </label>
          <select
            id="sexo"
            disabled={isLoading}
            {...register('sexo')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            <option value="M">Masculino</option>
            <option value="F">Femenino</option>
            <option value="O">Otro</option>
          </select>
        </div>
      </div>

      {/* Documento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="tipo_documento" className="text-sm font-medium text-gray-700">
            Tipo de Documento
          </label>
          <select
            id="tipo_documento"
            disabled={isLoading}
            {...register('tipo_documento')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar</option>
            <option value="DNI">DNI</option>
            <option value="Pasaporte">Pasaporte</option>
            <option value="RUC">RUC</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="numero_documento" className="text-sm font-medium text-gray-700">
            Número de Documento
          </label>
          <Input
            id="numero_documento"
            placeholder="12345678"
            disabled={isLoading}
            {...register('numero_documento')}
            className={errors.numero_documento ? 'border-red-500' : ''}
          />
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-2">
        <label htmlFor="direccion" className="text-sm font-medium text-gray-700">
          Dirección
        </label>
        <Input
          id="direccion"
          placeholder="Calle Principal 123"
          disabled={isLoading}
          {...register('direccion')}
          className={errors.direccion ? 'border-red-500' : ''}
        />
      </div>

      {/* Ciudad y País */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="ciudad" className="text-sm font-medium text-gray-700">
            Ciudad
          </label>
          <Input
            id="ciudad"
            placeholder="Lima"
            disabled={isLoading}
            {...register('ciudad')}
            className={errors.ciudad ? 'border-red-500' : ''}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="pais" className="text-sm font-medium text-gray-700">
            País
          </label>
          <Input
            id="pais"
            placeholder="Perú"
            disabled={isLoading}
            {...register('pais')}
            className={errors.pais ? 'border-red-500' : ''}
          />
        </div>
      </div>

      {/* Información Médica */}
      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Información Médica
        </h3>

        <div className="space-y-2">
          <label htmlFor="alergias" className="text-sm font-medium text-gray-700">
            Alergias a Medicamentos
          </label>
          <Input
            id="alergias"
            placeholder="Penicilina, etc."
            disabled={isLoading}
            {...register('alergias')}
            className={errors.alergias ? 'border-red-500' : ''}
          />
          {errors.alergias && (
            <p className="text-xs text-red-500">{errors.alergias.message}</p>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <label htmlFor="antecedentes_medicos" className="text-sm font-medium text-gray-700">
            Enfermedades Relevantes
          </label>
          <Input
            id="antecedentes_medicos"
            placeholder="Diabetes, Hipertensión, etc."
            disabled={isLoading}
            {...register('antecedentes_medicos')}
            className={errors.antecedentes_medicos ? 'border-red-500' : ''}
          />
          {errors.antecedentes_medicos && (
            <p className="text-xs text-red-500">{errors.antecedentes_medicos.message}</p>
          )}
        </div>

        <div className="space-y-2 mt-4">
          <label htmlFor="observaciones" className="text-sm font-medium text-gray-700">
            Observaciones Generales
          </label>
          <textarea
            id="observaciones"
            placeholder="Notas adicionales del paciente"
            disabled={isLoading}
            {...register('observaciones')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
        </div>
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
            'Actualizar Paciente'
          ) : (
            'Crear Paciente'
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
