# DOCUMENTO 6 — ARQUITECTURA TÉCNICA

## TOOTH X · Stack, Infraestructura y Decisiones de Ingeniería

-----

|Campo           |Detalle                                        |
|----------------|-----------------------------------------------|
|**Proyecto**    |TOOTH X                                        |
|**Versión**     |v1.0                                           |
|**Fecha**       |Mayo 2026                                      |
|**Arquitectura**|SaaS Web Multi-Tenant · Serverless · Full-Stack|

-----

## 1. DIAGRAMA GENERAL DE LA ARQUITECTURA

```
         ┌───────────────────────────────────────┐
         │  USUARIO  (Tablet / Desktop)          │
         │  Google Chrome o Microsoft Edge       │
         └──────────────────┬────────────────────┘
                            │ HTTPS
         ┌──────────────────▼────────────────────┐
         │           VERCEL (CDN Global)          │
         │   Next.js 14 · App Router              │
         │   Frontend + API Routes (serverless)   │
         └────────┬─────────────┬────────────────┘
                  │             │
      ┌───────────▼───┐   ┌─────▼──────────────────┐
      │  SUPABASE     │   │  SERVICIOS EXTERNOS     │
      │  PostgreSQL   │   │  Resend  (emails gratis)│
      │  Auth (JWT)   │   │  WhatsApp Cloud API     │
      │  Storage      │   │  (mensajes gratis)      │
      │  RLS activo   │   └─────────────────────────┘
      └───────────────┘
```

**Principios:**

- Sin servidor propio. Todo en servicios gestionados (Vercel + Supabase).
- API Routes de Next.js son funciones serverless que escalan automáticamente.
- Multi-tenant en una sola base de datos con Row Level Security (RLS).
- Dominio en Namecheap apuntando a Vercel mediante registros DNS.

-----

## 2. STACK TECNOLÓGICO COMPLETO

### Frontend y Framework

|Tecnología  |Versión       |Rol                                    |
|------------|--------------|---------------------------------------|
|Next.js     |14+ App Router|Framework full-stack principal         |
|TypeScript  |5+ estricto   |Lenguaje. Elimina errores en runtime   |
|React       |18+           |UI Library (incluido en Next.js)       |
|Tailwind CSS|3+            |Estilos con clases de utilidad         |
|shadcn/ui   |latest        |Componentes base accesibles y editables|
|Lucide React|0.383+        |Iconografía MIT, tree-shakeable        |

### Estado y Datos en el Cliente

|Tecnología     |Rol                                          |
|---------------|---------------------------------------------|
|Zustand        |Estado global (sesión, tenant activo, UI)    |
|React Hook Form|Gestión de formularios con rendimiento óptimo|
|Zod            |Validación de esquemas en cliente Y servidor |
|SWR            |Fetching con caché y revalidación automática |

### Backend y Base de Datos

|Tecnología        |Rol                                         |
|------------------|--------------------------------------------|
|Next.js API Routes|Endpoints REST serverless                   |
|Supabase          |PostgreSQL gestionado + Auth + Storage + RLS|
|Prisma ORM        |Abstracción tipada de la base de datos      |
|Supabase Auth     |JWT con roles, integración con RLS          |

### Módulos Especializados

|Tecnología                        |Módulo                                                  |
|----------------------------------|--------------------------------------------------------|
|FullCalendar React                |Calendario de citas con drag & drop                     |
|Recharts                          |Gráficos del Dashboard y Estado de Resultados           |
|@react-pdf/renderer               |Generación de facturas en PDF                           |
|Web Speech API (SpeechRecognition)|Reconocimiento de voz — gratis, nativo del browser      |
|Web Speech Synthesis API          |Respuestas de voz de la app — gratis, nativo del browser|
|Resend SDK                        |Envío de emails transaccionales                         |

### Servicios Gratuitos

|Servicio          |Plan gratuito                         |Uso                                      |
|------------------|--------------------------------------|-----------------------------------------|
|Vercel            |Hobby (ilimitado proyectos personales)|Hosting + deploys                        |
|Supabase          |500MB DB, 1GB Storage, 50k usuarios   |DB + auth + archivos                     |
|Resend            |3,000 emails/mes                      |Notificaciones y recordatorios           |
|WhatsApp Cloud API|1,000 conversaciones/mes              |Recordatorios de citas                   |
|Google Fonts      |Gratuito                              |Inter, Plus Jakarta Sans, Nunito, Poppins, DM Sans|

-----

## 3. DOMINIO Y DNS (NAMECHEAP → VERCEL)

### Situación actual del usuario

- Hosting compartido Namecheap: **no compatible con Next.js** (solo sirve PHP/HTML estático).
- Dominio existente: `www.belleza-orofacial.com` — queda para el sitio web del consultorio personal.

### Estrategia de dominios

|Dominio                                     |Hosting                     |Propósito                                  |
|--------------------------------------------|----------------------------|-------------------------------------------|
|`toothx.app` (comprar en Namecheap ~$14/año)|Vercel                      |La app SaaS TOOTH X                        |
|`www.belleza-orofacial.com` (existente)     |Namecheap hosting compartido|Sitio web estático del consultorio personal|


> Los dos dominios son completamente independientes. El hosting compartido de Namecheap no se toca para TOOTH X.

### Configuración DNS en Namecheap para `toothx.app`

En el panel Namecheap → Advanced DNS:

```
Tipo    Nombre   Valor                    TTL
──────────────────────────────────────────────
A       @        76.76.21.21              Auto
CNAME   www      cname.vercel-dns.com     Auto
```

Luego en Vercel → Settings → Domains → agregar `toothx.app`. Vercel verifica los DNS y activa SSL/HTTPS automáticamente (Let’s Encrypt, gratis).

-----

## 4. ESTRUCTURA DE CARPETAS DEL PROYECTO

```
tooth-x/
│
├── app/                              # Next.js App Router
│   ├── (public)/                     # Páginas sin sesión
│   │   ├── page.tsx                  # Landing page /
│   │   ├── login/page.tsx
│   │   ├── registro/page.tsx
│   │   ├── recuperar-contrasena/page.tsx
│   │   └── activar-cuenta/page.tsx
│   │
│   ├── (onboarding)/                 # Wizard de configuración
│   │   └── onboarding/
│   │       ├── layout.tsx
│   │       ├── paso-1/page.tsx       # Datos del consultorio
│   │       ├── paso-2/page.tsx       # Identidad visual
│   │       ├── paso-3/page.tsx       # Horarios
│   │       ├── paso-4/page.tsx       # Crear usuarios
│   │       └── paso-5/page.tsx       # Completado
│   │
│   ├── (dashboard)/                  # Rutas protegidas
│   │   ├── layout.tsx                # Sidebar + Header + Theming
│   │   ├── dashboard/page.tsx
│   │   ├── dashboard/patients/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [patientId]/
│   │   │       ├── page.tsx
│   │   │       ├── evolutions/new/page.tsx
│   │   │       └── evolutions/[id]/page.tsx
│   │   ├── dashboard/appointments/page.tsx
│   │   ├── dashboard/billing/
│   │   │   ├── page.tsx
│   │   │   ├── invoices/page.tsx
│   │   │   └── [invoiceId]/page.tsx
│   │   ├── dashboard/treatment-plans/page.tsx
│   │   ├── dashboard/finance/
│   │   │   ├── page.tsx              # Resumen financiero
│   │   │   ├── expenses/page.tsx
│   │   │   └── income-statement/page.tsx
│   │   ├── dashboard/inventory/page.tsx
│   │   ├── dashboard/settings/page.tsx
│   │   └── dashboard/profile/page.tsx
│   │
│   ├── (super-admin)/                # Panel del operador SaaS
│   │   └── super-admin/
│   │       ├── page.tsx
│   │       ├── consultorios/page.tsx
│   │       └── planes/page.tsx
│   │
│   ├── api/                          # API Routes serverless
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── voice-login/route.ts
│   │   │   └── logout/route.ts
│   │   ├── patients/
│   │   │   ├── route.ts
│   │   │   └── [id]/route.ts
│   │   ├── appointments/
│   │   │   ├── route.ts
│   │   │   ├── [id]/route.ts
│   │   │   └── today/route.ts
│   │   ├── clinical/
│   │   │   ├── evolutions/route.ts
│   │   │   └── odontogram/[patientId]/route.ts
│   │   ├── billing/
│   │   │   ├── invoices/route.ts
│   │   │   └── [id]/pagos/route.ts
│   │   ├── finanzas/
│   │   │   ├── gastos/route.ts
│   │   │   └── estado-resultados/route.ts
│   │   ├── inventario/
│   │   │   ├── equipos/route.ts
│   │   │   └── insumos/[id]/movimientos/route.ts
│   │   ├── dashboard/metricas/route.ts
│   │   ├── notificaciones/enviar/route.ts
│   │   └── tenant/route.ts
│   │
│   ├── layout.tsx                    # Root layout (fuentes, metadata)
│   └── not-found.tsx                 # Página 404
│
├── components/
│   ├── ui/                           # shadcn/ui (no editar)
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── Breadcrumb.tsx
│   ├── patients/
│   │   ├── PatientList.tsx
│   │   ├── PatientForm.tsx
│   │   └── PatientProfile.tsx
│   ├── appointments/
│   │   ├── AppointmentCalendar.tsx
│   │   └── AppointmentModal.tsx
│   ├── clinical/
│   │   ├── Odontogram.tsx
│   │   ├── OdontogramTooth.tsx
│   │   ├── ConditionsPanel.tsx
│   │   └── VoiceConfirmBar.tsx
│   ├── billing/
│   │   ├── InvoiceForm.tsx
│   │   └── InvoicePDF.tsx
│   ├── finance/
│   │   ├── ExpenseForm.tsx
│   │   ├── IncomeStatement.tsx
│   │   └── PLChart.tsx
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   └── ProfitabilityCard.tsx
│   └── shared/
│       ├── EmptyState.tsx
│       ├── LoadingSkeleton.tsx
│       └── ConfirmDialog.tsx
│
├── hooks/
│   ├── useVoiceAssistant.ts          # Orquestador del asistente de voz
│   ├── useVoiceOdontograma.ts        # Parser del odontograma
│   ├── useTenant.ts                  # Datos y theming del consultorio
│   ├── useAuth.ts                    # Sesión y permisos
│   └── usePL.ts                      # Cálculos del P&L
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Cliente para el browser
│   │   └── server.ts                 # Cliente para Server Components
│   ├── prisma/client.ts
│   ├── auth/
│   │   ├── middleware.ts
│   │   └── permissions.ts
│   ├── theme/applyTenantTheme.ts
│   ├── voice/
│   │   ├── commandRegistry.ts
│   │   ├── parser.ts
│   │   └── numberNormalizer.ts
│   ├── finance/plCalculator.ts
│   ├── notifications/
│   │   ├── emailService.ts
│   │   └── whatsappService.ts
│   └── utils/
│       ├── formatCurrency.ts         # S/. 1,234.56
│       └── formatDate.ts
│
├── types/
│   ├── tenant.types.ts
│   ├── user.types.ts
│   ├── paciente.types.ts
│   ├── cita.types.ts
│   ├── odontograma.types.ts
│   ├── factura.types.ts
│   ├── finanzas.types.ts
│   ├── inventario.types.ts
│   └── voice.types.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── middleware.ts                    # Protección global de rutas
├── next.config.ts
├── tailwind.config.ts
├── .env.local                       # Variables reales (NO subir a Git)
├── .env.example                     # Plantilla (SÍ subir a Git)
└── package.json
```

-----

## 5. MIDDLEWARE DE PROTECCIÓN DE RUTAS

```typescript
// middleware.ts — se ejecuta en el edge antes de cada request
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/', '/login', '/registro',
                       '/recuperar-contrasena', '/activar-cuenta'];
const SUPER_ADMIN_ROUTES = ['/super-admin'];
const ADMIN_ONLY_ROUTES = ['/dashboard/settings', '/dashboard/finance'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  const { data: { session } } = await supabase.auth.getSession();
  const path = req.nextUrl.pathname;

  // Rutas públicas
  if (PUBLIC_ROUTES.some(r => path.startsWith(r))) {
    if (session && path === '/login')
      return NextResponse.redirect(new URL('/dashboard', req.url));
    return res;
  }

  // Sin sesión → login
  if (!session) {
    const url = new URL('/login', req.url);
    url.searchParams.set('redirect', path);
    return NextResponse.redirect(url);
  }

  const role = session.user.user_metadata?.app_role;

  // Super Admin
  if (SUPER_ADMIN_ROUTES.some(r => path.startsWith(r)) && role !== 'super_admin')
    return NextResponse.redirect(new URL('/dashboard', req.url));

  // Solo Admin del consultorio
  if (ADMIN_ONLY_ROUTES.some(r => path.startsWith(r)) && role !== 'admin')
    return NextResponse.redirect(new URL('/dashboard', req.url));

  // Onboarding incompleto
  if (!session.user.user_metadata?.onboarding_complete && !path.startsWith('/onboarding'))
    return NextResponse.redirect(new URL('/onboarding/paso-1', req.url));

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

-----

## 6. AUTENTICACIÓN Y JWT

### Estructura del JWT

```json
{
  "sub": "uuid-del-usuario",
  "email": "doctor@consultorio.com",
  "user_metadata": {
    "tenant_id": "uuid-del-consultorio",
    "app_role": "admin",
    "full_name": "Dr. Carlos Pérez",
    "onboarding_complete": true,
    "voice_pin_set": true
  }
}
```

**Roles del sistema:** `super_admin` | `admin` | `doctor` | `secretary`

### Login por PIN de voz (flujo simplificado)

```typescript
// app/api/auth/login-voz/route.ts
export async function POST(req: NextRequest) {
  const { nombre, pin } = await req.json();

  // 1. Buscar usuario por nombre
  const usuario = await prisma.user.findFirst({
    where: { full_name: { contains: nombre, mode: 'insensitive' }, is_active: true }
  });

  if (!usuario?.voice_pin_hash)
    return NextResponse.json({ error: 'Usuario no encontrado o PIN no configurado' }, { status: 404 });

  // 2. Verificar bloqueo (3 intentos fallidos)
  if (usuario.voice_pin_attempts >= 3)
    return NextResponse.json({ error: 'PIN bloqueado. Ingresa manualmente.' }, { status: 423 });

  // 3. Verificar PIN (bcrypt hash)
  const pinValido = await bcrypt.compare(pin, usuario.voice_pin_hash);

  if (!pinValido) {
    await prisma.user.update({
      where: { id: usuario.id },
      data: { voice_pin_attempts: { increment: 1 } }
    });
    return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
  }

  // 4. Resetear intentos y crear sesión (14 horas)
  await prisma.user.update({ where: { id: usuario.id }, data: { voice_pin_attempts: 0 } });
  const { data } = await supabaseAdmin.auth.admin.createSession(usuario.id);

  return NextResponse.json({
    success: true,
    session: data.session,
    mensaje_voz: await buildWelcomeMessage(usuario.tenant_id, nombre)
  });
}
```

-----

## 7. ARQUITECTURA MULTI-TENANT CON RLS

### Principio de aislamiento

Cada tabla tiene un campo `tenant_id`. Las políticas RLS de Supabase filtran automáticamente todas las queries para que solo devuelvan datos del tenant del usuario autenticado.

```sql
-- Activar RLS en la tabla pacientes
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

-- Política: solo el tenant dueño accede a sus pacientes
CREATE POLICY "Tenant isolation - pacientes"
ON pacientes FOR ALL
USING (
  tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
);

-- Política de rol: evoluciones clínicas solo para doctor y admin
CREATE POLICY "Rol - solo doctor y admin ven evoluciones"
ON evoluciones FOR ALL
USING (
  tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  AND (auth.jwt() -> 'user_metadata' ->> 'app_role') IN ('admin', 'doctor')
);

-- Política de rol: gestión financiera solo para admin
CREATE POLICY "Rol - solo admin ve finanzas"
ON gastos FOR ALL
USING (
  tenant_id = (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::uuid
  AND (auth.jwt() -> 'user_metadata' ->> 'app_role') = 'admin'
);
```

-----

## 8. MOTOR DEL ESTADO DE RESULTADOS (P&L)

```typescript
// lib/finance/plCalculator.ts
export async function calcularEstadoResultados(
  tenantId: string, desde: Date, hasta: Date
): Promise<EstadoResultados> {

  // 1. Ingresos: facturas cobradas en el período
  const { _sum: { total: ingresos } } = await prisma.factura.aggregate({
    where: { tenant_id: tenantId, estado: 'pagado',
             fecha_emision: { gte: desde, lte: hasta } },
    _sum: { total: true }
  });

  // 2. Insumos consumidos = salidas inventario × precio unitario
  const salidas = await prisma.movimientoInsumo.findMany({
    where: { tenant_id: tenantId, tipo: 'salida', fecha: { gte: desde, lte: hasta } },
    include: { insumo: { select: { precio_unitario: true } } }
  });
  const costoInsumos = salidas.reduce((a, m) => a + m.cantidad * m.insumo.precio_unitario, 0);

  // 3. Laboratorio dental
  const { _sum: { monto: costoLab } } = await prisma.gasto.aggregate({
    where: { tenant_id: tenantId, categoria: 'laboratorio',
             fecha: { gte: desde, lte: hasta } },
    _sum: { monto: true }
  });

  // 4. Gastos fijos y variables (sin laboratorio)
  const gastosFijos = await sumarGastosPorCategoria(tenantId, 'fijo', desde, hasta);
  const gastosVariables = await sumarGastosPorCategoria(tenantId, 'variable', desde, hasta);

  // 5. Depreciación mensual automática desde equipos activos
  const equipos = await prisma.equipo.findMany({
    where: { tenant_id: tenantId, estado: 'activo' }
  });
  const meses = calcularMeses(desde, hasta);
  const depreciacion = equipos.reduce((a, eq) =>
    a + ((eq.valor_compra - eq.valor_residual) / eq.vida_util_anios / 12) * meses, 0
  );

  // 6. Cálculos finales
  const totalIngresos = ingresos ?? 0;
  const costosDirectos = costoInsumos + (costoLab ?? 0);
  const utilidadBruta = totalIngresos - costosDirectos;
  const totalFijos = gastosFijos.reduce((a, g) => a + g.total, 0);
  const totalVariables = gastosVariables.reduce((a, g) => a + g.total, 0);
  const resultadoNeto = utilidadBruta - totalFijos - totalVariables - depreciacion;

  return {
    ingresos: totalIngresos,
    costos_directos: { insumos: costoInsumos, laboratorio: costoLab ?? 0 },
    utilidad_bruta: utilidadBruta,
    margen_bruto_pct: totalIngresos > 0 ? (utilidadBruta / totalIngresos) * 100 : 0,
    gastos_fijos: gastosFijos,
    gastos_variables: gastosVariables,
    depreciacion,
    resultado_neto: resultadoNeto,
    margen_neto_pct: totalIngresos > 0 ? (resultadoNeto / totalIngresos) * 100 : 0,
    es_rentable: resultadoNeto > 0,
  };
}
```

-----

## 9. VARIABLES DE ENTORNO

```bash
# .env.example (subir a Git sin valores reales)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Prisma
DATABASE_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres
DIRECT_URL=postgresql://postgres:[password]@db.xxxx.supabase.co:5432/postgres

# Resend (emails)
RESEND_API_KEY=re_xxxxxxxxxxxx

# WhatsApp Cloud API
WHATSAPP_ACCESS_TOKEN=EAAxxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_VERIFY_TOKEN=tooth_x_verify_2026

# App
NEXT_PUBLIC_APP_URL=https://toothx.app
NEXT_PUBLIC_APP_NAME=TOOTH X
NEXTAUTH_SECRET=cadena_aleatoria_larga_y_segura
```

-----

## 10. SEGURIDAD

|Área             |Implementación                                          |
|-----------------|--------------------------------------------------------|
|Autenticación    |JWT firmado por Supabase, 14h de duración               |
|Autorización     |RLS en BD + guards en middleware + guards en componentes|
|PIN de voz       |bcrypt hash (cost 12), nunca texto plano                |
|Aislamiento datos|Row Level Security a nivel de motor PostgreSQL          |
|HTTPS            |Forzado por Vercel, SSL automático                      |
|Validación       |Zod en cliente Y servidor antes de tocar la BD          |
|SQL Injection    |Imposible: Prisma usa prepared statements               |
|XSS              |React escapa HTML por defecto                           |
|Archivos subidos |Validación de tipo MIME y tamaño máximo                 |
|Datos sensibles  |Nunca logear contraseñas, PINs ni datos de salud        |

-----

## 11. ENTORNOS DE DESPLIEGUE

|Entorno           |URL                        |Rama Git   |
|------------------|---------------------------|-----------|
|Desarrollo local  |`localhost:3000`           |`feature/*`|
|Preview automático|`tooth-x-[hash].vercel.app`|`develop`  |
|Producción        |`toothx.app`               |`main`     |

```
feature/nueva-funcionalidad
  ↓ Pull Request a develop
develop → auto-deploy Vercel (preview)
  ↓ revisión manual + tests
  ↓ merge a main
main → auto-deploy Vercel (producción)
  ↓ toothx.app actualizado
```

-----

*TOOTH X — Documento 6: Arquitectura Técnica · v1.0 · Mayo 2026*
*Próximo documento: Modelo de Datos para dbdiagram.io (Documento 7)*