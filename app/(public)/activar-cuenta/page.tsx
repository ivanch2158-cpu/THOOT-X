// app/(public)/activar-cuenta/page.tsx
// Página de activación de cuenta para usuarios invitados

import { ActivateAccountForm } from '@/components/auth/ActivateAccountForm';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ActivateAccountPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">TOOTH X</h1>
            <p className="text-gray-600 text-sm mt-2">Activar Cuenta</p>
          </div>

          <Alert variant="destructive">
            <AlertDescription>
              Link de activación inválido o expirado. Por favor solicita una nueva invitación a tu administrador.
            </AlertDescription>
          </Alert>

          <div className="mt-6 text-center">
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Ir al inicio de sesión
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
          <p className="text-gray-600 text-sm mt-2">Activar Cuenta</p>
        </div>

        {/* Formulario */}
        <ActivateAccountForm token={token} />

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          TOOTH X © 2026. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
