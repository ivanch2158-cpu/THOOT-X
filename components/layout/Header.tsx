// components/layout/Header.tsx
// Header superior del dashboard: título, toggle sidebar, voz y avatar de usuario

'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Menu, Mic, Bell, ChevronDown, User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface HeaderProps {
  onToggleSidebar: () => void; // Callback para abrir/colapsar sidebar
  isVoiceActive?: boolean;     // Si el asistente de voz está escuchando
  onToggleVoice?: () => void;  // Callback para activar/desactivar voz
}

// ─── Mapa de rutas a títulos amigables ────────────────────────────────────────

const ROUTE_TITLES: Record<string, { label: string; parent?: string }> = {
  '/dashboard': { label: 'Dashboard' },
  '/dashboard/patients': { label: 'Pacientes', parent: 'Dashboard' },
  '/dashboard/appointments': { label: 'Agenda', parent: 'Dashboard' },
  '/dashboard/billing': { label: 'Facturación', parent: 'Dashboard' },
  '/dashboard/billing/invoices': { label: 'Facturas', parent: 'Facturación' },
  '/dashboard/finance': { label: 'Gestión Financiera', parent: 'Dashboard' },
  '/dashboard/inventory': { label: 'Inventario', parent: 'Dashboard' },
  '/dashboard/settings': { label: 'Configuración', parent: 'Dashboard' },
  '/dashboard/treatment-plans': { label: 'Planes de Tratamiento', parent: 'Dashboard' },
};

function getRouteTitle(pathname: string) {
  // Coincidencia exacta primero
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  // Coincidencia por prefijo (para rutas dinámicas como /patients/[id])
  const match = Object.entries(ROUTE_TITLES)
    .filter(([route]) => pathname.startsWith(route) && route !== '/dashboard')
    .sort((a, b) => b[0].length - a[0].length)[0];
  return match ? match[1] : { label: 'Dashboard' };
}

// ─── Componente ──────────────────────────────────────────────────────────────

export function Header({
  onToggleSidebar,
  isVoiceActive = false,
  onToggleVoice,
}: HeaderProps) {
  const pathname = usePathname();
  const { logout, user, role } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const routeInfo = getRouteTitle(pathname);

  // Cerrar menú al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    window.location.href = '/login';
  };

  const userInitials = (() => {
    const name: string =
      user?.user_metadata?.full_name ?? user?.email ?? 'U';
    return name
      .split(' ')
      .slice(0, 2)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase();
  })();

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between bg-white border-b px-4 lg:px-6"
      style={{
        height: '64px',
        borderColor: 'var(--color-border, #E2E8F0)',
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Izquierda: Toggle sidebar + Breadcrumb ─────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Botón hamburguesa (siempre visible, toggle en desktop / drawer en mobile) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle menú"
          style={{ color: 'var(--color-text-secondary, #475569)' }}
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          {routeInfo.parent && (
            <>
              <span style={{ color: 'var(--color-text-secondary, #475569)' }}>
                {routeInfo.parent}
              </span>
              <span style={{ color: 'var(--color-text-disabled, #94A3B8)' }}>/</span>
            </>
          )}
          <span
            className="font-semibold"
            style={{ color: 'var(--color-text-primary, #0F172A)' }}
          >
            {routeInfo.label}
          </span>
        </nav>
      </div>

      {/* ── Derecha: Voz + Notificaciones + Avatar ────────────────────── */}
      <div className="flex items-center gap-2">
        {/* Botón de micrófono — asistente de voz */}
        {onToggleVoice && (
          <button
            onClick={onToggleVoice}
            className="relative p-2 rounded-lg transition-all"
            style={{
              backgroundColor: isVoiceActive ? '#EF4444' : 'transparent',
              color: isVoiceActive ? 'white' : 'var(--color-text-secondary, #475569)',
            }}
            aria-label={isVoiceActive ? 'Detener asistente de voz' : 'Activar asistente de voz'}
            title={isVoiceActive ? 'Detener asistente de voz' : 'Activar asistente de voz'}
          >
            <Mic className="h-5 w-5" />
            {/* Anillo pulsante cuando está activo */}
            {isVoiceActive && (
              <span className="absolute inset-0 rounded-lg bg-red-500 animate-ping opacity-40" />
            )}
          </button>
        )}

        {/* Campana de notificaciones */}
        <button
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
          style={{ color: 'var(--color-text-secondary, #475569)' }}
          aria-label="Notificaciones"
          title="Notificaciones"
        >
          <Bell className="h-5 w-5" />
          {/* Badge — sin notificaciones por ahora, se puede conectar a un estado global */}
        </button>

        {/* Avatar del usuario con dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-expanded={isMenuOpen}
            aria-haspopup="true"
          >
            {/* Avatar circular con iniciales */}
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: 'var(--color-primary, #1D4ED8)' }}
            >
              {userInitials}
            </div>
            <div className="hidden sm:block text-left">
              <p
                className="text-sm font-medium leading-tight truncate max-w-[120px]"
                style={{ color: 'var(--color-text-primary, #0F172A)' }}
              >
                {user?.user_metadata?.full_name?.split(' ')[0] ?? 'Usuario'}
              </p>
              <p
                className="text-xs leading-tight capitalize"
                style={{ color: 'var(--color-text-secondary, #475569)' }}
              >
                {role === 'admin'
                  ? 'Admin'
                  : role === 'doctor'
                  ? 'Odontólogo'
                  : role === 'secretary'
                  ? 'Secretaria'
                  : ''}
              </p>
            </div>
            <ChevronDown
              className="h-4 w-4 hidden sm:block transition-transform"
              style={{
                color: 'var(--color-text-secondary, #475569)',
                transform: isMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
              }}
            />
          </button>

          {/* Menú desplegable */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-48 rounded-xl bg-white shadow-lg border py-1 z-50"
              style={{ borderColor: 'var(--color-border, #E2E8F0)' }}
            >
              <Link
                href="/dashboard/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                style={{ color: 'var(--color-text-primary, #0F172A)' }}
              >
                <User className="h-4 w-4" style={{ color: 'var(--color-text-secondary)' }} />
                Mi perfil
              </Link>
              <div
                className="my-1 border-t"
                style={{ borderColor: 'var(--color-border, #E2E8F0)' }}
              />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-red-50 transition-colors text-left"
                style={{ color: '#EF4444' }}
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
