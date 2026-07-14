// app/(onboarding)/onboarding/paso-1/page.tsx
// Wizard paso 1 — Datos del consultorio

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowRight, Building2 } from 'lucide-react';

// ── ESQUEMA ───────────────────────────────────────────────────────────────────

const paso1Schema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
  ruc: z.string().length(11, 'El RUC debe tener 11 dígitos').regex(/^\d+$/, 'Solo dígitos').optional().or(z.literal('')),
  direccion: z.string().max(300).optional(),
  telefono: z.string().min(7, 'Teléfono inválido').max(20),
  especialidad: z.string().min(2, 'Ingresa la especialidad principal').max(100),
});

type Paso1Input = z.infer<typeof paso1Schema>;

const ESPECIALIDADES = [
  'Odontología General',
  'Ortodoncia',
  'Endodoncia',
  'Periodoncia',
  'Cirugía Oral',
  'Odontopediatría',
  'Estética Dental',
  'Implantología',
  'Odontología Integral',
];

// ── COMPONENTE ────────────────────────────────────────────────────────────────

export default function Paso1Page() {
  const router = useRouter();
  const [guardando, setGuardando] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Paso1Input>({
    resolver: zodResolver(paso1Schema),
    defaultValues: {
      especialidad: 'Odontología General',
    },
  });

  const onSubmit = async (data: Paso1Input) => {
    setGuardando(true);
    try {
      const res = await fetch('/api/tenant/onboarding/paso-1', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Error al guardar');

      router.push('/onboarding/paso-2');
    } catch {
      alert('Error al guardar. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
      {/* Encabezado */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tu consultorio</h1>
          <p className="text-sm text-gray-500">Cuéntanos los datos básicos de tu consultorio</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nombre del consultorio <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('nombre')}
            placeholder="Ej. Clínica Dental Flores"
            className={errors.nombre ? 'border-red-400' : ''}
          />
          {errors.nombre && (
            <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>
          )}
        </div>

        {/* RUC */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            RUC (opcional)
          </label>
          <Input
            {...register('ruc')}
            placeholder="20123456789"
            maxLength={11}
            className={errors.ruc ? 'border-red-400' : ''}
          />
          {errors.ruc && (
            <p className="text-red-500 text-xs mt-1">{errors.ruc.message}</p>
          )}
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Teléfono de contacto <span className="text-red-500">*</span>
          </label>
          <Input
            {...register('telefono')}
            placeholder="01 234-5678 o 987 654 321"
            className={errors.telefono ? 'border-red-400' : ''}
          />
          {errors.telefono && (
            <p className="text-red-500 text-xs mt-1">{errors.telefono.message}</p>
          )}
        </div>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Dirección
          </label>
          <Input
            {...register('direccion')}
            placeholder="Av. Principal 123, Lima"
          />
        </div>

        {/* Especialidad */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Especialidad principal <span className="text-red-500">*</span>
          </label>
          <select
            {...register('especialidad')}
            className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:border-blue-500"
          >
            {ESPECIALIDADES.map((esp) => (
              <option key={esp} value={esp}>{esp}</option>
            ))}
          </select>
          {errors.especialidad && (
            <p className="text-red-500 text-xs mt-1">{errors.especialidad.message}</p>
          )}
        </div>

        {/* Botón */}
        <div className="pt-2">
          <Button
            type="submit"
            disabled={guardando}
            className="w-full gap-2 bg-blue-600 hover:bg-blue-700"
          >
            {guardando ? 'Guardando...' : 'Continuar'}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
