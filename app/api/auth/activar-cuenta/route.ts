// app/api/auth/activar-cuenta/route.ts
// Endpoint para activar la cuenta de un usuario invitado

import { createAdminClient } from '@/lib/supabase/server';
import { activateAccountSchema } from '@/lib/auth/schemas';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = activateAccountSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { token, fullName, password, voicePin } = validation.data;

    // Crear cliente de administración de Supabase para omitir RLS y acceder a auth.admin
    const adminSupabase = createAdminClient();

    // 1. Buscar al usuario por su token de invitación
    const { data: user, error: userError } = await adminSupabase
      .from('users')
      .select('*')
      .eq('invitation_token', token)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'El link de activación es inválido o ya ha sido utilizado' },
        { status: 404 }
      );
    }

    // 2. Verificar si el token ha expirado
    if (user.invitation_expires && new Date(user.invitation_expires) < new Date()) {
      return NextResponse.json(
        { error: 'El link de activación ha expirado. Por favor solicita una nueva invitación.' },
        { status: 400 }
      );
    }

    // 3. Obtener el estado del onboarding del consultorio (tenant)
    const { data: tenant } = await adminSupabase
      .from('tenants')
      .select('onboarding_complete')
      .eq('id', user.tenant_id)
      .single();

    const onboardingComplete = tenant?.onboarding_complete || false;

    // 4. Actualizar la contraseña y metadata del usuario en Supabase Auth
    const { error: authError } = await adminSupabase.auth.admin.updateUserById(
      user.supabase_auth_id,
      {
        password: password,
        user_metadata: {
          full_name: fullName,
          tenant_id: user.tenant_id,
          app_role: user.app_role,
          onboarding_complete: onboardingComplete,
          voice_pin_set: !!voicePin,
        },
      }
    );

    if (authError) {
      console.error('Error updating auth password:', authError.message);
      return NextResponse.json(
        { error: 'Error al establecer la contraseña de la cuenta' },
        { status: 500 }
      );
    }

    // 5. Hashear el PIN de voz si se proporcionó
    let voicePinHash = null;
    if (voicePin) {
      voicePinHash = await bcrypt.hash(voicePin, 10);
    }

    // 6. Activar el registro en la tabla `users` limpiando el token
    const { error: updateError } = await adminSupabase
      .from('users')
      .update({
        full_name: fullName,
        voice_pin_hash: voicePinHash,
        invitation_token: null,
        invitation_expires: null,
        is_active: true,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error activating user in database:', updateError.message);
      return NextResponse.json(
        { error: 'Error al activar el registro de usuario' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: 'Cuenta activada correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Activate account handler error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
