// ═══════════════════════════════════════════════════════════════════════════════
// HOOK: useTenant — Gestión del tenant activo
// ═══════════════════════════════════════════════════════════════════════════════
// Hook para acceder a los datos del consultorio activo (tenant) en toda la app.
// Se hidrata desde Zustand al cargar la sesión.

'use client';

import { create } from 'zustand';
import type { Tenant } from '@/types/tenant.types';

interface TenantStore {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant) => void;
  clearTenant: () => void;
}

const useTenantStore = create<TenantStore>((set) => ({
  tenant: null,
  setTenant: (tenant) => set({ tenant }),
  clearTenant: () => set({ tenant: null }),
}));

export function useTenant() {
  return useTenantStore();
}
