// app/api/tenant/onboarding/paso-2/route.ts
// Guarda identidad visual del consultorio (colores, fuente, logo)

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  logo_url: z.string().url().nullable(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  font_family: z.string().min(1).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [UserRole.ADMIN]);
    if (!isValid) return response;

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('tenants')
      .update({
        logo_url: validation.data.logo_url,
        primary_color: validation.data.primary_color,
        secondary_color: validation.data.secondary_color,
        font_family: validation.data.font_family,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.tenantId);

    if (error) {
      console.error('[Onboarding P2] Error BD:', error);
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding P2]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
