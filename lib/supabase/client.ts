// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE CLIENT — Para el navegador (lado cliente)
// ═══════════════════════════════════════════════════════════════════════════════
// Este cliente se usa en componentes React y en llamadas SWR desde el cliente.
// NO usar en Server Components o API Routes — para eso está server.ts

'use client';

import { createBrowserClient } from '@supabase/ssr';

export const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
