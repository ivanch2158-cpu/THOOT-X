// app/api/users/route.ts
// API para listar usuarios del consultorio

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [UserRole.ADMIN]);
    if (!isValid) return response;

    const supabase = await createServerClient();
    const { data: usuarios, error } = await supabase
      .from('users')
      .select('id, full_name, email, role, is_active')
      .eq('tenant_id', user!.tenantId)
      .order('full_name', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Error al obtener usuarios' }, { status: 500 });
    }

    return NextResponse.json({ usuarios: usuarios ?? [] });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
