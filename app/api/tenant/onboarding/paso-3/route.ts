// app/api/tenant/onboarding/paso-3/route.ts
// Guarda horarios de atención y duración de citas

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const diaSchema = z.object({
  activo: z.boolean(),
  inicio: z.string().regex(/^\d{2}:\d{2}$/),
  fin: z.string().regex(/^\d{2}:\d{2}$/),
});

const schema = z.object({
  horario: z.record(z.string(), diaSchema),
  duracion_cita_min: z.number().min(15).max(120),
});

export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [UserRole.ADMIN]);
    if (!isValid) return response!;

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('tenants')
      .update({
        horarios_atencion: validation.data.horario,
        duracion_cita_min: validation.data.duracion_cita_min,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user!.tenantId);

    if (error) {
      console.error('[Onboarding P3] Error BD:', error);
      return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding P3]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
