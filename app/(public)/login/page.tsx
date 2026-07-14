// app/(public)/login/page.tsx
// Página de autenticación

import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-purple-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">TOOTH X</h1>
          <p className="text-gray-600 text-sm mt-2">Gestor de Consultorios Odontológicos</p>
        </div>

        {/* Formulario */}
        <LoginForm />

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          TOOTH X © 2026. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
