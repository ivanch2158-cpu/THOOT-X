// app/api/users/[id]/estado/route.ts
// Activa o desactiva un usuario del consultorio (soft delete)

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({ is_active: z.boolean() });

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [UserRole.ADMIN]);
    if (!isValid) return response!;

    // El admin no puede desactivarse a sí mismo
    if (params.id === user!.id) {
      return NextResponse.json({ error: 'No puedes desactivar tu propio usuario' }, { status: 400 });
    }

    const body = await request.json();
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
    }

    const supabase = await createServerClient();
    const { error } = await supabase
      .from('users')
      .update({ is_active: validation.data.is_active, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .eq('tenant_id', user!.tenantId); // Asegurar aislamiento de tenant

    if (error) {
      return NextResponse.json({ error: 'Error al actualizar estado' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
