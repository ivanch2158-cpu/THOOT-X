// app/api/tenant/configuracion/route.ts
// API para obtener y actualizar la configuración del tenant

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);
    if (!isValid) return response!;

    const supabase = await createServerClient();
    const { data: tenant, error } = await supabase
      .from('tenants')
      .select('id, name, ruc, phone, address, logo_url, primary_color, secondary_color, font_family, duracion_cita_min, horarios_atencion, onboarding_complete')
      .eq('id', user!.tenantId)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
    }

    return NextResponse.json({ tenant });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
