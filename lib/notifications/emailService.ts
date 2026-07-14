// lib/notifications/emailService.ts
// Servicio de envío de emails transaccionales usando Resend
// Plantillas para: confirmación de cita, recordatorio 24h, reagendamiento, cancelación

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// ── TIPOS ─────────────────────────────────────────────────────────────────────

export type TipoNotificacionEmail =
  | 'confirmacion'
  | 'recordatorio_24h'
  | 'reagendamiento'
  | 'cancelacion';

export interface DatosCita {
  id: string;
  paciente_nombre: string;
  paciente_email: string;
  fecha: string;          // e.g. "lunes 14 de julio de 2026"
  hora: string;           // e.g. "10:30"
  doctor_nombre: string;
  motivo?: string;
}

export interface DatosConsultorio {
  nombre: string;
  telefono?: string;
  direccion?: string;
  color_primario?: string;
  logo_url?: string;
  email_remitente?: string;
}

// ── HELPERS DE PLANTILLA ──────────────────────────────────────────────────────

function wrapHtml(
  titulo: string,
  cuerpo: string,
  consultorio: DatosConsultorio
): string {
  const colorPrimario = consultorio.color_primario ?? '#2563EB';
  const nombreConsultorio = consultorio.nombre ?? 'Consultorio Dental';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${titulo}</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0;">
          <!-- Cabecera con color primario -->
          <tr>
            <td style="background:${colorPrimario};padding:28px 32px;text-align:center;">
              ${consultorio.logo_url
                ? `<img src="${consultorio.logo_url}" alt="${nombreConsultorio}" height="48" style="margin-bottom:8px;" /><br/>`
                : ''}
              <span style="color:#FFFFFF;font-size:22px;font-weight:700;">${nombreConsultorio}</span>
            </td>
          </tr>
          <!-- Cuerpo -->
          <tr>
            <td style="padding:32px;">
              ${cuerpo}
            </td>
          </tr>
          <!-- Pie -->
          <tr>
            <td style="background:#F8FAFC;padding:20px 32px;border-top:1px solid #E2E8F0;text-align:center;">
              <p style="color:#94A3B8;font-size:13px;margin:0;">
                ${consultorio.telefono ? `📞 ${consultorio.telefono} &nbsp;·&nbsp; ` : ''}
                ${consultorio.direccion ? `📍 ${consultorio.direccion}` : ''}
              </p>
              <p style="color:#CBD5E1;font-size:11px;margin:8px 0 0;">
                Este mensaje fue enviado automáticamente por TOOTH X. No respondas a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

function tarjetaCita(cita: DatosCita, colorPrimario: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0"
      style="background:#F8FAFC;border-left:4px solid ${colorPrimario};border-radius:8px;padding:16px;margin:20px 0;">
      <tr>
        <td>
          <p style="margin:0 0 6px;font-size:13px;color:#64748B;">📅 Fecha</p>
          <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0F172A;">${cita.fecha}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#64748B;">⏰ Hora</p>
          <p style="margin:0 0 12px;font-size:16px;font-weight:600;color:#0F172A;">${cita.hora}</p>
          <p style="margin:0 0 6px;font-size:13px;color:#64748B;">👨‍⚕️ Doctor</p>
          <p style="margin:0;font-size:16px;font-weight:600;color:#0F172A;">${cita.doctor_nombre}</p>
        </td>
      </tr>
    </table>
  `;
}

// ── PLANTILLAS ────────────────────────────────────────────────────────────────

function plantillaConfirmacion(cita: DatosCita, consultorio: DatosConsultorio): string {
  const color = consultorio.color_primario ?? '#2563EB';
  const cuerpo = `
    <h2 style="color:#0F172A;font-size:20px;margin:0 0 8px;">✅ Tu cita está confirmada</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 20px;">
      Hola <strong>${cita.paciente_nombre}</strong>, te confirmamos que tu cita en
      <strong>${consultorio.nombre}</strong> ha sido agendada exitosamente.
    </p>
    ${tarjetaCita(cita, color)}
    ${cita.motivo ? `<p style="color:#475569;font-size:14px;margin:12px 0 0;"><strong>Motivo:</strong> ${cita.motivo}</p>` : ''}
    <p style="color:#64748B;font-size:13px;margin:24px 0 0;">
      Si necesitas cancelar o reprogramar tu cita, comunícate con nosotros a la brevedad posible.
    </p>
  `;
  return wrapHtml('Cita confirmada', cuerpo, consultorio);
}

function plantillaRecordatorio24h(cita: DatosCita, consultorio: DatosConsultorio): string {
  const color = consultorio.color_primario ?? '#2563EB';
  const cuerpo = `
    <h2 style="color:#0F172A;font-size:20px;margin:0 0 8px;">🔔 Recordatorio de tu cita mañana</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 20px;">
      Hola <strong>${cita.paciente_nombre}</strong>, te recordamos que tienes una cita programada
      para <strong>mañana</strong> en <strong>${consultorio.nombre}</strong>.
    </p>
    ${tarjetaCita(cita, color)}
    <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:14px;margin:20px 0;">
      <p style="margin:0;font-size:13px;color:#92400E;">
        💡 <strong>Recuerda:</strong> Si necesitas cancelar o cambiar tu cita, por favor avísanos
        con anticipación para poder atender a otros pacientes.
      </p>
    </div>
    <p style="color:#64748B;font-size:13px;">¡Te esperamos!</p>
  `;
  return wrapHtml('Recordatorio de cita', cuerpo, consultorio);
}

function plantillaReagendamiento(cita: DatosCita, consultorio: DatosConsultorio): string {
  const color = consultorio.color_primario ?? '#2563EB';
  const cuerpo = `
    <h2 style="color:#0F172A;font-size:20px;margin:0 0 8px;">🔄 Tu cita ha sido reagendada</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 20px;">
      Hola <strong>${cita.paciente_nombre}</strong>, te informamos que tu cita en
      <strong>${consultorio.nombre}</strong> ha sido reprogramada con los siguientes datos:
    </p>
    ${tarjetaCita(cita, color)}
    <p style="color:#64748B;font-size:13px;margin:20px 0 0;">
      Si tienes alguna duda, por favor comunícate con nosotros directamente.
    </p>
  `;
  return wrapHtml('Cita reagendada', cuerpo, consultorio);
}

function plantillaCancelacion(cita: DatosCita, consultorio: DatosConsultorio): string {
  const cuerpo = `
    <h2 style="color:#0F172A;font-size:20px;margin:0 0 8px;">❌ Tu cita ha sido cancelada</h2>
    <p style="color:#475569;font-size:15px;margin:0 0 20px;">
      Hola <strong>${cita.paciente_nombre}</strong>, te informamos que tu cita del
      <strong>${cita.fecha}</strong> a las <strong>${cita.hora}</strong> en
      <strong>${consultorio.nombre}</strong> ha sido cancelada.
    </p>
    <p style="color:#475569;font-size:15px;">
      Si deseas agendar una nueva cita, por favor contáctanos.
    </p>
    ${consultorio.telefono
      ? `<p style="color:#64748B;font-size:14px;margin:20px 0 0;">📞 Teléfono: <strong>${consultorio.telefono}</strong></p>`
      : ''}
  `;
  return wrapHtml('Cita cancelada', cuerpo, consultorio);
}

const PLANTILLAS: Record<TipoNotificacionEmail, (c: DatosCita, co: DatosConsultorio) => string> = {
  confirmacion: plantillaConfirmacion,
  recordatorio_24h: plantillaRecordatorio24h,
  reagendamiento: plantillaReagendamiento,
  cancelacion: plantillaCancelacion,
};

const ASUNTOS: Record<TipoNotificacionEmail, (consultorio: string, fecha?: string) => string> = {
  confirmacion: (c) => `✅ Cita confirmada — ${c}`,
  recordatorio_24h: (c, f) => `🔔 Recordatorio: tu cita mañana en ${c}${f ? ` (${f})` : ''}`,
  reagendamiento: (c) => `🔄 Cita reagendada — ${c}`,
  cancelacion: (c) => `❌ Cita cancelada — ${c}`,
};

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────────────────

/**
 * Envía un email de notificación de cita al paciente.
 * Retorna true si el envío fue exitoso.
 */
export async function sendEmail(
  tipo: TipoNotificacionEmail,
  cita: DatosCita,
  consultorio: DatosConsultorio
): Promise<boolean> {
  if (!cita.paciente_email) {
    console.warn(`[Email] Paciente ${cita.id} sin email registrado, omitiendo envío.`);
    return false;
  }

  try {
    const html = PLANTILLAS[tipo](cita, consultorio);
    const subject = ASUNTOS[tipo](consultorio.nombre, cita.fecha);
    const from = consultorio.email_remitente ?? 'notificaciones@toothx.app';

    const { error } = await resend.emails.send({
      from: `${consultorio.nombre} <${from}>`,
      to: cita.paciente_email,
      subject,
      html,
    });

    if (error) {
      console.error(`[Email] Error Resend para cita ${cita.id}:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[Email] Error inesperado para cita ${cita.id}:`, err);
    return false;
  }
}
