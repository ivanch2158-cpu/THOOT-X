// ═══════════════════════════════════════════════════════════════════════════════
// ROOT LAYOUT — Componente raíz de Next.js
// ═══════════════════════════════════════════════════════════════════════════════
// Este layout envuelve toda la aplicación e incluye las fuentes, metadata y providers.

import type { Metadata } from 'next';
import '@/app/globals.css';

export const metadata: Metadata = {
  title: 'TOOTH X | Software de Gestión Odontológica',
  description: 'SaaS web para consultorios odontológicos independientes en Perú y Latinoamérica',
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/favicon.ico',
  },
};

/**
 * Root Layout
 *
 * Este layout se aplica a todas las páginas de la aplicación.
 * Aquí se cargan las fuentes, se configuran las variables CSS por defecto,
 * y se envuelven todos los componentes con providers globales (Zustand, etc.)
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Precargar fuentes de Google */}
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* CSS Custom Properties — Valores por defecto */}
        <style>{`
          :root {
            --color-primary: #1D4ED8;
            --color-primary-hover: #1E40AF;
            --color-primary-light: #DBEAFE;
            --color-primary-text: #1E3A8A;
            --color-secondary: #0F766E;
            --color-secondary-hover: #0D6B63;
            --color-secondary-light: #CCFBF1;
            --color-bg: #FFFFFF;
            --color-surface: #F8FAFC;
            --color-surface-hover: #F1F5F9;
            --color-border: #E2E8F0;
            --color-border-strong: #CBD5E1;
            --color-text-primary: #0F172A;
            --color-text-secondary: #475569;
            --color-text-disabled: #94A3B8;
            --color-text-inverse: #FFFFFF;
            --color-success: #16A34A;
            --color-success-light: #DCFCE7;
            --color-success-text: #14532D;
            --color-warning: #CA8A04;
            --color-warning-light: #FEF9C3;
            --color-warning-text: #713F12;
            --color-danger: #DC2626;
            --color-danger-light: #FEE2E2;
            --color-danger-text: #7F1D1D;
            --color-info: #0284C7;
            --color-info-light: #E0F2FE;
            --color-info-text: #0C4A6E;
            --color-sidebar-bg: #0F172A;
            --color-sidebar-text: #94A3B8;
            --color-sidebar-active: #FFFFFF;
            --color-sidebar-hover: rgba(255, 255, 255, 0.06);
            --color-sidebar-active-bg: rgba(255, 255, 255, 0.1);
            --font-family: 'Inter', system-ui, sans-serif;
            --font-mono: 'JetBrains Mono', monospace;
          }

          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }

          html,
          body {
            height: 100%;
            background-color: var(--color-surface);
            color: var(--color-text-primary);
            font-family: var(--font-family);
          }
        `}</style>
      </head>

      <body>
        {/* Los providers globales irán aquí cuando los creemos (Zustand, etc.) */}
        {children}
      </body>
    </html>
  );
}
