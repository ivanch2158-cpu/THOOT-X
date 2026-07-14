// lib/clinical/schemas.ts
// Esquemas Zod para el núcleo clínico (pacientes, citas, odontograma)

import { z } from 'zod';

/**
 * Esquema para crear/editar paciente
 */
export const pacienteSchema = z.object({
  // Prisma usa 'nombres' (plural) — columna real en la BD
  nombres: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  apellidos: z
    .string()
    .min(1, 'Los apellidos son requeridos')
    .min(3, 'Los apellidos deben tener al menos 3 caracteres'),
  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  telefono: z
    .string()
    .min(7, 'Teléfono inválido')
    .optional()
    .or(z.literal('')),
  fecha_nacimiento: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida')
    .optional()
    .or(z.literal('')),
  // Prisma usa 'sexo' (columna real en la BD: M | F | O)
  sexo: z
    .enum(['M', 'F', 'O'], {
      errorMap: () => ({ message: 'Sexo inválido' }),
    })
    .optional(),
  direccion: z
    .string()
    .optional()
    .or(z.literal('')),
  ciudad: z
    .string()
    .optional()
    .or(z.literal('')),
  pais: z
    .string()
    .optional()
    .or(z.literal('')),
  numero_documento: z
    .string()
    .optional()
    .or(z.literal('')),
  tipo_documento: z
    .enum(['DNI', 'Pasaporte', 'RUC', 'CE'], {
      errorMap: () => ({ message: 'Tipo de documento inválido' }),
    })
    .optional(),
  // Prisma usa 'alergias' y 'antecedentes_medicos' — mapeamos aquí para compatibilidad
  alergias: z
    .string()
    .optional()
    .or(z.literal('')),
  antecedentes_medicos: z
    .string()
    .optional()
    .or(z.literal('')),
  observaciones: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type PacienteInput = z.infer<typeof pacienteSchema>;

/**
 * Esquema para crear/editar cita
 */
export const citaSchema = z.object({
  paciente_id: z
    .string()
    .min(1, 'El paciente es requerido'),
  fecha: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
  hora_inicio: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Hora inválida (HH:mm)'),
  hora_fin: z
    .string()
    .regex(/^([0-1]\d|2[0-3]):[0-5]\d$/, 'Hora inválida (HH:mm)'),
  tipo_cita: z
    .enum(['consulta', 'limpieza', 'revision', 'tratamiento', 'seguimiento'], {
      errorMap: () => ({ message: 'Tipo de cita inválido' }),
    }),
  estado: z
    .enum(['pendiente', 'confirmada', 'completada', 'cancelada'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    }),
  notas: z
    .string()
    .optional()
    .or(z.literal('')),
  odontologist_id: z
    .string()
    .optional(),
}).refine(
  (data) => {
    // Validar que hora_fin sea posterior a hora_inicio
    const [hI, mI] = data.hora_inicio.split(':').map(Number);
    const [hF, mF] = data.hora_fin.split(':').map(Number);
    const inicio = hI * 60 + mI;
    const fin = hF * 60 + mF;
    return fin > inicio;
  },
  {
    message: 'La hora de fin debe ser posterior a la hora de inicio',
    path: ['hora_fin'],
  }
);

export type CitaInput = z.infer<typeof citaSchema>;

/**
 * Esquema para evolución/nota clínica
 */
export const evolucionSchema = z.object({
  paciente_id: z
    .string()
    .min(1, 'El paciente es requerido'),
  cita_id: z
    .string()
    .optional(),
  diagnostico: z
    .string()
    .min(1, 'El diagnóstico es requerido')
    .min(5, 'El diagnóstico debe tener al menos 5 caracteres'),
  tratamiento_realizado: z
    .string()
    .min(1, 'Debe describir el tratamiento realizado')
    .min(5, 'Descripción muy corta'),
  observaciones: z
    .string()
    .optional()
    .or(z.literal('')),
  proxima_cita_recomendada: z
    .string()
    .optional()
    .or(z.literal('')),
  presion_arterial: z
    .string()
    .optional()
    .or(z.literal('')),
  frecuencia_cardiaca: z
    .string()
    .optional()
    .or(z.literal('')),
  temperatura: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type EvolucionInput = z.infer<typeof evolucionSchema>;

/**
 * Esquema para ítem del odontograma (hallazgo por diente)
 */
export const odontogramaItemSchema = z.object({
  paciente_id: z
    .string()
    .min(1, 'El paciente es requerido'),
  numero_diente: z
    .number()
    .min(11, 'Número de diente inválido')
    .max(88, 'Número de diente inválido'),
  estado: z
    .enum(
      [
        'sano',
        'caries',
        'obturacion',
        'corona',
        'ausente',
        'fractura',
        'implante',
        'endodoncia',
        'sellante',
      ],
      {
        errorMap: () => ({ message: 'Estado de diente inválido' }),
      }
    ),
  cara: z
    .enum(['O', 'M', 'D', 'L', 'V', 'P'], {
      errorMap: () => ({ message: 'Cara del diente inválida' }),
    })
    .optional(),
  profundidad_bolsa: z
    .number()
    .min(0)
    .max(10)
    .optional(),
  sangrado: z
    .boolean()
    .optional()
    .default(false),
  movilidad: z
    .number()
    .min(0)
    .max(3)
    .optional(),
  notas: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type OdontogramaItemInput = z.infer<typeof odontogramaItemSchema>;

/**
 * Esquema para plan de tratamiento
 */
export const planTratamientoSchema = z.object({
  paciente_id: z
    .string()
    .min(1, 'El paciente es requerido'),
  descripcion: z
    .string()
    .min(1, 'La descripción es requerida')
    .min(5, 'Descripción muy corta'),
  costo_total: z
    .number()
    .min(0, 'El costo debe ser positivo'),
  estado: z
    .enum(['pendiente', 'en_proceso', 'completado', 'cancelado'], {
      errorMap: () => ({ message: 'Estado inválido' }),
    }),
  fecha_inicio_estimada: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida')
    .optional(),
  fecha_fin_estimada: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida')
    .optional(),
  notas: z
    .string()
    .optional()
    .or(z.literal('')),
});

export type PlanTratamientoInput = z.infer<typeof planTratamientoSchema>;
