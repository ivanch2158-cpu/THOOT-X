// app/api/cron/recordatorios/route.ts
// Cron job de Vercel: ejecuta todos los días a las 09:00 AM
// Envía recordatorios de citas del día siguiente por email y WhatsApp

import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { sendEmail } from '@/lib/notifications/emailService';
import { sendWhatsApp } from '@/lib/notifications/whatsappService';

/**
 * GET /api/cron/recordatorios
 * Invocado por Vercel Cron cada día a las 09:00 AM (configurado en vercel.json).
 * Busca citas del día siguiente sin recordatorio enviado y los despacha.
 */
export async function GET(request: NextRequest) {
  // Verificar token secreto del cron para evitar ejecuciones no autorizadas
  const authorization = request.headers.get('authorization');
  if (authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Calcular rango: mañana 00:00:00 → mañana 23:59:59
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const inicio = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 0, 0, 0);
  const fin = new Date(manana.getFullYear(), manana.getMonth(), manana.getDate(), 23, 59, 59);

  // Obtener citas del día siguiente sin recordatorio enviado
  const { data: citas, error } = await supabase
    .from('citas')
    .select(`
      id, fecha_inicio, motivo,
      pacientes(nombre, apellidos, email, telefono),
      users(full_name),
      tenants(nombre, telefono, direccion, logo_url, color_primario,
              whatsapp_phone_id, whatsapp_access_token,
              notif_email_activo, notif_whatsapp_activo)
    `)
    .eq('estado', 'programada')
    .eq('is_active', true)
    .or('email_recordatorio_enviado.is.null,email_recordatorio_enviado.eq.false')
    .gte('fecha_inicio', inicio.toISOString())
    .lte('fecha_inicio', fin.toISOString());

  if (error) {
    console.error('[Cron Recordatorios] Error al obtener citas:', error);
    return NextResponse.json({ error: 'Error al obtener citas' }, { status: 500 });
  }

  let enviados = 0;
  let errores = 0;

  for (const cita of citas ?? []) {
    const paciente = (cita as any).pacientes;
    const doctor = (cita as any).users;
    const tenant = (cita as any).tenants;

    const fechaLegible = new Date(cita.fecha_inicio).toLocaleDateString('es-PE', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
    const hora = new Date(cita.fecha_inicio).toLocaleTimeString('es-PE', {
      hour: '2-digit', minute: '2-digit',
    });

    const datosCita = {
      id: cita.id,
      paciente_nombre: `${paciente.nombre} ${paciente.apellidos}`,
      paciente_email: paciente.email ?? '',
      fecha: fechaLegible,
      hora,
      doctor_nombre: doctor.full_name,
      motivo: cita.motivo ?? undefined,
    };

    const datosWA = {
      paciente_nombre: datosCita.paciente_nombre,
      paciente_telefono: paciente.telefono ?? '',
      fecha: fechaLegible,
      hora,
      doctor_nombre: doctor.full_name,
      consultorio_nombre: tenant.nombre,
      consultorio_telefono: tenant.telefono ?? undefined,
    };

    const datosConsultorio = {
      nombre: tenant.nombre,
      telefono: tenant.telefono ?? undefined,
      direccion: tenant.direccion ?? undefined,
      logo_url: tenant.logo_url ?? undefined,
      color_primario: tenant.color_primario ?? undefined,
    };

    let emailOk = false;
    let waOk = false;

    try {
      if (tenant.notif_email_activo !== false && paciente.email) {
        emailOk = await sendEmail('recordatorio_24h', datosCita, datosConsultorio);
      }

      if (tenant.notif_whatsapp_activo !== false && paciente.telefono) {
        waOk = await sendWhatsApp(
          'recordatorio_24h',
          datosWA,
          tenant.whatsapp_phone_id ?? undefined,
          tenant.whatsapp_access_token ?? undefined
        );
      }

      // Marcar recordatorio enviado si al menos un canal tuvo éxito
      if (emailOk || waOk) {
        await supabase.from('citas').update({
          email_recordatorio_enviado: emailOk,
          whatsapp_recordatorio_enviado: waOk,
        }).eq('id', cita.id);

        enviados++;
      }
    } catch (err) {
      console.error(`[Cron Recordatorios] Error en cita ${cita.id}:`, err);
      errores++;
    }
  }

  return NextResponse.json({
    procesadas: (citas ?? []).length,
    enviados,
    errores,
    timestamp: new Date().toISOString(),
  });
}
