// app/(public)/register/page.tsx
// Página de registro de nuevos usuarios

import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-blue-600">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">TOOTH X</h1>
          <p className="text-gray-600 text-sm mt-2">Crear Nuevo Consultorio</p>
        </div>

        {/* Formulario */}
        <RegisterForm />

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          TOOTH X © 2026. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
