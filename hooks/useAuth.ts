// ═══════════════════════════════════════════════════════════════════════════════
// HOOK: useAuth — Gestión de sesión y autenticación
// ═══════════════════════════════════════════════════════════════════════════════
// Hook para acceder a la sesión, usuario, rol y tenant_id en componentes.

'use client';

import { useCallback, useEffect, useState } from 'react';
import { supabaseClient } from '@/lib/supabase/client';
import type { AuthSession } from '@/types/tenant.types';

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Cargar sesión inicial
  useEffect(() => {
    const loadSession = async () => {
      try {
        const {
          data: { session: authSession },
        } = await supabaseClient.auth.getSession();

        setSession(authSession as unknown as AuthSession);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Error cargando sesión'));
      } finally {
        setLoading(false);
      }
    };

    loadSession();

    // Escuchar cambios de sesión
    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event: any, authSession: any) => {
      setSession(authSession as unknown as AuthSession);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Helper: logout
  const logout = useCallback(async () => {
    try {
      await supabaseClient.auth.signOut();
      setSession(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error cerrando sesión'));
    }
  }, []);

  return {
    session,
    user: session?.user,
    loading,
    error,
    logout,
    isAuthenticated: !!session,
    role: session?.user.user_metadata?.app_role,
    tenantId: session?.user.user_metadata?.tenant_id,
  };
}
