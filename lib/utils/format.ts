// ═══════════════════════════════════════════════════════════════════════════════
// UTILIDADES — Formateo de Moneda y Fecha
// ═══════════════════════════════════════════════════════════════════════════════

// Formatea un número como moneda en soles peruanos (S/. 1,234.56)
export function formatCurrency(amount: number | string | undefined): string {
  if (!amount && amount !== 0) return 'S/. 0.00';

  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 'S/. 0.00';

  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency: 'PEN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

// Formatea una fecha en español: "28 de mayo de 2026"
export function formatDate(date: Date | string | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

// Formatea una fecha y hora: "28 de mayo, 14:30"
export function formatDateTime(date: Date | string | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Solo la hora: "14:30"
export function formatTime(date: Date | string | undefined): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';

  return new Intl.DateTimeFormat('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

// Calcula la diferencia en días entre dos fechas
export function daysDifference(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / oneDay);
}
