// lib/auth/schemas.ts
// Esquemas Zod para autenticación y validación

import { z } from 'zod';

/**
 * Esquema de validación para login
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Esquema de validación para registro
 */
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  passwordConfirm: z.string(),
  fullName: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  tenantName: z
    .string()
    .min(1, 'El nombre del consultorio es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
}).refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  }
);

export type RegisterInput = z.infer<typeof registerSchema>;

/**
 * Esquema de validación para recuperación de contraseña
 */
export const resetPasswordRequestSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Email inválido'),
});

export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;

/**
 * Esquema de validación para confirmar nueva contraseña
 */
export const resetPasswordConfirmSchema = z.object({
  token: z.string().min(1, 'Token inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  passwordConfirm: z.string(),
}).refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  }
);

export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;

/**
 * Esquema de validación para login por voz (PIN)
 */
export const voiceLoginSchema = z.object({
  doctorName: z
    .string()
    .min(1, 'El nombre del doctor es requerido'),
  pin: z
    .string()
    .length(4, 'El PIN debe tener exactamente 4 dígitos')
    .regex(/^\d+$/, 'El PIN debe ser solo números'),
});

export type VoiceLoginInput = z.infer<typeof voiceLoginSchema>;

/**
 * Esquema de validación para el formulario de restablecer contraseña (sin token)
 */
export const resetPasswordFormSchema = z.object({
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  passwordConfirm: z.string(),
}).refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  }
);

export type ResetPasswordFormInput = z.infer<typeof resetPasswordFormSchema>;

/**
 * Esquema de validación para activación de cuenta
 */
export const activateAccountSchema = z.object({
  token: z.string().optional(),
  fullName: z
    .string()
    .min(1, 'El nombre completo es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Debe contener al menos un número'),
  passwordConfirm: z.string(),
  voicePin: z
    .string()
    .length(4, 'El PIN debe tener exactamente 4 dígitos')
    .regex(/^\d+$/, 'El PIN debe ser solo números')
    .optional()
    .or(z.literal('')),
}).refine(
  (data) => data.password === data.passwordConfirm,
  {
    message: 'Las contraseñas no coinciden',
    path: ['passwordConfirm'],
  }
);

export type ActivateAccountInput = z.infer<typeof activateAccountSchema>;

