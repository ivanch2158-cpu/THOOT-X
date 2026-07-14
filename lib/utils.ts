// lib/utils.ts
// Utilidad para combinar clases CSS condicionales de Tailwind

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina múltiples clases CSS de Tailwind manejando conflictos y condicionales.
 * Usa `clsx` para evaluar condiciones y `tailwind-merge` para resolver colisiones de clases de Tailwind.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
