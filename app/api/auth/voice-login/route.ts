// app/api/auth/voice-login/route.ts
// Endpoint para autenticación por voz (reconocimiento de nombre + PIN)

import { createServerClient } from '@/lib/supabase/server';
import { voiceLoginSchema } from '@/lib/auth/schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validar request
    const body = await request.json();
    const validation = voiceLoginSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { doctorName, pin } = validation.data;

    // Crear cliente Supabase
    const supabase = await createServerClient();

    // Buscar el usuario por nombre y PIN
    // Nota: El PIN se debe haber guardado en el campo voice_pin durante el perfil del usuario
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, role, tenant_id, voice_pin, tenants(id, name, theme_colors)')
      .ilike('full_name', `%${doctorName}%`)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el PIN coincida
    if (userData.voice_pin !== pin) {
      return NextResponse.json(
        { error: 'PIN incorrecto' },
        { status: 401 }
      );
    }

    // Si llegamos aquí, el login por voz es exitoso
    // Para completar la sesión, necesitamos un token JWT
    // En una aplicación real, esto sería más complejo
    // Por ahora, retornamos los datos del usuario

    const tenantsData = Array.isArray(userData?.tenants)
      ? userData.tenants[0]
      : (userData?.tenants as any);

    return NextResponse.json(
      {
        message: 'Sesión iniciada por voz correctamente',
        user: {
          id: userData.id,
          email: userData.email,
          fullName: userData.full_name,
          role: userData.role,
          tenantId: userData.tenant_id,
          tenantName: tenantsData?.name,
          themeColors: tenantsData?.theme_colors,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Voice login error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
