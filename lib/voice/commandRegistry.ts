// lib/voice/commandRegistry.ts
// Registro central de comandos del asistente clínico de voz
// Cada entrada define patrones RegExp, la acción a ejecutar y la respuesta de voz

import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// ── TIPOS ─────────────────────────────────────────────────────────────────────

export interface VoiceCommandContext {
  router: AppRouterInstance;
  tenantId: string;
  speak: (texto: string) => void;
}

export interface VoiceCommand {
  id: string;
  grupo: string;
  descripcion: string;
  ejemplos: string[];
  patterns: RegExp[];
  action: (match: RegExpMatchArray, ctx: VoiceCommandContext) => Promise<void> | void;
}

// ── HELPERS ───────────────────────────────────────────────────────────────────

async function fetchAPI(url: string): Promise<any> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function formatHora(isoDate: string): string {
  return new Date(isoDate).toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── REGISTRO DE COMANDOS ──────────────────────────────────────────────────────

export const commandRegistry: VoiceCommand[] = [
  // ── GRUPO 1: Consultas de agenda ──────────────────────────────────────────

  {
    id: 'cuantos_pacientes_hoy',
    grupo: 'Agenda',
    descripcion: 'Consulta cuántos pacientes hay hoy',
    ejemplos: ['¿cuántos pacientes tengo hoy?', 'cuántas citas hay'],
    patterns: [
      /cuántos? pacientes? (tengo |hay )?(hoy|para hoy)/i,
      /cuántas? citas? (tengo |hay )?(hoy|para hoy)/i,
    ],
    action: async (_, ctx) => {
      const data = await fetchAPI('/api/appointments?filter=hoy');
      const total = data?.count ?? 0;
      const completadas = data?.completadas ?? 0;
      ctx.speak(
        `Tienes ${total} citas hoy. ${completadas} completadas y ${total - completadas} pendientes.`
      );
    },
  },

  {
    id: 'siguiente_paciente',
    grupo: 'Agenda',
    descripcion: 'Cuál es el siguiente paciente',
    ejemplos: ['¿quién es el siguiente?', 'siguiente paciente'],
    patterns: [
      /quién es el siguiente/i,
      /siguiente paciente/i,
      /próximo paciente/i,
      /quién sigue/i,
    ],
    action: async (_, ctx) => {
      const data = await fetchAPI('/api/appointments?filter=proxima');
      if (!data?.cita) {
        ctx.speak('No hay más citas pendientes hoy.');
        return;
      }
      const { paciente_nombre, fecha_inicio } = data.cita;
      ctx.speak(`El siguiente paciente es ${paciente_nombre} a las ${formatHora(fecha_inicio)}.`);
    },
  },

  {
    id: 'resumen_dia',
    grupo: 'Agenda',
    descripcion: 'Resumen de métricas del día',
    ejemplos: ['dame el resumen del día', 'cómo va el día'],
    patterns: [
      /resumen del día/i,
      /cómo va el día/i,
      /dame el resumen/i,
    ],
    action: async (_, ctx) => {
      const data = await fetchAPI('/api/appointments?filter=hoy');
      const total = data?.count ?? 0;
      const completadas = data?.completadas ?? 0;
      ctx.speak(
        `Resumen del día: ${total} citas en total, ${completadas} atendidas, ${total - completadas} por atender.`
      );
    },
  },

  // ── GRUPO 2: Navegación ───────────────────────────────────────────────────

  {
    id: 'ir_dashboard',
    grupo: 'Navegación',
    descripcion: 'Ir al panel principal',
    ejemplos: ['ir al dashboard', 'inicio', 'panel principal'],
    patterns: [
      /ir al dashboard/i,
      /abrir dashboard/i,
      /panel principal/i,
      /inicio/i,
      /home/i,
    ],
    action: (_, ctx) => {
      ctx.router.push('/dashboard');
      ctx.speak('Abriendo el panel principal.');
    },
  },

  {
    id: 'ir_agenda',
    grupo: 'Navegación',
    descripcion: 'Ir a la agenda',
    ejemplos: ['abrir agenda', 'ir a citas', 'ver calendario'],
    patterns: [
      /abrir agenda/i,
      /ir a( la)? agenda/i,
      /ver( el)? calendario/i,
      /ver citas/i,
    ],
    action: (_, ctx) => {
      ctx.router.push('/dashboard/appointments');
      ctx.speak('Abriendo la agenda.');
    },
  },

  {
    id: 'ir_pacientes',
    grupo: 'Navegación',
    descripcion: 'Ir a la lista de pacientes',
    ejemplos: ['abrir pacientes', 'ir a pacientes', 'lista de pacientes'],
    patterns: [
      /abrir pacientes/i,
      /ir a pacientes/i,
      /lista de pacientes/i,
      /ver pacientes/i,
    ],
    action: (_, ctx) => {
      ctx.router.push('/dashboard/patients');
      ctx.speak('Abriendo la lista de pacientes.');
    },
  },

  {
    id: 'ir_facturacion',
    grupo: 'Navegación',
    descripcion: 'Ir a facturación',
    ejemplos: ['abrir facturación', 'ir a facturación', 'ver facturas'],
    patterns: [
      /abrir facturación/i,
      /ir a facturación/i,
      /ver facturas/i,
      /facturación/i,
    ],
    action: (_, ctx) => {
      ctx.router.push('/dashboard/billing');
      ctx.speak('Abriendo facturación.');
    },
  },

  // ── GRUPO 3: Gestión de citas ─────────────────────────────────────────────

  {
    id: 'paciente_en_sala',
    grupo: 'Citas',
    descripcion: 'Marcar que el paciente llegó',
    ejemplos: ['paciente en sala', 'el paciente llegó', 'comenzar cita'],
    patterns: [
      /paciente en sala/i,
      /el paciente llegó/i,
      /comenzar cita/i,
      /iniciar cita/i,
      /paciente listo/i,
    ],
    action: async (_, ctx) => {
      const data = await fetchAPI('/api/appointments?filter=proxima');
      if (!data?.cita) {
        ctx.speak('No encontré la cita activa. Verifica la agenda.');
        return;
      }
      await fetch(`/api/appointments/${data.cita.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'en_curso' }),
      });
      ctx.speak(`Cita iniciada para ${data.cita.paciente_nombre}.`);
    },
  },

  {
    id: 'finalizar_cita',
    grupo: 'Citas',
    descripcion: 'Finalizar la cita activa',
    ejemplos: ['finalizar cita', 'cita terminada', 'atención completada'],
    patterns: [
      /finalizar cita/i,
      /cita terminada/i,
      /atención completada/i,
      /terminar cita/i,
      /completar cita/i,
    ],
    action: async (_, ctx) => {
      const data = await fetchAPI('/api/appointments?filter=en_curso');
      if (!data?.cita) {
        ctx.speak('No hay cita en curso.');
        return;
      }
      await fetch(`/api/appointments/${data.cita.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'completada' }),
      });
      ctx.speak(`Cita de ${data.cita.paciente_nombre} marcada como completada.`);
    },
  },

  {
    id: 'paciente_no_asistio',
    grupo: 'Citas',
    descripcion: 'Marcar que el paciente no asistió',
    ejemplos: ['no asistió', 'paciente ausente', 'faltó'],
    patterns: [
      /no asistió/i,
      /paciente ausente/i,
      /faltó/i,
      /no vino/i,
      /no se presentó/i,
    ],
    action: async (_, ctx) => {
      const data = await fetchAPI('/api/appointments?filter=proxima');
      if (!data?.cita) {
        ctx.speak('No encontré la cita.');
        return;
      }
      await fetch(`/api/appointments/${data.cita.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'no_asistio' }),
      });
      ctx.speak(`Cita de ${data.cita.paciente_nombre} registrada como no asistida.`);
    },
  },

  // ── GRUPO 4: Plan de tratamiento ──────────────────────────────────────────

  {
    id: 'tratamiento_finalizado',
    grupo: 'Tratamiento',
    descripcion: 'Marcar el tratamiento actual como finalizado',
    ejemplos: ['tratamiento finalizado', 'procedimiento completado', 'listo el tratamiento'],
    patterns: [
      /tratamiento finalizado/i,
      /procedimiento completado/i,
      /listo el tratamiento/i,
      /tratamiento completo/i,
    ],
    action: (_, ctx) => {
      ctx.speak(
        'Entendido. Por favor ve a la ficha del paciente para marcar el tratamiento como completado.'
      );
    },
  },

  // ── GRUPO 5: Facturación ──────────────────────────────────────────────────

  {
    id: 'generar_factura',
    grupo: 'Facturación',
    descripcion: 'Abrir el formulario de nueva factura',
    ejemplos: ['generar factura', 'crear factura', 'nueva factura'],
    patterns: [
      /generar factura/i,
      /crear factura/i,
      /nueva factura/i,
      /hacer factura/i,
      /emitir factura/i,
    ],
    action: (_, ctx) => {
      ctx.router.push('/dashboard/billing?tab=facturas');
      ctx.speak('Abriendo el módulo de facturación.');
    },
  },

  // ── GRUPO 6: Control del asistente ────────────────────────────────────────

  {
    id: 'silencio',
    grupo: 'Control',
    descripcion: 'Activar modo silencioso (sin voz)',
    ejemplos: ['silencio', 'modo silencioso', 'apaga el audio'],
    patterns: [
      /^silencio$/i,
      /modo silencioso/i,
      /apaga el audio/i,
      /sin voz/i,
    ],
    action: (_, ctx) => {
      ctx.speak('Modo silencioso activado.');
    },
  },

  {
    id: 'ayuda',
    grupo: 'Control',
    descripcion: 'Mostrar los comandos disponibles',
    ejemplos: ['ayuda', 'qué puedes hacer', 'comandos disponibles'],
    patterns: [
      /ayuda/i,
      /qué puedes hacer/i,
      /comandos disponibles/i,
      /qué comandos hay/i,
    ],
    action: (_, ctx) => {
      ctx.speak(
        'Puedo ayudarte con: consultar la agenda, navegar entre módulos, gestionar citas y facturación. ' +
          'Di el nombre del módulo al que quieres ir o pregunta por tus citas del día.'
      );
    },
  },

  {
    id: 'cerrar_sesion',
    grupo: 'Control',
    descripcion: 'Cerrar la sesión',
    ejemplos: ['cerrar sesión', 'logout', 'salir del sistema'],
    patterns: [
      /cerrar sesión/i,
      /logout/i,
      /salir del sistema/i,
      /terminar sesión/i,
    ],
    action: async (_, ctx) => {
      ctx.speak('Cerrando sesión. Hasta pronto.');
      await fetch('/api/auth/logout', { method: 'POST' });
      ctx.router.push('/login');
    },
  },
];

// ── FUNCIÓN DE BÚSQUEDA ───────────────────────────────────────────────────────

/**
 * Busca el primer comando que coincida con la transcripción.
 * Retorna el comando y el match si lo encuentra, o null.
 */
export function findCommand(
  transcript: string
): { command: VoiceCommand; match: RegExpMatchArray } | null {
  for (const command of commandRegistry) {
    for (const pattern of command.patterns) {
      const match = transcript.match(pattern);
      if (match) return { command, match };
    }
  }
  return null;
}

/**
 * Retorna todos los comandos agrupados por grupo.
 */
export function getCommandsByGroup(): Record<string, VoiceCommand[]> {
  return commandRegistry.reduce((acc, cmd) => {
    if (!acc[cmd.grupo]) acc[cmd.grupo] = [];
    acc[cmd.grupo].push(cmd);
    return acc;
  }, {} as Record<string, VoiceCommand[]>);
}
