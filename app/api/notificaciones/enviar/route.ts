// app/api/notificaciones/enviar/route.ts
// API para disparar notificaciones de cita (email + WhatsApp) manualmente

import { NextRequest, NextResponse } from 'next/server';
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import { sendEmail, type TipoNotificacionEmail } from '@/lib/notifications/emailService';
import { sendWhatsApp, type TipoNotificacionWhatsApp } from '@/lib/notifications/whatsappService';
import { z } from 'zod';

// ── ESQUEMA ───────────────────────────────────────────────────────────────────

const enviarSchema = z.object({
  tipo: z.enum(['confirmacion', 'recordatorio_24h', 'reagendamiento', 'cancelacion']),
  citaId: z.string().uuid(),
  canales: z.array(z.enum(['email', 'whatsapp'])).min(1).default(['email', 'whatsapp']),
});

// ── FUNCIÓN DE FORMATO DE FECHA ───────────────────────────────────────────────

function formatFechaLegible(isoDate: string): string {
  const fecha = new Date(isoDate);
  return fecha.toLocaleDateString('es-PE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatHora(isoDate: string): string {
  const fecha = new Date(isoDate);
  return fecha.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
}

// ── HANDLER ───────────────────────────────────────────────────────────────────

/**
 * POST /api/notificaciones/enviar
 * Dispara una notificación de cita por email y/o WhatsApp.
 *
 * Body: { tipo, citaId, canales? }
 */
export async function POST(request: NextRequest) {
  try {
    const { isValid, user, response } = await protectEndpoint(request, [
      UserRole.ADMIN,
      UserRole.ODONTOLOGIST,
      UserRole.SECRETARY,
    ]);

    if (!isValid) return response;

    const body = await request.json();
    const validation = enviarSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.flatten() },
        { status: 400 }
      );
    }

    const { tipo, citaId, canales } = validation.data;
    const supabase = await createServerClient();

    // Obtener datos de la cita con paciente y consultorio
    const { data: cita, error: citaError } = await supabase
      .from('citas')
      .select(`
        id, fecha_inicio, motivo,
        pacientes(id, nombre, apellidos, email, telefono),
        users(id, full_name),
        tenants(nombre, telefono, direccion, logo_url, color_primario, whatsapp_phone_id, whatsapp_access_token)
      `)
      .eq('id', citaId)
      .eq('tenant_id', user!.tenantId)
      .single();

    if (citaError || !cita) {
      return NextResponse.json(
        { error: 'Cita no encontrada' },
        { status: 404 }
      );
    }

    const paciente = (cita as any).pacientes;
    const doctor = (cita as any).users;
    const tenant = (cita as any).tenants;

    const datosCita = {
      id: cita.id,
      paciente_nombre: `${paciente.nombre} ${paciente.apellidos}`,
      paciente_email: paciente.email ?? '',
      fecha: formatFechaLegible(cita.fecha_inicio),
      hora: formatHora(cita.fecha_inicio),
      doctor_nombre: doctor.full_name,
      motivo: cita.motivo ?? undefined,
    };

    const datosConsultorio = {
      nombre: tenant.nombre,
      telefono: tenant.telefono ?? undefined,
      direccion: tenant.direccion ?? undefined,
      logo_url: tenant.logo_url ?? undefined,
      color_primario: tenant.color_primario ?? undefined,
    };

    const datosWA = {
      paciente_nombre: datosCita.paciente_nombre,
      paciente_telefono: paciente.telefono ?? '',
      fecha: datosCita.fecha,
      hora: datosCita.hora,
      doctor_nombre: doctor.full_name,
      consultorio_nombre: tenant.nombre,
      consultorio_telefono: tenant.telefono ?? undefined,
      motivo: cita.motivo ?? undefined,
    };

    // Disparar notificaciones en paralelo
    const resultados: Record<string, boolean> = {};

    await Promise.allSettled([
      canales.includes('email')
        ? sendEmail(tipo as TipoNotificacionEmail, datosCita, datosConsultorio).then(
            (ok) => { resultados.email = ok; }
          )
        : Promise.resolve(),
      canales.includes('whatsapp')
        ? sendWhatsApp(
            tipo as TipoNotificacionWhatsApp,
            datosWA,
            tenant.whatsapp_phone_id ?? undefined,
            tenant.whatsapp_access_token ?? undefined
          ).then((ok) => { resultados.whatsapp = ok; })
        : Promise.resolve(),
    ]);

    // Marcar flags de envío en la cita para evitar duplicados
    const flagUpdates: Record<string, boolean> = {};
    if (tipo === 'recordatorio_24h') {
      if (resultados.email) flagUpdates.email_recordatorio_enviado = true;
      if (resultados.whatsapp) flagUpdates.whatsapp_recordatorio_enviado = true;
    }

    if (Object.keys(flagUpdates).length > 0) {
      await supabase.from('citas').update(flagUpdates).eq('id', citaId);
    }

    return NextResponse.json(
      {
        enviado: true,
        resultados,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Notificaciones] Error al enviar:', error);
    return NextResponse.json(
      { error: 'Error al enviar la notificación' },
      { status: 500 }
    );
  }
}
