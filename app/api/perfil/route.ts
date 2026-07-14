// app/api/perfil/route.ts
// API para obtener y actualizar el perfil del usuario autenticado

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const putSchema = z.object({
  nombre: z.string().min(2).max(100),
  especialidad: z.string().max(100).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN, UserRole.ODONTOLOGIST, UserRole.SECRETARY,
    ]);
    if (!isValid) return response!;

    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, especialidad, voice_pin_set')
      .eq('id', user!.id)
      .single();

    if (error) return NextResponse.json({ error: 'Error al obtener perfil' }, { status: 500 });
    return NextResponse.json({ usuario: data });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN, UserRole.ODONTOLOGIST, UserRole.SECRETARY,
    ]);
    if (!isValid) return response!;

    const body = await request.json();
    const validation = putSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('users')
      .update({
        full_name: validation.data.nombre,
        especialidad: validation.data.especialidad ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.id);

    if (error) return NextResponse.json({ error: 'Error al actualizar perfil' }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
