# DOCUMENTO 1 — PRODUCT BRIEF

## TOOTH X · Software de Gestión Odontológica SaaS

-----

|Campo                  |Detalle                                    |
|-----------------------|-------------------------------------------|
|**Nombre del producto**|TOOTH X                                    |
|**Versión documentada**|v1.0                                       |
|**Tipo de producto**   |Aplicación web SaaS (Software as a Service)|
|**Industria**          |Salud / Odontología                        |
|**País de origen**     |Perú                                       |
|**Mercado objetivo**   |Latinoamérica (inicio: Perú)               |
|**Idioma de la app**   |Español (inglés planificado para v2.0)     |
|**Fecha del documento**|Mayo 2026                                  |
|**Autor**              |Fundador / Odontólogo propietario          |

-----

## 1. RESUMEN EJECUTIVO

TOOTH X es una plataforma web SaaS diseñada exclusivamente para consultorios odontológicos independientes de pequeño formato (1 a 3 odontólogos con 1 secretaria). Centraliza en un solo sistema todos los procesos clínicos y administrativos del consultorio: agenda de citas, historia clínica digital, odontograma interactivo, facturación, métricas del negocio e inventario de equipos e insumos.

Su diferencial tecnológico más importante es el **Asistente Clínico de Voz**: el odontólogo puede controlar toda la sesión de atención — desde el login matutino hasta la generación de la factura final — usando únicamente comandos de voz, sin tocar la pantalla mientras trabaja con el paciente. La app escucha, ejecuta acciones y responde en voz alta con información en tiempo real de la base de datos del consultorio.

Cada consultorio cliente opera en un entorno completamente aislado, con su propia marca visual personalizada (logo, colores, tipografía) y sin ningún cruce de información con otros consultorios. La plataforma se comercializa bajo un modelo de suscripción mensual fija.

-----

## 2. EL PROBLEMA

Los consultorios odontológicos independientes en Perú y Latinoamérica enfrentan estos problemas sin una solución integrada:

- **Agenda en papel o apps genéricas** (Google Calendar, WhatsApp) que no están conectadas al expediente clínico del paciente.
- **Historias clínicas en papel** que se pierden, deterioran o son difíciles de consultar durante la atención.
- **Odontograma manual** que obliga al odontólogo a soltar al paciente para registrar hallazgos, interrumpiendo la atención y arriesgando la higiene clínica.
- **Facturación improvisada** en hojas de cálculo o a mano, sin numeración automática ni registro de pagos parciales.
- **Inventario no controlado** que genera gastos no monitoreados y desconocimiento del valor real de los activos del consultorio.
- **Sin visibilidad financiera real:** el odontólogo no sabe si su consultorio es rentable porque sus ingresos nunca se comparan contra todos sus gastos reales: arriendo, sueldos, servicios, trabajos de laboratorio dental (prótesis, coronas, aparatos), depreciación de equipos e insumos consumidos. Sin ese análisis, el negocio se maneja a ciegas.
- **Sin métricas claras** para tomar decisiones sobre el negocio (ingresos, pacientes atendidos, ausentismo, rentabilidad, etc.).
- **Soluciones existentes** costosas, complejas de implementar o diseñadas para clínicas grandes, no para el consultorio independiente.

-----

## 3. LA SOLUCIÓN

TOOTH X es una plataforma intuitiva y asequible que resuelve todos los problemas anteriores desde un solo lugar, con tres principios guía:

1. **Clínico primero:** El diseño prioriza la velocidad de registro durante la atención. El odontólogo puede registrar hallazgos en el odontograma usando únicamente su voz, sin interrumpir el trabajo con el paciente.
1. **Aislamiento total:** Cada consultorio es un mundo cerrado. Sus datos, su agenda, su historia clínica y su configuración visual no son visibles ni accesibles para ningún otro consultorio en la plataforma.
1. **Listo para operar desde el día 1:** El proceso de configuración inicial (onboarding) está diseñado para que un consultorio esté operativo en menos de 30 minutos, sin necesidad de capacitación técnica.

-----

## 4. USUARIOS Y ROLES

TOOTH X maneja 4 tipos de usuario con permisos diferenciados:

### 4.1 Super Administrador TOOTH X

El dueño y operador de la plataforma SaaS. Tiene acceso al panel general de gestión de consultorios clientes, facturación de suscripciones y métricas globales de la plataforma. **No tiene acceso a los datos clínicos de ningún consultorio.**

### 4.2 Administrador del Consultorio (Odontólogo propietario)

El dueño del consultorio cliente. Tiene acceso completo a todos los módulos de su consultorio: configuración de marca, gestión de usuarios internos, historia clínica, agenda, odontograma, facturas, inventario y métricas financieras.

### 4.3 Odontólogo

Profesional que atiende pacientes en el consultorio. Accede a la agenda, historia clínica, odontograma y puede generar facturas. No gestiona usuarios ni ve métricas financieras del negocio.

### 4.4 Secretaria

Personal administrativo del consultorio. Agenda citas, registra y edita datos de pacientes, genera e imprime facturas. **No tiene acceso a la historia clínica ni al odontograma.**

-----

## 5. FUNCIONALIDADES DE LA v1.0

Las siguientes funcionalidades forman el alcance completo de la primera versión comercial:

### ✅ MÓDULO 1 — Gestión del Consultorio y Configuración

Registro y configuración inicial del consultorio. Personalización de marca (logo, color primario, color secundario, tipografía). Gestión de usuarios internos con roles. Configuración de horarios de atención por día de la semana. Datos legales del consultorio (nombre, RUC, dirección, teléfono) para uso en facturas.

### ✅ MÓDULO 2 — Pacientes

Registro completo del paciente con datos personales, de contacto, documento de identidad, antecedentes médicos y alergias. Búsqueda y filtrado de pacientes. Adjuntar documentos y radiografías digitales. Vista de ficha completa con historial de citas, tratamientos y pagos.

### ✅ MÓDULO 3 — Agenda / Calendario Interactivo

Calendario visual en vistas diaria, semanal y mensual. Creación de citas con paciente, odontólogo, fecha, hora y motivo. Edición por arrastrar y soltar (drag & drop). Estados de cita: Programada, Confirmada, En curso, Completada, Cancelada, No asistió. Bloqueo de horarios por odontólogo. Configuración de horarios de atención del consultorio. Visualización por odontólogo cuando hay más de uno.

### ✅ MÓDULO 4 — Historia Clínica

Registro de evoluciones clínicas por fecha: anamnesis, examen clínico, diagnóstico y plan de tratamiento. Plan de tratamiento con ítems vinculables a facturación. Notas de evolución. Adjuntar imágenes por consulta. Historial cronológico completo por paciente.

### ✅ MÓDULO 5 — Odontograma Interactivo con Control por Voz

#### 5.1 Representación visual

Odontograma adulto completo (dientes 11–48, notación FDI) y pediátrico (dientes 51–85) construido en SVG interactivo dentro de React. Cada diente tiene 5 superficies independientes seleccionables: oclusal/incisal, vestibular, palatino/lingual, mesial y distal. Cada superficie se colorea de forma individual según la condición registrada. El odontograma se puede imprimir o exportar como imagen PNG desde la historia clínica.

#### 5.2 Interacción manual (clic)

El odontólogo puede hacer clic sobre cualquier diente para seleccionarlo, luego elegir la superficie y la condición/tratamiento desde un panel lateral. Esta modalidad coexiste con el control por voz y sirve como alternativa o corrección.

#### 5.3 Control por voz — Funcionamiento detallado

**Tecnología utilizada:** Web Speech API (SpeechRecognition), integrada de forma nativa en los navegadores Google Chrome y Microsoft Edge. **No requiere API de pago, no consume créditos y funciona completamente en el navegador sin enviar audio a servidores externos.** El idioma de reconocimiento se configura en `es-PE` (español Perú) para optimizar el reconocimiento de términos odontológicos en el acento local.

**Activación del modo voz:**
El odontólogo presiona el botón de micrófono visible en la pantalla del odontograma (o usa el atajo de teclado `Barra espaciadora` cuando el foco está en el odontograma). El ícono del micrófono se vuelve rojo y pulsa visualmente, y aparece el texto “Escuchando…” con una barra de nivel de audio en tiempo real. Un pitido suave confirma que el sistema está listo para recibir comandos.

**Estructura del comando de voz:**
Los comandos siguen el patrón natural: `"Diente [número] [superficie] [condición]"`

El sistema entiende las siguientes variantes para cada campo:

*Número de diente:*

|Se dice                |Se interpreta|
|-----------------------|-------------|
|“diente dieciséis”     |Diente 16    |
|“diente uno seis”      |Diente 16    |
|“diente uno punto seis”|Diente 16    |
|“diente cuatro ocho”   |Diente 48    |
|“diente treinta y seis”|Diente 36    |

*Superficie:*

|Se dice                                   |Se interpreta        |
|------------------------------------------|---------------------|
|“oclusal” o “masticatoria”                |Oclusal              |
|“vestibular” o “de frente” o “exterior”   |Vestibular           |
|“palatino” o “lingual” o “interior”       |Palatino / Lingual   |
|“mesial” o “al frente”                    |Mesial               |
|“distal” o “atrás”                        |Distal               |
|“todo el diente” o “todas las superficies”|Todas (5 superficies)|
|*(sin mencionar superficie)*              |Todas (por defecto)  |

*Condiciones y tratamientos reconocidos:*

|Se dice                             |Se interpreta   |Color en odontograma|
|------------------------------------|----------------|--------------------|
|“caries”                            |Caries          |🔴 Rojo              |
|“obturación” / “relleno” / “empaste”|Obturación      |🔵 Azul              |
|“corona”                            |Corona          |🟡 Dorado            |
|“ausente” / “falta” / “extraído”    |Diente ausente  |⚫ Gris oscuro       |
|“fractura” / “fracturado”           |Fractura        |🟠 Naranja           |
|“implante”                          |Implante        |🟢 Verde             |
|“endodoncia” / “nervio” / “conducto”|Endodoncia      |🟣 Morado            |
|“sellante”                          |Sellante        |🩵 Celeste           |
|“sano” / “normal”                   |Sin condición   |⬜ Sin color         |
|“prótesis”                          |Prótesis parcial|🟤 Café              |

**Proceso completo de un comando (paso a paso):**

1. Odontólogo dicta: *“Diente dieciséis oclusal caries”*
1. Sistema transcribe en tiempo real el audio a texto y lo muestra en pantalla.
1. El parser analiza el texto, normaliza el número del diente, identifica la superficie y la condición.
1. El sistema muestra una **barra de confirmación** en la parte inferior de la pantalla: *“🦷 Diente 16 · Oclusal · Caries — ¿Confirmar?”*
1. Simultáneamente, el diente 16 se resalta en color **amarillo** como previsualización antes de confirmar.
1. El odontólogo dice **“confirmar”** o **“sí”** (o hace clic en el botón Confirmar).
1. La superficie oclusal del diente 16 se colorea en rojo permanente. Se escucha un pitido de confirmación.
1. El sistema **vuelve automáticamente al modo escucha** para recibir el siguiente comando sin necesidad de presionar nada.
1. El comando queda registrado en el **log de sesión** visible al costado del odontograma.

**Comandos de control del modo voz:**

|Comando hablado                |Acción                                              |
|-------------------------------|----------------------------------------------------|
|“Confirmar” / “Sí”             |Guarda el hallazgo actual en el odontograma         |
|“Cancelar” / “No”              |Descarta el comando actual y vuelve a escuchar      |
|“Deshacer”                     |Revierte el último cambio guardado en el odontograma|
|“Borrar diente [número]”       |Elimina todas las marcas del diente indicado        |
|“Terminar” / “Modo voz apagado”|Cierra el modo voz y vuelve al modo manual          |
|“Siguiente diente”             |Avanza al siguiente diente en secuencia numérica    |

**Corrección de errores de reconocimiento:**
El parser usa un algoritmo de similitud fonética (distancia de Levenshtein) para tolerar variaciones de pronunciación y acento. Por ejemplo, “karies” se interpreta como “caries”, “obturacion” sin tilde como “obturación”, y “palatina” como “palatino”. Si el sistema no puede interpretar el comando con certeza, responde: *“No entendí el comando, por favor repite”* y vuelve a escuchar.

**Limitaciones técnicas del modo voz:**

- Funciona únicamente en **Google Chrome y Microsoft Edge**. En otros navegadores se muestra un aviso claro: *“El control por voz requiere Google Chrome o Microsoft Edge”*, y el odontólogo debe usar la modalidad manual por clic.
- Requiere que el dispositivo tenga micrófono activo y permiso de acceso concedido al navegador.
- Ambientes con ruido elevado pueden reducir la precisión. El sistema muestra un indicador del nivel de ruido ambiente.
- No requiere conexión a internet para el reconocimiento de voz (el procesamiento es local en el navegador).

#### 5.4 Catálogo de condiciones y colorimetría

El catálogo de condiciones y tratamientos es fijo en v1.0, siguiendo el estándar clínico latinoamericano. No es personalizable por consultorio en esta versión.

#### 5.5 Historial y trazabilidad

Cada cambio en el odontograma queda registrado con fecha, hora y el usuario que lo realizó (odontólogo). Se puede visualizar el estado del odontograma en cualquier fecha anterior mediante un selector de fecha. La vista comparativa muestra lado a lado el estado inicial del paciente vs. el estado actual.

### ✅ MÓDULO 6 — Facturación

Generación de facturas desde el plan de tratamiento. Ítems editables: descripción, cantidad, precio unitario, descuento por ítem. Descuento global sobre el total. Registro de método de pago: efectivo, transferencia bancaria, tarjeta, cuotas. Registro de abonos parciales con estado de cartera. Numeración automática de facturas por consultorio. Descarga e impresión de factura en PDF con logo y datos del consultorio.

### ✅ MÓDULO 7 — Dashboard de Métricas

Resumen diario de citas e ingresos. Gráfico de ingresos mensual del año en curso. Gráfico de citas por estado (completadas, canceladas, no asistidas). Tratamientos más realizados en el período. Pacientes nuevos vs. recurrentes. Alertas de facturas pendientes de pago (cartera activa). Alertas de insumos en nivel mínimo de stock. **Panel de rentabilidad del consultorio:** ingresos vs. gastos totales del mes, resultado neto (ganancia o pérdida), margen de rentabilidad y gráfico comparativo de los últimos 12 meses.

### ✅ MÓDULO 8 — Inventario

Registro de equipos con ficha técnica completa: marca, modelo, serial, fecha y valor de compra, vida útil estimada. Cálculo automático de depreciación lineal anual y valor en libros. Registro de insumos con stock actual, stock mínimo y precio unitario. Entradas y salidas de insumos con trazabilidad. Alerta visual de insumos por debajo del stock mínimo. Reporte de inventario valorizado. **El costo de insumos consumidos y la depreciación mensual de equipos se integran automáticamente al módulo de Gestión Financiera.**

### ✅ MÓDULO 11 — Gestión Financiera y Rentabilidad

#### 11.1 Objetivo

Permitir al Admin del consultorio registrar todos sus gastos operativos (fijos y variables) para compararlos contra los ingresos por facturación, los costos de insumos y la depreciación de equipos, obteniendo así un **Estado de Resultados mensual** que responde la pregunta clave: ¿Mi consultorio es rentable?

#### 11.2 Categorías de gastos

**Gastos Fijos (se repiten cada mes):**

|Categoría         |Ejemplos                                             |
|------------------|-----------------------------------------------------|
|Arriendo del local|Alquiler mensual del consultorio                     |
|Sueldos           |Secretaria, odontólogos empleados (no el propietario)|
|Servicios públicos|Agua, luz, internet, teléfono                        |
|Seguros           |Seguro del local, seguro de equipos                  |
|Suscripciones     |TOOTH X, software contable, otros servicios          |
|Otros fijos       |Cualquier gasto recurrente mensual                   |

**Gastos Variables (cambian cada mes):**

|Categoría         |Ejemplos                                                                                              |
|------------------|------------------------------------------------------------------------------------------------------|
|Laboratorio dental|Prótesis totales/parciales, coronas, carillas, aparatos de ortodoncia mandados a fabricar externamente|
|Mantenimiento     |Reparación de equipos, servicio técnico                                                               |
|Marketing         |Publicidad, redes sociales, volantes                                                                  |
|Capacitación      |Cursos, congresos odontológicos                                                                       |
|Otros variables   |Gastos no recurrentes del mes                                                                         |

**Costos calculados automáticamente (no requieren ingreso manual):**

|Origen              |Cálculo                                                                             |
|--------------------|------------------------------------------------------------------------------------|
|Insumos consumidos  |Suma de salidas de insumos del período × precio unitario (del módulo de Inventario) |
|Depreciación mensual|Suma de depreciación mensual de todos los equipos activos (del módulo de Inventario)|

#### 11.3 Estado de resultados mensual (P&L simplificado)

```
ESTADO DE RESULTADOS — [Mes / Año]
Consultorio: [Nombre]

(+) INGRESOS
    Facturación cobrada del mes             S/. XXXX
    ─────────────────────────────────────────────────
    TOTAL INGRESOS                          S/. XXXX

(-) COSTOS DIRECTOS
    Insumos consumidos (automático)         S/. XXXX
    Trabajos de laboratorio dental          S/. XXXX
    ─────────────────────────────────────────────────
    TOTAL COSTOS DIRECTOS                   S/. XXXX

    UTILIDAD BRUTA                          S/. XXXX
    Margen bruto                               XX %

(-) GASTOS OPERATIVOS FIJOS
    Arriendo del local                      S/. XXXX
    Sueldos                                 S/. XXXX
    Servicios públicos                      S/. XXXX
    Seguros                                 S/. XXXX
    Suscripciones                           S/. XXXX
    Otros fijos                             S/. XXXX
    ─────────────────────────────────────────────────
    TOTAL GASTOS FIJOS                      S/. XXXX

(-) GASTOS VARIABLES
    Mantenimiento                           S/. XXXX
    Marketing                               S/. XXXX
    Capacitación                            S/. XXXX
    Otros variables                         S/. XXXX
    ─────────────────────────────────────────────────
    TOTAL GASTOS VARIABLES                  S/. XXXX

(-) DEPRECIACIÓN (automático)
    Depreciación mensual de equipos         S/. XXXX
    ─────────────────────────────────────────────────

    RESULTADO NETO DEL MES                  S/. XXXX
    ✅ GANANCIA / ❌ PÉRDIDA
    Margen neto                                XX %
```

#### 11.4 Gastos recurrentes (automatización)

El Admin puede marcar cualquier gasto fijo como **recurrente mensual**. TOOTH X lo registrará automáticamente el primer día de cada mes, evitando la re-entrada manual. Si el monto cambia, el Admin lo edita antes de que se confirme. Una notificación interna recuerda al Admin revisar los gastos recurrentes al inicio de cada mes.

#### 11.5 Trabajos de laboratorio dental

Los trabajos mandados a laboratorio externo (prótesis, coronas, aparatos) pueden vincularse opcionalmente al paciente y al tratamiento correspondiente. Esto permite al odontólogo saber exactamente cuánto le costó cada caso y si el precio cobrado al paciente cubre los costos de laboratorio.

#### 11.6 Reportes financieros disponibles

- Estado de resultados del mes actual
- Estado de resultados comparativo: mes vs. mes anterior
- Estado de resultados acumulado del año en curso
- Gráfico de tendencia: ingresos vs. gastos totales (últimos 12 meses)
- Desglose de gastos por categoría del período (gráfico de torta)
- Exportar cualquier reporte a PDF

### ✅ MÓDULO 9 — Notificaciones de Citas (WhatsApp y Correo Electrónico)

#### 9.1 Objetivo

Reducir el ausentismo de pacientes enviando recordatorios automáticos de sus citas por los canales de comunicación más usados en Perú: WhatsApp y correo electrónico. Ambos canales se implementan con servicios que tienen **capa gratuita suficiente para un consultorio pequeño**, sin costo adicional en v1.0.

#### 9.2 Canales y tecnología gratuita

**Correo electrónico — Resend.com**
Resend es un servicio de emails transaccionales con un plan gratuito permanente de **3,000 emails por mes** (100 emails por día). Para un consultorio que atiende entre 15 y 30 pacientes diarios, esta cuota es más que suficiente. La integración con Next.js es directa mediante el SDK oficial de Resend. Los correos se envían desde una dirección del tipo `citas@toothx.app` con el nombre del consultorio como remitente visible.

**WhatsApp — WhatsApp Cloud API (Meta oficial)**
La API oficial de WhatsApp Business de Meta permite enviar mensajes con **1,000 conversaciones de servicio gratuitas por mes**. Para un consultorio con 20–25 citas diarias, esto cubre aproximadamente el primer mes. Es la única vía oficial y legal para enviar mensajes automatizados por WhatsApp sin riesgo de que el número sea bloqueado. Requiere que el consultorio conecte su propio número de WhatsApp Business durante la configuración inicial.

|Canal   |Servicio                 |Plan gratuito|Límite mensual estimado |
|--------|-------------------------|-------------|------------------------|
|Email   |Resend.com               |Permanente   |3,000 emails/mes        |
|WhatsApp|WhatsApp Cloud API (Meta)|Permanente   |1,000 conversaciones/mes|

#### 9.3 Cuándo se envían las notificaciones

|Evento                |Canal           |Momento del envío                  |Contenido del mensaje                                                                |
|----------------------|----------------|-----------------------------------|-------------------------------------------------------------------------------------|
|Cita agendada         |WhatsApp + Email|Inmediatamente al crear la cita    |Confirmación con fecha, hora, odontólogo y dirección del consultorio                 |
|Recordatorio 24h antes|WhatsApp + Email|El día anterior a las 9:00 AM      |Recordatorio con fecha, hora y opción de confirmar asistencia respondiendo al mensaje|
|Recordatorio 2h antes |WhatsApp        |2 horas antes de la cita           |Recordatorio final con hora de la cita                                               |
|Cita reagendada       |WhatsApp + Email|Inmediatamente al modificar la cita|Nueva fecha y hora confirmada                                                        |
|Cita cancelada        |WhatsApp + Email|Inmediatamente al cancelar         |Notificación de cancelación con nombre del consultorio                               |

#### 9.4 Configuración por consultorio

Cada consultorio puede activar o desactivar cada tipo de notificación desde su panel de configuración. También puede personalizar el texto de los mensajes manteniendo las variables dinámicas (nombre del paciente, fecha, hora, nombre del odontólogo, nombre del consultorio). El sistema envía notificaciones únicamente a pacientes que tengan registrado un número de teléfono o correo electrónico en su ficha.

#### 9.5 Plantilla de mensaje de WhatsApp (ejemplo)

```
Hola [Nombre del paciente] 👋

Te recordamos tu cita en *[Nombre del consultorio]*:

📅 Fecha: [Día, fecha]
🕐 Hora: [Hora]
👨‍⚕️ Odontólogo: [Nombre del odontólogo]
📍 Dirección: [Dirección del consultorio]

Por favor, llega 5 minutos antes.
Para cualquier cambio, comunícate al [Teléfono del consultorio].
```

> Nota: Las plantillas de WhatsApp deben ser aprobadas por Meta antes de su uso. TOOTH X incluye plantillas preaprobadas listas para usar desde el primer día.

### ✅ MÓDULO 10 — Asistente Clínico de Voz (Voice Clinical Assistant)

#### 10.1 Concepto

El Asistente Clínico de Voz es una capa de control por voz que se extiende sobre **toda la aplicación**, no solo sobre el odontograma. Permite al odontólogo iniciar su jornada, consultar su agenda, navegar entre módulos, registrar hallazgos clínicos, gestionar tratamientos y generar facturas usando únicamente su voz, mientras la app responde en voz alta con información real del consultorio.

**Tecnología utilizada — 100% gratuita:**

|Función                       |Tecnología                                     |Costo |
|------------------------------|-----------------------------------------------|------|
|Escuchar al odontólogo        |Web Speech API — SpeechRecognition (`es-PE`)   |Gratis|
|Responder en voz alta         |Web Speech Synthesis API — SpeechSynthesis     |Gratis|
|Interpretar comandos          |Parser de patrones fijos (sin IA)              |Gratis|
|Consultar datos en tiempo real|Llamadas internas a la base de datos del tenant|Gratis|


> **¿Por qué sin IA?** El sistema usa comandos fijos predefinidos en lugar de procesamiento de lenguaje natural con IA. Esto hace el sistema completamente gratuito, predecible y confiable. A cambio, los comandos deben decirse con la estructura establecida (documentada en la app con una tarjeta de referencia rápida).

#### 10.2 Activación del modo voz

El asistente NO escucha de forma permanente (restricción de seguridad de los navegadores). El odontólogo activa la escucha tocando el **botón de micrófono** visible en todo momento en el header de la aplicación, o usando el atajo de teclado **`Alt + M`**. Tras cada comando ejecutado, el asistente vuelve automáticamente a modo escucha sin necesidad de tocar nada.

#### 10.3 Login por voz (PIN de voz)

Dado que la tablet se apaga cada noche, el odontólogo necesita autenticarse cada mañana. Hablar la contraseña en voz alta representa un riesgo de seguridad, por lo que TOOTH X implementa un **PIN de voz de 4 dígitos**, configurado una sola vez en el panel de configuración personal y completamente separado de la contraseña.

**Flujo de login por voz:**

1. El odontólogo abre el navegador en la tablet y la app muestra la pantalla de login.
1. Toca el botón de micrófono en la pantalla de login.
1. Dice: **“Doctor [su nombre] PIN [cuatro dígitos]”** — ejemplo: *“Doctor Carlos PIN dos cuatro uno siete”*
1. El sistema verifica el PIN de voz y el nombre de usuario.
1. Si es correcto: la sesión se abre y el asistente responde en voz alta: *“Buenos días, Doctor Carlos. Hoy tienes 7 pacientes. Tu primera cita es con Ana Torres a las 9:00 AM.”*
1. Si es incorrecto: el asistente responde *“PIN incorrecto, intenta nuevamente”*. Tras 3 intentos fallidos, bloquea el login por voz y exige ingresar manualmente con email y contraseña.

**Seguridad:** El PIN de voz se almacena como hash en la base de datos (nunca en texto plano). La sesión dura 14 horas desde el login para que no expire durante la jornada laboral.

#### 10.4 Catálogo completo de comandos de voz

Los comandos están organizados por el momento de la jornada en que se usan:

-----

**GRUPO 1 — Inicio de jornada (después del login)**

|Comando                             |Acción                            |Respuesta en voz                                                                                           |
|------------------------------------|----------------------------------|-----------------------------------------------------------------------------------------------------------|
|*”¿Cuántos pacientes tengo hoy?”*   |Consulta la agenda del día        |*“Tienes [N] pacientes hoy. Has atendido [X] y te faltan [Y].”*                                            |
|*”¿Quién es mi primer paciente?”*   |Consulta la primera cita del día  |*“Tu primer paciente es [nombre], a las [hora], por [motivo].”*                                            |
|*”¿Quién es el siguiente paciente?”*|Consulta la próxima cita pendiente|*“Tu siguiente paciente es [nombre], a las [hora].”*                                                       |
|*”¿A qué hora es mi próxima cita?”* |Hora de la siguiente cita         |*“Tu próxima cita es a las [hora] con [nombre].”*                                                          |
|*”¿Cuántas citas me quedan?”*       |Citas no atendidas del día        |*“Te faltan [N] pacientes por atender hoy.”*                                                               |
|*“Dame el resumen del día”*         |Resumen completo de la jornada    |*“Hoy tienes [N] pacientes. [X] completados, [Y] pendientes, [Z] cancelados. Has facturado [monto] soles.”*|

-----

**GRUPO 2 — Navegación por la app**

|Comando                               |Acción                                                |Respuesta en voz                                           |
|--------------------------------------|------------------------------------------------------|-----------------------------------------------------------|
|*“Ir al inicio”* / *“Ir al dashboard”*|Navega al Dashboard                                   |*“Mostrando el dashboard.”*                                |
|*“Abrir agenda”* / *“Ver citas”*      |Navega al Calendario                                  |*“Mostrando la agenda.”*                                   |
|*“Abrir pacientes”*                   |Navega al listado de pacientes                        |*“Mostrando la lista de pacientes.”*                       |
|*“Abrir inventario”*                  |Navega al módulo de inventario                        |*“Mostrando el inventario.”*                               |
|*“Abrir configuración”*               |Navega a Configuración                                |*“Mostrando configuración.”*                               |
|*“Abrir el primer paciente”*          |Abre la ficha del primer paciente de la agenda de hoy |*“Abriendo la ficha de [nombre], primer paciente del día.”*|
|*“Abrir el siguiente paciente”*       |Abre la ficha del siguiente en la agenda              |*“Abriendo la ficha de [nombre].”*                         |
|*“Abrir el odontograma de [nombre]”*  |Navega al odontograma del paciente buscando por nombre|*“Abriendo el odontograma de [nombre].”*                   |

-----

**GRUPO 3 — Gestión de citas**

|Comando                                      |Acción                                      |Respuesta en voz                                                    |
|---------------------------------------------|--------------------------------------------|--------------------------------------------------------------------|
|*“Paciente en sala”* / *“Inicio de atención”*|Cambia estado de la cita activa a “En curso”|*“Cita de [nombre] marcada como en curso.”*                         |
|*“Finalizar cita”* / *“Cita completada”*     |Cambia estado a “Completada”                |*“Cita de [nombre] completada. ¿Deseas generar la factura?”*        |
|*“Paciente no asistió”*                      |Cambia estado a “No asistió”                |*“Marcado como no asistido. Siguiente cita: [nombre] a las [hora].”*|

-----

**GRUPO 4 — Odontograma (durante la exploración)**

|Comando                                       |Acción                                                   |Respuesta en voz                                      |
|----------------------------------------------|---------------------------------------------------------|------------------------------------------------------|
|*“Activar odontograma”* / *“Modo exploración”*|Activa el odontograma y el modo voz dentro de él         |*“Odontograma activo. Puedes dictar los hallazgos.”*  |
|*“Diente [número] [superficie] [condición]”*  |Registra el hallazgo (ver Módulo 5 para detalle completo)|*“Diente [N], [superficie], [condición]. ¿Confirmar?”*|
|*“Confirmar”* / *“Sí”*                        |Guarda el hallazgo en el odontograma                     |*“Guardado. Continúa.”*                               |
|*“Cancelar”* / *“No”*                         |Descarta el hallazgo actual                              |*“Cancelado. Repite el comando.”*                     |
|*“Deshacer”*                                  |Revierte el último hallazgo guardado                     |*“Último cambio revertido.”*                          |
|*“Terminar exploración”*                      |Cierra el modo voz del odontograma                       |*“Exploración finalizada. [N] hallazgos registrados.”*|

-----

**GRUPO 5 — Plan de tratamiento**

|Comando                                       |Acción                                                |Respuesta en voz                                                          |
|----------------------------------------------|------------------------------------------------------|--------------------------------------------------------------------------|
|*”¿Cuántos tratamientos tiene este paciente?”*|Consulta los ítems del plan                           |*“El paciente tiene [N] tratamientos en su plan: [lista los 3 primeros].”*|
|*“Procederé con los tratamientos”*            |Cambia todos los ítems del plan a estado “En progreso”|*“Plan de tratamiento activado. [N] procedimientos en progreso.”*         |
|*“Tratamiento finalizado”*                    |Marca el tratamiento activo o todos como “Completado” |*“Tratamiento marcado como completado.”*                                  |
|*“Tratamiento pendiente”*                     |Marca el tratamiento activo como “Pendiente”          |*“Tratamiento marcado como pendiente para próxima cita.”*                 |
|*“Siguiente tratamiento”*                     |Avanza al siguiente ítem del plan                     |*“Siguiente: [nombre del tratamiento].”*                                  |

-----

**GRUPO 6 — Facturación**

|Comando                                |Acción                                                                 |Respuesta en voz                                                       |
|---------------------------------------|-----------------------------------------------------------------------|-----------------------------------------------------------------------|
|*“Generar factura”* / *“Crear factura”*|Crea la factura automáticamente desde el plan de tratamiento completado|*“Factura generada. Total: [monto] soles. ¿Cuál es el método de pago?”*|
|*“Pago en efectivo”*                   |Registra el pago como efectivo y marca la factura como Pagada          |*“Factura pagada en efectivo. ¿Deseas imprimirla?”*                    |
|*“Pago con tarjeta”*                   |Registra el pago como tarjeta                                          |*“Factura pagada con tarjeta. ¿Deseas imprimirla?”*                    |
|*“Pago por transferencia”*             |Registra como transferencia bancaria                                   |*“Factura pagada por transferencia. ¿Deseas imprimirla?”*              |
|*“Imprimir factura”*                   |Lanza la impresión del PDF de la factura                               |*“Enviando a impresora.”*                                              |
|*”¿Cuánto he facturado hoy?”*          |Consulta el total facturado en el día                                  |*“Hoy has facturado [monto] soles en [N] atenciones.”*                 |

-----

**GRUPO 7 — Comandos de control general**

|Comando                           |Acción                                                      |Respuesta en voz                                  |
|----------------------------------|------------------------------------------------------------|--------------------------------------------------|
|*“Silencio”* / *“Modo silencioso”*|Desactiva las respuestas en voz alta (solo ejecuta acciones)|*“Modo silencioso activado.”*                     |
|*“Habla de nuevo”* / *“Modo voz”* |Reactiva las respuestas en voz alta                         |Sonido de confirmación                            |
|*”¿Qué puedo decir?”* / *“Ayuda”* |Muestra en pantalla la tarjeta de referencia de comandos    |*“Mostrando comandos disponibles.”*               |
|*“Cerrar sesión”*                 |Cierra la sesión del usuario                                |*“Sesión cerrada. Hasta mañana, Doctor [nombre].”*|

-----

#### 10.5 Flujo completo de una jornada usando solo voz

```
[Mañana — Login]
Odontólogo abre el navegador en la tablet
→ Toca el micrófono en la pantalla de login
→ "Doctor Carlos PIN dos cuatro uno siete"
→ App: "Buenos días, Doctor Carlos. Tienes 6 pacientes hoy.
         Tu primera cita es con Ana Torres a las 9:00 AM."

[9:00 AM — Primera cita]
→ "Paciente en sala"
→ App: "Cita de Ana Torres marcada como en curso."
→ "Abrir el odontograma de Ana Torres"
→ App: "Abriendo el odontograma de Ana Torres."
→ "Activar odontograma"
→ App: "Odontograma activo. Puedes dictar los hallazgos."
→ "Diente dieciséis oclusal caries"
→ App: "Diente 16, oclusal, caries. ¿Confirmar?"
→ "Confirmar"
→ App: "Guardado. Continúa."
→ [Repite para más dientes...]
→ "Terminar exploración"
→ App: "Exploración finalizada. 4 hallazgos registrados."

[Durante el tratamiento]
→ "Procederé con los tratamientos"
→ App: "Plan de tratamiento activado. 2 procedimientos en progreso."
→ [Realiza los tratamientos...]
→ "Tratamiento finalizado"
→ App: "Tratamiento marcado como completado."

[Al terminar la atención]
→ "Finalizar cita"
→ App: "Cita de Ana Torres completada. ¿Deseas generar la factura?"
→ "Generar factura"
→ App: "Factura generada. Total: 180 soles. ¿Cuál es el método de pago?"
→ "Pago en efectivo"
→ App: "Factura pagada en efectivo. ¿Deseas imprimirla?"
→ "Imprimir factura"
→ App: "Enviando a impresora."
→ "¿Quién es el siguiente paciente?"
→ App: "Tu siguiente paciente es Luis García a las 10:00 AM."
```

#### 10.6 Tarjeta de referencia rápida

La app incluye una tarjeta imprimible (PDF descargable) con todos los comandos organizados por grupo, para que el odontólogo la pegue cerca de la tablet durante los primeros días de uso hasta memorizar los comandos.

-----

## 6. FUERA DEL ALCANCE — v1.0

Las siguientes funcionalidades están explícitamente excluidas de la versión 1.0 para mantener el foco y los plazos:

|Funcionalidad excluida                             |Razón                                             |
|---------------------------------------------------|--------------------------------------------------|
|Agendamiento de citas por el paciente              |Genera desorden operativo en consultorios pequeños|
|App móvil nativa (iOS / Android)                   |La app web responsive cubre la necesidad en v1.0  |
|Integración con seguros médicos o EPS              |Alta complejidad regulatoria por país             |
|Telemedicina / videoconsultas                      |Fuera del foco clínico actual                     |
|Receta médica digital con firma electrónica        |Requiere certificación legal por país             |
|Integración contable con software externo          |Se planifica para v2.0                            |
|Portal de pacientes (ver su historial)             |Se planifica para v2.0                            |
|Múltiples sedes del mismo consultorio              |Fuera del perfil del cliente objetivo v1.0        |
|Integración con SUNAT (factura electrónica oficial)|Complejidad regulatoria, se evalúa para v2.0      |

-----

## 7. PERFIL DEL CLIENTE OBJETIVO (Buyer Persona)

**Nombre representativo:** Dr. Renzo / Dra. Patricia
**Ocupación:** Odontólogo general o especialista con consultorio propio
**Tamaño del consultorio:** 1 a 3 odontólogos, 1 secretaria, 1 consultorio físico
**País:** Perú (expansión a Latinoamérica)
**Situación actual:** Maneja su agenda en papel o WhatsApp, su historia clínica en carpetas físicas o Excel, y factura de forma manual o con recibos impresos.
**Principal frustración:** Perder tiempo en papeleo administrativo que debería dedicar a pacientes.
**Principal motivación para adoptar TOOTH X:** Tener todo centralizado, poder atender más pacientes con menos errores administrativos y proyectar una imagen profesional y moderna a sus pacientes.
**Disposición de pago:** Suscripción mensual fija asequible (referencia de mercado peruano: S/. 80 – S/. 180 soles mensuales).

-----

## 8. MODELO DE NEGOCIO

**Tipo:** SaaS B2B (venta a consultorios, no a pacientes finales)
**Modelo de cobro:** Suscripción mensual fija por consultorio
**Estructura de planes propuesta (definir precios en fase comercial):**

|Plan      |Usuarios incluidos                |Módulos                                 |Almacenamiento|
|----------|----------------------------------|----------------------------------------|--------------|
|**Básico**|1 odontólogo + 1 secretaria       |Todos excepto Asistente de Voz          |2 GB          |
|**Pro**   |Hasta 3 odontólogos + 1 secretaria|Todos incluido Asistente de Voz completo|10 GB         |

**Ciclo de facturación:** Mensual (con descuento por pago anual en v1.1)
**Forma de pago inicial (v1.0):** Transferencia bancaria / Yape / Plin (Perú)
**Pasarela de pagos automatizada:** Planificada para v1.1 (Culqi para Perú, Stripe para expansión)

-----

## 9. DIFERENCIADORES COMPETITIVOS

|Diferenciador                                 |Descripción                                                                                                                                                                   |
|----------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|**Asistente Clínico de Voz completo**         |El odontólogo controla toda la sesión de atención con su voz. Único en el mercado latinoamericano.                                                                            |
|**Estado de resultados integrado**            |El consultorio conoce su rentabilidad real: ingresos vs. arriendo, sueldos, laboratorio dental, insumos consumidos y depreciación de equipos, todo en un solo reporte mensual.|
|**Notificaciones gratis por WhatsApp y email**|Recordatorios automáticos de citas sin costo adicional.                                                                                                                       |
|**Multi-tenant con marca propia**             |Cada consultorio tiene su propio logo, colores y tipografía.                                                                                                                  |
|**Aislamiento total de datos**                |Los datos de un consultorio nunca son visibles para otro.                                                                                                                     |
|**Diseñado para el consultorio pequeño**      |Onboarding en menos de 30 minutos, sin capacitación técnica.                                                                                                                  |
|**Precio asequible para el mercado peruano**  |Posicionado para el odontólogo independiente, no para clínicas corporativas.                                                                                                  |

-----

## 10. SUPUESTOS Y RESTRICCIONES

|Supuesto                     |Detalle                                                                                                                                                 |
|-----------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------|
|Conectividad a internet      |La app requiere conexión a internet. No hay modo offline en v1.0.                                                                                       |
|Dispositivos de uso          |Desktop y tablet principalmente. La app es responsive pero no es app móvil nativa.                                                                      |
|Navegadores soportados       |Chrome, Edge y Safari (versiones de los últimos 2 años).                                                                                                |
|Resolución mínima de pantalla|1024px de ancho (tablet landscape).                                                                                                                     |
|Regulación de datos de salud |El sistema almacena datos clínicos sensibles. Debe cumplir con la Ley N° 29733 de Protección de Datos Personales del Perú.                              |
|Facturación electrónica SUNAT|La factura de TOOTH X es un comprobante interno del consultorio. La integración con SUNAT (factura electrónica oficial) queda fuera del alcance de v1.0.|

-----

## 11. CRITERIOS DE ÉXITO DE LA v1.0

La versión 1.0 se considera exitosa cuando:

- [ ] El consultorio propio del fundador opera completamente en TOOTH X durante 30 días seguidos.
- [ ] Al menos 3 consultorios externos pagan la suscripción mensual y la usan activamente.
- [ ] El odontólogo puede completar una sesión de atención completa — desde el login hasta la impresión de la factura — usando únicamente su voz, sin tocar la pantalla.
- [ ] El tiempo de respuesta del asistente de voz (desde que termina de hablar hasta que ejecuta la acción) es menor a 1.5 segundos.
- [ ] Ningún consultorio puede ver datos de otro consultorio (verificado con pruebas de aislamiento).
- [ ] Una secretaria sin conocimientos técnicos puede aprender a agendar citas y generar facturas en menos de 1 hora de uso.
- [ ] El sistema soporta al menos 50 consultorios simultáneos sin degradación de rendimiento.

-----

## 12. GLOSARIO DEL PROYECTO

|Término                         |Definición en el contexto de TOOTH X                                                                                                                                                                    |
|--------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
|**Tenant**                      |Un consultorio cliente dentro de la plataforma TOOTH X.                                                                                                                                                 |
|**Odontograma**                 |Diagrama gráfico de los dientes del paciente donde se registran condiciones y tratamientos por superficie dental.                                                                                       |
|**Evolución**                   |Registro clínico de una consulta o atención. Equivale a una nota de progreso en la historia clínica.                                                                                                    |
|**RLS**                         |Row Level Security. Mecanismo de la base de datos que asegura que cada tenant solo acceda a sus propios datos.                                                                                          |
|**Onboarding**                  |Proceso guiado de configuración inicial que realiza un consultorio cuando se registra por primera vez en TOOTH X.                                                                                       |
|**Plan de tratamiento**         |Lista de procedimientos odontológicos propuestos para un paciente, con su costo estimado.                                                                                                               |
|**Depreciación lineal**         |Método contable que distribuye el costo de un equipo uniformemente a lo largo de su vida útil estimada.                                                                                                 |
|**Cartera**                     |Conjunto de facturas emitidas con pago pendiente o parcial.                                                                                                                                             |
|**Web Speech API**              |API nativa de los navegadores Chrome y Edge que convierte audio del micrófono en texto, sin costo y sin enviar datos a servidores externos. Es la tecnología que hace posible el odontograma por voz.   |
|**Parser de voz**               |Módulo de software que analiza el texto transcripto por el micrófono e identifica el número de diente, la superficie y la condición odontológica dentro del comando hablado.                            |
|**WhatsApp Cloud API**          |API oficial de Meta (empresa dueña de WhatsApp) para enviar mensajes automatizados de forma legal. Incluye 1,000 conversaciones gratuitas por mes.                                                      |
|**Resend**                      |Servicio de envío de correos electrónicos transaccionales con 3,000 emails/mes gratuitos. Se usa para enviar confirmaciones y recordatorios de citas a los pacientes.                                   |
|**Plantilla de WhatsApp**       |Mensaje preaprobado por Meta que el sistema puede enviar de forma automática. Debe ser aprobado antes de usarse en producción.                                                                          |
|**Asistente Clínico de Voz**    |Capa de control por voz que cubre toda la aplicación: login, navegación, consultas de agenda, odontograma, gestión de tratamientos y facturación. Opera con comandos fijos predefinidos, sin IA externa.|
|**PIN de voz**                  |Código numérico de 4 dígitos que el odontólogo configura una vez y usa para autenticarse por voz cada mañana. Es diferente a su contraseña y se almacena como hash en la base de datos.                 |
|**Web Speech Synthesis API**    |API nativa del navegador que convierte texto en voz audible. Es la tecnología que permite que la app le hable de vuelta al odontólogo. Completamente gratuita y no requiere servicios externos.         |
|**Comando fijo**                |Instrucción de voz con estructura predefinida que el sistema reconoce mediante coincidencia de patrones, sin necesidad de inteligencia artificial. Ejemplo: “Diente dieciséis oclusal caries”.          |
|**Tarjeta de referencia rápida**|Documento PDF imprimible con todos los comandos de voz disponibles, organizado por grupos, para uso del odontólogo durante los primeros días de adopción del asistente.                                 |
|**Estado de resultados (P&L)**  |Reporte financiero mensual que muestra ingresos, costos directos, gastos operativos, depreciación y resultado neto del consultorio. Responde si el consultorio es rentable o no.                        |
|**Utilidad bruta**              |Diferencia entre los ingresos facturados y los costos directos (insumos consumidos + laboratorio dental).                                                                                               |
|**Resultado neto**              |Utilidad bruta menos gastos operativos fijos, gastos variables y depreciación de equipos. Representa la ganancia o pérdida real del consultorio en el período.                                          |
|**Laboratorio dental**          |Servicio externo al que el odontólogo encarga la fabricación de prótesis, coronas, carillas y aparatos de ortodoncia. Su costo es un gasto variable del consultorio.                                    |
|**Gasto recurrente**            |Gasto fijo mensual (arriendo, sueldos, servicios) que TOOTH X puede registrar automáticamente al inicio de cada mes, evitando el ingreso manual repetitivo.                                             |

-----

*TOOTH X — Documento 1: Product Brief · v1.0 · Mayo 2026*
*Próximo documento: Feature Map con prioridades y fases de desarrollo*