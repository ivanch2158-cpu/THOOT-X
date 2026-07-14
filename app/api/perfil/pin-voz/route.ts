// app/api/perfil/pin-voz/route.ts
// Guarda el PIN de voz del usuario (hasheado con bcrypt)

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const schema = z.object({
  pin: z.string().length(4).regex(/^\d{4}$/),
});

export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);
    if (!isValid) return response;

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'PIN inválido. Debe ser 4 dígitos.' }, { status: 400 });
    }

    // Hashear el PIN con bcrypt (cost factor 12)
    const pinHash = await bcrypt.hash(validation.data.pin, 12);

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('users')
      .update({ voice_pin_hash: pinHash, updated_at: new Date().toISOString() })
      .eq('id', user!.id);

    if (error) {
      console.error('[PIN Voz] Error BD:', error);
      return NextResponse.json({ error: 'Error al guardar el PIN' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[PIN Voz]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
