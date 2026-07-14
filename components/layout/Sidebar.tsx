// components/layout/Sidebar.tsx
// Sidebar de navegación principal del dashboard
// Ancho: 260px expandido / 64px colapsado. Se convierte en drawer en tablet.

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useSidebar } from '@/hooks/useSidebar';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Receipt,
  TrendingUp,
  Package,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  X,
} from 'lucide-react';

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: string[]; // Roles que pueden ver este ítem
}

interface SidebarProps {
  tenantName?: string;
  tenantLogoUrl?: string | null;
  onClose?: () => void; // Para cerrar el drawer en mobile
  isMobileDrawer?: boolean;
}

// ─── Ítems de navegación por rol ─────────────────────────────────────────────

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'odontologist', 'doctor', 'secretary'],
  },
  {
    label: 'Pacientes',
    href: '/dashboard/patients',
    icon: Users,
    roles: ['admin', 'odontologist', 'doctor', 'secretary'],
  },
  {
    label: 'Agenda',
    href: '/dashboard/appointments',
    icon: CalendarDays,
    roles: ['admin', 'odontologist', 'doctor', 'secretary'],
  },
  {
    label: 'Facturación',
    href: '/dashboard/billing',
    icon: Receipt,
    roles: ['admin', 'odontologist', 'doctor', 'secretary'],
  },
  {
    label: 'Finanzas',
    href: '/dashboard/finance',
    icon: TrendingUp,
    roles: ['admin'], // Solo Admin
  },
  {
    label: 'Inventario',
    href: '/dashboard/inventory',
    icon: Package,
    roles: ['admin', 'odontologist', 'doctor'],
  },
  {
    label: 'Configuración',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['admin'], // Solo Admin
  },
];

// ─── Componente ──────────────────────────────────────────────────────────────

export function Sidebar({
  tenantName,
  tenantLogoUrl,
  onClose,
  isMobileDrawer = false,
}: SidebarProps) {
  const pathname = usePathname();
  const { logout, role, user } = useAuth();
  const { isCollapsed, toggle } = useSidebar();

  // En modo drawer mobile, no se colapsa — siempre expandido
  const collapsed = isMobileDrawer ? false : isCollapsed;

  // Filtrar ítems según el rol del usuario
  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!role) return false;
    return item.roles.includes(role);
  });

  // Verificar si un ítem está activo (coincidencia exacta o prefijo)
  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside
      style={{
        width: collapsed ? '64px' : '260px',
        backgroundColor: 'var(--color-sidebar-bg, #0F172A)',
        transition: 'width 0.25s ease',
      }}
      className="h-screen flex flex-col fixed left-0 top-0 z-30 overflow-hidden"
    >
      {/* ── Cabecera: Logo + botón cerrar drawer ───────────────────────── */}
      <div
        className="flex items-center justify-between px-4 border-b border-white/10"
        style={{ height: '64px', minHeight: '64px' }}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5 min-w-0">
            {tenantLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tenantLogoUrl}
                alt="Logo"
                className="h-8 w-8 object-contain rounded"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: 'var(--color-primary, #1D4ED8)' }}
              >
                <Stethoscope className="h-4 w-4 text-white" />
              </div>
            )}
            <span className="text-white font-semibold text-sm truncate">
              {tenantName ?? 'TOOTH X'}
            </span>
          </div>
        )}

        {/* Botón cerrar en drawer mobile */}
        {isMobileDrawer && onClose && (
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white ml-auto p-1 rounded"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}

        {/* Logo solo cuando colapsado (icono centrado) */}
        {collapsed && !isMobileDrawer && (
          <div className="mx-auto">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary, #1D4ED8)' }}
            >
              <Stethoscope className="h-4 w-4 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* ── Navegación ─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={isMobileDrawer ? onClose : undefined}
              title={collapsed ? item.label : undefined}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150 group relative"
              style={{
                color: active ? 'white' : 'rgba(255,255,255,0.6)',
                backgroundColor: active ? 'rgba(255,255,255,0.10)' : 'transparent',
                borderLeft: active
                  ? '3px solid var(--color-primary, #1D4ED8)'
                  : '3px solid transparent',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    'rgba(255,255,255,0.06)';
                  (e.currentTarget as HTMLAnchorElement).style.color = 'white';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLAnchorElement).style.backgroundColor =
                    'transparent';
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    'rgba(255,255,255,0.6)';
                }
              }}
            >
              <Icon
                className="h-5 w-5 flex-shrink-0"
                style={{ color: active ? 'var(--color-primary, #60A5FA)' : 'inherit' }}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}

              {/* Tooltip en modo colapsado */}
              {collapsed && (
                <div
                  className="absolute left-full ml-2 px-2 py-1 text-xs rounded bg-gray-900 text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                >
                  {item.label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Footer: usuario + logout ───────────────────────────────────── */}
      <div className="border-t border-white/10 px-2 py-3 space-y-1">
        {/* Botón colapsar (solo desktop) */}
        {!isMobileDrawer && (
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-white hover:bg-white/06 transition-all text-sm"
            aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 flex-shrink-0" />
                <span>Colapsar</span>
              </>
            )}
          </button>
        )}

        {/* Info del usuario */}
        {!collapsed && (
          <div className="px-3 py-2">
            <p className="text-white text-sm font-medium truncate">
              {user?.user_metadata?.full_name ?? user?.email ?? 'Usuario'}
            </p>
            <p className="text-white/50 text-xs capitalize">
              {role === 'admin'
                ? 'Administrador'
                : role === 'doctor'
                ? 'Odontólogo'
                : role === 'secretary'
                ? 'Secretaria'
                : role ?? ''}
            </p>
          </div>
        )}

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
