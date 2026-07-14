// lib/notifications/whatsappService.ts
// Servicio de envío de mensajes WhatsApp via Meta Cloud API
// Usa plantillas preaprobadas para cada tipo de notificación de cita

// ── TIPOS ─────────────────────────────────────────────────────────────────────

export type TipoNotificacionWhatsApp =
  | 'confirmacion'
  | 'recordatorio_24h'
  | 'recordatorio_2h'
  | 'reagendamiento'
  | 'cancelacion';

export interface DatosMensajeWA {
  paciente_nombre: string;
  paciente_telefono: string;   // Formato internacional: "51912345678"
  fecha: string;
  hora: string;
  doctor_nombre: string;
  consultorio_nombre: string;
  consultorio_telefono?: string;
  motivo?: string;
}

// ── CONFIGURACIÓN ─────────────────────────────────────────────────────────────

const WA_API_URL = 'https://graph.facebook.com/v19.0';

// IDs de plantillas preaprobadas en Meta Business
// Estas plantillas deben estar registradas en el panel de Meta
const TEMPLATE_NAMES: Record<TipoNotificacionWhatsApp, string> = {
  confirmacion: 'toothx_cita_confirmada',
  recordatorio_24h: 'toothx_recordatorio_manana',
  recordatorio_2h: 'toothx_recordatorio_2h',
  reagendamiento: 'toothx_cita_reagendada',
  cancelacion: 'toothx_cita_cancelada',
};

// ── CONSTRUCCIÓN DE PAYLOAD ───────────────────────────────────────────────────

/**
 * Construye los componentes (parámetros) de la plantilla WA según el tipo.
 * Las variables se pasan en el orden definido en la plantilla aprobada por Meta.
 */
function buildTemplateComponents(
  tipo: TipoNotificacionWhatsApp,
  datos: DatosMensajeWA
): object[] {
  // Parámetros comunes a todas las plantillas
  const paramsBase = [
    { type: 'text', text: datos.paciente_nombre },
    { type: 'text', text: datos.consultorio_nombre },
    { type: 'text', text: datos.fecha },
    { type: 'text', text: datos.hora },
    { type: 'text', text: datos.doctor_nombre },
  ];

  if (tipo === 'confirmacion' || tipo === 'reagendamiento') {
    return [
      {
        type: 'body',
        parameters: [
          ...paramsBase,
          ...(datos.motivo
            ? [{ type: 'text', text: datos.motivo }]
            : [{ type: 'text', text: 'consulta general' }]),
        ],
      },
    ];
  }

  if (tipo === 'cancelacion') {
    return [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: datos.paciente_nombre },
          { type: 'text', text: datos.fecha },
          { type: 'text', text: datos.hora },
          { type: 'text', text: datos.consultorio_nombre },
          ...(datos.consultorio_telefono
            ? [{ type: 'text', text: datos.consultorio_telefono }]
            : []),
        ],
      },
    ];
  }

  // recordatorio_24h, recordatorio_2h
  return [
    {
      type: 'body',
      parameters: paramsBase,
    },
  ];
}

// ── FUNCIÓN PRINCIPAL ─────────────────────────────────────────────────────────

/**
 * Envía un mensaje de WhatsApp al paciente usando Meta Cloud API.
 *
 * @param tipo - Tipo de notificación
 * @param datos - Datos de la cita y el consultorio
 * @param phoneNumberId - ID del número de WhatsApp Business del consultorio
 * @param accessToken - Token de acceso de Meta (del consultorio)
 * @returns true si el envío fue exitoso
 */
export async function sendWhatsApp(
  tipo: TipoNotificacionWhatsApp,
  datos: DatosMensajeWA,
  phoneNumberId?: string,
  accessToken?: string
): Promise<boolean> {
  const waPhoneNumberId = phoneNumberId ?? process.env.WHATSAPP_PHONE_NUMBER_ID;
  const waToken = accessToken ?? process.env.WHATSAPP_ACCESS_TOKEN;

  if (!waPhoneNumberId || !waToken) {
    console.warn('[WhatsApp] Credenciales no configuradas, omitiendo envío.');
    return false;
  }

  if (!datos.paciente_telefono) {
    console.warn(`[WhatsApp] Paciente sin teléfono registrado, omitiendo envío.`);
    return false;
  }

  // Limpiar el número: solo dígitos, agregar código de país si no lo tiene
  const telefono = datos.paciente_telefono.replace(/\D/g, '');
  const telefonoFinal = telefono.startsWith('51') ? telefono : `51${telefono}`;

  const templateName = TEMPLATE_NAMES[tipo];
  const components = buildTemplateComponents(tipo, datos);

  const payload = {
    messaging_product: 'whatsapp',
    to: telefonoFinal,
    type: 'template',
    template: {
      name: templateName,
      language: { code: 'es_419' },
      components,
    },
  };

  try {
    const res = await fetch(`${WA_API_URL}/${waPhoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${waToken}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();

    if (!res.ok) {
      console.error(
        `[WhatsApp] Error Meta API para tipo "${tipo}":`,
        JSON.stringify(json.error ?? json)
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[WhatsApp] Error de red para tipo "${tipo}":`, err);
    return false;
  }
}

/**
 * Construye el texto de un mensaje WhatsApp en texto plano (para fallback o logs).
 */
export function buildMensajeTexto(
  tipo: TipoNotificacionWhatsApp,
  datos: DatosMensajeWA
): string {
  const mensajes: Record<TipoNotificacionWhatsApp, string> = {
    confirmacion: `✅ *Cita confirmada*\nHola ${datos.paciente_nombre}, tu cita en ${datos.consultorio_nombre} está confirmada.\n📅 ${datos.fecha} a las ${datos.hora}\n👨‍⚕️ ${datos.doctor_nombre}`,
    recordatorio_24h: `🔔 *Recordatorio de cita*\nHola ${datos.paciente_nombre}, mañana tienes cita en ${datos.consultorio_nombre}.\n📅 ${datos.fecha} a las ${datos.hora}\n👨‍⚕️ ${datos.doctor_nombre}`,
    recordatorio_2h: `⏰ *Recordatorio*\nHola ${datos.paciente_nombre}, en 2 horas tienes cita en ${datos.consultorio_nombre}.\n🕐 ${datos.hora}\n👨‍⚕️ ${datos.doctor_nombre}`,
    reagendamiento: `🔄 *Cita reagendada*\nHola ${datos.paciente_nombre}, tu cita en ${datos.consultorio_nombre} fue reprogramada.\n📅 ${datos.fecha} a las ${datos.hora}\n👨‍⚕️ ${datos.doctor_nombre}`,
    cancelacion: `❌ *Cita cancelada*\nHola ${datos.paciente_nombre}, tu cita del ${datos.fecha} a las ${datos.hora} en ${datos.consultorio_nombre} ha sido cancelada.`,
  };

  return mensajes[tipo];
}
