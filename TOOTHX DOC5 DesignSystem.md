# DOCUMENTO 5 — DESIGN SYSTEM

## TOOTH X · Sistema de Diseño Completo

-----

|Campo                           |Detalle                             |
|--------------------------------|------------------------------------|
|**Proyecto**                    |TOOTH X                             |
|**Versión**                     |v1.0                                |
|**Fecha del documento**         |Mayo 2026                           |
|**Framework de estilos**        |Tailwind CSS + CSS Custom Properties|
|**Librería de componentes base**|shadcn/ui                           |

-----

## 1. FILOSOFÍA DE DISEÑO

TOOTH X debe transmitir **tres valores visuales en simultáneo:**

|Valor                     |Qué significa en la interfaz                                                                            |
|--------------------------|--------------------------------------------------------------------------------------------------------|
|**Confianza clínica**     |Colores fríos y neutros, espaciado generoso, sin distracciones visuales durante la atención             |
|**Modernidad profesional**|Tipografía limpia, bordes suaves, iconografía consistente, sin ornamentos innecesarios                  |
|**Claridad operativa**    |La información más importante siempre visible primero, jerarquía visual clara, estados siempre indicados|

### Principios de diseño

1. **Funcional primero:** cada elemento existe porque cumple una función, no por decoración.
1. **Densidad controlada:** suficiente información en pantalla para que el odontólogo no pierda contexto, pero sin saturar.
1. **Accesible bajo presión:** el odontólogo usa la app mientras atiende. Botones tocables fácilmente, textos legibles desde distancia de brazo extendido en tablet.
1. **Personalizable sin romper:** el theming permite que cada consultorio cambie colores, logo y tipografía sin que ningún componente se vea roto.
1. **Sin modo oscuro en v1.0:** se implementará en v2.0. Todo el sistema asume fondo claro.

-----

## 2. SISTEMA DE COLOR

### 2.1 Variables CSS globales (tokens de color)

Todas las variables se definen en `:root` y son sobreescritas por JavaScript al cargar el perfil del tenant. Esto habilita el theming dinámico por consultorio.

```css
:root {
  /* ── Colores de marca (personalizables por tenant) ── */
  --color-primary:          #1D4ED8;   /* Azul TOOTH X por defecto */
  --color-primary-hover:    #1E40AF;   /* 10% más oscuro para hover */
  --color-primary-light:    #DBEAFE;   /* Fondo de elementos destacados */
  --color-primary-text:     #1E3A8A;   /* Texto sobre fondo primary-light */

  --color-secondary:        #0F766E;   /* Teal clínico por defecto */
  --color-secondary-hover:  #0D6B63;
  --color-secondary-light:  #CCFBF1;

  /* ── Colores de superficie (NO personalizables) ── */
  --color-bg:               #FFFFFF;   /* Fondo de tarjetas y modales */
  --color-surface:          #F8FAFC;   /* Fondo general de la app */
  --color-surface-hover:    #F1F5F9;   /* Hover sobre filas o items */
  --color-border:           #E2E8F0;   /* Bordes de inputs y tarjetas */
  --color-border-strong:    #CBD5E1;   /* Bordes de separadores */

  /* ── Colores de texto (NO personalizables) ── */
  --color-text-primary:     #0F172A;   /* Texto principal */
  --color-text-secondary:   #475569;   /* Texto secundario, labels */
  --color-text-disabled:    #94A3B8;   /* Texto deshabilitado */
  --color-text-inverse:     #FFFFFF;   /* Texto sobre fondos oscuros */

  /* ── Colores de estado (NO personalizables) ── */
  --color-success:          #16A34A;
  --color-success-light:    #DCFCE7;
  --color-success-text:     #14532D;

  --color-warning:          #CA8A04;
  --color-warning-light:    #FEF9C3;
  --color-warning-text:     #713F12;

  --color-danger:           #DC2626;
  --color-danger-light:     #FEE2E2;
  --color-danger-text:      #7F1D1D;

  --color-info:             #0284C7;
  --color-info-light:       #E0F2FE;
  --color-info-text:        #0C4A6E;

  /* ── Sidebar ── */
  --color-sidebar-bg:       #0F172A;
  --color-sidebar-text:     #94A3B8;
  --color-sidebar-active:   #FFFFFF;
  --color-sidebar-hover:    rgba(255,255,255,0.06);
  --color-sidebar-active-bg:rgba(255,255,255,0.10);
}
```

### 2.2 Aplicación del theming por tenant

```typescript
// lib/theme/applyTenantTheme.ts
export function applyTenantTheme(tenant: Tenant) {
  const root = document.documentElement;
  root.style.setProperty('--color-primary', tenant.primary_color);
  root.style.setProperty('--color-primary-hover', darken(tenant.primary_color, 10));
  root.style.setProperty('--color-primary-light', lighten(tenant.primary_color, 85));
  root.style.setProperty('--color-primary-text', darken(tenant.primary_color, 30));
  root.style.setProperty('--color-secondary', tenant.secondary_color);
  root.style.setProperty('--color-secondary-hover', darken(tenant.secondary_color, 10));
  root.style.setProperty('--color-secondary-light', lighten(tenant.secondary_color, 85));
  root.style.setProperty('--font-family', tenant.font_family);
}
```

### 2.3 Colores de estados de cita (calendario)

|Estado    |Fondo         |Texto          |Hex fondo            |
|----------|--------------|---------------|---------------------|
|Programada|Azul claro    |Azul oscuro    |`#DBEAFE` / `#1E3A8A`|
|Confirmada|Verde claro   |Verde oscuro   |`#DCFCE7` / `#14532D`|
|En curso  |Amarillo claro|Amarillo oscuro|`#FEF9C3` / `#713F12`|
|Completada|Gris claro    |Gris oscuro    |`#F1F5F9` / `#334155`|
|Cancelada |Rojo claro    |Rojo oscuro    |`#FEE2E2` / `#7F1D1D`|
|No asistió|Naranja claro |Naranja oscuro |`#FFEDD5` / `#7C2D12`|
|Bloqueado |Gris medio    |Blanco         |`#64748B` / `#FFFFFF`|

### 2.4 Colorimetría del odontograma (estándar clínico)

|Condición           |Color         |Hex      |Aplicación en SVG                  |
|--------------------|--------------|---------|-----------------------------------|
|Caries              |Rojo          |`#EF4444`|Fill de la superficie afectada     |
|Obturación          |Azul          |`#3B82F6`|Fill de la superficie restaurada   |
|Corona              |Dorado        |`#F59E0B`|Contorno y fill completo del diente|
|Diente ausente      |Gris oscuro   |`#475569`|Fill completo + X encima           |
|Fractura            |Naranja       |`#F97316`|Línea diagonal sobre la superficie |
|Implante            |Verde         |`#10B981`|Fill completo con ícono especial   |
|Endodoncia          |Morado        |`#8B5CF6`|Punto central en la raíz           |
|Sellante            |Celeste       |`#38BDF8`|Fill semitransparente              |
|Prótesis parcial    |Café          |`#92400E`|Contorno especial                  |
|Sano                |Gris muy claro|`#F1F5F9`|Fill base de todas las superficies |
|Previsualización voz|Amarillo      |`#FCD34D`|Fill temporal antes de confirmar   |

### 2.5 Colores del Dashboard financiero

|Indicador                        |Color        |Hex                   |
|---------------------------------|-------------|----------------------|
|Ganancia / Resultado positivo    |Verde        |`#16A34A`             |
|Pérdida / Resultado negativo     |Rojo         |`#DC2626`             |
|Ingresos (línea de gráfico)      |Azul primario|`var(--color-primary)`|
|Gastos totales (línea de gráfico)|Rojo suave   |`#F87171`             |
|Depreciación (segmento torta)    |Gris         |`#94A3B8`             |
|Insumos consumidos (segmento)    |Naranja      |`#FB923C`             |
|Laboratorio dental (segmento)    |Morado       |`#A78BFA`             |
|Gastos fijos (segmento)          |Azul grisáceo|`#60A5FA`             |
|Gastos variables (segmento)      |Teal         |`#2DD4BF`             |

-----

## 3. TIPOGRAFÍA

### 3.1 Familias tipográficas

**Fuente por defecto:** `Inter` (Google Fonts)
**Fuentes opcionales para tenants:** `Plus Jakarta Sans`, `Nunito`, `Poppins`, `DM Sans`

```css
:root {
  --font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

> `--font-mono` se usa exclusivamente para valores numéricos de métricas y montos en facturas, garantizando alineación visual de los dígitos.

### 3.2 Escala tipográfica

|Token Tailwind|Tamaño|Line Height|Peso(s) |Uso                                  |
|--------------|------|-----------|--------|-------------------------------------|
|`text-xs`     |11px  |16px       |400, 500|Timestamps, etiquetas mínimas        |
|`text-sm`     |13px  |18px       |400, 500|Texto de apoyo, captions, tooltips   |
|`text-base`   |15px  |22px       |400     |Cuerpo de texto general              |
|`text-md`     |16px  |24px       |500, 600|Labels de formulario, texto destacado|
|`text-lg`     |18px  |26px       |600     |Subtítulos de sección                |
|`text-xl`     |22px  |30px       |700     |Títulos de módulo                    |
|`text-2xl`    |28px  |36px       |700     |Títulos de página                    |
|`text-3xl`    |36px  |44px       |700, 800|Cifras clave en Dashboard            |
|`text-4xl`    |48px  |56px       |800     |Solo pantallas de bienvenida         |

### 3.3 Reglas tipográficas

- Máximo 2 pesos tipográficos distintos en la misma tarjeta.
- Montos de dinero y números de métricas: siempre `font-mono`.
- Botones: siempre `font-semibold` (600) y `text-sm` (13px).
- Placeholders de inputs: `text-sm` con `color-text-disabled`.
- Nombre del consultorio en sidebar: `text-md font-bold color-sidebar-active`.

-----

## 4. SISTEMA DE ESPACIADO

Sistema basado en **múltiplos de 4px** (escala de 8 puntos con medios pasos).

|Token Tailwind |Valor|Uso típico                                                   |
|---------------|-----|-------------------------------------------------------------|
|`p-1` / `gap-1`|4px  |Separación mínima entre elementos inline                     |
|`p-2` / `gap-2`|8px  |Padding de badges y chips                                    |
|`p-3` / `gap-3`|12px |Gap entre ícono y texto en navegación                        |
|`p-4` / `gap-4`|16px |Padding horizontal de inputs, gap entre campos               |
|`p-5` / `gap-5`|20px |Padding de tarjetas pequeñas, gap del grid del Dashboard     |
|`p-6` / `gap-6`|24px |Padding estándar de tarjetas, padding del contenido principal|
|`p-8`          |32px |Separación entre secciones de una página                     |
|`p-10`         |40px |Padding vertical de modales                                  |
|`p-12`         |48px |Separación entre bloques de contenido principales            |
|`p-16`         |64px |Altura del header / margen superior del contenido            |

-----

## 5. GRILLAS Y LAYOUT

### 5.1 Estructura general de la app

```
┌───────────────────────────────────────────────────────────┐
│ SIDEBAR 260px (fijo) │  HEADER sticky 64px                │
│                      │─────────────────────────────────── │
│  Logo consultorio    │  BREADCRUMB 40px                   │
│  ─────────────────   │─────────────────────────────────── │
│  📊 Dashboard        │                                    │
│  👥 Pacientes        │  CONTENIDO PRINCIPAL               │
│  📅 Agenda      ▌   │  max-width: 1280px, centrado       │
│  🧾 Facturación      │  padding: 24px                     │
│  💰 Finanzas         │                                    │
│  📦 Inventario       │                                    │
│  ─────────────────   │                                    │
│  ⚙️ Configuración    │                                    │
│  👤 Dr. Carlos       │                                    │
└───────────────────────────────────────────────────────────┘
```

### 5.2 Grid del contenido principal

|Contexto                       |Columnas desktop|Columnas tablet|Gap |
|-------------------------------|----------------|---------------|----|
|Dashboard — widgets de métricas|4 col           |2 col          |20px|
|Dashboard — gráficos           |2 col (60/40)   |1 col          |20px|
|Formularios estándar           |2 col           |1 col          |16px|
|Tabla + panel detalle lateral  |60% / 40%       |100% (apilado) |—   |
|Ficha de paciente (pestañas)   |1 col completa  |1 col          |—   |

### 5.3 Breakpoints responsivos

|Nombre|Ancho mínimo|Dispositivo                                  |
|------|------------|---------------------------------------------|
|`sm`  |640px       |Tablet vertical                              |
|`md`  |768px       |Tablet horizontal                            |
|`lg`  |1024px      |Laptop / tablet grande ← **mínimo soportado**|
|`xl`  |1280px      |Desktop estándar                             |
|`2xl` |1536px      |Desktop grande                               |

En pantallas menores a `lg` (1024px) el sidebar se convierte en menú drawer con overlay.

-----

## 6. COMPONENTES UI

### 6.1 Botones

**Variantes y especificaciones:**

|Variante       |Background       |Borde                        |Texto                   |Hover                  |
|---------------|-----------------|-----------------------------|------------------------|-----------------------|
|Primario       |`--color-primary`|Ninguno                      |Blanco                  |`--color-primary-hover`|
|Secundario     |Transparente     |`1.5px solid --color-primary`|`--color-primary`       |`--color-primary-light`|
|Ghost          |Transparente     |Ninguno                      |`--color-text-secondary`|`--color-surface-hover`|
|Peligro        |`--color-danger` |Ninguno                      |Blanco                  |`#B91C1C`              |
|Peligro outline|Transparente     |`1.5px solid --color-danger` |`--color-danger`        |`--color-danger-light` |

**Tamaños:**

|Tamaño        |Padding    |Font|Altura|Radius|Uso                       |
|--------------|-----------|----|------|------|--------------------------|
|`sm`          |`6px 12px` |12px|30px  |6px   |Acciones dentro de tablas |
|`md` (default)|`10px 20px`|13px|38px  |8px   |Uso general               |
|`lg`          |`12px 24px`|14px|44px  |8px   |CTAs principales de página|
|`icon`        |`8px`      |—   |36px  |8px   |Solo ícono, sin texto     |

**Reglas:**

- El botón primario de cada formulario va siempre a la **derecha**.
- El botón cancelar va siempre a la **izquierda** del botón primario.
- Los botones destructivos requieren siempre un diálogo de confirmación.
- Estado `disabled`: opacidad 50%, cursor `not-allowed`.
- Estado `loading`: texto reemplazado por spinner del mismo tamaño del texto.

-----

### 6.2 Inputs y Campos de Formulario

**Especificación del input estándar:**

```css
border: 1.5px solid var(--color-border);
border-radius: 8px;
padding: 10px 14px;
height: 42px;
font-size: 14px;
background: var(--color-bg);
transition: border-color 150ms, box-shadow 150ms;

/* Focus */
border-color: var(--color-primary);
box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent);

/* Error */
border-color: var(--color-danger);
box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-danger) 15%, transparent);

/* Disabled */
background: var(--color-surface);
color: var(--color-text-disabled);
cursor: not-allowed;
```

**Componentes de formulario disponibles:**

|Componente   |Descripción                               |Altura|
|-------------|------------------------------------------|------|
|`Input`      |Texto de una línea                        |42px  |
|`Textarea`   |Texto multilínea (mín 3 filas)            |auto  |
|`Select`     |Lista desplegable                         |42px  |
|`Combobox`   |Select con búsqueda en tiempo real        |42px  |
|`DatePicker` |Selector de fecha con calendario emergente|42px  |
|`TimePicker` |Selector de hora hh:mm                    |42px  |
|`ColorPicker`|Selector de color HEX (theming)           |42px  |
|`Toggle`     |Switch on/off                             |24px  |
|`Checkbox`   |Casilla individual                        |18px  |
|`RadioGroup` |Selección única de grupo                  |18px  |
|`FileUpload` |Zona drag & drop para archivos            |80px  |

**Anatomía de un campo de formulario:**

```
[Label visible] *              ← text-sm font-medium (asterisco rojo si obligatorio)
[Input / Select / Textarea]
[Texto de ayuda opcional]      ← text-xs color-text-secondary
[Mensaje de error]             ← text-xs color-danger (solo si hay error)
```

**Reglas de formularios:**

- Todos los campos tienen su label visible arriba, nunca solo placeholder.
- Los mensajes de error aparecen debajo del campo, no como alerta global.
- Formularios de más de 6 campos se dividen en secciones con subtítulos.
- El botón de guardar se activa solo cuando los campos obligatorios están completos.

-----

### 6.3 Tarjetas (Cards)

**Card estándar:**

```css
background: var(--color-bg);
border: 1px solid var(--color-border);
border-radius: 12px;
padding: 20px 24px;
box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
```

**Variantes:**

|Variante             |Diferencia visual                        |Uso                          |
|---------------------|-----------------------------------------|-----------------------------|
|`card-default`       |Estándar                                 |Contenedor general           |
|`card-metric`        |Borde izquierdo 4px en `--color-primary` |Tarjetas del Dashboard       |
|`card-metric-success`|Borde izquierdo 4px verde                |Ganancia / resultado positivo|
|`card-metric-danger` |Borde izquierdo 4px rojo                 |Pérdida / resultado negativo |
|`card-alert`         |Fondo `warning-light`, borde `warning`   |Alertas de stock, cartera    |
|`card-patient`       |Hover con `surface-hover`, cursor pointer|Listado de pacientes         |

**Anatomía de tarjeta de métrica (Dashboard):**

```
┌──────────────────────────────────────────┐
│ ░  [Ícono 20px]  Título de la métrica   │  ← text-sm color-text-secondary
│                                          │
│   S/. 4,280                              │  ← text-3xl font-extrabold font-mono
│                                          │
│   ▲ +12% vs mes anterior                │  ← text-xs color-success
└──────────────────────────────────────────┘
  ↑ Borde izquierdo 4px --color-primary
```

-----

### 6.4 Tablas

```css
/* Encabezados */
thead th {
  background: var(--color-surface);
  padding: 12px 16px;
  font-weight: 600;
  font-size: 12px;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  border-bottom: 1px solid var(--color-border);
}

/* Filas */
tbody tr { border-bottom: 1px solid var(--color-border); }
tbody tr:hover { background: var(--color-surface-hover); }
tbody td { padding: 14px 16px; vertical-align: middle; }
```

**Reglas de tablas:**

- Primera columna: nombre/identificador en `font-medium`.
- Columnas de monto y número: alineadas a la **derecha** con `font-mono`.
- Columnas de estado: siempre usan un Badge de color.
- Paginación de 20 ítems por página en tablas largas.
- Estado vacío obligatorio: ícono + mensaje + botón de acción.

-----

### 6.5 Badges de Estado

```css
badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}
```

**Catálogo completo:**

|Badge     |Fondo    |Texto    |
|----------|---------|---------|
|Programada|`#DBEAFE`|`#1E3A8A`|
|Confirmada|`#DCFCE7`|`#14532D`|
|En curso  |`#FEF9C3`|`#713F12`|
|Completada|`#F1F5F9`|`#334155`|
|Cancelada |`#FEE2E2`|`#7F1D1D`|
|No asistió|`#FFEDD5`|`#7C2D12`|
|Pagado    |`#DCFCE7`|`#14532D`|
|Parcial   |`#FEF9C3`|`#713F12`|
|Pendiente |`#FEE2E2`|`#7F1D1D`|
|Ganancia ✅|`#DCFCE7`|`#14532D`|
|Pérdida ❌ |`#FEE2E2`|`#7F1D1D`|
|Admin     |`#EDE9FE`|`#4C1D95`|
|Odontólogo|`#DBEAFE`|`#1E3A8A`|
|Secretaria|`#FCE7F3`|`#831843`|
|Stock bajo|`#FEE2E2`|`#7F1D1D`|

-----

### 6.6 Modales

```css
/* Overlay */
position: fixed; inset: 0;
background: rgba(15,23,42,0.45);
backdrop-filter: blur(2px);

/* Contenedor */
background: var(--color-bg);
border-radius: 16px;
padding: 32px;
box-shadow: 0 20px 60px rgba(0,0,0,0.15);
max-height: 90vh;
overflow-y: auto;
```

**Tamaños:**

|Tamaño|Ancho máx|Uso                                      |
|------|---------|-----------------------------------------|
|`sm`  |400px    |Confirmaciones                           |
|`md`  |560px    |Formularios estándar (cita, gasto)       |
|`lg`  |760px    |Formularios complejos (evolución clínica)|
|`xl`  |900px    |Odontograma interactivo                  |

**Anatomía:**

```
┌──────────────────────────────────────────┐
│  Título del modal              [X cerrar] │  ← Header (border-bottom)
│──────────────────────────────────────────│
│  Contenido (formulario / vista)          │  ← Body (overflow-y: auto)
│──────────────────────────────────────────│
│  [Cancelar]          [Botón primario]    │  ← Footer (border-top, sticky)
└──────────────────────────────────────────┘
```

-----

### 6.7 Toasts y Alertas

**Toasts:** Esquina inferior derecha, duración 4 segundos, con botón de cierre manual.

|Tipo       |Ícono        |Color   |Ejemplo de mensaje                       |
|-----------|-------------|--------|-----------------------------------------|
|Éxito      |CheckCircle2 |Verde   |“Cita guardada correctamente”            |
|Error      |XCircle      |Rojo    |“No se pudo guardar. Intenta de nuevo.”  |
|Advertencia|AlertTriangle|Amarillo|“Stock de [insumo] por debajo del mínimo”|
|Info       |Info         |Azul    |“Se registraron 3 gastos recurrentes”    |

-----

### 6.8 Sidebar de Navegación

```
┌──────────────────────────────┐
│ [LOGO]  Nombre Consultorio   │  ← 64px altura
│──────────────────────────────│
│  📊  Dashboard               │  ← ítem inactivo
│  👥  Pacientes               │
│ ▌💰  Gestión Financiera      │  ← ítem ACTIVO
│  📅  Agenda                  │
│  🧾  Facturación             │
│  📦  Inventario              │
│──────────────────────────────│
│  ⚙️  Configuración           │
│  👤  Dr. Carlos · Admin      │
│  [→] Cerrar sesión           │
└──────────────────────────────┘
```

```css
sidebar { width: 260px; background: var(--color-sidebar-bg); }
sidebar.collapsed { width: 64px; }

nav-item.active {
  background: var(--color-sidebar-active-bg);
  color: var(--color-sidebar-active);
  border-left: 3px solid var(--color-primary);
  padding-left: 17px;
}
```

-----

### 6.9 Header Principal

```
┌──────────────────────────────────────────────────────────────┐
│ [☰]  Gestión Financiera              [🎤]  [🔔 2]  [▾ Dr.Carlos] │
│       Dashboard › Gestión Financiera                         │
└──────────────────────────────────────────────────────────────┘
```

|Elemento         |Detalle                                                         |
|-----------------|----------------------------------------------------------------|
|`☰`              |Colapsar/expandir sidebar                                       |
|Título del módulo|`text-xl font-bold`                                             |
|Breadcrumb       |`text-sm color-text-secondary` con separadores `›`              |
|`🎤`              |Botón asistente de voz. Pulsa en rojo cuando escucha activamente|
|`🔔`              |Campana de notificaciones con badge de conteo                   |
|Avatar           |Foto + nombre → menú desplegable: Perfil / Cerrar sesión        |

-----

### 6.10 Calendario Interactivo

**Vista semanal (principal):**

```
┌────────┬──────────┬──────────┬──────────┬──────────┐
│        │  LUN 19  │  MAR 20  │  MIÉ 21  │  JUE 22  │
│  8:00  │          │          │          │          │
│  8:30  │ ▓▓▓▓▓▓▓  │          │          │          │
│  9:00  │ Ana T.   │          │ ▓▓▓▓▓▓▓  │          │
│  9:30  │ Conducto │          │ Luis G.  │          │
│ 10:00  │          │ ▓▓▓▓▓▓▓  │ Limpieza │          │
└────────┴──────────┴──────────┴──────────┴──────────┘
```

**Especificaciones:**

- Altura mínima por slot de cita: 40px
- Slots fuera del horario de atención: fondo `#F8FAFC`
- Línea de hora actual: línea roja horizontal con punto circular
- Día actual: número con fondo `--color-primary`, texto blanco
- Hover sobre cita: sombra leve, cursor pointer

-----

### 6.11 Odontograma SVG

**Layout del componente:**

```
┌─────────────────────────────────────────────────────────┐
│  [Adulto] [Pediátrico]         [🎤 Modo voz] [Historial]│
│─────────────────────────────────────────────────────────│
│  18 17 16 15 14 13 12 11 │ 21 22 23 24 25 26 27 28      │
│  ───────────────────────────────────────────────────    │
│  48 47 46 45 44 43 42 41 │ 31 32 33 34 35 36 37 38      │
│─────────────────────────────────────────────────────────│
│  [PANEL] Diente 16 seleccionado                         │
│  Superficies: [Oclusal ✓] [Vestibular] [Palatino]...    │
│  Condición:  ● Caries  ○ Obturación  ○ Corona...        │
│  [Guardar hallazgo]                                     │
└─────────────────────────────────────────────────────────┘
```

**Cada diente SVG:**

- Tamaño base: 36×48px (corona + raíz)
- Seleccionado: contorno 2px `--color-primary` + escala 102%
- 5 zonas de superficie clicables independientes en la corona
- Número del diente debajo: `text-xs font-mono color-text-secondary`

**Barra de confirmación de voz:**

```
┌─────────────────────────────────────────────────────────┐
│ 🦷  Diente 16 · Oclusal · Caries        [Confirmar] [✕] │
└─────────────────────────────────────────────────────────┘
```

- Fondo: `--color-primary-light`
- Borde superior: 3px `--color-primary`
- Posición: sticky en la parte inferior del componente

-----

### 6.12 Estado de Resultados (P&L)

El Estado de Resultados tiene su propio diseño visual para facilitar la lectura financiera:

```
┌──────────────────────────────────────────────────────────┐
│  ESTADO DE RESULTADOS · Mayo 2026          [Exportar PDF] │
│  Consultorio Belleza Orofacial                           │
│──────────────────────────────────────────────────────────│
│  (+) INGRESOS                                            │
│      Facturación cobrada              S/. 8,400  ────── │
│                          TOTAL INGRESOS  S/. 8,400       │
│                                                          │
│  (-) COSTOS DIRECTOS                                     │
│      Insumos consumidos  (auto)       S/.   320          │
│      Laboratorio dental               S/.   850          │
│                                       ─────────         │
│                         UTILIDAD BRUTA  S/. 7,230  86%   │
│                                                          │
│  (-) GASTOS FIJOS                                        │
│      Arriendo                         S/. 1,200          │
│      Sueldo secretaria                S/. 1,500          │
│      Servicios públicos               S/.   180          │
│                                                          │
│  (-) GASTOS VARIABLES                                    │
│      Mantenimiento                    S/.   150          │
│                                                          │
│  (-) DEPRECIACIÓN  (auto)             S/.   210          │
│──────────────────────────────────────────────────────────│
│       RESULTADO NETO DEL MES        ✅ S/. 3,990  47%   │
└──────────────────────────────────────────────────────────┘
```

**Reglas visuales del P&L:**

- Las filas de TOTAL usan `font-bold` y tienen línea superior `border-top`.
- El RESULTADO NETO positivo: fondo `--color-success-light`, texto `--color-success-text`, ícono ✅.
- El RESULTADO NETO negativo: fondo `--color-danger-light`, texto `--color-danger-text`, ícono ❌.
- Los valores calculados automáticamente (insumos, depreciación) llevan la etiqueta `(auto)` en `text-xs color-text-disabled`.
- Los porcentajes de margen van en `font-mono color-text-secondary`.

-----

## 7. ICONOGRAFÍA

**Librería:** Lucide React (MIT License, v0.383+)

**Tamaños estándar:**

|Contexto             |Tamaño|Trazo|
|---------------------|------|-----|
|Dentro de botones    |16px  |2px  |
|Sidebar de navegación|20px  |2px  |
|Acciones de tabla    |16px  |1.5px|
|Header               |20px  |2px  |
|Tarjetas de métricas |24px  |1.5px|
|Empty states         |48px  |1px  |

**Ícono por módulo:**

|Módulo / Acción   |Ícono Lucide     |
|------------------|-----------------|
|Dashboard         |`LayoutDashboard`|
|Pacientes         |`Users`          |
|Agenda            |`CalendarDays`   |
|Historia Clínica  |`FileText`       |
|Odontograma       |`Smile`          |
|Facturación       |`Receipt`        |
|Gestión Financiera|`TrendingUp`     |
|Inventario        |`Package`        |
|Configuración     |`Settings`       |
|Voz activa        |`Mic`            |
|Voz inactiva      |`MicOff`         |
|Ganancia          |`TrendingUp`     |
|Pérdida           |`TrendingDown`   |
|Laboratorio dental|`FlaskConical`   |
|Arriendo          |`Building2`      |
|Sueldo            |`Banknote`       |
|Servicios         |`Zap`            |
|Imprimir          |`Printer`        |
|Descargar PDF     |`Download`       |
|Editar            |`Pencil`         |
|Eliminar          |`Trash2`         |
|Notificaciones    |`Bell`           |

-----

## 8. ANIMACIONES Y TRANSICIONES

|Elemento                         |Animación                |Duración      |
|---------------------------------|-------------------------|--------------|
|Hover en botones                 |Color transition         |150ms ease    |
|Hover en filas de tabla          |Background fade          |100ms ease    |
|Apertura de modal                |Fade in + scale 95%→100% |200ms ease-out|
|Cierre de modal                  |Fade out + scale 100%→95%|150ms ease-in |
|Sidebar colapsar/expandir        |Width transition         |250ms ease    |
|Toast aparecer                   |Slide in desde abajo     |300ms ease-out|
|Pulsación del micrófono activo   |Scale + ring pulse       |1s infinite   |
|Diente seleccionado (odontograma)|Border + scale 102%      |150ms         |
|Skeleton de carga                |Shimmer izquierda→derecha|1.5s infinite |

**Accesibilidad:** Todas las animaciones respetan `prefers-reduced-motion`. Si el usuario tiene este ajuste activado, las transiciones se reducen a 0ms.

-----

## 9. ESTADOS OBLIGATORIOS DE INTERFAZ

Cada vista de datos debe manejar estos 4 estados sin excepción:

|Estado            |Implementación                                                                        |
|------------------|--------------------------------------------------------------------------------------|
|**Cargando**      |Skeleton screens (no spinner central). Mismo layout que el contenido real.            |
|**Vacío**         |Ícono 48px + mensaje descriptivo + botón de acción primaria.                          |
|**Error**         |Mensaje genérico amigable + botón “Intentar de nuevo”. Nunca mostrar el error técnico.|
|**Sin resultados**|Mensaje indicando qué se buscó + sugerencia de búsqueda alternativa.                  |

-----

## 10. ACCESIBILIDAD

|Requisito           |Implementación                                                          |
|--------------------|------------------------------------------------------------------------|
|Contraste de texto  |Mínimo 4.5:1 (WCAG AA) para texto normal, 3:1 para texto grande         |
|Focus visible       |Ring de 3px en `--color-primary` en todos los elementos interactivos    |
|Labels de formulario|Todos los inputs tienen `<label>` con `htmlFor` explícito               |
|Íconos decorativos  |`aria-hidden="true"`                                                    |
|Íconos funcionales  |`aria-label` descriptivo                                                |
|Modales             |Focus trap al abrir. `Escape` cierra el modal.                          |
|Tablas              |`<thead>` con `scope="col"` en todos los encabezados                    |
|Estado de color     |Nunca el color como único indicador: siempre acompañado de texto o ícono|

-----

## 11. TOKENS RESUMEN PARA PROMPT DE LA IA

Incluye este bloque en cada prompt de construcción de módulo:

```
DESIGN SYSTEM — TOOTH X (usar obligatoriamente):

COLORES: Solo var(--color-*) definidas en el sistema. Nunca hex hardcodeado.
TIPOGRAFÍA: var(--font-family). Escala Tailwind text-xs a text-3xl.
            Montos y métricas numéricas: var(--font-mono).
ESPACIADO: Múltiplos de 4px con escala Tailwind (p-1=4px, p-4=16px, p-6=24px).
BORDER RADIUS: rounded-lg (8px) inputs/botones. rounded-xl (12px) tarjetas.
SOMBRAS: shadow-sm para tarjetas estándar.
TRANSICIONES: transition-colors duration-150 en hover de botones y filas.
ICONOS: Lucide React, 16-20px según contexto, trazo 2px.
COMPONENTES BASE: shadcn/ui (Button, Input, Select, Dialog, Toast, Badge, Table).
ESTADOS: Implementar SIEMPRE: loading (skeleton), empty state, error, sin resultados.
ACCESIBILIDAD: focus-visible ring, aria-labels en íconos funcionales, labels en forms.
THEMING: Usar var(--color-primary) para el color de marca, nunca #1D4ED8 directo.
P&L: Resultado positivo → card-metric-success. Negativo → card-metric-danger.
```

-----

*TOOTH X — Documento 5: Design System · v1.0 · Mayo 2026*
*Próximo documento: Arquitectura Técnica (Documento 6)*