// app/(dashboard)/dashboard/profile/page.tsx
// Página de perfil del usuario — datos personales, contraseña y PIN de voz

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Lock, Mic, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

// ── SCHEMAS ───────────────────────────────────────────────────────────────────

const perfilSchema = z.object({
  nombre: z.string().min(2, 'Nombre demasiado corto').max(100),
  especialidad: z.string().max(100).optional(),
});

const passwordSchema = z
  .object({
    password_actual: z.string().min(1, 'Requerido'),
    password_nuevo: z
      .string()
      .min(8, 'Mínimo 8 caracteres')
      .regex(/[A-Z]/, 'Debe tener al menos una mayúscula')
      .regex(/[0-9]/, 'Debe tener al menos un número'),
    password_confirmar: z.string(),
  })
  .refine((d) => d.password_nuevo === d.password_confirmar, {
    message: 'Las contraseñas no coinciden',
    path: ['password_confirmar'],
  });

const pinSchema = z
  .object({
    pin: z.string().length(4, 'El PIN debe tener 4 dígitos').regex(/^\d{4}$/, 'Solo dígitos'),
    pin_confirmar: z.string(),
  })
  .refine((d) => d.pin === d.pin_confirmar, {
    message: 'Los PINs no coinciden',
    path: ['pin_confirmar'],
  });

type PerfilInput = z.infer<typeof perfilSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;
type PinInput = z.infer<typeof pinSchema>;

// ── SECCIÓN CARD ──────────────────────────────────────────────────────────────

function SeccionCard({
  titulo,
  icono,
  children,
}: {
  titulo: string;
  icono: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
          {icono}
        </div>
        <h2 className="text-base font-semibold text-gray-900">{titulo}</h2>
      </div>
      {children}
    </div>
  );
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────────────────────

export default function ProfilePage() {
  const { user } = useAuth();
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [okPerfil, setOkPerfil] = useState(false);
  const [guardandoPass, setGuardandoPass] = useState(false);
  const [okPass, setOkPass] = useState(false);
  const [errorPass, setErrorPass] = useState('');
  const [guardandoPin, setGuardandoPin] = useState(false);
  const [okPin, setOkPin] = useState(false);
  const [mostrarPin, setMostrarPin] = useState(false);

  const { register: rPerfil, handleSubmit: hPerfil, formState: { errors: ePerfil } } =
    useForm<PerfilInput>({
      resolver: zodResolver(perfilSchema),
      defaultValues: { nombre: user?.user_metadata?.full_name ?? '' },
    });

  const { register: rPass, handleSubmit: hPass, reset: resetPass, formState: { errors: ePass } } =
    useForm<PasswordInput>({ resolver: zodResolver(passwordSchema) });

  const { register: rPin, handleSubmit: hPin, reset: resetPin, formState: { errors: ePin } } =
    useForm<PinInput>({ resolver: zodResolver(pinSchema) });

  // Guardar perfil
  const onPerfil = async (data: PerfilInput) => {
    setGuardandoPerfil(true);
    setOkPerfil(false);
    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) setOkPerfil(true);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // Cambiar contraseña
  const onPassword = async (data: PasswordInput) => {
    setGuardandoPass(true);
    setOkPass(false);
    setErrorPass('');
    try {
      const res = await fetch('/api/perfil/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOkPass(true);
        resetPass();
      } else {
        const json = await res.json();
        setErrorPass(json.error ?? 'Error al cambiar la contraseña');
      }
    } finally {
      setGuardandoPass(false);
    }
  };

  // Guardar PIN de voz
  const onPin = async (data: PinInput) => {
    setGuardandoPin(true);
    setOkPin(false);
    try {
      const res = await fetch('/api/perfil/pin-voz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: data.pin }),
      });
      if (res.ok) {
        setOkPin(true);
        resetPin();
      }
    } finally {
      setGuardandoPin(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-1">Gestiona tu información personal y seguridad</p>
      </div>

      {/* Datos personales */}
      <SeccionCard titulo="Datos personales" icono={<User className="w-4 h-4 text-gray-600" />}>
        <form onSubmit={hPerfil(onPerfil)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre completo</label>
            <Input {...rPerfil('nombre')} className={ePerfil.nombre ? 'border-red-400' : ''} />
            {ePerfil.nombre && <p className="text-red-500 text-xs mt-0.5">{ePerfil.nombre.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <Input value={user?.email ?? ''} disabled className="bg-gray-50 text-gray-400" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Especialidad</label>
            <Input {...rPerfil('especialidad')} placeholder="Ej. Ortodoncista" />
          </div>
          <Button type="submit" disabled={guardandoPerfil} className="gap-2 bg-blue-600 hover:bg-blue-700">
            {guardandoPerfil ? <Loader2 className="w-4 h-4 animate-spin" /> : okPerfil ? <Check className="w-4 h-4" /> : null}
            {okPerfil ? '¡Guardado!' : 'Guardar cambios'}
          </Button>
        </form>
      </SeccionCard>

      {/* Cambiar contraseña */}
      <SeccionCard titulo="Seguridad — Contraseña" icono={<Lock className="w-4 h-4 text-gray-600" />}>
        <form onSubmit={hPass(onPassword)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña actual</label>
            <Input {...rPass('password_actual')} type="password" className={ePass.password_actual ? 'border-red-400' : ''} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nueva contraseña</label>
            <Input {...rPass('password_nuevo')} type="password" className={ePass.password_nuevo ? 'border-red-400' : ''} />
            {ePass.password_nuevo && <p className="text-red-500 text-xs mt-0.5">{ePass.password_nuevo.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar nueva contraseña</label>
            <Input {...rPass('password_confirmar')} type="password" className={ePass.password_confirmar ? 'border-red-400' : ''} />
            {ePass.password_confirmar && <p className="text-red-500 text-xs mt-0.5">{ePass.password_confirmar.message}</p>}
          </div>
          {errorPass && <p className="text-red-600 text-sm">{errorPass}</p>}
          <Button type="submit" disabled={guardandoPass} className="gap-2 bg-blue-600 hover:bg-blue-700">
            {guardandoPass ? <Loader2 className="w-4 h-4 animate-spin" /> : okPass ? <Check className="w-4 h-4" /> : null}
            {okPass ? '¡Contraseña cambiada!' : 'Cambiar contraseña'}
          </Button>
        </form>
      </SeccionCard>

      {/* PIN de voz */}
      <SeccionCard titulo="PIN de Voz" icono={<Mic className="w-4 h-4 text-gray-600" />}>
        <p className="text-sm text-gray-500 mb-4">
          El PIN de voz te permite hacer login con el asistente diciendo{' '}
          <span className="font-mono bg-gray-100 px-1 rounded">
            "Doctor [tu nombre] PIN [4 dígitos]"
          </span>
        </p>
        <form onSubmit={hPin(onPin)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nuevo PIN (4 dígitos)</label>
            <div className="relative">
              <Input
                {...rPin('pin')}
                type={mostrarPin ? 'text' : 'password'}
                maxLength={4}
                placeholder="••••"
                className={`font-mono tracking-widest text-lg ${ePin.pin ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setMostrarPin(!mostrarPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {mostrarPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {ePin.pin && <p className="text-red-500 text-xs mt-0.5">{ePin.pin.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar PIN</label>
            <Input
              {...rPin('pin_confirmar')}
              type={mostrarPin ? 'text' : 'password'}
              maxLength={4}
              placeholder="••••"
              className={`font-mono tracking-widest text-lg ${ePin.pin_confirmar ? 'border-red-400' : ''}`}
            />
            {ePin.pin_confirmar && <p className="text-red-500 text-xs mt-0.5">{ePin.pin_confirmar.message}</p>}
          </div>
          <Button type="submit" disabled={guardandoPin} className="gap-2 bg-blue-600 hover:bg-blue-700">
            {guardandoPin ? <Loader2 className="w-4 h-4 animate-spin" /> : okPin ? <Check className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {okPin ? '¡PIN guardado!' : 'Guardar PIN de voz'}
          </Button>
        </form>
      </SeccionCard>
    </div>
  );
}
