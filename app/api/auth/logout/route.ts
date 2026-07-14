// app/api/auth/logout/route.ts
// Endpoint para cerrar sesión

import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Cerrar sesión en Supabase
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('Logout error from Supabase:', error.message);
      return NextResponse.json(
        { error: 'Error al cerrar la sesión en el servidor' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Sesión cerrada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout handler error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
