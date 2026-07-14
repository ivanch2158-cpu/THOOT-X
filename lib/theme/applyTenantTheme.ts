// ═══════════════════════════════════════════════════════════════════════════════
// APLICAR TEMA DEL TENANT — Inyectar CSS Custom Properties
// ═══════════════════════════════════════════════════════════════════════════════
// Esta función toma los colores personalizados del tenant y los inyecta
// como variables CSS en document.documentElement para que Tailwind los use.

import type { Tenant } from '@/types/tenant.types';

// Helper: oscurecer un color hex en N%
function darkenHex(hex: string, percent: number): string {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.max(0, Math.floor(r * (1 - percent / 100)));
  g = Math.max(0, Math.floor(g * (1 - percent / 100)));
  b = Math.max(0, Math.floor(b * (1 - percent / 100)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// Helper: aclarar un color hex en N%
function lightenHex(hex: string, percent: number): string {
  let r = parseInt(hex.slice(1, 3), 16);
  let g = parseInt(hex.slice(3, 5), 16);
  let b = parseInt(hex.slice(5, 7), 16);

  r = Math.min(255, Math.floor(r + (255 - r) * (percent / 100)));
  g = Math.min(255, Math.floor(g + (255 - g) * (percent / 100)));
  b = Math.min(255, Math.floor(b + (255 - b) * (percent / 100)));

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Aplica el tema personalizado del tenant a la aplicación.
 * Inyecta las variables CSS en document.documentElement para que
 * Tailwind CSS pueda acceder a ellas mediante var().
 *
 * @param tenant - Objeto del tenant con colores y tipografía personalizados
 */
export function applyTenantTheme(tenant: Tenant): void {
  if (typeof document === 'undefined') return; // Server-side safety

  const root = document.documentElement;

  // Colores de marca (personalizables)
  root.style.setProperty('--color-primary', tenant.primary_color);
  root.style.setProperty('--color-primary-hover', darkenHex(tenant.primary_color, 10));
  root.style.setProperty('--color-primary-light', lightenHex(tenant.primary_color, 85));
  root.style.setProperty('--color-primary-text', darkenHex(tenant.primary_color, 30));

  root.style.setProperty('--color-secondary', tenant.secondary_color);
  root.style.setProperty('--color-secondary-hover', darkenHex(tenant.secondary_color, 10));
  root.style.setProperty('--color-secondary-light', lightenHex(tenant.secondary_color, 85));

  // Tipografía (personalizable)
  root.style.setProperty('--font-family', `'${tenant.font_family}', system-ui, sans-serif`);
  root.style.setProperty('--font-mono', "'JetBrains Mono', 'Fira Code', monospace");

  // Colores fijos (NO se personalizan)
  root.style.setProperty('--color-bg', '#FFFFFF');
  root.style.setProperty('--color-surface', '#F8FAFC');
  root.style.setProperty('--color-surface-hover', '#F1F5F9');
  root.style.setProperty('--color-border', '#E2E8F0');
  root.style.setProperty('--color-border-strong', '#CBD5E1');

  root.style.setProperty('--color-text-primary', '#0F172A');
  root.style.setProperty('--color-text-secondary', '#475569');
  root.style.setProperty('--color-text-disabled', '#94A3B8');
  root.style.setProperty('--color-text-inverse', '#FFFFFF');

  root.style.setProperty('--color-success', '#16A34A');
  root.style.setProperty('--color-success-light', '#DCFCE7');
  root.style.setProperty('--color-success-text', '#14532D');

  root.style.setProperty('--color-warning', '#CA8A04');
  root.style.setProperty('--color-warning-light', '#FEF9C3');
  root.style.setProperty('--color-warning-text', '#713F12');

  root.style.setProperty('--color-danger', '#DC2626');
  root.style.setProperty('--color-danger-light', '#FEE2E2');
  root.style.setProperty('--color-danger-text', '#7F1D1D');

  root.style.setProperty('--color-info', '#0284C7');
  root.style.setProperty('--color-info-light', '#E0F2FE');
  root.style.setProperty('--color-info-text', '#0C4A6E');

  root.style.setProperty('--color-sidebar-bg', '#0F172A');
  root.style.setProperty('--color-sidebar-text', '#94A3B8');
  root.style.setProperty('--color-sidebar-active', '#FFFFFF');
  root.style.setProperty('--color-sidebar-hover', 'rgba(255,255,255,0.06)');
  root.style.setProperty('--color-sidebar-active-bg', 'rgba(255,255,255,0.10)');
}

/**
 * Restaura los estilos por defecto de TOOTH X (sin personalización de tenant).
 * Útil para el login y páginas públicas antes de cargar el tenant.
 */
export function applyDefaultTheme(): void {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;

  // Colores por defecto
  root.style.setProperty('--color-primary', '#1D4ED8');
  root.style.setProperty('--color-primary-hover', '#1E40AF');
  root.style.setProperty('--color-primary-light', '#DBEAFE');
  root.style.setProperty('--color-primary-text', '#1E3A8A');

  root.style.setProperty('--color-secondary', '#0F766E');
  root.style.setProperty('--color-secondary-hover', '#0D6B63');
  root.style.setProperty('--color-secondary-light', '#CCFBF1');

  root.style.setProperty('--font-family', "'Inter', system-ui, sans-serif");
  root.style.setProperty('--font-mono', "'JetBrains Mono', monospace");

  // Todos los demás colores igual
  root.style.setProperty('--color-bg', '#FFFFFF');
  root.style.setProperty('--color-surface', '#F8FAFC');
  root.style.setProperty('--color-surface-hover', '#F1F5F9');
  root.style.setProperty('--color-border', '#E2E8F0');
  root.style.setProperty('--color-border-strong', '#CBD5E1');

  root.style.setProperty('--color-text-primary', '#0F172A');
  root.style.setProperty('--color-text-secondary', '#475569');
  root.style.setProperty('--color-text-disabled', '#94A3B8');
  root.style.setProperty('--color-text-inverse', '#FFFFFF');

  root.style.setProperty('--color-success', '#16A34A');
  root.style.setProperty('--color-success-light', '#DCFCE7');
  root.style.setProperty('--color-success-text', '#14532D');

  root.style.setProperty('--color-warning', '#CA8A04');
  root.style.setProperty('--color-warning-light', '#FEF9C3');
  root.style.setProperty('--color-warning-text', '#713F12');

  root.style.setProperty('--color-danger', '#DC2626');
  root.style.setProperty('--color-danger-light', '#FEE2E2');
  root.style.setProperty('--color-danger-text', '#7F1D1D');

  root.style.setProperty('--color-info', '#0284C7');
  root.style.setProperty('--color-info-light', '#E0F2FE');
  root.style.setProperty('--color-info-text', '#0C4A6E');

  root.style.setProperty('--color-sidebar-bg', '#0F172A');
  root.style.setProperty('--color-sidebar-text', '#94A3B8');
  root.style.setProperty('--color-sidebar-active', '#FFFFFF');
  root.style.setProperty('--color-sidebar-hover', 'rgba(255,255,255,0.06)');
  root.style.setProperty('--color-sidebar-active-bg', 'rgba(255,255,255,0.10)');
}
