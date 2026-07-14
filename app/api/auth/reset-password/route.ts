// app/api/auth/reset-password/route.ts
// Endpoint para confirmar nueva contraseña

import { createServerClient } from '@/lib/supabase/server';
import { resetPasswordConfirmSchema } from '@/lib/auth/schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validar request
    const body = await request.json();
    const validation = resetPasswordConfirmSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // Crear cliente Supabase
    const supabase = await createServerClient();

    // Validar el token de reset
    const { data: userData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (verifyError || !userData.user) {
      return NextResponse.json(
        {
          error: 'El link de recuperación es inválido o ha expirado',
        },
        { status: 400 }
      );
    }

    // Actualizar la contraseña
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return NextResponse.json(
        { error: 'Error al actualizar la contraseña' },
        { status: 400 }
      );
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: 'Contraseña actualizada exitosamente',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
