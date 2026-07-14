// app/api/tenant/onboarding/paso-4/route.ts
// Invita usuarios al consultorio (paso 4 del wizard)

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createAdminClient } from '@/lib/supabase/server';
import { z } from 'zod';

const schema = z.object({
  usuarios: z.array(
    z.object({
      nombre: z.string().min(2).max(100),
      email: z.string().email(),
      rol: z.enum(['odontologist', 'secretary']),
    })
  ).min(1),
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

    const supabase = createAdminClient();
    const errores: string[] = [];

    for (const u of validation.data.usuarios) {
      try {
        // Invitar usuario con Supabase Auth — genera enlace de activación
        const { data: authData, error: authError } = await supabase.auth.admin.inviteUserByEmail(
          u.email,
          {
            data: {
              full_name: u.nombre,
              tenant_id: user!.tenantId,
              app_role: u.rol,
            },
          }
        );

        if (authError || !authData.user) {
          errores.push(`${u.email}: ${authError?.message ?? 'Error desconocido'}`);
          continue;
        }

        // Insertar en tabla users
        await supabase.from('users').insert({
          id: authData.user.id,
          email: u.email,
          full_name: u.nombre,
          tenant_id: user!.tenantId,
          role: u.rol,
          is_active: true,
        });
      } catch (err) {
        errores.push(`${u.email}: error inesperado`);
      }
    }

    return NextResponse.json({
      ok: true,
      invitados: validation.data.usuarios.length - errores.length,
      errores,
    });
  } catch (error) {
    console.error('[Onboarding P4]', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
