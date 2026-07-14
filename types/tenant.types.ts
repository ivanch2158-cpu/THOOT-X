// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS BASE — Tenant y User
// ═══════════════════════════════════════════════════════════════════════════════
// Tipos TypeScript para las entidades principales del sistema.

// Representación completa de un Tenant (Consultorio)
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ruc?: string;
  address?: string;
  phone?: string;
  country: string;
  logo_url?: string;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  plan: string;
  plan_expires_at?: string;
  is_active: boolean;
  onboarding_complete: boolean;
  horarios_atencion?: Record<string, { activo: boolean; inicio: string; fin: string }>;
  duracion_cita_min: number;
  created_at: string;
  updated_at: string;
}

// Representación completa de un User
export interface User {
  id: string;
  tenant_id: string;
  supabase_auth_id: string;
  email: string;
  full_name: string;
  app_role: 'admin' | 'doctor' | 'secretary' | 'super_admin';
  specialty?: string;
  photo_url?: string;
  voice_pin_hash?: string;
  voice_pin_attempts: number;
  is_active: boolean;
  invitation_token?: string;
  invitation_expires?: string;
  created_at: string;
  updated_at: string;
}

// Sesión del usuario autenticado
export interface AuthSession {
  user: {
    id: string;
    email: string;
    user_metadata: {
      tenant_id: string;
      app_role: 'admin' | 'doctor' | 'secretary' | 'super_admin';
      full_name: string;
      onboarding_complete: boolean;
      voice_pin_set: boolean;
    };
  };
  access_token: string;
  refresh_token: string;
}

// Respuesta estándar de la API
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    fields?: Record<string, string[]>;
  };
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}
