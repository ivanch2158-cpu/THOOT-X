// app/api/auth/forgot-password/route.ts
// Endpoint para solicitar recuperación de contraseña

import { createServerClient } from '@/lib/supabase/server';
import { resetPasswordRequestSchema } from '@/lib/auth/schemas';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Este endpoint usa el servicio de recuperación de contraseña de Supabase
 * que envía un email con un link de reset automáticamente
 */
export async function POST(request: NextRequest) {
  try {
    // Validar request
    const body = await request.json();
    const validation = resetPasswordRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email } = validation.data;

    // Crear cliente Supabase
    const supabase = await createServerClient();

    // Solicitar reset de contraseña (Supabase envía el email automáticamente)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
    });

    if (error) {
      // No revelar si el email existe o no por seguridad
      console.error('Reset password error:', error);
    }

    // Responder siempre con éxito por seguridad (evitar enumeration attacks)
    return NextResponse.json(
      {
        message: 'Si el email existe en nuestro sistema, recibirás un link de recuperación',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
