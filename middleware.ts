// ═══════════════════════════════════════════════════════════════════════════════
// NEXT.JS MIDDLEWARE — Protección de rutas y validación de sesión
// ═══════════════════════════════════════════════════════════════════════════════
// Este middleware se ejecuta en el edge (Vercel) antes de cada request.
// Protege las rutas privadas, valida tokens y redirige según el rol y estado.

import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas (accesibles sin sesión)
const PUBLIC_ROUTES = ['/', '/login', '/registro', '/recuperar-contrasena', '/nueva-contrasena', '/activar-cuenta', '/login-voz', '/404'];

// Rutas solo para Super Admin
const SUPER_ADMIN_ROUTES = ['/super-admin'];

// Rutas solo para Admin del consultorio
const ADMIN_ONLY_ROUTES = ['/dashboard/settings', '/dashboard/finance'];

/**
 * Middleware de Next.js
 *
 * Se ejecuta en el edge antes de cada request. Valida:
 * 1. Sesión: si no existe, redirige al login
 * 2. Rol: verifica permisos según la ruta
 * 3. Onboarding: si no está completo, redirige al wizard
 * 4. Acceso: redirige a dashboard si intenta acceder a login siendo autenticado
 */
export async function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const supabase = createMiddlewareClient({ req: request, res: response });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // ─────────────────────────────────────────────────────────────────────────────
  // 1. Rutas públicas — acceso permitido sin sesión
  // ─────────────────────────────────────────────────────────────────────────────
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    // Si tiene sesión y trata de ir al login, lo redirige al dashboard
    if (session && pathname === '/login') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return response;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 2. Sin sesión → redirige al login
  // ─────────────────────────────────────────────────────────────────────────────
  if (!session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 3. Validar rol para rutas restringidas
  // ─────────────────────────────────────────────────────────────────────────────
  const userRole = session.user.user_metadata?.app_role as string;

  // Solo Super Admin puede acceder a /super-admin
  if (SUPER_ADMIN_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userRole !== 'super_admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Solo Admin puede acceder a configuración y finanzas
  if (ADMIN_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // 4. Onboarding incompleto → redirige al wizard
  // ─────────────────────────────────────────────────────────────────────────────
  const onboardingComplete = session.user.user_metadata?.onboarding_complete as boolean;

  if (!onboardingComplete && !pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/onboarding/paso-1', request.url));
  }

  // Si está en onboarding pero ya completó, redirige al dashboard
  if (onboardingComplete && pathname.startsWith('/onboarding')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

// Configurar qué rutas pasan por el middleware
// Se excluyen las rutas de API porque cada endpoint valida su propia
// autenticación con protectEndpoint() (incluye rutas públicas como
// /api/auth/register, /api/auth/login, /api/cron/* con Bearer token, etc.)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public/).*)'],
};
