# DOCUMENTO 4 — SITEMAP

## TOOTH X · Mapa del Sitio y Estructura de Rutas

-----

|Campo                  |Detalle  |
|-----------------------|---------|
|**Proyecto**           |TOOTH X  |
|**Versión**            |v1.0     |
|**Fecha del documento**|Mayo 2026|

-----

## GUÍA DE LECTURA

### Acceso por rol

|Ícono|Rol                                           |
|-----|----------------------------------------------|
|👑    |Super Admin TOOTH X                           |
|🦷    |Admin del Consultorio (Odontólogo propietario)|
|👨‍⚕️    |Odontólogo                                    |
|👩‍💼    |Secretaria                                    |

### Tipo de página

|Código |Tipo                                   |
|-------|---------------------------------------|
|`[PUB]`|Pública — accesible sin sesión iniciada|
|`[PRO]`|Protegida — requiere sesión activa     |
|`[ADM]`|Solo Admin del consultorio             |
|`[SUP]`|Solo Super Admin TOOTH X               |

-----

## ZONA 1 — PÁGINAS PÚBLICAS (sin sesión)

```
toothx.app/
│
├── / ...................... [PUB] Landing page de TOOTH X
│   Describe el producto, planes y precios.
│   Botones: "Crear mi consultorio" y "Iniciar sesión"
│
├── /registro .............. [PUB] Registro de nuevo consultorio
│   Formulario: nombre del consultorio, RUC, país, email, contraseña.
│   Solo para el primer usuario (Admin) de cada consultorio.
│
├── /login ................. [PUB] Inicio de sesión
│   Formulario: email + contraseña.
│   Botón de micrófono para login por voz (PIN de voz).
│   Enlace a recuperación de contraseña.
│
├── /recuperar-contrasena .. [PUB] Solicitud de recuperación
│   Formulario: ingresa el email registrado.
│   Sistema envía enlace de restablecimiento.
│
├── /nueva-contrasena ...... [PUB] Restablecer contraseña
│   Accesible solo con el token del email de recuperación.
│   Formulario: nueva contraseña + confirmación.
│
├── /activar-cuenta ........ [PUB] Activación de cuenta para usuarios invitados
│   Accesible solo con el token del email de invitación.
│   Formulario: nombre completo, contraseña, PIN de voz (opcional).
│
└── /404 ................... [PUB] Página no encontrada
    Diseño personalizado con botón "Ir al inicio".
```

-----

## ZONA 2 — ONBOARDING (primera vez del Admin)

```
toothx.app/onboarding/
│   Acceso: 👑🦷  Solo Admin del consultorio recién creado.
│   Redirige automáticamente al Dashboard al completarse.
│
├── /onboarding/paso-1 ..... Datos del consultorio
│   Nombre, RUC, dirección, teléfono, especialidad principal.
│
├── /onboarding/paso-2 ..... Identidad visual
│   Subir logo, elegir color primario, color secundario, tipografía.
│   Vista previa en tiempo real del tema aplicado.
│
├── /onboarding/paso-3 ..... Horarios de atención
│   Tabla de 7 días con activación y horas de apertura/cierre por día.
│   Duración por defecto de cada cita.
│
├── /onboarding/paso-4 ..... Crear usuarios del consultorio
│   Formulario repetible: nombre, email, rol.
│   Envío de invitación por email.
│
└── /onboarding/paso-5 ..... Configuración completada
    Resumen de la configuración.
    Botón "Ir al Dashboard".
```

-----

## ZONA 3 — APP PRINCIPAL (sesión activa, layout con sidebar)

> Todas las rutas de esta zona están protegidas.
> El sidebar y el header se cargan con el tema visual del consultorio activo.

-----

### 3.1 DASHBOARD

```
/dashboard ................. [PRO] 👑🦷👨‍⚕️👩‍💼  Dashboard principal
│
│   WIDGETS VISIBLES PARA TODOS:
│   ├── Citas del día (resumen: programadas, en curso, completadas)
│   ├── Próxima cita (nombre del paciente, hora, odontólogo)
│   └── Alertas de inventario (insumos en stock mínimo)
│
│   WIDGETS SOLO PARA ADMIN 🦷:
│   ├── Ingresos del día
│   ├── Ingresos del mes vs. mes anterior
│   ├── Facturas pendientes de cobro (cartera)
│   ├── Gráfico: ingresos por mes del año en curso
│   ├── Gráfico: citas por estado (torta)
│   └── Gráfico: top 5 tratamientos más realizados
```

-----

### 3.2 PACIENTES

```
/dashboard/patients ........ [PRO] 👑🦷👨‍⚕️👩‍💼  Listado de pacientes
│   Tabla paginada con búsqueda y filtros.
│   Botón "Nuevo paciente".
│
├── /dashboard/patients/new .. [PRO] 👑🦷👨‍⚕️👩‍💼  Registrar nuevo paciente
│   Formulario completo de registro.
│   Secciones: datos personales, contacto, antecedentes médicos.
│
└── /dashboard/patients/:id .. [PRO] 👑🦷👨‍⚕️👩‍💼  Ficha del paciente
    │   Encabezado con foto (opcional), nombre, documento, teléfono.
    │   Pestañas de navegación dentro de la ficha:
    │
    ├── [Pestaña] Datos personales
    │   Vista y edición de todos los datos del paciente.
    │   Acceso edición: 👑🦷👨‍⚕️👩‍💼
    │
    ├── [Pestaña] Historia clínica ............. 👑🦷👨‍⚕️  (no secretaria)
    │   │   Lista de evoluciones del paciente.
    │   │   Botón "Nueva evolución".
    │   │
    │   ├── /dashboard/patients/:id/evolutions/new
    │   │   Formulario de nueva evolución clínica.
    │   │   Campos: motivo, anamnesis, examen, diagnóstico,
    │   │           plan de tratamiento (tabla de ítems), notas, imágenes.
    │   │
    │   └── /dashboard/patients/:id/evolutions/:evolutionId
    │       Vista en modo lectura de la evolución.
    │       Botón "Editar" (solo creador o Admin).
    │
    ├── [Pestaña] Odontograma .................. 👑🦷👨‍⚕️  (no secretaria)
    │   SVG interactivo del odontograma adulto o pediátrico.
    │   Panel lateral de condiciones/tratamientos.
    │   Botón de micrófono para modo voz.
    │   Selector de fecha para ver estado histórico.
    │
    ├── [Pestaña] Facturación .................. 👑🦷👨‍⚕️👩‍💼
    │   │   Lista de facturas del paciente con estado y monto.
    │   │   Botón "Nueva factura".
    │   │
    │   └── /dashboard/patients/:id/invoices/:invoiceId
    │       Detalle de la factura, ítems, pagos y abonos.
    │       Botones: "Descargar PDF", "Imprimir", "Registrar abono".
    │
    └── [Pestaña] Documentos adjuntos .......... 👑🦷👨‍⚕️👩‍💼
        Lista de archivos adjuntos del paciente (radiografías, PDFs).
        Botón "Subir documento".
```

-----

### 3.3 AGENDA / CALENDARIO

```
/dashboard/appointments .... [PRO] 👑🦷👨‍⚕️👩‍💼  Calendario interactivo
│   Vista semanal por defecto.
│   Selector de vista: Diaria / Semanal / Mensual.
│   Filtro por odontólogo (si hay más de uno).
│   Botón "Nueva cita".
│
├── /dashboard/appointments?view=daily .. Vista diaria del calendario
│   Columna de horas con slots de 15 minutos.
│   Detalle de cada cita (paciente, motivo, duración).
│
├── /dashboard/appointments?view=weekly . Vista semanal del calendario (vista por defecto)
│   7 columnas (una por día) con slots de hora.
│   Drag & drop para mover citas.
│
├── /dashboard/appointments?view=monthly  Vista mensual del calendario
│   Grid mensual con puntos o íconos por cita.
│   Clic en un día abre la vista diaria de ese día.
│
└── /dashboard/appointments/:appointmentId  [PRO] 👑🦷👨‍⚕️👩‍💼  Detalle / edición de cita
    Panel lateral o modal con:
    - Datos de la cita (paciente, odontólogo, fecha, hora, motivo)
    - Selector de estado
    - Notas de la cita
    - Botones: "Editar", "Cancelar cita", "Ver ficha del paciente"
```

-----

### 3.4 FACTURACIÓN

```
/dashboard/billing ......... [PRO] 👑🦷👨‍⚕️👩‍💼  Listado general de facturas
│   Tabla con todas las facturas del consultorio.
│   Filtros: por fecha, por paciente, por estado (pendiente/parcial/pagada).
│   Buscador por nombre de paciente o número de factura.
│   Resumen de cartera total pendiente.
│
└── /dashboard/billing/:invoiceId  [PRO] 👑🦷👨‍⚕️👩‍💼  Detalle de factura
    Cabecera: número, fecha, datos del paciente.
    Tabla de ítems con cantidades y valores.
    Totales: subtotal, descuento, total.
    Historial de pagos y abonos.
    Botones: "Descargar PDF", "Imprimir", "Registrar abono", "Cancelar" (solo Admin).
```

-----

### 3.4B GESTIÓN FINANCIERA Y RENTABILIDAD

```
/dashboard/finance ......... [ADM] 👑🦷  Solo Admin del consultorio
│   Vista principal: resumen del mes actual
│   Tarjetas: ingresos, gastos totales, resultado neto, margen
│   Acceso rápido a registrar gasto y ver el Estado de Resultados
│
├── /dashboard/finance/expenses  [ADM] 👑🦷  Listado de gastos
│   │   Tabla de todos los gastos del consultorio.
│   │   Filtros: por mes, por categoría, por tipo (fijo/variable).
│   │   Indicador de gastos recurrentes activos.
│   │   Botón "Registrar gasto".
│   │
│   └── /dashboard/finance/expenses/new
│       Formulario de registro de gasto:
│       tipo (fijo/variable), categoría, descripción, monto, fecha.
│       Toggle: "Gasto recurrente mensual".
│       Campo opcional: vincular a paciente/tratamiento (para laboratorio dental).
│
└── /dashboard/finance/income-statement  [ADM] 👑🦷  Estado de Resultados (P&L)
    │   Selector de período: mes/año o rango de fechas.
    │   Estado de Resultados completo y desglosado:
    │   ingresos, costos directos, utilidad bruta,
    │   gastos fijos, gastos variables, depreciación, resultado neto.
    │   Indicador visual: ✅ GANANCIA / ❌ PÉRDIDA con margen %.
    │   Gráfico de torta: desglose de gastos por categoría.
    │   Gráfico de línea doble: ingresos vs. gastos (últimos 12 meses).
    │   Botón "Exportar PDF".
    │
    └── /dashboard/finance/income-statement?comparison=true
        Vista comparativa: dos columnas lado a lado.
        Mes seleccionado vs. mes anterior.
        Variaciones porcentuales por rubro (▲ / ▼).
```

-----

### 3.5 INVENTARIO

```
/dashboard/inventory ....... [PRO] 👑🦷👨‍⚕️👩‍💼  Módulo de inventario
│   Dos pestañas principales: Equipos e Insumos.
│
├── [Pestaña] Equipos ...... [PRO] 👑🦷  (lectura para odontólogo y secretaria)
│   │   Tabla de equipos con nombre, estado y valor actual en libros.
│   │   Botón "Nuevo equipo" (solo Admin 👑🦷).
│   │
│   └── /dashboard/inventory/equipment/:equipmentId
│       Ficha del equipo:
│       - Datos técnicos (marca, modelo, serial)
│       - Datos de compra (fecha, valor, proveedor)
│       - Depreciación: tabla año a año con valor en libros
│       - Estado del equipo
│       Botón "Editar" (solo Admin).
│
├── [Pestaña] Insumos ...... [PRO] 👑🦷👨‍⚕️👩‍💼
│   │   Tabla de insumos con nombre, stock actual y alerta si está en mínimo.
│   │   Botón "Nuevo insumo" (solo Admin 👑🦷).
│   │
│   └── /dashboard/inventory/supplies/:supplyId
│       Ficha del insumo:
│       - Datos del insumo (categoría, unidad, stock mínimo, precio)
│       - Stock actual con indicador visual
│       - Historial de movimientos (entradas y salidas)
│       Botones: "Registrar entrada", "Registrar salida" (solo Admin 👑🦷).
│
└── [Pestaña] Reportes ..... [ADM] 👑🦷  Solo Admin
    Reporte de inventario valorizado de insumos.
    Tabla de depreciación acumulada de equipos.
    Exportar a PDF.
```

-----

### 3.6 CONFIGURACIÓN DEL CONSULTORIO

```
/dashboard/settings ........ [ADM] 👑🦷  Solo Admin del consultorio
│
├── [Sección] Datos del consultorio
│   Nombre, RUC, dirección, teléfono, especialidad.
│   Botón "Guardar cambios".
│
├── [Sección] Identidad visual (Marca)
│   Subir/cambiar logo.
│   Selector de color primario (con color picker).
│   Selector de color secundario.
│   Selector de tipografía.
│   Vista previa en tiempo real del tema.
│   Botón "Guardar y aplicar tema".
│
├── [Sección] Horarios de atención
│   Tabla de días con activación, hora inicio y hora fin.
│   Duración por defecto de las citas.
│   Botón "Guardar horarios".
│
├── [Sección] Usuarios y roles
│   Tabla de usuarios activos del consultorio con su rol.
│   Botón "Invitar usuario".
│   Por cada usuario: "Editar rol", "Desactivar".
│
├── [Sección] Notificaciones
│   Toggle para activar/desactivar cada tipo de notificación:
│   - Email de confirmación de cita
│   - Email de recordatorio 24h
│   - WhatsApp de confirmación
│   - WhatsApp de recordatorio 24h
│   - WhatsApp de recordatorio 2h
│   Configuración del número de WhatsApp Business.
│
└── [Sección] Suscripción
    Plan actual, fecha de renovación, historial de pagos.
    Botón "Cambiar plan".
```

-----

### 3.7 PERFIL PERSONAL DEL USUARIO

```
/dashboard/profile ......... [PRO] 👑🦷👨‍⚕️👩‍💼  Perfil del usuario activo
│
├── [Sección] Datos personales
│   Nombre completo, foto de perfil, especialidad (para odontólogos).
│   Botón "Guardar cambios".
│
├── [Sección] Seguridad
│   Cambiar contraseña (requiere contraseña actual).
│   Configurar / cambiar PIN de voz (4 dígitos).
│   Botón "Guardar".
│
└── [Sección] Preferencias
    Idioma (Español por ahora).
    Zona horaria.
```

-----

## ZONA 4 — SUPER ADMIN TOOTH X

> Zona exclusiva del operador del SaaS. Completamente separada de los consultorios.

```
/super-admin ............... [SUP] 👑  Solo Super Admin TOOTH X
│
├── /super-admin/dashboard
│   Métricas globales de la plataforma:
│   consultorios activos, usuarios totales, suscripciones activas,
│   ingresos del mes, consultorios nuevos en el período.
│
├── /super-admin/consultorios
│   │   Lista de todos los consultorios registrados.
│   │   Filtros: por país, por plan, por estado (activo/inactivo).
│   │
│   └── /super-admin/consultorios/:tenantId
│       Ficha del consultorio:
│       - Datos del consultorio y del admin principal
│       - Plan contratado y fecha de vencimiento
│       - Historial de pagos
│       - Botones: "Suspender consultorio", "Cambiar plan"
│       ⚠️ El Super Admin NO puede ver datos clínicos del consultorio.
│
├── /super-admin/planes
│   Gestión de planes disponibles (nombre, precio, límites).
│   Botón "Nuevo plan".
│
└── /super-admin/configuracion
    Configuración global de la plataforma TOOTH X:
    - Cuotas de servicios (Resend, WhatsApp)
    - Configuración de emails transaccionales
    - Parámetros globales del sistema
```

-----

## RESUMEN DE RUTAS POR MÓDULO

|Módulo            |Rutas                 |Roles con acceso         |
|------------------|----------------------|-------------------------|
|Páginas públicas  |7 rutas               |Todos (sin sesión)       |
|Onboarding        |5 rutas               |Admin                    |
|Dashboard         |1 ruta                |Todos                    |
|Pacientes         |5+ rutas              |Todos (con restricciones)|
|Agenda            |4 rutas               |Todos                    |
|Facturación       |2 rutas               |Todos                    |
|Gestión Financiera|4 rutas               |Solo Admin               |
|Inventario        |5+ rutas              |Todos (Admin gestiona)   |
|Configuración     |1 ruta con 6 secciones|Solo Admin               |
|Perfil            |1 ruta con 3 secciones|Todos                    |
|Super Admin       |5 rutas               |Solo Super Admin         |
|**Total**         |**~40 rutas**         |                         |

-----

## REGLAS DE NAVEGACIÓN Y REDIRECCIONES

```
Usuario sin sesión intenta acceder a /dashboard
  → Redirige a /login

Usuario con sesión intenta acceder a /login
  → Redirige a /dashboard

Admin recién registrado sin completar onboarding
  → Redirige a /onboarding/paso-1

Secretaria intenta acceder a /configuracion
  → Redirige a /dashboard con mensaje "No tienes permiso para esta sección"

Odontólogo intenta acceder a /super-admin
  → Redirige a /dashboard

Enlace de invitación expirado
  → Redirige a /login con mensaje "El enlace ha expirado"

Ruta inexistente (/cualquier-cosa-que-no-existe)
  → Muestra página /404

Sesión expirada mientras el usuario navega
  → Redirige a /login con mensaje "Tu sesión expiró, inicia sesión de nuevo"
  → Tras login, redirige de vuelta a la última ruta visitada
```

-----

## COMPORTAMIENTO DEL SIDEBAR POR ROL

El sidebar de navegación muestra u oculta ítems según el rol del usuario activo:

```
SIDEBAR — ADMIN (🦷) y ODONTÓLOGO (👨‍⚕️):
  ├── 📊 Dashboard
  ├── 👥 Pacientes
  ├── 📅 Agenda
  ├── 🧾 Facturación
  ├── 💰 Gestión Financiera  (solo Admin 🦷)
  ├── 📦 Inventario
  └── ⚙️ Configuración (solo Admin 🦷)

SIDEBAR — SECRETARIA (👩‍💼):
  ├── 📊 Dashboard
  ├── 👥 Pacientes
  ├── 📅 Agenda
  └── 🧾 Facturación
  [Gestión Financiera, Inventario e Historia Clínica no aparecen]

SIDEBAR — SUPER ADMIN (👑):
  ├── 📊 Panel global
  ├── 🏥 Consultorios
  ├── 💳 Planes
  └── ⚙️ Configuración global
  [No tiene acceso al contenido clínico de ningún consultorio]
```

-----

## PÁGINA 404 PERSONALIZADA

```
/404
  Mensaje: "Esta página no existe o no tienes acceso a ella."
  Ícono: diente con interrogación (coherente con la marca)
  Botón primario: "Ir al Dashboard"
  Botón secundario: "Volver atrás"
```

-----

*TOOTH X — Documento 4: Sitemap · v1.0 · Mayo 2026*
*Próximo documento: Design System completo (Documento 5)*