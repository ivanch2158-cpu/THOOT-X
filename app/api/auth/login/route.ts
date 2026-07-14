// app/api/auth/login/route.ts
// Endpoint para autenticación por email/contraseña

import { createServerClient } from '@/lib/supabase/server';
import { loginSchema } from '@/lib/auth/schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validar request
    const body = await request.json();
    const validation = loginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // Crear cliente Supabase
    const supabase = await createServerClient();

    // Intentar autenticar
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json(
        {
          error: error.message === 'Invalid login credentials'
            ? 'Email o contraseña incorrectos'
            : 'Error al iniciar sesión',
        },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 401 }
      );
    }

    // Obtener información del usuario y consultorio
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, full_name, role, tenant_id, tenants(id, name, theme_colors)')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      return NextResponse.json(
        { error: 'Error al obtener datos del usuario' },
        { status: 500 }
      );
    }

    const tenantsData = Array.isArray(userData?.tenants)
      ? userData.tenants[0]
      : (userData?.tenants as any);

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: 'Sesión iniciada correctamente',
        user: {
          id: data.user.id,
          email: data.user.email,
          fullName: userData?.full_name,
          role: userData?.role,
          tenantId: userData?.tenant_id,
          tenantName: tenantsData?.name,
          themeColors: tenantsData?.theme_colors,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
