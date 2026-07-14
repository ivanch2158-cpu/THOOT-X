// app/(public)/forgot-password/page.tsx
// Página para solicitar recuperación de contraseña

import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">TOOTH X</h1>
          <p className="text-gray-600 text-sm mt-2">Recuperar Contraseña</p>
        </div>

        {/* Formulario */}
        <ForgotPasswordForm />

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          TOOTH X © 2026. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
