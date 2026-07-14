// ═══════════════════════════════════════════════════════════════════════════════
// README — Instrucciones de instalación y uso
// ═══════════════════════════════════════════════════════════════════════════════

# TOOTH X — Configuración Base Completada ✅

## 🚀 Próximos pasos

### 1. Instalar dependencias
```bash
npm install
# o
yarn install
```

### 2. Crear archivo .env.local
Copia el contenido de `.env.example` a un nuevo archivo `.env.local` y reemplaza los valores reales:

```bash
cp .env.example .env.local
```

Luego completa:
- `NEXT_PUBLIC_SUPABASE_URL` — URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Clave anónima
- `SUPABASE_SERVICE_ROLE_KEY` — Clave de servicio (SECRETO)
- `DATABASE_URL` — URL de PostgreSQL de Supabase
- Otros tokens (Resend, WhatsApp, etc.)

### 3. Inicializar Prisma
```bash
# Generar el cliente de Prisma
npx prisma generate

# Crear migraciones y tablas en la BD
npx prisma migrate dev --name init
```

### 4. Ejecutar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📁 Estructura del proyecto

```
tooth-x/
├── app/                    # Next.js App Router
│   ├── (public)/           # Rutas públicas (sin sesión)
│   ├── (onboarding)/       # Wizard de configuración
│   ├── (dashboard)/        # Rutas protegidas
│   ├── api/                # API Routes serverless
│   ├── layout.tsx          # Root layout con fuentes
│   ├── globals.css         # Estilos globales
│   └── middleware.ts       # Validación de rutas
│
├── components/
│   ├── ui/                 # shadcn/ui (base components)
│   └── layout/             # Sidebar, Header, etc.
│
├── lib/
│   ├── supabase/           # Clientes de Supabase
│   ├── auth/               # Helpers de autenticación
│   ├── theme/              # Aplicación de theming
│   ├── utils/              # Utilidades (formateo, etc.)
│   ├── voice/              # Lógica del asistente de voz
│   ├── finance/            # Cálculos financieros
│   └── notifications/      # Email y WhatsApp
│
├── hooks/
│   ├── useAuth.ts          # Gestión de sesión
│   └── useTenant.ts        # Datos del consultorio
│
├── types/                  # Tipos TypeScript
├── prisma/
│   └── schema.prisma       # Schema de BD
├── public/                 # Assets estáticos
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.example
```

## 🎨 Design System

### Colores (variables CSS)
Todos los componentes usan `var()` para los colores, permitiendo el theming dinámico:

```css
--color-primary           /* Personalizable por tenant */
--color-secondary         /* Personalizable */
--color-bg                /* #FFFFFF */
--color-surface           /* #F8FAFC */
--color-text-primary      /* #0F172A */
--color-danger            /* #DC2626 */
--color-success           /* #16A34A */
--color-warning           /* #CA8A04 */
```

### Tipografía
- **Fuente por defecto**: Inter (Google Fonts)
- **Fuente monoespaciada**: JetBrains Mono (para números)

### Componentes
Usamos **shadcn/ui** como base (instalable con `npx shadcn-ui@latest add <component>`)

## 🔐 Seguridad

### Headers implementados
- `X-Frame-Options: DENY` — Previene clickjacking
- `X-Content-Type-Options: nosniff` — Previene MIME sniffing
- `X-XSS-Protection: 1; mode=block` — Protección XSS

### Autenticación
- JWT con Supabase Auth
- Roles en `user_metadata`: admin, doctor, secretary, super_admin
- Middleware valida sesión en cada request
- Soft delete (is_active = false) en lugar de eliminar datos

## 📦 Stack tecnológico confirmado

| Componente | Tecnología |
|-----------|-----------|
| Framework | Next.js 14+ App Router |
| Lenguaje | TypeScript estricto |
| Estilos | Tailwind CSS + CSS Custom Properties |
| UI | shadcn/ui |
| Iconos | Lucide React |
| Estado global | Zustand |
| Formularios | React Hook Form + Zod |
| BD | PostgreSQL (Supabase) + Prisma ORM |
| Auth | Supabase Auth con JWT |
| Gráficos | Recharts |
| PDF | @react-pdf/renderer |
| Deploy | Vercel |

## ✅ Checklist de configuración

- [x] Next.js 14 con App Router
- [x] TypeScript estricto
- [x] Tailwind CSS + CSS Custom Properties
- [x] shadcn/ui base
- [x] Dependencias instaladas (Zustand, React Hook Form, Zod, SWR, Prisma)
- [x] Clientes de Supabase (browser y server)
- [x] Schema de Prisma con tablas tenants y users
- [x] Variables de entorno (.env.example)
- [x] Estructura de carpetas completa
- [x] next.config.ts con headers de seguridad
- [x] Google Fonts (Inter + JetBrains Mono)
- [x] Middleware de protección de rutas
- [x] Theming dinámico (applyTenantTheme)
- [x] Hooks de autenticación (useAuth, useTenant)
- [x] Placeholder pages de login y dashboard

## 🔄 Próximo módulo

MÓDULO 02 — Autenticación y Middleware
- Página de Login completa
- Página de Registro
- Recuperación de contraseña
- Login por PIN de voz
- Validación de permisos por rol

---

**Fecha**: 28 de mayo de 2026
**Proyecto**: TOOTH X v1.0
**Estado**: ✅ MÓDULO 01 COMPLETADO
