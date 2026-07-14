// app/api/tenant/onboarding/paso-1/route.ts
// Guarda los datos básicos del consultorio (paso 1 del wizard)

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  nombre: z.string().min(2).max(200),
  ruc: z.string().length(11).regex(/^\d+$/).optional().or(z.literal('')),
  telefono: z.string().min(7).max(20),
  direccion: z.string().max(300).optional(),
  especialidad: z.string().min(2).max(100),
});

export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [UserRole.ADMIN]);
    if (!isValid) return response;

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos', details: validation.error.flatten() }, { status: 400 });
    }

    const { nombre, ruc, telefono, direccion, especialidad } = validation.data;
    const supabase = await createServerClient();

    const { error } = await supabase
      .from('tenants')
      .update({
        name: nombre,
        ruc: ruc || null,
        phone: telefono,
        address: direccion || null,
        especialidad_principal: especialidad,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.tenantId);

    if (error) {
      console.error('[Onboarding P1] Error BD:', error);
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding P1]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
