// hooks/useSidebar.ts
// Hook para controlar el estado del sidebar (colapsado/expandido)
// Persiste la preferencia del usuario en localStorage

'use client';

import { useState, useEffect, useCallback } from 'react';

const SIDEBAR_KEY = 'toothx_sidebar_collapsed';

interface UseSidebarReturn {
  isCollapsed: boolean;
  isMobileOpen: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  toggleMobile: () => void;
  closeMobile: () => void;
}

export function useSidebar(): UseSidebarReturn {
  // Inicializar desde localStorage (sólo en cliente)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isMobileOpen, setIsMobileOpen] = useState<boolean>(false);

  useEffect(() => {
    // Leer preferencia guardada al montar
    try {
      const stored = localStorage.getItem(SIDEBAR_KEY);
      if (stored !== null) {
        setIsCollapsed(JSON.parse(stored));
      }
    } catch {
      // Si falla (SSR u otro error), usar estado default
    }
  }, []);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const collapse = useCallback(() => {
    setIsCollapsed(true);
    try {
      localStorage.setItem(SIDEBAR_KEY, 'true');
    } catch {}
  }, []);

  const expand = useCallback(() => {
    setIsCollapsed(false);
    try {
      localStorage.setItem(SIDEBAR_KEY, 'false');
    } catch {}
  }, []);

  const toggleMobile = useCallback(() => {
    setIsMobileOpen((prev) => !prev);
  }, []);

  const closeMobile = useCallback(() => {
    setIsMobileOpen(false);
  }, []);

  return {
    isCollapsed,
    isMobileOpen,
    toggle,
    collapse,
    expand,
    toggleMobile,
    closeMobile,
  };
}
