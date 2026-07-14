# DOCUMENTO 8 — MASTER PROMPT DOCUMENT

## TOOTH X · Documento de Instrucciones para la IA

-----

|Campo        |Detalle                                                                   |
|-------------|--------------------------------------------------------------------------|
|**Proyecto** |TOOTH X                                                                   |
|**Versión**  |v1.0                                                                      |
|**Fecha**    |Mayo 2026                                                                 |
|**Propósito**|Instrucciones completas para que la IA construya TOOTH X módulo por módulo|

-----

## CÓMO USAR ESTE DOCUMENTO

1. Copia el **BLOQUE DE CONTEXTO PERMANENTE** (Sección 1) al inicio de cada nueva conversación con la IA.
1. Agrega el **PROMPT DE MÓDULO** correspondiente (Sección 3) según el módulo que vayas a construir.
1. Sigue el **ORDEN DE CONSTRUCCIÓN** exacto (Sección 2) para no generar dependencias rotas.
1. Después de cada módulo, revisa el **CHECKLIST DE ENTREGA** (Sección 4) antes de continuar.

-----

## SECCIÓN 1 — BLOQUE DE CONTEXTO PERMANENTE

> Copia este bloque completo al inicio de CADA conversación con la IA.

-----

### CONTEXTO DEL PROYECTO

Estoy construyendo **TOOTH X**, un SaaS web para consultorios odontológicos independientes en Perú y Latinoamérica. Es una aplicación multi-tenant donde cada consultorio tiene sus datos completamente aislados mediante Row Level Security (RLS) en PostgreSQL.

**Características principales de la aplicación:**

- Agenda interactiva de citas con calendario visual
- Historia clínica digital con odontograma SVG interactivo
- Odontograma controlado por voz (Web Speech API, gratuita)
- Asistente clínico de voz que cubre toda la jornada: login, agenda, navegación, tratamientos y facturación
- Facturación con generación de PDF
- Gestión financiera con Estado de Resultados (P&L): ingresos vs. arriendo, sueldos, laboratorio dental, insumos consumidos y depreciación de equipos
- Inventario de equipos con depreciación lineal e insumos con alertas de stock
- Notificaciones automáticas de citas por WhatsApp (Meta Cloud API) y email (Resend)
- Personalización de marca por consultorio: logo, colores, tipografía
- Roles: Admin (odontólogo propietario), Odontólogo, Secretaria, Super Admin TOOTH X

-----

### STACK TECNOLÓGICO OBLIGATORIO

**Nunca sugerir ni usar tecnologías fuera de esta lista sin pedirlo explícitamente.**

```
Framework:        Next.js 14+ con App Router
Lenguaje:         TypeScript estricto (sin uso de "any")
Estilos:          Tailwind CSS + CSS Custom Properties para theming
Componentes:      shadcn/ui como base (no instalar otras librerías UI)
Iconos:           Lucide React únicamente
Estado global:    Zustand
Formularios:      React Hook Form + Zod (validación en cliente y servidor)
Fetching:         SWR para datos del servidor
Base de datos:    PostgreSQL via Supabase con Row Level Security activado
ORM:              Prisma
Autenticación:    Supabase Auth con JWT personalizado
Storage archivos: Supabase Storage
Calendario:       FullCalendar con adaptador React
Gráficos:         Recharts
PDF:              @react-pdf/renderer
Voz entrada:      Web Speech API (SpeechRecognition) — gratis, nativa del browser
Voz salida:       Web Speech Synthesis API — gratis, nativa del browser
Emails:           Resend SDK
WhatsApp:         WhatsApp Cloud API (Meta oficial)
Deploy:           Vercel
```

-----

### DESIGN SYSTEM — TOKENS OBLIGATORIOS

**Colores (siempre usar var(), nunca hex hardcodeado):**

```css
--color-primary          /* Color de marca del consultorio, personalizable */
--color-primary-hover    /* 10% más oscuro */
--color-primary-light    /* Fondos destacados */
--color-secondary        /* Color secundario del consultorio */
--color-bg               /* #FFFFFF — fondos de tarjetas */
--color-surface          /* #F8FAFC — fondo general de la app */
--color-surface-hover    /* #F1F5F9 — hover de filas */
--color-border           /* #E2E8F0 — bordes */
--color-text-primary     /* #0F172A — texto principal */
--color-text-secondary   /* #475569 — texto secundario */
--color-text-disabled    /* #94A3B8 — texto deshabilitado */
--color-success          /* #16A34A */
--color-success-light    /* #DCFCE7 */
--color-warning          /* #CA8A04 */
--color-warning-light    /* #FEF9C3 */
--color-danger           /* #DC2626 */
--color-danger-light     /* #FEE2E2 */
--color-sidebar-bg       /* #0F172A — fondo oscuro del sidebar */
```

**Tipografía:**

```
Fuente: var(--font-family) — Inter por defecto
Montos y métricas numéricas: var(--font-mono) — JetBrains Mono
Escala: text-xs(11px) text-sm(13px) text-base(15px) text-lg(18px) text-xl(22px) text-2xl(28px) text-3xl(36px)
Pesos: font-normal(400) font-medium(500) font-semibold(600) font-bold(700)
```

**Componentes clave:**

```
Botón primario:   bg-[var(--color-primary)] text-white rounded-lg px-5 py-2.5 text-sm font-semibold
Botón secundario: border-1.5 border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg px-5 py-2.5
Input:            border-1.5 border-[var(--color-border)] rounded-lg px-3.5 py-2.5 h-[42px] focus:border-[var(--color-primary)]
Tarjeta:          bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm
Sidebar:          bg-[var(--color-sidebar-bg)] w-[260px] h-screen fixed
```

**Colores del odontograma:**

```
Caries:         #EF4444   Obturación:   #3B82F6   Corona:    #F59E0B
Ausente:        #475569   Fractura:     #F97316   Implante:  #10B981
Endodoncia:     #8B5CF6   Sellante:     #38BDF8   Sano:      #F1F5F9
Previsualización voz: #FCD34D
```

-----

### REGLAS DE CALIDAD DE CÓDIGO — OBLIGATORIAS

1. **Comentarios en español** en toda la lógica de negocio y funciones complejas.
1. Cada componente React en su **propio archivo** con nombre en PascalCase.
1. Cada API Route en su **propio archivo** bajo `app/api/`.
1. **Manejo de errores** con try/catch en TODAS las llamadas a base de datos y APIs externas. Los errores técnicos nunca se muestran al usuario — solo mensajes amigables.
1. **Validación con Zod** en todos los formularios y en todos los endpoints del servidor.
1. **Tipos TypeScript explícitos** para todas las props, respuestas de API y modelos. Sin uso de `any`.
1. **Separación de responsabilidades:** lógica de negocio en hooks o servicios, no dentro de componentes UI.
1. **No hardcodear** colores, textos de UI ni valores de configuración. Usar variables CSS y constantes.
1. Todo componente debe ser **responsive** para desktop (1280px) y tablet (1024px).
1. Implementar siempre los **4 estados de interfaz:** cargando (skeleton), vacío (empty state), error y sin resultados.
1. El campo `tenant_id` **nunca viene del body del request** — siempre se extrae del JWT del usuario autenticado.
1. **Soft delete** para pacientes y usuarios: campo `is_active = false`, no eliminación física.
1. Los **montos de dinero** siempre se almacenan como `Decimal` y se muestran con `font-mono`.
1. El código debe incluir los **índices de base de datos** necesarios en el schema de Prisma.
1. Todo archivo debe tener al inicio un **comentario de cabecera** indicando su propósito.

-----

### ARQUITECTURA MULTI-TENANT — REGLAS

- Cada tabla de datos tiene `tenant_id uuid NOT NULL`.
- Las API Routes extraen el `tenant_id` del JWT: `session.user.user_metadata.tenant_id`.
- Nunca filtrar manualmente — RLS de Supabase lo hace a nivel de motor de BD.
- El middleware de Next.js en `middleware.ts` protege todas las rutas privadas.
- El theming (colores, fuente, logo) se carga del tenant al iniciar sesión y se aplica con CSS custom properties.

-----

### ESTRUCTURA DE RESPUESTA DE LA API

**Éxito:**

```json
{ "success": true, "data": {}, "meta": { "total": 0, "page": 1, "pageSize": 20 } }
```

**Error:**

```json
{ "success": false, "error": { "code": "ERROR_CODE", "message": "Mensaje amigable", "fields": {} } }
```

-----

## SECCIÓN 2 — ORDEN DE CONSTRUCCIÓN DE MÓDULOS

Construir en este orden exacto. No pasar al siguiente módulo hasta que el anterior esté completo y funcionando.

```
MÓDULO 01 — Configuración base del proyecto
MÓDULO 02 — Sistema de autenticación y middleware
MÓDULO 03 — Layout principal y theming dinámico
MÓDULO 04 — Configuración del consultorio (Onboarding)
MÓDULO 05 — Gestión de usuarios y roles
MÓDULO 06 — Módulo de Pacientes (CRUD completo)
MÓDULO 07 — Módulo de Agenda / Calendario
MÓDULO 08 — Historia Clínica y Evoluciones
MÓDULO 09 — Odontograma SVG (interacción manual)
MÓDULO 10 — Odontograma por Voz (parser + Web Speech API)
MÓDULO 11 — Facturación + Generación de PDF
MÓDULO 12 — Gestión Financiera y Estado de Resultados (P&L)
MÓDULO 13 — Inventario (Equipos + Insumos + Depreciación)
MÓDULO 14 — Dashboard de Métricas
MÓDULO 15 — Notificaciones (Email via Resend + WhatsApp)
MÓDULO 16 — Asistente Clínico de Voz (capa completa)
MÓDULO 17 — Super Admin Panel
```

-----

## SECCIÓN 3 — PROMPTS POR MÓDULO

Usa el prompt del módulo correspondiente junto con el Bloque de Contexto Permanente.

-----

### PROMPT MÓDULO 01 — Configuración Base del Proyecto

```
Usando el stack obligatorio definido en el contexto, configura el proyecto base de TOOTH X:

1. Inicializa Next.js 14 con App Router y TypeScript estricto.
2. Configura Tailwind CSS con el archivo tailwind.config.ts incluyendo los colores del design system como variables CSS en :root.
3. Instala y configura shadcn/ui con el tema base.
4. Instala Lucide React, Zustand, React Hook Form, Zod, SWR y Prisma.
5. Configura Supabase: crea los dos clientes (browser y server) en lib/supabase/.
6. Crea el schema inicial de Prisma con las tablas: tenants, users. Incluye todos los campos definidos en el modelo de datos.
7. Configura el archivo .env.example con todas las variables de entorno necesarias.
8. Crea la estructura de carpetas completa del proyecto según la arquitectura definida.
9. Configura next.config.ts con los headers de seguridad (X-Frame-Options, X-Content-Type-Options).
10. Instala las fuentes Inter y JetBrains Mono desde Google Fonts en el layout raíz.

Genera todos los archivos de configuración con comentarios explicando cada decisión.
```

-----

### PROMPT MÓDULO 02 — Autenticación y Middleware

```
Construye el sistema completo de autenticación de TOOTH X:

1. Página de Login (/login): formulario con email y contraseña, botón de micrófono para login por voz (PIN), enlace a recuperación de contraseña. Validación con Zod.
2. Página de Registro (/registro): formulario de nuevo consultorio (nombre, RUC, país, email, contraseña). Al completarse, crea el tenant y el usuario admin en Supabase Auth y en la tabla users de Prisma.
3. Página de Recuperación de contraseña (/recuperar-contrasena): envío de email con Supabase Auth.
4. Página de Nueva contraseña (/nueva-contrasena): formulario con token de recuperación.
5. Página de Activación de cuenta (/activar-cuenta): para usuarios invitados. Recibe token, muestra formulario para nombre, contraseña y PIN de voz opcional.
6. API Route POST /api/auth/login: login estándar con email + contraseña via Supabase Auth.
7. API Route POST /api/auth/login-voz: login por PIN de voz. Busca usuario por nombre, verifica bcrypt hash del PIN, bloquea tras 3 intentos, crea sesión de 14 horas. Retorna también el mensaje de bienvenida en texto para que el asistente de voz lo lea.
8. API Route POST /api/auth/logout: cierra la sesión.
9. middleware.ts: protege todas las rutas privadas, redirige al login si no hay sesión, verifica roles para rutas restringidas, redirige al onboarding si no está completo.
10. Hook useAuth.ts: expone sesión, usuario, rol y tenant_id para uso en componentes.

El JWT debe contener en user_metadata: tenant_id, app_role, full_name, onboarding_complete, voice_pin_set.
Manejar todos los estados de error con mensajes en español amigables para el usuario.
```

-----

### PROMPT MÓDULO 03 — Layout Principal y Theming

```
Construye el layout principal de la aplicación autenticada:

1. Sidebar de navegación (components/layout/Sidebar.tsx):
   - Fondo: var(--color-sidebar-bg). Ancho: 260px expandido / 64px colapsado.
   - Logo del consultorio en la parte superior (cargado desde tenant.logo_url).
   - Ítems de navegación con íconos Lucide según el rol del usuario:
     Admin/Doctor: Dashboard, Pacientes, Agenda, Facturación, Gestión Financiera (solo Admin), Inventario, Configuración (solo Admin).
     Secretaria: Dashboard, Pacientes, Agenda, Facturación.
   - Ítem activo: borde izquierdo 3px var(--color-primary), fondo rgba(255,255,255,0.10).
   - Sección inferior: nombre del usuario, rol y botón de cerrar sesión.
   - Botón de colapsar sidebar.
   - En tablet (<1024px): se convierte en drawer con overlay.

2. Header (components/layout/Header.tsx):
   - Altura 64px, sticky, fondo blanco, borde inferior.
   - Botón hamburguesa para colapsar sidebar.
   - Título del módulo activo + Breadcrumb.
   - Botón de micrófono (🎤): rojo pulsante cuando el asistente de voz está activo.
   - Campana de notificaciones con badge de conteo.
   - Avatar del usuario con menú: Perfil / Cerrar sesión.

3. Función applyTenantTheme (lib/theme/applyTenantTheme.ts):
   - Recibe el objeto tenant.
   - Inyecta --color-primary, --color-primary-hover, --color-primary-light, --color-secondary, --font-family como CSS custom properties en document.documentElement.
   - Se ejecuta al cargar el layout después del login.

4. Hook useTenant.ts: carga y expone los datos del consultorio activo desde Zustand. Se hidrata al iniciar sesión.

5. Layout (app/(dashboard)/layout.tsx): envuelve el contenido con Sidebar + Header + el área de contenido principal (max-width 1280px, padding 24px).
```

-----

### PROMPT MÓDULO 04 — Onboarding del Consultorio

```
Construye el wizard de configuración inicial de TOOTH X (5 pasos):

Paso 1 (/onboarding/paso-1): Datos del consultorio.
  Campos: nombre del consultorio, RUC, dirección, teléfono, especialidad principal.
  Guarda en la tabla tenants.

Paso 2 (/onboarding/paso-2): Identidad visual.
  Subir logo (PNG/JPG, máx 2MB) a Supabase Storage.
  Color picker para color primario y secundario (hexadecimal).
  Select de tipografía: Inter, Plus Jakarta Sans, Nunito, Poppins, DM Sans.
  Vista previa en tiempo real del tema aplicado (llama a applyTenantTheme al cambiar).

Paso 3 (/onboarding/paso-3): Horarios de atención.
  Tabla de 7 días con toggle activo/inactivo, hora inicio y hora fin para cada día.
  Campo de duración por defecto de citas (30 / 45 / 60 minutos).
  Guarda en tenant.horarios_atencion como JSON.

Paso 4 (/onboarding/paso-4): Crear usuarios.
  Formulario repetible: nombre completo, email, rol (Odontólogo / Secretaria).
  Al agregar: crea el usuario en Supabase Auth y en tabla users, envía email de invitación con Supabase Auth.
  Puede agregar múltiples usuarios o continuar sin agregar.

Paso 5 (/onboarding/paso-5): Pantalla de completado.
  Resumen de la configuración realizada.
  Marca tenant.onboarding_complete = true.
  Botón "Ir al Dashboard".

Layout especial para el wizard: sin sidebar, con indicador de progreso de 5 pasos en la parte superior.
Persistir el progreso del wizard: si el usuario cierra el browser, al volver retoma desde el último paso completado.
```

-----

### PROMPT MÓDULO 05 — Gestión de Usuarios

```
Construye el módulo de gestión de usuarios dentro de la sección Configuración:

1. Página /configuracion con pestañas: Datos del consultorio, Identidad visual, Horarios, Usuarios, Notificaciones, Suscripción.

2. Pestaña Usuarios:
   - Tabla de usuarios activos con columnas: nombre, email, rol (badge), estado, acciones.
   - Botón "Invitar usuario": abre modal con campos nombre, email y rol.
   - Al invitar: crea usuario en Supabase Auth + tabla users, envía email de invitación.
   - Acciones por usuario: Editar rol (modal), Desactivar (confirmación, soft delete is_active=false).
   - El Admin no puede desactivarse a sí mismo.

3. Pestaña Datos del consultorio: formulario editable de nombre, RUC, dirección, teléfono.

4. Pestaña Identidad visual: igual al paso 2 del onboarding pero en modo edición.

5. Pestaña Horarios: igual al paso 3 del onboarding pero en modo edición.

6. Página /perfil:
   - Sección datos personales: nombre, foto de perfil (upload a Supabase Storage), especialidad.
   - Sección seguridad: cambiar contraseña (requiere contraseña actual).
   - Sección PIN de voz: campo para ingresar nuevo PIN de 4 dígitos + confirmación. Al guardar, hashear con bcrypt y guardar en users.voice_pin_hash.

API Routes necesarias:
- GET/PUT /api/tenant/configuracion
- GET /api/users (listar usuarios del consultorio)
- POST /api/users/invitar
- PATCH /api/users/:id/rol
- PATCH /api/users/:id/estado
- GET/PUT /api/perfil
- POST /api/perfil/pin-voz
```

-----

### PROMPT MÓDULO 06 — Módulo de Pacientes

```
Construye el módulo completo de pacientes:

1. Página /pacientes: tabla paginada (20 por página) con columnas: foto (avatar), nombre completo, documento, teléfono, última cita, estado.
   - Búsqueda en tiempo real por nombre, apellido o número de documento (Full Text Search con debounce 300ms).
   - Filtros: estado activo/inactivo.
   - Botón "Nuevo paciente".
   - Estado vacío con botón de crear.

2. Página /pacientes/nuevo: formulario dividido en secciones:
   - Datos personales: nombres, apellidos, tipo documento, número documento, fecha nacimiento, sexo.
   - Datos de contacto: teléfono, email, dirección.
   - Información médica: grupo sanguíneo, alergias, antecedentes médicos.
   - Foto: upload opcional a Supabase Storage.
   Validación Zod. Guardar con tenant_id del JWT.

3. Página /pacientes/:id (Ficha del paciente): encabezado con foto, nombre, documento y teléfono.
   Pestañas: Datos personales | Historia Clínica | Odontograma | Facturación | Documentos.
   - Pestaña Datos: formulario editable + historial de citas recientes + resumen de facturas pendientes.
   - Las otras pestañas se construyen en módulos posteriores.

4. API Routes:
   - GET /api/pacientes (listar con búsqueda y paginación)
   - POST /api/pacientes (crear)
   - GET /api/pacientes/:id (obtener con datos completos)
   - PUT /api/pacientes/:id (actualizar)
   - PATCH /api/pacientes/:id/estado (activar/desactivar)
   Todas extraen tenant_id del JWT. Validación Zod en cada endpoint.
```

-----

### PROMPT MÓDULO 07 — Agenda y Calendario

```
Construye el módulo de agenda con FullCalendar:

1. Página /agenda con vista semanal por defecto.
   - Selector de vista: Diaria | Semanal | Mensual.
   - Filtro por odontólogo (select con doctores del consultorio).
   - Botón "Nueva cita" en el header.
   - Los slots fuera del horario de atención del consultorio: fondo gris, no clickables.
   - Línea roja de hora actual.
   - El día actual destacado con el color primario del tenant.

2. Citas en el calendario con colores según estado:
   Programada:#DBEAFE Confirmada:#DCFCE7 En_curso:#FEF9C3 Completada:#F1F5F9 Cancelada:#FEE2E2 No_asistio:#FFEDD5

3. Modal "Nueva cita" (md, 560px):
   - Combobox de paciente con búsqueda en tiempo real.
   - Opción "Crear nuevo paciente" dentro del modal (formulario rápido: nombre, apellido, teléfono).
   - Select de odontólogo.
   - DatePicker + TimePicker con hora precargada si se hizo clic en un slot.
   - Select de duración (usa la duración por defecto del consultorio).
   - Campo de motivo.
   - Al guardar: crea la cita y dispara notificación automática al paciente si tiene teléfono/email.

4. Al hacer clic sobre una cita existente: panel lateral con detalle.
   - Datos de la cita + datos del paciente.
   - Selector de estado.
   - Botones: Editar, Ver ficha del paciente, Cancelar cita.

5. Drag & drop para mover citas (cambiar hora o día).

6. API Routes:
   - GET /api/citas (con filtros: desde, hasta, doctorId, estado)
   - POST /api/citas
   - GET /api/citas/hoy (para el asistente de voz)
   - PUT /api/citas/:id
   - PATCH /api/citas/:id/estado
   - DELETE /api/citas/:id
```

-----

### PROMPT MÓDULO 08 — Historia Clínica y Evoluciones

```
Construye el módulo de historia clínica dentro de la ficha del paciente:

1. Pestaña "Historia Clínica" en /pacientes/:id:
   - Lista de evoluciones ordenadas de más reciente a más antigua.
   - Cada evolución muestra: fecha, motivo, nombre del doctor, badge de número de tratamientos del plan.
   - Botón "Nueva evolución".
   - Estado vacío: "No hay evoluciones registradas. Comienza creando la primera."

2. Formulario de nueva evolución (/pacientes/:id/evoluciones/nueva):
   - Campos: fecha (hoy por defecto), motivo de consulta (obligatorio), anamnesis, examen clínico, diagnóstico, plan de tratamiento en texto libre, notas.
   - Sección "Plan de tratamiento estructurado": tabla de ítems con botón "Agregar ítem".
     Cada ítem: número de diente (opcional), descripción del procedimiento, estado (Pendiente por defecto), costo estimado.
   - Botón para adjuntar imágenes (Supabase Storage).
   - Guardar: vincula la evolución al paciente y al tenant. Registra doctor_id del usuario autenticado.

3. Vista de evolución (/pacientes/:id/evoluciones/:evolucionId):
   - Modo lectura con todos los campos.
   - Botón "Editar" solo para el doctor que la creó o el admin.
   - Mostrar los ítems del plan de tratamiento con su estado actual.

4. Cambio de estado de ítems del plan: Pendiente → En progreso → Completado.

5. API Routes:
   - GET /api/pacientes/:id/evoluciones
   - POST /api/evoluciones
   - GET /api/evoluciones/:id
   - PUT /api/evoluciones/:id
   - PATCH /api/plan-items/:id/estado
```

-----

### PROMPT MÓDULO 09 — Odontograma SVG (Interacción Manual)

```
Construye el odontograma interactivo SVG:

1. Componente OdontogramaSVG.tsx:
   - Odontograma adulto completo: 32 dientes en notación FDI (11-18, 21-28, 31-38, 41-48).
   - Cada diente es un componente DienteSVG.tsx con 5 zonas de superficie clicables: oclusal (centro), vestibular (parte frontal), palatino/lingual (parte posterior), mesial (izquierda), distal (derecha).
   - Número del diente debajo de cada pieza en font-mono text-xs.
   - Selector en la parte superior: [Adulto] [Pediátrico]. El pediátrico usa dientes 51-55 y 61-65 (superior) y 71-75 y 81-85 (inferior).

2. Interacción manual:
   - Clic en un diente: lo selecciona (contorno de 2px en --color-primary, escala 102%).
   - Panel lateral PanelCondiciones.tsx: muestra los botones de superficie y el catálogo de condiciones.
   - Al seleccionar superficie + condición: botón "Guardar hallazgo".
   - La superficie se colorea con el color de la condición en el SVG.

3. Colorimetría exacta:
   Caries:#EF4444 Obturación:#3B82F6 Corona:#F59E0B Ausente:#475569 Fractura:#F97316
   Implante:#10B981 Endodoncia:#8B5CF6 Sellante:#38BDF8 Sano:#F1F5F9

4. Selector de fecha: permite ver el estado del odontograma en cualquier fecha anterior.
   Botones: "Ver historial" → calendario para seleccionar fecha → carga odontograma_items de esa fecha.

5. Botón "Exportar imagen PNG": usa html2canvas para capturar el SVG.

6. API Routes:
   - GET /api/odontograma/:pacienteId (estado actual o por fecha query param)
   - POST /api/odontograma (guardar hallazgo, vinculado a evolucion_id del JWT context)
   - DELETE /api/odontograma/:itemId (borrar un hallazgo)
```

-----

### PROMPT MÓDULO 10 — Odontograma por Voz

```
Agrega el control por voz al odontograma ya construido:

1. Botón de micrófono en la barra superior del odontograma. Al activarse:
   - Ícono Mic rojo pulsante.
   - Texto "Escuchando..." debajo del odontograma.
   - Indicador de nivel de audio en tiempo real.

2. Hook useVoiceOdontograma.ts:
   - Integra Web Speech API (SpeechRecognition) con idioma 'es-PE'.
   - Modo de escucha continua: tras confirmar un hallazgo, vuelve automáticamente a escuchar.
   - Llama al parser con cada transcripción recibida.

3. Parser lib/voice/parser.ts:
   - Función parseOdontogramaCommand(transcript: string): OdontogramaCommand | null
   - Extrae: número de diente, superficie y condición del texto transcripto.
   - Normalización de números: lib/voice/numberNormalizer.ts
     Convierte: "dieciséis"→16, "uno seis"→16, "uno punto seis"→16, "treinta y seis"→36.
   - Sinónimos de superficie: "masticatoria"→oclusal, "lingual"→palatino, "de frente"→vestibular.
   - Sinónimos de condición: "empaste"→obturacion, "nervio"→endodoncia, "karies"→caries.
   - Tolerancia fonética: distancia Levenshtein ≤ 2 para condiciones.
   - Si no puede interpretar: retorna null → sistema responde "No entendí, repite el comando".

4. Barra de confirmación BarraConfirmacionVoz.tsx (sticky en la parte inferior del odontograma):
   - Fondo --color-primary-light, borde superior 3px --color-primary.
   - Muestra: "🦷 Diente 16 · Oclusal · Caries — ¿Confirmar?"
   - El diente interpretado se resalta en amarillo (#FCD34D) como previsualización.
   - Botones: [Confirmar] [Cancelar].

5. Comandos de control:
   "confirmar" / "sí" → guarda el hallazgo (llama al mismo endpoint del módulo 09).
   "cancelar" / "no" → descarta, vuelve a escuchar.
   "deshacer" → elimina el último hallazgo guardado.
   "terminar" / "modo voz apagado" → desactiva el modo voz.

6. Respuesta de voz (Web Speech Synthesis):
   "Guardado. Continúa." tras confirmar.
   "Cancelado. Repite el comando." tras cancelar.
   "No entendí, repite el comando." si el parser retorna null.
   "Exploración finalizada. [N] hallazgos registrados." al terminar.

7. Mensaje de advertencia si el navegador no soporta SpeechRecognition:
   "El control por voz requiere Google Chrome o Microsoft Edge."
```

-----

### PROMPT MÓDULO 11 — Facturación y PDF

```
Construye el módulo de facturación completo:

1. Pestaña "Facturación" en /pacientes/:id:
   - Historial de facturas del paciente con estado (badge) y monto.
   - Botón "Nueva factura".

2. Página /facturacion: listado general de todas las facturas del consultorio.
   - Filtros: por estado, por fecha, búsqueda por paciente o número de factura.
   - Resumen de cartera total (suma de facturas pendientes + parciales).

3. Formulario de nueva factura (modal lg o página):
   - Carga automática de ítems desde plan_tratamiento_items con estado "completado" del paciente.
   - Tabla editable de ítems: descripción, cantidad, precio unitario, descuento por ítem, total.
   - Agregar ítems manualmente.
   - Descuento global (monto o porcentaje) con recálculo automático.
   - Selector de método de pago: efectivo | transferencia | tarjeta | cuotas.
   - Numeración automática: MAX(numero_factura) + 1 por tenant.
   - Al emitir: crea factura + factura_items + pago (si pago completo).

4. Registro de abonos parciales: botón "Registrar abono" en el detalle de factura.
   - Modal: monto del abono, método de pago, referencia.
   - Actualiza monto_pagado y saldo_pendiente. Cambia estado a "parcial" o "pagada".

5. Generación de PDF con @react-pdf/renderer (componente FacturaPDF.tsx):
   - Cabecera: logo del consultorio, nombre, RUC, dirección, teléfono.
   - Datos del paciente: nombre, documento.
   - Número de factura, fecha de emisión.
   - Tabla de ítems con cantidades y valores.
   - Subtotal, descuento, total en font-mono.
   - Método de pago y estado.
   - Pie: "Gracias por su visita".
   - Descarga directa y botón de imprimir.

6. API Routes:
   - GET /api/facturas
   - POST /api/facturas
   - GET /api/facturas/:id
   - POST /api/facturas/:id/pagos
   - PATCH /api/facturas/:id/anular (solo admin)
```

-----

### PROMPT MÓDULO 12 — Gestión Financiera y P&L

```
Construye el módulo de Gestión Financiera (solo accesible para el rol admin):

1. Página /finanzas: resumen del mes actual con tarjetas:
   - Total ingresos del mes (verde).
   - Total gastos del mes (rojo).
   - Resultado neto (verde si ganancia, rojo si pérdida) con badge ✅ GANANCIA / ❌ PÉRDIDA.
   - Margen neto en porcentaje.
   - Botón "Registrar gasto" y enlace "Ver Estado de Resultados completo".

2. Página /finanzas/gastos: tabla de gastos del mes.
   - Filtros: mes/año, tipo (fijo/variable), categoría.
   - Indicador de gastos recurrentes activos.
   - Botón "Registrar gasto".
   - Formulario de nuevo gasto (modal md):
     Tipo: Fijo | Variable.
     Categoría según tipo (lista definida en el modelo de datos).
     Descripción, monto, fecha.
     Toggle "Gasto recurrente mensual".
     Si categoría = "laboratorio": campos opcionales para vincular a paciente y tratamiento.

3. Página /finanzas/estado-resultados: Estado de Resultados completo.
   - Selector de período: mes/año o rango de fechas.
   - Vista del P&L con todos los rubros desglosados según la estructura del Document 6.
   - Los valores calculados automáticamente (insumos, depreciación) llevan etiqueta "(auto)" en text-xs.
   - Resultado neto con fondo verde (ganancia) o rojo (pérdida).
   - Gráfico de torta (Recharts): desglose de gastos por categoría.
   - Gráfico de línea doble (Recharts): ingresos vs gastos de los últimos 12 meses.
   - Botón "Exportar PDF" que genera el reporte completo.
   - Botón "Ver comparativo": muestra dos columnas mes actual vs mes anterior con variaciones %.

4. lib/finance/plCalculator.ts: motor del P&L según la implementación del Document 6.
   Combina: facturas cobradas + salidas de insumos × precio + gastos registrados + depreciación mensual de equipos.

5. Job de gastos recurrentes: función que se ejecuta el día 1 de cada mes,
   copia los gastos marcados como es_recurrente=true al nuevo mes y envía notificación interna al admin.

6. API Routes:
   - GET /api/finanzas/gastos
   - POST /api/finanzas/gastos
   - PUT /api/finanzas/gastos/:id
   - DELETE /api/finanzas/gastos/:id
   - GET /api/finanzas/estado-resultados?desde=&hasta=
```

-----

### PROMPT MÓDULO 13 — Inventario

```
Construye el módulo de inventario con dos secciones: Equipos e Insumos.

EQUIPOS:
1. Lista de equipos con columnas: nombre, categoría, estado (badge), valor en libros actual, acciones.
2. Formulario de nuevo equipo: nombre, categoría, marca, modelo, serial, proveedor, fecha de compra, valor de compra, valor residual, vida útil en años, estado.
3. Ficha del equipo: tabla de depreciación año por año.
   Depreciación anual = (valor_compra - valor_residual) / vida_util_anios.
   Valor en libros = valor_compra - (depreciacion_anual × años transcurridos desde fecha_compra).
   Tabla: Año | Depreciación del año | Valor en libros al cierre.

INSUMOS:
4. Lista de insumos con stock actual, stock mínimo, indicador visual de alerta (badge rojo "Stock bajo") si stock_actual <= stock_minimo.
5. Formulario de nuevo insumo: nombre, categoría, unidad de medida, stock mínimo, precio unitario, proveedor.
6. Ficha del insumo: stock actual destacado, historial de movimientos (entradas y salidas).
7. Modal "Registrar entrada": cantidad, precio unitario de compra, proveedor, fecha, notas.
   Actualiza stock_actual = stock_actual + cantidad.
8. Modal "Registrar salida": cantidad, paciente vinculado (opcional), fecha, notas.
   Actualiza stock_actual = stock_actual - cantidad.
   Si nuevo stock <= stock_minimo: activa la alerta.
9. En ambos movimientos: guarda el stock_resultante en la tabla movimientos_insumo para trazabilidad.

REPORTES:
10. Pestaña Reportes (solo admin): tabla de inventario valorizado de insumos (stock × precio unitario).
    Total valorizado al pie. Exportar a PDF.

API Routes:
- GET/POST /api/inventario/equipos
- GET/PUT /api/inventario/equipos/:id
- GET/POST /api/inventario/insumos
- GET/PUT /api/inventario/insumos/:id
- POST /api/inventario/insumos/:id/movimientos
```

-----

### PROMPT MÓDULO 14 — Dashboard de Métricas

```
Construye el Dashboard principal de TOOTH X usando Recharts:

TARJETAS VISIBLES PARA TODOS LOS ROLES:
- Citas del día: total, completadas, en curso, pendientes.
- Próxima cita: nombre del paciente, hora, motivo.
- Alertas de inventario: lista de insumos con stock bajo (badge rojo).

TARJETAS SOLO PARA ADMIN:
- Ingresos del día con comparación vs ayer.
- Ingresos del mes vs mes anterior (con flecha ▲▼ y % de variación).
- Facturas pendientes de cobro (cartera total en S/.).
- Resultado neto del mes: tarjeta grande con ✅ GANANCIA o ❌ PÉRDIDA y monto en font-mono text-3xl.
- Margen neto del mes en porcentaje.

GRÁFICOS SOLO PARA ADMIN (Recharts):
- Gráfico de barras: ingresos por mes del año en curso (12 barras, color --color-primary).
- Gráfico de línea doble: ingresos vs gastos totales de los últimos 12 meses (azul vs rojo suave).
- Gráfico de torta: desglose de gastos del mes por categoría (colores del design system).
- Gráfico de torta: citas por estado del mes (completadas, canceladas, no asistidas).
- Gráfico de barras horizontales: top 5 tratamientos más realizados.

SELECTOR:
- Selector de rango de fechas que filtra todos los gráficos simultáneamente.

Todos los gráficos tienen estado de carga (skeleton), estado vacío y manejo de error.
Las tarjetas de métricas usan la variante card-metric con borde izquierdo de 4px.
Resultado positivo: card-metric-success (borde verde). Negativo: card-metric-danger (borde rojo).

API Route: GET /api/dashboard/metricas?desde=&hasta=
Retorna todos los datos en una sola llamada para minimizar requests.
```

-----

### PROMPT MÓDULO 15 — Notificaciones

```
Construye el sistema de notificaciones automáticas:

EMAIL (Resend):
1. lib/notifications/emailService.ts: función sendEmail(tipo, cita, consultorio).
2. Plantillas HTML para cada tipo: confirmación, recordatorio 24h, reagendamiento, cancelación.
   Las plantillas incluyen el logo y colores del consultorio (theming en el email).
3. API Route POST /api/notificaciones/enviar: recibe { tipo, citaId } y dispara el email y/o WhatsApp.
4. Cron job (Vercel Cron): todos los días a las 9:00 AM, busca citas del día siguiente con estado "programada" y email_recordatorio_enviado=false. Envía el recordatorio y marca el flag.

WHATSAPP (Meta Cloud API):
5. lib/notifications/whatsappService.ts: función sendWhatsApp(tipo, cita, numeroTelefono).
6. Plantillas preaprobadas de WhatsApp para cada tipo de notificación (definidas en el Document 1 Módulo 9).
7. Cron job: mismo momento que el de email, envía recordatorio 24h por WhatsApp.
8. Segundo cron: 2 horas antes de cada cita, envía recordatorio final por WhatsApp.

CONFIGURACIÓN:
9. Pestaña Notificaciones en /configuracion:
   - Toggles para activar/desactivar cada tipo de notificación.
   - Campo para conectar el número de WhatsApp Business del consultorio.
   - Indicador de cuota consumida del mes (emails enviados / 3000, conversaciones WA / 1000).

REGLAS:
- Solo se envía notificación si el paciente tiene teléfono (para WA) o email (para email) registrado.
- Los flags de envío en la tabla citas evitan duplicados.
- Si falla el envío, registrar el error pero no romper el flujo de la app.
```

-----

### PROMPT MÓDULO 16 — Asistente Clínico de Voz

```
Construye la capa completa del Asistente Clínico de Voz sobre toda la aplicación:

1. Hook central useVoiceAssistant.ts:
   - Integra Web Speech API (SpeechRecognition) en modo continuo, idioma 'es-PE'.
   - Integra Web Speech Synthesis (respuestas en voz alta).
   - Expone: { isListening, isProcessing, lastCommand, startListening, stopListening }.
   - Al recibir transcripción: busca el comando en el commandRegistry.
   - Si encuentra match: ejecuta la acción y llama a speak(respuesta).
   - Si no encuentra: speak("No entendí el comando. Di 'ayuda' para ver los comandos disponibles.").

2. lib/voice/commandRegistry.ts: registro central de todos los comandos.
   Cada entrada: { patterns: RegExp[], action: Function, response: Function }.
   Grupos implementados según Document 3 (Módulo 10):
   - Grupo 1: Consultas de agenda (¿cuántos pacientes?, ¿quién es el siguiente?, etc.)
   - Grupo 2: Navegación (ir al dashboard, abrir agenda, abrir primer paciente, etc.)
   - Grupo 3: Gestión de citas (paciente en sala, finalizar cita, no asistió)
   - Grupo 4: Plan de tratamiento (procederé con los tratamientos, tratamiento finalizado, etc.)
   - Grupo 5: Facturación (generar factura, pago en efectivo, imprimir factura)
   - Grupo 6: Control (silencio, habla de nuevo, ayuda, cerrar sesión)

3. Botón de micrófono en el Header (ya construido en Módulo 03): activa/desactiva el asistente.
   Atajo de teclado Alt+M.

4. Respuestas dinámicas que consultan la BD en tiempo real:
   "¿Cuántos pacientes tengo hoy?" → GET /api/citas/hoy → cuenta y responde.
   "¿Quién es el siguiente paciente?" → GET /api/citas/hoy → filtra pendientes → responde con nombre y hora.
   "Dame el resumen del día" → GET /api/dashboard/metricas?desde=hoy → responde con resumen.

5. Navegación por voz: el asistente usa router.push() de Next.js para navegar entre páginas.

6. Tarjeta de referencia de comandos: componente modal que se activa con "ayuda" o desde el header.
   Lista todos los comandos organizados por grupo.

7. Login por voz: ya implementado en Módulo 02. Integrar con el asistente para que, al hacer login exitoso, active automáticamente el asistente y diga el mensaje de bienvenida.

8. Modo silencioso: toggle que desactiva las respuestas de voz pero sigue ejecutando acciones.
```

-----

### PROMPT MÓDULO 17 — Super Admin Panel

```
Construye el panel exclusivo del operador del SaaS TOOTH X:

1. Layout separado (app/(super-admin)/layout.tsx): sin el sidebar de consultorio, con su propio sidebar de Super Admin.

2. Página /super-admin: Dashboard global con métricas de la plataforma:
   - Total de consultorios activos.
   - Total de usuarios en la plataforma.
   - Suscripciones activas por plan (básico / pro).
   - Ingresos del mes (de los pagos de suscripción).
   - Consultorios nuevos en los últimos 30 días.

3. Página /super-admin/consultorios: tabla de todos los consultorios.
   - Columnas: nombre, país, plan, fecha de registro, estado (activo/inactivo), fecha de vencimiento.
   - Búsqueda por nombre o RUC.
   - Filtros: por plan, por estado, por país.

4. Página /super-admin/consultorios/:tenantId: ficha del consultorio.
   - Datos del consultorio y del admin principal.
   - Plan contratado y fecha de vencimiento.
   - Historial de pagos de suscripción.
   - Botón "Suspender consultorio" (is_active=false con confirmación).
   - Botón "Cambiar plan".
   ⚠️ IMPORTANTE: el Super Admin NO puede ver datos clínicos (pacientes, citas, facturas) de ningún consultorio. Solo metadatos del tenant.

5. Página /super-admin/planes: gestión de planes disponibles.
   - Tabla: nombre, precio, límites (usuarios, almacenamiento), features incluidas.
   - Crear y editar planes.

API Routes bajo /api/super-admin/* protegidas por rol super_admin en el middleware.
```

-----

## SECCIÓN 4 — CHECKLIST DE ENTREGA POR MÓDULO

Antes de continuar al siguiente módulo, verifica que el módulo actual cumple con:

```
FUNCIONALIDAD
[ ] Todas las funcionalidades del módulo están implementadas
[ ] Los 4 estados de interfaz funcionan: carga, vacío, error, sin resultados
[ ] Las validaciones de formulario funcionan en cliente y servidor
[ ] Los permisos por rol están aplicados correctamente
[ ] El tenant_id se extrae del JWT (nunca del body del request)

CÓDIGO
[ ] TypeScript sin errores de compilación
[ ] Sin uso de "any" en ningún archivo
[ ] Comentarios en español en la lógica de negocio
[ ] Manejo de errores en todas las llamadas a BD y APIs externas
[ ] Los montos se muestran con font-mono
[ ] Las variables CSS del design system se usan correctamente (no hex hardcodeado)

DISEÑO
[ ] El theming (colores del consultorio) se aplica correctamente
[ ] El componente es responsive en desktop (1280px) y tablet (1024px)
[ ] Los estados de carga usan skeleton screens (no spinners centrales)
[ ] Los estados vacíos tienen ícono + mensaje + botón de acción

BASE DE DATOS
[ ] Las tablas del módulo están en el schema de Prisma con sus índices
[ ] La migración se puede ejecutar sin errores
[ ] Las políticas RLS del módulo están documentadas

SEGURIDAD
[ ] Las rutas del módulo están protegidas en middleware.ts
[ ] Los endpoints verifican el rol antes de ejecutar acciones restringidas
[ ] Los datos sensibles no se loguean en consola
```

-----

## SECCIÓN 5 — COMANDOS ÚTILES DE DESARROLLO

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Generar cliente Prisma después de cambiar el schema
npx prisma generate

# Crear y ejecutar migración de base de datos
npx prisma migrate dev --name nombre_de_la_migracion

# Abrir Prisma Studio (explorador visual de la BD)
npx prisma studio

# Verificar tipos TypeScript
npx tsc --noEmit

# Generar tipos de Supabase desde la BD
npx supabase gen types typescript --project-id [ID] > types/database.types.ts

# Build de producción
npm run build

# Deploy a Vercel
git push origin main  # Vercel hace el deploy automáticamente
```

-----

## SECCIÓN 6 — CHECKLIST FINAL ANTES DEL PRIMER DEPLOY

```
INFRAESTRUCTURA
[ ] Cuenta en Supabase creada y proyecto configurado
[ ] Cuenta en Vercel creada y repositorio conectado
[ ] Dominio toothx.app comprado en Namecheap y DNS apuntando a Vercel
[ ] SSL activo en Vercel (automático)
[ ] Variables de entorno configuradas en Vercel (Production + Preview)

BASE DE DATOS
[ ] Todas las migraciones de Prisma ejecutadas en la BD de producción
[ ] Row Level Security activado en todas las tablas
[ ] Políticas RLS creadas y probadas para todos los roles
[ ] Prueba de aislamiento multi-tenant ejecutada y exitosa
[ ] Índices críticos creados en la BD de producción

FUNCIONALIDAD
[ ] Flujo de onboarding completo funciona de extremo a extremo
[ ] Login estándar y login por voz funcionan
[ ] El theming del consultorio se aplica correctamente
[ ] El odontograma SVG renderiza correctamente en Chrome
[ ] El asistente de voz responde en Chrome y Edge
[ ] Las facturas se generan en PDF correctamente
[ ] El Estado de Resultados calcula correctamente con datos reales
[ ] Las notificaciones de email se envían (probar con cuenta de prueba Resend)
[ ] El aislamiento de tenants está verificado

SEGURIDAD
[ ] No hay claves API en el código fuente (solo en .env)
[ ] El .env.local NO está en el repositorio de Git (.gitignore actualizado)
[ ] Los endpoints de Super Admin están bloqueados para otros roles
[ ] Los datos clínicos (evoluciones, odontograma) no son accesibles por la secretaria

USABILIDAD
[ ] Una secretaria real puede agendar una cita en menos de 2 minutos
[ ] El odontólogo puede completar un odontograma por voz en menos de 3 minutos
[ ] El Admin puede ver el Estado de Resultados del mes en menos de 30 segundos
```

-----

*TOOTH X — Documento 8: Master Prompt Document · v1.0 · Mayo 2026*
*Esta es la documentación completa. El proyecto está listo para comenzar a codificar.*