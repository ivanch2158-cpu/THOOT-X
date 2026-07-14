# DOCUMENTO 12 — VARIABLES DE ENTORNO E INFRAESTRUCTURA

## TOOTH X · Configuración Completa del Entorno, Cron Jobs y Templates de WhatsApp

-----

|Campo          |Detalle                                                        |
|---------------|---------------------------------------------------------------|
|**Proyecto**   |TOOTH X                                                        |
|**Versión**    |v1.0                                                           |
|**Fecha**      |Junio 2026                                                     |
|**Propósito**  |Lista completa de variables de entorno, buckets, cron jobs y templates|

-----

## 1. ARCHIVO `.env.example`

> Copiar este archivo a `.env.local` y completar los valores reales.
> **Nunca subir `.env.local` a Git** — está incluido en `.gitignore`.

```bash
# ══════════════════════════════════════════════════════════════
# TOOTH X — Variables de Entorno
# Copiar a .env.local y completar con los valores reales
# ══════════════════════════════════════════════════════════════

# ── SUPABASE ──────────────────────────────────────────────────
# URL de la base de datos con PgBouncer (connection pooling — para Prisma)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# URL directa sin pooling (para migraciones de Prisma)
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# URL pública del proyecto Supabase (visible en el cliente)
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"

# Clave anónima — acceso público limitado por RLS (visible en el cliente)
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Clave de service_role — acceso completo sin RLS (SOLO en el servidor, NUNCA en el cliente)
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# JWT secret para verificar tokens en el servidor
SUPABASE_JWT_SECRET="your-jwt-secret-from-supabase-dashboard"

# ── APLICACIÓN ────────────────────────────────────────────────
# URL base de la app (sin slash final)
NEXT_PUBLIC_APP_URL="https://toothx.app"

# Secreto para firmar tokens internos (invitaciones, activaciones)
# Generar con: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
APP_SECRET="64-char-random-hex-string"

# ── RESEND (EMAILS) ───────────────────────────────────────────
# API key de Resend.com — obtener en resend.com/api-keys
RESEND_API_KEY="re_123456789_abcdefghijklmnopqrstuvwxyz"

# Dirección de remitente verificada en Resend (debe pertenecer al dominio verificado)
RESEND_FROM_EMAIL="no-reply@toothx.app"

# Nombre del remitente que verá el paciente
RESEND_FROM_NAME="TOOTH X"

# Email del admin de TOOTH X para notificaciones internas
RESEND_ADMIN_EMAIL="admin@toothx.app"

# ── WHATSAPP CLOUD API (META) ─────────────────────────────────
# Token de acceso permanente — generar en Meta Business Suite
# Ruta: Meta for Developers → tu app → WhatsApp → API Setup
WHATSAPP_TOKEN="EAABsbCS1234..."

# ID del número de teléfono de negocio registrado en Meta
WHATSAPP_PHONE_NUMBER_ID="123456789012345"

# ID de la cuenta de WhatsApp Business
WHATSAPP_BUSINESS_ACCOUNT_ID="123456789012345"

# Webhook verify token — string aleatorio para verificar el webhook de Meta
WHATSAPP_WEBHOOK_VERIFY_TOKEN="random-string-for-meta-webhook-verification"

# ── CRON JOBS (solo para endpoints protegidos) ────────────────
# Token secreto para autenticar las llamadas de cron externo
# Los endpoints /api/cron/* verifican este header: Authorization: Bearer CRON_SECRET
CRON_SECRET="64-char-random-hex-string-for-cron"

# ── SUPABASE STORAGE ──────────────────────────────────────────
# URL base de Storage (generalmente automática desde SUPABASE_URL)
NEXT_PUBLIC_SUPABASE_STORAGE_URL="https://[project-ref].supabase.co/storage/v1"
```

-----

## 2. DESCRIPCIÓN DE VARIABLES POR CATEGORÍA

### 2.1 Supabase — dónde obtener cada valor

| Variable | Ruta en Supabase Dashboard |
|----------|---------------------------|
| `DATABASE_URL` | Settings → Database → Connection string → URI (con pgbouncer) |
| `DIRECT_URL` | Settings → Database → Connection string → URI (sin pgbouncer) |
| `NEXT_PUBLIC_SUPABASE_URL` | Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Settings → API → Project API keys → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Settings → API → Project API keys → service_role secret |
| `SUPABASE_JWT_SECRET` | Settings → API → JWT Settings → JWT Secret |

> ⚠️ La región `us-east-1` puede variar según la región donde se creó el proyecto Supabase.

### 2.2 Resend — pasos de configuración

1. Crear cuenta en [resend.com](https://resend.com)
2. Settings → Domains → Add Domain → ingresar `toothx.app`
3. Agregar los registros DNS indicados en Namecheap (TXT, MX, DKIM)
4. Esperar verificación (5-30 minutos)
5. API Keys → Create API Key → Full Access

Plan gratuito: 3,000 emails/mes, 100/día — suficiente para v1.0.

### 2.3 WhatsApp Cloud API — pasos de configuración

1. Crear app en [developers.facebook.com](https://developers.facebook.com)
2. Agregar producto: WhatsApp
3. WhatsApp → Getting Started → copiar `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_NUMBER_ID`
4. WhatsApp → Configuration → configurar webhook:
   - URL: `https://toothx.app/api/whatsapp/webhook`
   - Verify Token: el valor de `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
5. Para producción: WhatsApp Business Account → agregar número real de negocio
6. Registrar templates (ver Sección 4)

-----

## 3. ESTRUCTURA DE BUCKETS EN SUPABASE STORAGE

Crear estos 4 buckets en **Supabase → Storage → New Bucket**:

| Bucket | Público | Tamaño máx. | Tipos permitidos |
|--------|---------|-------------|-----------------|
| `tenant-logos` | ✅ Sí | 2 MB | `image/png`, `image/jpeg`, `image/webp`, `image/svg+xml` |
| `patient-photos` | ❌ No | 5 MB | `image/png`, `image/jpeg`, `image/webp` |
| `clinical-documents` | ❌ No | 20 MB | `image/png`, `image/jpeg`, `image/webp`, `application/pdf` |
| `invoice-pdfs` | ❌ No | 5 MB | `application/pdf` |

### Convención de rutas dentro de cada bucket

```
tenant-logos/
  {tenant_id}/logo.png

patient-photos/
  {tenant_id}/{patient_id}/profile.jpg

clinical-documents/
  {tenant_id}/{patient_id}/radiografia-{timestamp}.jpg
  {tenant_id}/{patient_id}/consentimiento-{timestamp}.pdf
  {tenant_id}/{patient_id}/evolucion-{evolution_id}-foto-1.jpg

invoice-pdfs/
  {tenant_id}/factura-{numero_factura}.pdf
```

-----

## 4. CRON JOBS — IMPLEMENTACIÓN DE RECORDATORIOS

### Contexto del problema

Los recordatorios automáticos requieren ejecución en horarios específicos:
- **F4-07**: Recordatorio 24h antes → enviar a las 9:00 AM del día anterior a la cita
- **F4-17**: Recordatorio 2h antes → enviar 2 horas antes de la hora de inicio de la cita

### Decisión de implementación: Vercel Cron Jobs

Vercel Cron Jobs están disponibles en el **plan Hobby (gratuito)** con las siguientes limitaciones:
- Máximo 2 cron functions
- Frecuencia mínima: 1 vez por día (no hay cron por hora en plan gratuito)

**Para v1.0 con plan Hobby (gratuito):**

| Cron | Expresión | Descripción |
|------|-----------|-------------|
| `cron-recordatorio-24h.ts` | `0 14 * * *` | Corre diario a las 9 AM PET (14:00 UTC). Envía recordatorios para citas de mañana. |
| `cron-recordatorio-2h.ts` | `0 11 * * *` | Corre diario a las 6 AM PET (11:00 UTC). Envía recordatorios para citas entre 7-9 AM. |

> **Limitación conocida:** El recordatorio de 2h no es en tiempo real con el plan gratuito. Se envía para las citas de la mañana temprana únicamente. Para recordatorios en tiempo real de cualquier hora del día se requiere el plan Pro de Vercel (~$20/mes) o una solución alternativa.

**Para plan Pro (recomendado para producción):**

| Cron | Expresión | Descripción |
|------|-----------|-------------|
| `cron-recordatorio-24h.ts` | `0 14 * * *` | Diario 9 AM PET |
| `cron-recordatorio-2h.ts` | `*/30 * * * *` | Cada 30 minutos — busca citas en las próximas 2-2.5h |

### Configuración en `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/recordatorio-24h",
      "schedule": "0 14 * * *"
    },
    {
      "path": "/api/cron/recordatorio-2h",
      "schedule": "0 11 * * *"
    }
  ]
}
```

### Endpoint del cron job — autenticación

```typescript
// app/api/cron/recordatorio-24h/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Verificar que la llamada proviene de Vercel Cron o del CRON_SECRET
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // Lógica del cron:
  // 1. Buscar citas de mañana con email_recordatorio_enviado = false
  // 2. Para cada cita, enviar email y/o WhatsApp
  // 3. Marcar email_recordatorio_enviado = true y whatsapp_recordatorio_enviado = true
  // ...
}
```

### Lógica del recordatorio 24h

```typescript
// Pseudocódigo — implementar en el endpoint del cron

const manana = new Date();
manana.setDate(manana.getDate() + 1);
const fechaMañana = manana.toISOString().split('T')[0]; // 'YYYY-MM-DD'

const citasDeManana = await prisma.cita.findMany({
  where: {
    fecha_hora_inicio: {
      gte: new Date(`${fechaMañana}T00:00:00`),
      lt:  new Date(`${fechaMañana}T23:59:59`),
    },
    estado: { in: ['programada', 'confirmada'] },
    email_recordatorio_enviado: false,
  },
  include: {
    paciente: { select: { nombres: true, apellidos: true, email: true, telefono: true } },
    doctor:   { select: { full_name: true } },
    tenant:   { select: { name: true, logo_url: true, primary_color: true } },
  },
});

for (const cita of citasDeManana) {
  // Enviar email con Resend
  if (cita.paciente.email) {
    await enviarEmailRecordatorio(cita);
    await prisma.cita.update({
      where: { id: cita.id },
      data:  { email_recordatorio_enviado: true }
    });
  }

  // Enviar WhatsApp si el tenant tiene WhatsApp configurado
  if (cita.paciente.telefono && tenantTieneWhatsApp(cita.tenant_id)) {
    await enviarWhatsAppRecordatorio(cita);
    await prisma.cita.update({
      where: { id: cita.id },
      data:  { whatsapp_recordatorio_enviado: true }
    });
  }
}
```

-----

## 5. PLANTILLAS DE WHATSAPP (META CLOUD API)

> Las plantillas deben enviarse a aprobación en Meta Business Manager antes de usarse.
> Proceso de aprobación: 1-3 días hábiles.
> Categoría: **UTILITY** (para notificaciones de citas médicas).

### Convención de variables en templates de Meta

Las variables se definen como `{{1}}`, `{{2}}`, etc. en el orden en que se pasan al enviar.

---

### TEMPLATE 1: Confirmación de cita nueva

**Nombre:** `cita_confirmacion`
**Categoría:** UTILITY
**Idioma:** es (Español)

**Encabezado (HEADER — tipo TEXT):**
```
Cita confirmada en {{1}}
```
Variables: `{{1}}` = nombre del consultorio

**Cuerpo (BODY):**
```
Hola {{1}}, tu cita ha sido confirmada con éxito.

🦷 *Consultorio:* {{2}}
👨‍⚕️ *Doctor/a:* {{3}}
📅 *Fecha:* {{4}}
🕐 *Hora:* {{5}}
📋 *Motivo:* {{6}}

Si necesitas cancelar o reagendar, contáctanos al {{7}}.

¡Te esperamos!
```
Variables:
- `{{1}}` = nombres del paciente
- `{{2}}` = nombre del consultorio
- `{{3}}` = nombre completo del doctor
- `{{4}}` = fecha formateada (ej: "lunes 14 de julio de 2026")
- `{{5}}` = hora (ej: "10:30 AM")
- `{{6}}` = motivo de la cita
- `{{7}}` = teléfono del consultorio

**Pie de página (FOOTER):**
```
TOOTH X — Software de Gestión Odontológica
```

---

### TEMPLATE 2: Recordatorio 24 horas antes

**Nombre:** `cita_recordatorio_24h`
**Categoría:** UTILITY
**Idioma:** es

**Encabezado:**
```
Recordatorio de cita — mañana
```

**Cuerpo:**
```
Hola {{1}}, te recordamos que mañana tienes una cita médica.

🦷 *Consultorio:* {{2}}
👨‍⚕️ *Doctor/a:* {{3}}
📅 *Fecha:* {{4}}
🕐 *Hora:* {{5}}

Por favor llega 5 minutos antes. Si no puedes asistir, avísanos al {{6}} con anticipación.

¡Hasta mañana!
```
Variables: `{{1}}` paciente, `{{2}}` consultorio, `{{3}}` doctor, `{{4}}` fecha, `{{5}}` hora, `{{6}}` teléfono

---

### TEMPLATE 3: Recordatorio 2 horas antes

**Nombre:** `cita_recordatorio_2h`
**Categoría:** UTILITY
**Idioma:** es

**Cuerpo:**
```
Hola {{1}}, en 2 horas tienes tu cita en {{2}}.

🕐 *Hora:* {{3}}
👨‍⚕️ *Doctor/a:* {{4}}
📍 *Dirección:* {{5}}

¡Te esperamos pronto!
```
Variables: `{{1}}` paciente, `{{2}}` consultorio, `{{3}}` hora, `{{4}}` doctor, `{{5}}` dirección

---

### TEMPLATE 4: Cita reagendada

**Nombre:** `cita_reagendada`
**Categoría:** UTILITY
**Idioma:** es

**Cuerpo:**
```
Hola {{1}}, tu cita en {{2}} ha sido reagendada.

*Nueva fecha:* {{3}}
*Nueva hora:* {{4}}
*Doctor/a:* {{5}}

Si tienes alguna consulta, contáctanos al {{6}}.
```
Variables: `{{1}}` paciente, `{{2}}` consultorio, `{{3}}` nueva fecha, `{{4}}` nueva hora, `{{5}}` doctor, `{{6}}` teléfono

---

### TEMPLATE 5: Cita cancelada

**Nombre:** `cita_cancelada`
**Categoría:** UTILITY
**Idioma:** es

**Cuerpo:**
```
Hola {{1}}, tu cita programada para {{2}} a las {{3}} en {{4}} ha sido cancelada.

Para agendar una nueva cita, contáctanos al {{5}} o responde este mensaje.

Disculpa las molestias.
```
Variables: `{{1}}` paciente, `{{2}}` fecha, `{{3}}` hora, `{{4}}` consultorio, `{{5}}` teléfono

---

### Código para enviar un template de WhatsApp

```typescript
// lib/notifications/whatsappService.ts

interface WhatsAppTemplateParams {
  to: string;          // Número del paciente: "51987654321" (con código de país, sin +)
  templateName: string;
  components: {
    type: 'header' | 'body';
    parameters: { type: 'text'; text: string }[];
  }[];
}

export async function enviarWhatsApp(params: WhatsAppTemplateParams): Promise<boolean> {
  const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const body = {
    messaging_product: 'whatsapp',
    to: params.to,
    type: 'template',
    template: {
      name: params.templateName,
      language: { code: 'es' },
      components: params.components,
    },
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[WhatsApp] Error al enviar:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[WhatsApp] Error de red:', error);
    return false;
  }
}

// Ejemplo de uso — Recordatorio 24h
export async function enviarRecordatorio24h(cita: CitaConRelaciones) {
  return enviarWhatsApp({
    to: formatearTelefono(cita.paciente.telefono), // ej: "51987654321"
    templateName: 'cita_recordatorio_24h',
    components: [
      {
        type: 'body',
        parameters: [
          { type: 'text', text: cita.paciente.nombres },
          { type: 'text', text: cita.tenant.name },
          { type: 'text', text: cita.doctor.full_name },
          { type: 'text', text: formatearFecha(cita.fecha_hora_inicio) },
          { type: 'text', text: formatearHora(cita.fecha_hora_inicio) },
          { type: 'text', text: cita.tenant.phone ?? 'nuestro número' },
        ],
      },
    ],
  });
}

// Normalizar número a formato internacional sin +
function formatearTelefono(telefono: string): string {
  const limpio = telefono.replace(/\D/g, '');
  if (limpio.startsWith('51')) return limpio;
  if (limpio.startsWith('9') && limpio.length === 9) return `51${limpio}`;
  return limpio;
}
```

-----

## 6. CONFIGURACIÓN DE RESEND — PLANTILLAS DE EMAIL

### Template: Confirmación de cita

```typescript
// lib/notifications/emailService.ts

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarEmailConfirmacion(cita: CitaConRelaciones) {
  const horaFormateada = formatearHora(cita.fecha_hora_inicio);
  const fechaFormateada = formatearFecha(cita.fecha_hora_inicio);

  await resend.emails.send({
    from: `${cita.tenant.name} <${process.env.RESEND_FROM_EMAIL}>`,
    to: [cita.paciente.email!],
    subject: `✅ Cita confirmada para el ${fechaFormateada}`,
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 600px; margin: 0 auto;">
        ${cita.tenant.logo_url ? `<img src="${cita.tenant.logo_url}" alt="Logo" style="height:60px; margin-bottom:24px;">` : ''}
        <h2 style="color: ${cita.tenant.primary_color ?? '#1D4ED8'};">Tu cita está confirmada</h2>
        <p>Hola <strong>${cita.paciente.nombres}</strong>,</p>
        <p>Tu cita ha sido confirmada con los siguientes detalles:</p>
        <table style="width:100%; border-collapse: collapse;">
          <tr><td style="padding:8px; color:#475569;">Consultorio</td><td style="padding:8px; font-weight:600;">${cita.tenant.name}</td></tr>
          <tr><td style="padding:8px; color:#475569;">Doctor/a</td><td style="padding:8px; font-weight:600;">${cita.doctor.full_name}</td></tr>
          <tr><td style="padding:8px; color:#475569;">Fecha</td><td style="padding:8px; font-weight:600;">${fechaFormateada}</td></tr>
          <tr><td style="padding:8px; color:#475569;">Hora</td><td style="padding:8px; font-weight:600;">${horaFormateada}</td></tr>
          <tr><td style="padding:8px; color:#475569;">Motivo</td><td style="padding:8px; font-weight:600;">${cita.motivo ?? 'Consulta general'}</td></tr>
        </table>
        <p style="color:#475569; font-size:14px; margin-top:24px;">
          Si necesitas cancelar o reagendar, contáctanos al <strong>${cita.tenant.phone ?? ''}</strong>.
        </p>
        <hr style="border-color:#E2E8F0; margin:24px 0;">
        <p style="color:#94A3B8; font-size:12px;">Este correo fue enviado desde TOOTH X · Software de Gestión Odontológica</p>
      </div>
    `,
  });
}
```
