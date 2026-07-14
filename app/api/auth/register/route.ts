// app/api/auth/register/route.ts
// Endpoint para crear nuevos usuarios y consultorios

import { createServerClient } from '@/lib/supabase/server';
import { registerSchema } from '@/lib/auth/schemas';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Validar request
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { email, password, fullName, tenantName } = validation.data;

    // Crear cliente Supabase
    const supabase = await createServerClient();

    // Verificar si el email ya existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 409 }
      );
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      return NextResponse.json(
        {
          error: authError.message.includes('already registered')
            ? 'El email ya está registrado'
            : 'Error al crear la cuenta',
        },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Error al crear la cuenta' },
        { status: 500 }
      );
    }

    // Crear consultorio (tenant)
    const { data: tenantData, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        name: tenantName,
        owner_id: authData.user.id,
        slug: tenantName.toLowerCase().replace(/\s+/g, '-'),
        is_active: true,
        theme_colors: {
          primary: '#3B82F6',
          secondary: '#8B5CF6',
        },
      })
      .select()
      .single();

    if (tenantError) {
      // Intentar eliminar el usuario si falla la creación del tenant
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Error al crear el consultorio' },
        { status: 500 }
      );
    }

    // Crear registro de usuario en la BD
    const { error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name: fullName,
        tenant_id: tenantData.id,
        role: 'admin', // El creador es admin del consultorio
        is_active: true,
      });

    if (userError) {
      // Intentar limpiar si falla
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Error al crear el usuario' },
        { status: 500 }
      );
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        message: 'Cuenta creada exitosamente. Verifica tu email para confirmar.',
        user: {
          id: authData.user.id,
          email: authData.user.email,
          fullName,
          tenantId: tenantData.id,
          tenantName: tenantData.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
