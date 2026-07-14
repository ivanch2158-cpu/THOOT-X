// components/auth/ActivateAccountForm.tsx
// Formulario de activación de cuenta para usuarios invitados

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { activateAccountSchema, type ActivateAccountInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';

interface ActivateAccountFormProps {
  token: string;
}

export function ActivateAccountForm({ token }: ActivateAccountFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ActivateAccountInput>({
    resolver: zodResolver(activateAccountSchema),
  });

  const password = watch('password');

  // Validaciones de contraseña en tiempo real
  const passwordRequirements = {
    length: (password?.length || 0) >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
  };

  const onSubmit = async (data: ActivateAccountInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/activar-cuenta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          fullName: data.fullName,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
          voicePin: data.voicePin || undefined,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al activar la cuenta');
        return;
      }

      setSuccess('¡Cuenta activada con éxito! Redirigiendo al inicio de sesión...');
      setTimeout(() => {
        router.push('/login?activated=success');
      }, 2000);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Account activation error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      {/* Alerta de Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Alerta de Éxito */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Nombre Completo */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <Input
          id="fullName"
          type="text"
          placeholder="Juan Pérez"
          disabled={isLoading}
          {...register('fullName')}
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Contraseña */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Nueva Contraseña
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password')}
            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Requisitos de contraseña */}
        <div className="space-y-1 mt-2">
          <p className="text-xs font-medium text-gray-600">Requisitos:</p>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${
              passwordRequirements.length ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {passwordRequirements.length && (
                <Check className="w-3 h-3 text-green-600" />
              )}
            </div>
            <span className="text-xs text-gray-600">Mínimo 8 caracteres</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${
              passwordRequirements.uppercase ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {passwordRequirements.uppercase && (
                <Check className="w-3 h-3 text-green-600" />
              )}
            </div>
            <span className="text-xs text-gray-600">Una mayúscula</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${
              passwordRequirements.number ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {passwordRequirements.number && (
                <Check className="w-3 h-3 text-green-600" />
              )}
            </div>
            <span className="text-xs text-gray-600">Un número</span>
          </div>
        </div>

        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}
      </div>

      {/* Confirmar Contraseña */}
      <div className="space-y-2">
        <label htmlFor="passwordConfirm" className="text-sm font-medium text-gray-700">
          Confirmar Contraseña
        </label>
        <div className="relative">
          <Input
            id="passwordConfirm"
            type={showPasswordConfirm ? 'text' : 'password'}
            placeholder="••••••••"
            disabled={isLoading}
            {...register('passwordConfirm')}
            className={errors.passwordConfirm ? 'border-red-500 pr-10' : 'pr-10'}
          />
          <button
            type="button"
            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            disabled={isLoading}
          >
            {showPasswordConfirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {errors.passwordConfirm && (
          <p className="text-xs text-red-500">{errors.passwordConfirm.message}</p>
        )}
      </div>

      {/* PIN de Voz (Opcional) */}
      <div className="space-y-2 border-t pt-4">
        <label htmlFor="voicePin" className="text-sm font-medium text-gray-700">
          PIN de Voz de 4 dígitos (Opcional)
        </label>
        <Input
          id="voicePin"
          type="password"
          placeholder="••••"
          maxLength={4}
          disabled={isLoading}
          {...register('voicePin')}
          className={errors.voicePin ? 'border-red-500' : ''}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
          }}
        />
        <p className="text-xs text-gray-500">
          Permite iniciar sesión rápidamente en tablets mediante comandos de voz.
        </p>
        {errors.voicePin && (
          <p className="text-xs text-red-500">{errors.voicePin.message}</p>
        )}
      </div>

      {/* Botón Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 mt-6"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Activando cuenta...
          </>
        ) : (
          'Activar Cuenta'
        )}
      </Button>
    </form>
  );
}
