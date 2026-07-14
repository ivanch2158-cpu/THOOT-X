// app/api/tenant/onboarding/completar/route.ts
// Marca el onboarding del tenant como completado

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [UserRole.ADMIN]);
    if (!isValid) return response;

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('tenants')
      .update({ onboarding_complete: true, updated_at: new Date().toISOString() })
      .eq('id', user!.tenantId);

    if (error) {
      console.error('[Onboarding Completar] Error:', error);
      return NextResponse.json({ error: 'Error al completar' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[Onboarding Completar]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
