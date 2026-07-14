// app/(public)/auth/reset-password/page.tsx
// Página para restablecer contraseña

'use client';

import { useSearchParams } from 'next/navigation';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">TOOTH X</h1>
            <p className="text-gray-600 text-sm mt-2">Restablecer Contraseña</p>
          </div>

          <Alert variant="destructive">
            <AlertDescription>
              Link inválido o expirado. Por favor solicita un nuevo link de recuperación.
            </AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <a href="/forgot-password" className="text-blue-600 hover:underline font-medium">
              Solicitar nuevo link
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">TOOTH X</h1>
          <p className="text-gray-600 text-sm mt-2">Restablecer Contraseña</p>
        </div>

        {/* Formulario */}
        <ResetPasswordForm token={token} />

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          TOOTH X © 2026. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
