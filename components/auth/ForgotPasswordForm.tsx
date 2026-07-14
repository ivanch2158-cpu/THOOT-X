// components/auth/ForgotPasswordForm.tsx
// Formulario para solicitar recuperación de contraseña

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordRequestSchema, type ResetPasswordRequestInput } from '@/lib/auth/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle } from 'lucide-react';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordRequestInput>({
    resolver: zodResolver(resetPasswordRequestSchema),
  });

  const onSubmit = async (data: ResetPasswordRequestInput) => {
    try {
      setError(null);
      setIsLoading(true);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Error al procesar la solicitud');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Error de conexión. Intenta de nuevo.');
      console.error('Forgot password error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="space-y-4 w-full max-w-md text-center">
        <div className="bg-green-50 rounded-lg p-6">
          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Correo Enviado
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Hemos enviado un link para recuperar tu contraseña al email proporcionado.
            Revisa tu bandeja de entrada (y spam) en los próximos minutos.
          </p>
          <p className="text-xs text-gray-500 mb-6">
            El link expirará en 24 horas por seguridad.
          </p>
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium text-sm"
          >
            Volver al inicio de sesión
          </a>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full max-w-md">
      {/* Alerta de Error */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Descripción */}
      <p className="text-sm text-gray-600 mb-6">
        Ingresa tu email y te enviaremos un link para recuperar tu contraseña.
      </p>

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

      {/* Botón Submit */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Enviando...
          </>
        ) : (
          'Enviar Link de Recuperación'
        )}
      </Button>

      {/* Link a login */}
      <p className="text-center text-sm text-gray-600">
        <a href="/login" className="text-blue-600 hover:underline font-medium">
          Volver al inicio de sesión
        </a>
      </p>
    </form>
  );
}
