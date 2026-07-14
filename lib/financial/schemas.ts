// lib/financial/schemas.ts
// Esquemas de validación para facturación e inventario

import { z } from 'zod';

/**
 * Esquema para ítems de factura
 * Cada ítem representa una línea de la factura
 */
export const facturaItemSchema = z.object({
  descripcion: z.string().min(1, 'Descripción es requerida').max(500),
  cantidad: z.number().positive('Cantidad debe ser mayor a 0'),
  precio_unitario: z.number().nonnegative('Precio no puede ser negativo'),
  descuento_porcentaje: z.number().min(0).max(100).optional(),
  descuento_monto: z.number().nonnegative().optional(),
});

export type FacturaItemInput = z.infer<typeof facturaItemSchema>;

/**
 * Esquema para crear factura
 */
export const facturaSchema = z.object({
  paciente_id: z.string().uuid('ID de paciente inválido'),
  items: z.array(facturaItemSchema).min(1, 'Mínimo 1 ítem es requerido'),
  descuento_global: z.number().nonnegative('Descuento no puede ser negativo').optional(),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cuotas']),
  notas: z.string().max(500).optional(),
});

export type FacturaInput = z.infer<typeof facturaSchema>;

/**
 * Esquema para registrar pago en factura
 */
export const pagoSchema = z.object({
  factura_id: z.string().uuid('ID de factura inválido'),
  monto: z.number().positive('Monto debe ser mayor a 0'),
  metodo_pago: z.enum(['efectivo', 'transferencia', 'tarjeta', 'cuotas']),
  referencia: z.string().max(200).optional(),
  notas: z.string().max(500).optional(),
});

export type PagoInput = z.infer<typeof pagoSchema>;

/**
 * Esquema para equipos (inventario)
 */
export const equipoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(200),
  marca: z.string().max(100).optional(),
  modelo: z.string().max(100).optional(),
  serial: z.string().max(100).optional(),
  categoria: z.enum(['sillon', 'compresor', 'autoclave', 'rayos_x', 'succiona', 'otro']),
  fecha_compra: z.string().date('Fecha inválida'),
  valor_compra: z.number().positive('Valor de compra debe ser mayor a 0'),
  proveedor: z.string().max(200).optional(),
  vida_util_anos: z.number().int().positive('Vida útil debe ser positiva'),
  valor_residual: z.number().nonnegative('Valor residual no puede ser negativo'),
  estado: z.enum(['activo', 'mantenimiento', 'dado_de_baja']).optional().default('activo'),
  observaciones: z.string().max(500).optional(),
});

export type EquipoInput = z.infer<typeof equipoSchema>;

/**
 * Esquema para insumos
 */
export const insumoSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido').max(200),
  categoria: z.enum(['instrumental', 'material', 'medicamento', 'desinfectante', 'otro']),
  unidad_medida: z.enum(['unidad', 'caja', 'paquete', 'tubo', 'botella', 'litro', 'kg']),
  stock_minimo: z.number().nonnegative('Stock mínimo no puede ser negativo'),
  precio_unitario: z.number().positive('Precio unitario debe ser mayor a 0'),
  observaciones: z.string().max(500).optional(),
});

export type InsumoInput = z.infer<typeof insumoSchema>;

/**
 * Esquema para movimiento de insumos (entrada/salida)
 */
export const movimientoInsumoSchema = z.object({
  insumo_id: z.string().uuid('ID de insumo inválido'),
  tipo: z.enum(['entrada', 'salida']),
  cantidad: z.number().positive('Cantidad debe ser mayor a 0'),
  precio_unitario: z.number().nonnegative('Precio unitario no puede ser negativo').optional(),
  fecha: z.string().date('Fecha inválida').optional(),
  proveedor: z.string().max(200).optional(),
  razon: z.string().max(500).optional(),
});

export type MovimientoInsumoInput = z.infer<typeof movimientoInsumoSchema>;

/**
 * Esquema para gastos del consultorio
 */
export const gastoSchema = z.object({
  categoria: z.enum([
    'arriendo',
    'sueldos',
    'servicios_publicos',
    'seguros',
    'suscripciones',
    'laboratorio_dental',
    'mantenimiento',
    'marketing',
    'capacitacion',
    'otro'
  ]),
  tipo: z.enum(['fijo', 'variable']),
  descripcion: z.string().min(1, 'Descripción es requerida').max(500),
  monto: z.number().positive('Monto debe ser mayor a 0'),
  fecha: z.string().date('Fecha inválida'),
  paciente_id: z.string().uuid().optional(),
  recurrente: z.boolean().optional().default(false),
  notas: z.string().max(500).optional(),
});

export type GastoInput = z.infer<typeof gastoSchema>;
