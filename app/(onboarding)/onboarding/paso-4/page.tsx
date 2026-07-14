// app/(onboarding)/onboarding/paso-4/page.tsx
// Wizard paso 4 — Invitar miembros del equipo (odontólogos y secretarias)

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowRight, ArrowLeft, Users, UserPlus, Trash2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ── ESQUEMA ───────────────────────────────────────────────────────────────────

const usuarioSchema = z.object({
  nombre: z.string().min(2, 'Nombre demasiado corto').max(100),
  email: z.string().email('Email inválido'),
  rol: z.enum(['odontologist', 'secretary']),
});

type UsuarioInput = z.infer<typeof usuarioSchema>;

interface UsuarioPendiente extends UsuarioInput {
  id: string;
}

const ROL_ETIQUETAS: Record<string, string> = {
  odontologist: 'Odontólogo',
  secretary: 'Secretaria',
};

const ROL_COLORES: Record<string, string> = {
  odontologist: 'bg-blue-100 text-blue-800',
  secretary: 'bg-green-100 text-green-800',
};

// ── COMPONENTE ────────────────────────────────────────────────────────────────

export default function Paso4Page() {
  const router = useRouter();
  const [usuarios, setUsuarios] = useState<UsuarioPendiente[]>([]);
  const [guardando, setGuardando] = useState(false);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UsuarioInput>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: { rol: 'odontologist' },
  });

  const agregarUsuario = (data: UsuarioInput) => {
    setUsuarios((prev) => [
      ...prev,
      { ...data, id: Math.random().toString(36).slice(2) },
    ]);
    reset();
    setMostrarFormulario(false);
  };

  const eliminarUsuario = (id: string) => {
    setUsuarios((prev) => prev.filter((u) => u.id !== id));
  };

  const onContinuar = async (skip = false) => {
    setGuardando(true);
    try {
      if (!skip && usuarios.length > 0) {
        const res = await fetch('/api/tenant/onboarding/paso-4', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ usuarios }),
        });
        if (!res.ok) throw new Error();
      }
      router.push('/onboarding/paso-5');
    } catch {
      alert('Error al enviar invitaciones. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
        {/* Encabezado */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
            <Users className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Tu equipo</h1>
            <p className="text-sm text-gray-500">
              Invita a odontólogos y secretarias (opcional, puedes hacerlo después)
            </p>
          </div>
        </div>

        {/* Lista de usuarios agregados */}
        {usuarios.length > 0 && (
          <div className="mt-5 space-y-2">
            {usuarios.map((u) => (
              <div
                key={u.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-200"
              >
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold text-gray-600">
                  {u.nombre[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{u.nombre}</p>
                  <p className="text-xs text-gray-500 truncate">{u.email}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ROL_COLORES[u.rol]}`}>
                  {ROL_ETIQUETAS[u.rol]}
                </span>
                <button
                  onClick={() => eliminarUsuario(u.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar usuario */}
        {mostrarFormulario ? (
          <form onSubmit={handleSubmit(agregarUsuario)} className="mt-5 space-y-4 border border-blue-200 rounded-xl p-4 bg-blue-50">
            <h3 className="text-sm font-semibold text-blue-800">Agregar miembro del equipo</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Nombre completo</label>
                <Input
                  {...register('nombre')}
                  placeholder="Dr. Juan Pérez"
                  className={errors.nombre ? 'border-red-400' : ''}
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-0.5">{errors.nombre.message}</p>}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">Email</label>
                <Input
                  {...register('email')}
                  type="email"
                  placeholder="juan@email.com"
                  className={errors.email ? 'border-red-400' : ''}
                />
                {errors.email && <p className="text-red-500 text-xs mt-0.5">{errors.email.message}</p>}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-2 block">Rol</label>
              <div className="flex gap-3">
                {['odontologist', 'secretary'].map((rol) => (
                  <label key={rol} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...register('rol')} value={rol} />
                    <span className="text-sm text-gray-700">{ROL_ETIQUETAS[rol]}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
                <UserPlus className="w-3 h-3" />
                Agregar
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => { reset(); setMostrarFormulario(false); }}
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setMostrarFormulario(true)}
            className="mt-5 w-full flex items-center gap-2 justify-center p-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Agregar miembro del equipo
          </button>
        )}

        {/* Info de invitaciones */}
        {usuarios.length > 0 && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Mail className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-green-700">
              Se enviará un email de invitación a cada miembro. Recibirán un enlace para crear su contraseña y acceder al sistema.
            </p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={() => router.push('/onboarding/paso-3')}
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onContinuar(true)}
          disabled={guardando}
          className="flex-1 text-gray-500"
        >
          Omitir por ahora
        </Button>
        <Button
          type="button"
          onClick={() => onContinuar(false)}
          disabled={guardando}
          className="flex-1 gap-2 bg-blue-600 hover:bg-blue-700"
        >
          {guardando ? 'Enviando...' : usuarios.length > 0 ? `Invitar (${usuarios.length})` : 'Continuar'}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
