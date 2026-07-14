// app/(dashboard)/layout.tsx
// Layout principal para todas las rutas del dashboard autenticado
// Envuelve el contenido con Sidebar (fixed) + Header (sticky) + área de contenido

'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useSidebar } from '@/hooks/useSidebar';
import { useTenant } from '@/hooks/useTenant';
import { useAuth } from '@/hooks/useAuth';
import { applyTenantTheme } from '@/lib/theme/applyTenantTheme';
import { supabaseClient } from '@/lib/supabase/client';
import { useVoiceAssistant } from '@/hooks/useVoiceAssistant';
import { VoiceCommandCard } from '@/components/voice/VoiceCommandCard';

// ─── Overlay para drawer mobile ───────────────────────────────────────────────

function MobileOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-20 bg-black/50 lg:hidden"
      onClick={onClose}
      aria-hidden="true"
    />
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isCollapsed, isMobileOpen, toggle, toggleMobile, closeMobile } =
    useSidebar();
  const { tenant, setTenant } = useTenant();
  const { tenantId, isAuthenticated } = useAuth();
  const [showCommandCard, setShowCommandCard] = useState(false);

  // ── Asistente de voz ───────────────────────────────────────────────────────
  const {
    isListening,
    isSupported: voiceSupported,
    toggleListening,
    lastCommand,
  } = useVoiceAssistant();

  // ── Cargar datos del tenant y aplicar theming ─────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !tenantId) return;

    async function loadTenant() {
      try {
        const { data } = await supabaseClient
          .from('tenants')
          .select('id, name, slug, logo_url, primary_color, secondary_color, font_family')
          .eq('id', tenantId)
          .single();

        if (data) {
          setTenant(data as any);
          applyTenantTheme(data as any);
        }
      } catch (err) {
        console.error('[Dashboard] Error cargando tenant:', err);
      }
    }

    // Solo cargar si no tenemos tenant en el store
    if (!tenant) {
      loadTenant();
    } else {
      // Re-aplicar el tema si ya está cargado (útil en HMR / re-montajes)
      applyTenantTheme(tenant as any);
    }
  }, [isAuthenticated, tenantId, tenant, setTenant]);

  // Ancho del sidebar en desktop para el margen del contenido principal
  const sidebarWidth = isCollapsed ? '64px' : '260px';

  // Función para el toggle del header:
  // En mobile (< 1024px): abre el drawer
  // En desktop (>= 1024px): colapsa/expande el sidebar
  const handleHeaderToggle = () => {
    // Detectar si estamos en mobile usando el ancho de la ventana
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      toggleMobile();
    } else {
      toggle();
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-surface, #F8FAFC)' }}>
      {/* ── Sidebar Desktop (fixed, siempre visible) ─────────────────── */}
      <div className="hidden lg:block">
        <Sidebar
          tenantName={tenant?.name}
          tenantLogoUrl={tenant?.logo_url ?? null}
        />
      </div>

      {/* ── Sidebar Mobile (drawer con overlay) ──────────────────────── */}
      {isMobileOpen && (
        <>
          <MobileOverlay isOpen={isMobileOpen} onClose={closeMobile} />
          <div className="lg:hidden fixed left-0 top-0 z-30 h-full">
            <Sidebar
              tenantName={tenant?.name}
              tenantLogoUrl={tenant?.logo_url ?? null}
              isMobileDrawer
              onClose={closeMobile}
            />
          </div>
        </>
      )}

      {/* ── Área principal (offset del sidebar en desktop) ───────────── */}
      <div
        className="flex flex-col min-h-screen transition-all duration-[250ms]"
        style={{
          marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024
            ? sidebarWidth
            : '0',
        }}
      >
        {/* Header sticky */}
        <Header
          onToggleSidebar={handleHeaderToggle}
          isVoiceActive={isListening}
          onToggleVoice={voiceSupported ? toggleListening : undefined}
        />

        {/* Tarjeta de comandos de voz (modal) */}
        <VoiceCommandCard
          isOpen={showCommandCard}
          onClose={() => setShowCommandCard(false)}
        />

        {/* Contenido de la página */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="max-w-[1280px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
