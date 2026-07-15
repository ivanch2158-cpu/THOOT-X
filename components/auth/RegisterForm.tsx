// components/auth/RegisterForm.tsx
// Formulario de registro de nuevos usuarios

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Check } from 'lucide-react';

export function RegisterForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  // Validaciones de contraseña en tiempo real
  const passwordRequirements = {
    length: (password?.length || 0) >= 8,
    uppercase: /[A-Z]/.test(password || ''),
    number: /[0-9]/.test(password || ''),
  };

  const onSubmit = async (data: RegisterInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          passwordConfirm: data.passwordConfirm,
          fullName: data.fullName,
          tenantName: data.tenantName,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al registrarse');
        return;
      }

      // Registro exitoso
      router.push('/login?registered=true');
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Register error:', err);
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

      {/* Nombre Completo */}
      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
          Nombre Completo
        </label>
        <Input
          id="fullName"
          type="text"
          placeholder="Dr. Juan Pérez"
          disabled={isLoading}
          {...register('fullName')}
          className={errors.fullName ? 'border-red-500' : ''}
        />
        {errors.fullName && (
          <p className="text-xs text-red-500">{errors.fullName.message}</p>
        )}
      </div>

      {/* Nombre del Consultorio */}
      <div className="space-y-2">
        <label htmlFor="tenantName" className="text-sm font-medium text-gray-700">
          Nombre del Consultorio
        </label>
        <Input
          id="tenantName"
          type="text"
          placeholder="Consultorio Dental Plaza"
          disabled={isLoading}
          {...register('tenantName')}
          className={errors.tenantName ? 'border-red-500' : ''}
        />
        {errors.tenantName && (
          <p className="text-xs text-red-500">{errors.tenantName.message}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-gray-700">
          Email
        </label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          disabled={isLoading}
          {...register('email')}
          className={errors.email ? 'border-red-500' : ''}
        />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-gray-700">
          Contraseña
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
              passwordRequirements.length
                ? 'bg-green-100'
                : 'bg-gray-100'
            }`}>
              {passwordRequirements.length && (
                <Check className="w-3 h-3 text-green-600" />
              )}
            </div>
            <span className="text-xs text-gray-600">Mínimo 8 caracteres</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${
              passwordRequirements.uppercase
                ? 'bg-green-100'
                : 'bg-gray-100'
            }`}>
              {passwordRequirements.uppercase && (
                <Check className="w-3 h-3 text-green-600" />
              )}
            </div>
            <span className="text-xs text-gray-600">Una mayúscula</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded flex items-center justify-center ${
              passwordRequirements.number
                ? 'bg-green-100'
                : 'bg-gray-100'
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

      {/* Confirmación de Password */}
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

      {/* Botón Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-green-600 hover:bg-green-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Registrándose...
          </>
        ) : (
          'Crear Cuenta'
        )}
      </Button>

      {/* Link a login */}
      <p className="text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
