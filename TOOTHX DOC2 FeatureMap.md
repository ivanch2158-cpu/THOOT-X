# DOCUMENTO 2 — FEATURE MAP

## TOOTH X · Mapa de Funcionalidades con Prioridades y Fases

-----

|Campo                     |Detalle                               |
|--------------------------|--------------------------------------|
|**Proyecto**              |TOOTH X                               |
|**Versión**               |v1.0                                  |
|**Método de priorización**|MoSCoW (Must / Should / Could / Won’t)|
|**Fases de desarrollo**   |4 fases secuenciales                  |
|**Fecha del documento**   |Mayo 2026                             |

-----

## GUÍA DE LECTURA

### Prioridad MoSCoW

|Código                   |Significado                                                                     |
|-------------------------|--------------------------------------------------------------------------------|
|🔴 **M** — Must Have      |Obligatorio. Sin esta función la app no puede lanzarse ni tiene valor.          |
|🟡 **S** — Should Have    |Importante. Debe estar en v1.0 pero no bloquea el lanzamiento inicial.          |
|🟢 **C** — Could Have     |Deseable. Agrega valor pero puede entrar en v1.1 si hay restricciones de tiempo.|
|⚫ **W** — Won’t Have v1.0|Explícitamente excluido de esta versión. Planificado para v2.0 en adelante.     |

### Complejidad de desarrollo

|Código|Significado |Tiempo estimado |
|------|------------|----------------|
|**XS**|Muy simple  |Menos de 1 día  |
|**S** |Simple      |1 a 2 días      |
|**M** |Moderada    |3 a 5 días      |
|**L** |Compleja    |1 a 2 semanas   |
|**XL**|Muy compleja|Más de 2 semanas|

### Fases de desarrollo

- **FASE 1 — Fundación:** Infraestructura base. Sin esto nada más funciona.
- **FASE 2 — Núcleo Clínico:** El corazón de la app. Lo que justifica su existencia.
- **FASE 3 — Administración:** Facturación, inventario, gestión financiera y métricas del negocio.
- **FASE 4 — Comunicaciones:** Notificaciones automáticas a pacientes.
- **FASE 5 — Asistente de Voz:** Capa completa de interacción por voz para toda la jornada clínica.

-----

## FASE 1 — FUNDACIÓN

> **Objetivo:** Tener la estructura base funcionando: autenticación, multi-tenancy, layout principal y configuración del consultorio. Sin esta fase ningún otro módulo puede construirse.

### MÓDULO 1A — Infraestructura del Proyecto

|ID   |Funcionalidad                                                                      |Prioridad|Complejidad|Dependencias|
|-----|-----------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F1-01|Configuración inicial del proyecto (Next.js 14 + TypeScript + Tailwind + shadcn/ui)|🔴 M      |S          |Ninguna     |
|F1-02|Configuración de Supabase (proyecto, base de datos PostgreSQL)                     |🔴 M      |S          |F1-01       |
|F1-03|Configuración de Prisma ORM y schema inicial                                       |🔴 M      |M          |F1-02       |
|F1-04|Configuración de variables de entorno (.env) y estructura de carpetas              |🔴 M      |XS         |F1-01       |
|F1-05|Repositorio GitHub con ramas: `main`, `develop`, `feature/*`                       |🔴 M      |XS         |F1-01       |
|F1-06|Deploy inicial en Vercel conectado al repositorio                                  |🔴 M      |S          |F1-01, F1-05|

-----

### MÓDULO 1B — Autenticación y Seguridad

|ID   |Funcionalidad                                                         |Prioridad|Complejidad|Dependencias|
|-----|----------------------------------------------------------------------|:-------:|:---------:|------------|
|F1-07|Página de Login (email + contraseña)                                  |🔴 M      |S          |F1-02       |
|F1-08|Página de Recuperación de contraseña (envío de email)                 |🔴 M      |S          |F1-07       |
|F1-09|Middleware de protección de rutas (redirige al login si no hay sesión)|🔴 M      |M          |F1-07       |
|F1-10|Sistema de roles en el JWT (admin, doctor, secretary)                 |🔴 M      |M          |F1-07       |
|F1-11|Guards de permisos por rol en cada ruta y componente                  |🔴 M      |M          |F1-10       |
|F1-12|Logout con limpieza de sesión                                         |🔴 M      |XS         |F1-07       |
|F1-13|Página de acceso denegado (403) para rutas sin permiso                |🟡 S      |XS         |F1-11       |
|F1-14|Bloqueo de cuenta tras 5 intentos fallidos de login                   |🟢 C      |S          |F1-07       |

-----

### MÓDULO 1C — Multi-tenancy (Aislamiento de Consultorios)

|ID   |Funcionalidad                                                                           |Prioridad|Complejidad|Dependencias|
|-----|----------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F1-15|Tabla `tenants` en base de datos con todos los campos del consultorio                   |🔴 M      |S          |F1-03       |
|F1-16|Campo `tenant_id` en todas las tablas de datos clínicos y administrativos               |🔴 M      |M          |F1-15       |
|F1-17|Políticas Row Level Security (RLS) activadas en todas las tablas                        |🔴 M      |L          |F1-16       |
|F1-18|Hook `useTenant()` que provee el contexto del consultorio activo a toda la app          |🔴 M      |M          |F1-15, F1-10|
|F1-19|Pruebas de aislamiento: verificar que usuario de tenant A no puede ver datos de tenant B|🔴 M      |M          |F1-17       |

-----

### MÓDULO 1D — Layout Principal y Theming

|ID   |Funcionalidad                                                                      |Prioridad|Complejidad|Dependencias|
|-----|-----------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F1-20|Sidebar de navegación con íconos y etiquetas por módulo                            |🔴 M      |M          |F1-09       |
|F1-21|Sidebar colapsable (modo compacto solo con íconos)                                 |🟡 S      |S          |F1-20       |
|F1-22|Header con nombre del consultorio, avatar del usuario y botón de logout            |🔴 M      |S          |F1-20       |
|F1-23|Carga dinámica de variables CSS del tenant (color primario, secundario, tipografía)|🔴 M      |M          |F1-18       |
|F1-24|Visualización del logo del consultorio en el sidebar y el header                   |🔴 M      |S          |F1-23       |
|F1-25|Página 404 personalizada con diseño TOOTH X                                        |🟢 C      |XS         |F1-20       |
|F1-26|Diseño responsive: sidebar se convierte en menú hamburguesa en tablet              |🟡 S      |M          |F1-20       |

-----

### MÓDULO 1E — Configuración del Consultorio (Onboarding)

|ID   |Funcionalidad                                                                   |Prioridad|Complejidad|Dependencias|
|-----|--------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F1-27|Wizard de onboarding paso a paso (primera vez que entra un consultorio)         |🔴 M      |L          |F1-18       |
|F1-28|Paso 1 del wizard: datos del consultorio (nombre, RUC, dirección, teléfono)     |🔴 M      |S          |F1-27       |
|F1-29|Paso 2 del wizard: subir logo, elegir color primario y secundario               |🔴 M      |M          |F1-27       |
|F1-30|Paso 3 del wizard: elegir tipografía (Inter, Plus Jakarta Sans, Nunito, Poppins, DM Sans)|🟡 S      |S          |F1-27       |
|F1-31|Paso 4 del wizard: configurar horarios de atención por día de la semana         |🔴 M      |M          |F1-27       |
|F1-32|Paso 5 del wizard: crear primer usuario (odontólogo o secretaria)               |🔴 M      |S          |F1-27       |
|F1-33|Página de configuración del consultorio (editar datos post-onboarding)          |🔴 M      |M          |F1-28, F1-29|
|F1-34|Gestión de usuarios del consultorio: crear, editar, desactivar                  |🔴 M      |M          |F1-10, F1-33|
|F1-35|Asignación de rol a cada usuario (admin, odontólogo, secretaria)                |🔴 M      |S          |F1-34       |
|F1-36|Perfil personal del usuario (cambiar nombre, foto, contraseña)                  |🟡 S      |S          |F1-07       |

-----

## FASE 2 — NÚCLEO CLÍNICO

> **Objetivo:** Construir los módulos que definen la propuesta de valor clínica de TOOTH X: pacientes, agenda, historia clínica y odontograma con voz.

### MÓDULO 2A — Pacientes

|ID   |Funcionalidad                                                                         |Prioridad|Complejidad|Dependencias|
|-----|--------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F2-01|Listado de pacientes con tabla paginada                                               |🔴 M      |M          |F1-17       |
|F2-02|Búsqueda de pacientes por nombre, apellido o número de documento                      |🔴 M      |S          |F2-01       |
|F2-03|Filtros de pacientes: por estado (activo/inactivo), por odontólogo tratante           |🟡 S      |S          |F2-01       |
|F2-04|Formulario de registro de nuevo paciente                                              |🔴 M      |M          |F2-01       |
|F2-05|Campos obligatorios: nombres, apellidos, tipo documento, número documento, teléfono   |🔴 M      |S          |F2-04       |
|F2-06|Campos opcionales: email, fecha nacimiento, sexo, dirección, foto                     |🟡 S      |S          |F2-04       |
|F2-07|Sección de antecedentes médicos y alergias en la ficha del paciente                   |🔴 M      |S          |F2-04       |
|F2-08|Vista de ficha completa del paciente (datos + pestañas de módulos)                    |🔴 M      |M          |F2-04       |
|F2-09|Edición de datos del paciente                                                         |🔴 M      |S          |F2-08       |
|F2-10|Desactivar / archivar paciente (sin eliminar sus datos)                               |🟡 S      |S          |F2-08       |
|F2-11|Adjuntar archivos a la ficha del paciente (radiografías, PDF, imágenes)               |🟡 S      |L          |F2-08       |
|F2-12|Vista previa de archivos adjuntos directamente en la app                              |🟢 C      |M          |F2-11       |
|F2-13|Historial resumido en la ficha: últimas citas, último odontograma, facturas pendientes|🟡 S      |M          |F2-08       |

-----

### MÓDULO 2B — Agenda / Calendario Interactivo

|ID   |Funcionalidad                                                                                      |Prioridad|Complejidad|Dependencias|
|-----|---------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F2-14|Vista de calendario semanal con slots de hora por odontólogo                                       |🔴 M      |L          |F1-17, F2-01|
|F2-15|Vista de calendario diaria (detalle del día seleccionado)                                          |🔴 M      |M          |F2-14       |
|F2-16|Vista de calendario mensual (vista general con puntos de citas)                                    |🟡 S      |M          |F2-14       |
|F2-17|Crear cita desde el calendario haciendo clic en un slot vacío                                      |🔴 M      |M          |F2-14       |
|F2-18|Modal de nueva cita: paciente, odontólogo, fecha, hora, duración, motivo                           |🔴 M      |M          |F2-17       |
|F2-19|Búsqueda del paciente dentro del modal de nueva cita                                               |🔴 M      |S          |F2-18       |
|F2-20|Crear paciente nuevo desde el modal de cita (flujo rápido sin salir del calendario)                |🟡 S      |M          |F2-18, F2-04|
|F2-21|Editar cita desde el calendario (clic sobre la cita)                                               |🔴 M      |M          |F2-14       |
|F2-22|Arrastrar y soltar cita para cambiar hora (drag & drop)                                            |🟡 S      |L          |F2-14       |
|F2-23|Cambiar estado de la cita: Programada / Confirmada / En curso / Completada / Cancelada / No asistió|🔴 M      |S          |F2-21       |
|F2-24|Código de color por estado de cita en el calendario                                                |🔴 M      |S          |F2-23       |
|F2-25|Bloquear horario en el calendario (vacaciones, descanso, reunión)                                  |🟡 S      |M          |F2-14       |
|F2-26|Filtro por odontólogo cuando hay más de uno en el consultorio                                      |🔴 M      |S          |F2-14       |
|F2-27|Respetar los horarios de atención configurados (no mostrar slots fuera del horario)                |🔴 M      |M          |F1-31, F2-14|
|F2-28|Indicador visual de disponibilidad (horas libres vs ocupadas)                                      |🟡 S      |S          |F2-14       |
|F2-29|Duración de cita configurable por defecto (30 min, 45 min, 1 hora, etc.)                           |🔴 M      |S          |F1-33       |
|F2-30|Detalle de la cita: ver datos del paciente, motivo y notas sin salir del calendario                |🟡 S      |S          |F2-21       |

-----

### MÓDULO 2C — Historia Clínica

|ID   |Funcionalidad                                                                             |Prioridad|Complejidad|Dependencias|
|-----|------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F2-31|Lista de evoluciones del paciente ordenadas de más reciente a más antigua                 |🔴 M      |M          |F2-08       |
|F2-32|Crear nueva evolución clínica                                                             |🔴 M      |M          |F2-31       |
|F2-33|Campos de la evolución: fecha, motivo de consulta, anamnesis, examen clínico              |🔴 M      |M          |F2-32       |
|F2-34|Campos de la evolución: diagnóstico, plan de tratamiento en texto libre                   |🔴 M      |S          |F2-32       |
|F2-35|Plan de tratamiento estructurado: tabla de ítems con diente, procedimiento, estado y costo|🔴 M      |M          |F2-32       |
|F2-36|Estados del ítem del plan: Pendiente / En progreso / Completado                           |🟡 S      |S          |F2-35       |
|F2-37|Vincular ítems del plan de tratamiento a ítems de factura                                 |🔴 M      |M          |F2-35, F3-01|
|F2-38|Notas adicionales de la evolución (texto libre)                                           |🔴 M      |XS         |F2-32       |
|F2-39|Adjuntar imágenes a la evolución (fotos clínicas)                                         |🟡 S      |M          |F2-32       |
|F2-40|Editar evolución (solo el odontólogo que la creó o el admin)                              |🟡 S      |S          |F2-32       |
|F2-41|Ver evolución en modo solo lectura                                                        |🔴 M      |S          |F2-31       |
|F2-42|Indicador de qué cita dio origen a cada evolución                                         |🟢 C      |S          |F2-32, F2-14|

-----

### MÓDULO 2D — Odontograma Interactivo

|ID   |Funcionalidad                                                                                                         |Prioridad|Complejidad|Dependencias|
|-----|----------------------------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F2-43|Renderizado SVG del odontograma adulto (dientes 11–48, notación FDI)                                                  |🔴 M      |XL         |F2-08       |
|F2-44|Renderizado SVG del odontograma pediátrico (dientes 51–85)                                                            |🟡 S      |L          |F2-43       |
|F2-45|Selector de tipo de odontograma: adulto / pediátrico por paciente                                                     |🟡 S      |S          |F2-43, F2-44|
|F2-46|Clic en diente para seleccionarlo y ver sus superficies                                                               |🔴 M      |M          |F2-43       |
|F2-47|Clic en superficie individual del diente (oclusal, vestibular, palatino, mesial, distal)                              |🔴 M      |L          |F2-46       |
|F2-48|Panel lateral para asignar condición/tratamiento a la superficie seleccionada                                         |🔴 M      |M          |F2-47       |
|F2-49|Catálogo de condiciones: caries, obturación, corona, ausente, fractura, implante, endodoncia, sellante, prótesis, sano|🔴 M      |M          |F2-48       |
|F2-50|Colorimetría estándar clínica: cada condición pinta la superficie de un color específico                              |🔴 M      |M          |F2-49       |
|F2-51|Guardar cambios del odontograma vinculados a la evolución activa                                                      |🔴 M      |M          |F2-43, F2-32|
|F2-52|Historial del odontograma: selector de fecha para ver el estado en cualquier fecha anterior                           |🟡 S      |L          |F2-51       |
|F2-53|Vista comparativa: estado inicial del paciente vs. estado actual                                                      |🟢 C      |L          |F2-52       |
|F2-54|Exportar/imprimir el odontograma como imagen PNG                                                                      |🟡 S      |M          |F2-43       |
|F2-55|Notas por diente (campo de texto libre al hacer clic en un diente)                                                    |🟢 C      |S          |F2-46       |

-----

### MÓDULO 2E — Odontograma por Voz

|ID   |Funcionalidad                                                                                                   |Prioridad|Complejidad|Dependencias|
|-----|----------------------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F2-56|Botón de activación del modo voz en la pantalla del odontograma                                                 |🔴 M      |S          |F2-43       |
|F2-57|Integración con Web Speech API (SpeechRecognition) en idioma `es-PE`                                            |🔴 M      |M          |F2-56       |
|F2-58|Indicador visual de escucha activa (micrófono pulsando + texto “Escuchando…”)                                   |🔴 M      |S          |F2-57       |
|F2-59|Transcripción en tiempo real del audio a texto visible en pantalla                                              |🔴 M      |S          |F2-57       |
|F2-60|Parser de comando de voz: extrae número de diente, superficie y condición del texto                             |🔴 M      |XL         |F2-59       |
|F2-61|Normalización de números hablados: “dieciséis” → 16, “uno seis” → 16, “uno punto seis” → 16                     |🔴 M      |L          |F2-60       |
|F2-62|Reconocimiento de sinónimos de superficie: “masticatoria” → oclusal, “lingual” → palatino                       |🔴 M      |M          |F2-60       |
|F2-63|Reconocimiento de sinónimos de condición: “empaste” → obturación, “nervio” → endodoncia                         |🔴 M      |M          |F2-60       |
|F2-64|Tolerancia a errores de pronunciación con similitud fonética (Levenshtein)                                      |🟡 S      |L          |F2-60       |
|F2-65|Barra de confirmación: muestra la interpretación antes de guardar (“Diente 16 · Oclusal · Caries — ¿Confirmar?”)|🔴 M      |M          |F2-60       |
|F2-66|Previsualización del diente en amarillo antes de confirmar                                                      |🔴 M      |M          |F2-65       |
|F2-67|Confirmación por voz: “confirmar” / “sí” guarda el hallazgo                                                     |🔴 M      |M          |F2-65       |
|F2-68|Cancelación por voz: “cancelar” / “no” descarta el comando actual                                               |🔴 M      |S          |F2-65       |
|F2-69|Comando “deshacer” revierte el último cambio guardado                                                           |🔴 M      |M          |F2-67       |
|F2-70|Comando “terminar” o “modo voz apagado” cierra el modo voz                                                      |🔴 M      |S          |F2-57       |
|F2-71|Log de sesión de voz: lista de comandos dictados en la sesión actual con opción de eliminar                     |🟡 S      |M          |F2-67       |
|F2-72|Modo escucha continua: tras confirmar, vuelve automáticamente a escuchar                                        |🔴 M      |S          |F2-67       |
|F2-73|Indicador de nivel de ruido ambiente                                                                            |🟢 C      |M          |F2-57       |
|F2-74|Mensaje de advertencia si el navegador no soporta Web Speech API                                                |🔴 M      |XS         |F2-57       |
|F2-75|Atajo de teclado (Barra espaciadora) para activar/desactivar el modo voz                                        |🟢 C      |S          |F2-56       |

-----

## FASE 3 — ADMINISTRACIÓN

> **Objetivo:** Construir los módulos que permiten gestionar el negocio del consultorio: facturación, inventario y métricas.

### MÓDULO 3A — Facturación

|ID   |Funcionalidad                                                                |Prioridad|Complejidad|Dependencias|
|-----|-----------------------------------------------------------------------------|:-------:|:---------:|------------|
|F3-01|Lista de facturas del consultorio con filtros por fecha, paciente y estado   |🔴 M      |M          |F1-17       |
|F3-02|Crear nueva factura desde la ficha del paciente                              |🔴 M      |M          |F2-08, F3-01|
|F3-03|Carga automática de ítems desde el plan de tratamiento de la evolución       |🟡 S      |M          |F3-02, F2-35|
|F3-04|Agregar ítems manualmente: descripción, cantidad, precio unitario            |🔴 M      |M          |F3-02       |
|F3-05|Editar y eliminar ítems de la factura antes de emitirla                      |🔴 M      |S          |F3-04       |
|F3-06|Descuento por ítem individual (porcentaje o monto fijo)                      |🟡 S      |S          |F3-04       |
|F3-07|Descuento global sobre el subtotal (porcentaje o monto fijo)                 |🟡 S      |S          |F3-02       |
|F3-08|Cálculo automático: subtotal, descuentos, total a pagar                      |🔴 M      |S          |F3-04       |
|F3-09|Registro del método de pago: efectivo, transferencia, tarjeta, cuotas        |🔴 M      |S          |F3-02       |
|F3-10|Registro de pago completo (marca factura como “Pagada”)                      |🔴 M      |S          |F3-09       |
|F3-11|Registro de abono parcial (actualiza monto pendiente, estado “Parcial”)      |🔴 M      |M          |F3-09       |
|F3-12|Historial de abonos por factura                                              |🟡 S      |S          |F3-11       |
|F3-13|Numeración automática de facturas por consultorio (reinicia en 1 por tenant) |🔴 M      |M          |F3-02       |
|F3-14|Generación de factura en PDF con logo, datos del consultorio, ítems y totales|🔴 M      |L          |F3-02       |
|F3-15|Descarga del PDF de factura desde el navegador                               |🔴 M      |S          |F3-14       |
|F3-16|Impresión directa del PDF de factura                                         |🔴 M      |S          |F3-14       |
|F3-17|Vista previa de la factura antes de emitir                                   |🟡 S      |M          |F3-14       |
|F3-18|Reporte de cartera: facturas pendientes con monto y días de atraso           |🟡 S      |M          |F3-01       |

-----

### MÓDULO 3B — Inventario

|ID   |Funcionalidad                                                                               |Prioridad|Complejidad|Dependencias|
|-----|--------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F3-19|Lista de equipos del consultorio con tabla                                                  |🔴 M      |M          |F1-17       |
|F3-20|Registro de nuevo equipo: nombre, marca, modelo, serial, categoría                          |🔴 M      |M          |F3-19       |
|F3-21|Datos de compra del equipo: fecha, valor de compra, proveedor                               |🔴 M      |S          |F3-20       |
|F3-22|Vida útil estimada en años y valor residual al final de la vida útil                        |🔴 M      |S          |F3-20       |
|F3-23|Cálculo automático de depreciación lineal anual: (Valor compra − Valor residual) ÷ Vida útil|🔴 M      |M          |F3-22       |
|F3-24|Valor en libros actual del equipo (valor compra − depreciación acumulada)                   |🔴 M      |S          |F3-23       |
|F3-25|Estado del equipo: Activo / En mantenimiento / Dado de baja                                 |🟡 S      |S          |F3-20       |
|F3-26|Lista de insumos con stock actual y stock mínimo                                            |🔴 M      |M          |F1-17       |
|F3-27|Registro de nuevo insumo: nombre, categoría, unidad de medida, stock mínimo, precio unitario|🔴 M      |M          |F3-26       |
|F3-28|Registro de entrada de insumos (compra): cantidad, precio unitario, proveedor, fecha        |🔴 M      |M          |F3-26       |
|F3-29|Registro de salida/uso de insumos: cantidad usada, fecha, quién lo registra                 |🔴 M      |M          |F3-26       |
|F3-30|Alerta visual (badge rojo) en insumos con stock igual o menor al mínimo                     |🔴 M      |S          |F3-26       |
|F3-31|Alerta en el Dashboard cuando hay insumos en stock mínimo                                   |🟡 S      |S          |F3-30, F3-37|
|F3-32|Reporte de inventario valorizado (cantidad × precio unitario por insumo)                    |🟡 S      |M          |F3-26       |
|F3-33|Historial de movimientos por insumo (entradas y salidas con trazabilidad)                   |🟡 S      |M          |F3-28, F3-29|

-----

### MÓDULO 3C — Dashboard de Métricas

|ID   |Funcionalidad                                                                                     |Prioridad|Complejidad|Dependencias|
|-----|--------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F3-34|Tarjetas de resumen del día: citas programadas, citas completadas, ingresos del día               |🔴 M      |M          |F2-14, F3-01|
|F3-35|Tarjeta de pacientes atendidos en el mes actual vs. mes anterior                                  |🟡 S      |M          |F2-14       |
|F3-36|Tarjeta de ingresos del mes actual vs. mes anterior                                               |🔴 M      |M          |F3-01       |
|F3-37|Tarjeta de facturas pendientes de pago (cartera total)                                            |🔴 M      |S          |F3-01       |
|F3-38|Gráfico de barras: ingresos por mes del año en curso                                              |🔴 M      |M          |F3-01       |
|F3-39|Gráfico de torta: citas por estado (completadas, canceladas, no asistidas)                        |🟡 S      |M          |F2-14       |
|F3-40|Gráfico de barras horizontales: top 5 tratamientos más realizados en el período                   |🟡 S      |M          |F2-35       |
|F3-41|Gráfico de línea: pacientes nuevos vs. recurrentes por mes                                        |🟢 C      |M          |F2-01       |
|F3-42|Selector de rango de fechas para filtrar todas las métricas                                       |🟡 S      |M          |F3-34       |
|F3-43|Selector de odontólogo para filtrar métricas (cuando hay más de uno)                              |🟢 C      |M          |F3-34       |
|F3-44|Tarjeta de rentabilidad del mes: resultado neto (ganancia/pérdida) con indicador visual verde/rojo|🔴 M      |M          |F3-55, F3-01|
|F3-45|Tarjeta resumen: total ingresos vs. total gastos del mes                                          |🔴 M      |M          |F3-55, F3-01|
|F3-46|Gráfico de línea doble: ingresos vs. gastos totales de los últimos 12 meses                       |🔴 M      |M          |F3-55, F3-01|
|F3-47|Gráfico de torta: desglose de gastos por categoría del mes                                        |🟡 S      |M          |F3-55       |

-----

### MÓDULO 3D — Gestión Financiera y Rentabilidad

|ID   |Funcionalidad                                                                                                                     |Prioridad|Complejidad|Dependencias              |
|-----|----------------------------------------------------------------------------------------------------------------------------------|:-------:|:---------:|--------------------------|
|F3-48|Listado de gastos del consultorio con filtro por mes, categoría y tipo (fijo/variable)                                            |🔴 M      |M          |F1-17                     |
|F3-49|Formulario de registro de nuevo gasto: categoría, tipo, descripción, monto, fecha                                                 |🔴 M      |M          |F3-48                     |
|F3-50|Categorías de gasto fijo: Arriendo, Sueldos, Servicios públicos, Seguros, Suscripciones, Otros fijos                              |🔴 M      |S          |F3-49                     |
|F3-51|Categorías de gasto variable: Laboratorio dental, Mantenimiento, Marketing, Capacitación, Otros variables                         |🔴 M      |S          |F3-49                     |
|F3-52|Vincular gasto de laboratorio dental a un paciente y tratamiento específico (opcional)                                            |🟡 S      |M          |F3-49, F2-35              |
|F3-53|Marcar gasto como recurrente mensual: el sistema lo registra automáticamente el día 1 de cada mes                                 |🔴 M      |M          |F3-49                     |
|F3-54|Notificación interna al Admin al inicio de cada mes: “Revisa y confirma tus gastos recurrentes de [mes]”                          |🟡 S      |S          |F3-53                     |
|F3-55|Motor de cálculo del Estado de Resultados mensual (P&L): combina ingresos, costos directos, gastos fijos, variables y depreciación|🔴 M      |XL         |F3-01, F3-48, F3-23, F3-29|
|F3-56|Cálculo automático de insumos consumidos como costo directo (desde movimientos de inventario × precio unitario)                   |🔴 M      |M          |F3-29, F3-55              |
|F3-57|Cálculo automático de depreciación mensual total de equipos (desde módulo de inventario)                                          |🔴 M      |M          |F3-23, F3-55              |
|F3-58|Vista del Estado de Resultados del mes actual con todos los rubros desglosados                                                    |🔴 M      |L          |F3-55                     |
|F3-59|Vista comparativa del Estado de Resultados: mes actual vs. mes anterior                                                           |🟡 S      |M          |F3-55                     |
|F3-60|Estado de Resultados acumulado del año en curso (enero a mes actual)                                                              |🟡 S      |M          |F3-55                     |
|F3-61|Indicador visual de rentabilidad: ✅ GANANCIA o ❌ PÉRDIDA con monto y porcentaje de margen neto                                    |🔴 M      |S          |F3-55                     |
|F3-62|Editar o eliminar un gasto registrado (solo Admin)                                                                                |🔴 M      |S          |F3-48                     |
|F3-63|Exportar Estado de Resultados a PDF                                                                                               |🟡 S      |M          |F3-58                     |
|F3-64|Exportar listado de gastos del período a PDF                                                                                      |🟢 C      |M          |F3-48                     |

-----

## FASE 4 — COMUNICACIONES

> **Objetivo:** Activar las notificaciones automáticas de citas para reducir el ausentismo, usando los canales gratuitos ya definidos.

### MÓDULO 4A — Notificaciones por Email

|ID   |Funcionalidad                                                                   |Prioridad|Complejidad|Dependencias|
|-----|--------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F4-01|Integración con Resend.com (SDK en Next.js, dominio verificado)                 |🔴 M      |M          |F1-02       |
|F4-02|Plantilla de email: confirmación de cita agendada                               |🔴 M      |M          |F4-01       |
|F4-03|Plantilla de email: recordatorio 24 horas antes de la cita                      |🔴 M      |M          |F4-01       |
|F4-04|Plantilla de email: notificación de cita reagendada                             |🟡 S      |S          |F4-01       |
|F4-05|Plantilla de email: notificación de cita cancelada                              |🟡 S      |S          |F4-01       |
|F4-06|Las plantillas incluyen logo y colores del consultorio (theming por tenant)     |🟡 S      |M          |F4-02, F1-23|
|F4-07|Job programado (cron job): enviar recordatorios 24h antes cada día a las 9:00 AM|🔴 M      |M          |F4-03       |
|F4-08|Activar/desactivar cada tipo de email desde la configuración del consultorio    |🟡 S      |S          |F4-01       |
|F4-09|Registro de emails enviados por cita (para evitar duplicados)                   |🟡 S      |S          |F4-07       |

-----

### MÓDULO 4B — Notificaciones por WhatsApp

|ID   |Funcionalidad                                                                         |Prioridad|Complejidad|Dependencias|
|-----|--------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F4-10|Integración con WhatsApp Cloud API (Meta): credenciales y token de acceso             |🔴 M      |L          |F1-02       |
|F4-11|Pantalla de configuración para conectar el número de WhatsApp Business del consultorio|🔴 M      |M          |F4-10       |
|F4-12|Plantilla preaprobada: confirmación de cita agendada                                  |🔴 M      |M          |F4-10       |
|F4-13|Plantilla preaprobada: recordatorio 24 horas antes de la cita                         |🔴 M      |M          |F4-10       |
|F4-14|Plantilla preaprobada: recordatorio 2 horas antes de la cita                          |🟡 S      |S          |F4-10       |
|F4-15|Plantilla preaprobada: cita reagendada                                                |🟡 S      |S          |F4-10       |
|F4-16|Plantilla preaprobada: cita cancelada                                                 |🟡 S      |S          |F4-10       |
|F4-17|Job programado: enviar recordatorio de 2h antes en tiempo real                        |🟡 S      |M          |F4-14       |
|F4-18|Activar/desactivar WhatsApp por tipo de notificación desde configuración              |🟡 S      |S          |F4-10       |
|F4-19|Indicador de estado del envío por cita: enviado / fallido / pendiente                 |🟢 C      |M          |F4-12       |

-----

## FASE 5 — ASISTENTE CLÍNICO DE VOZ

> **Objetivo:** Construir la capa de voz que cubre toda la jornada clínica: login por PIN de voz, consultas de agenda, navegación, gestión de citas, tratamientos y facturación. La app escucha, actúa y responde en voz alta. Todo con tecnología gratuita del navegador.

### MÓDULO 5A — Infraestructura del Asistente de Voz

|ID   |Funcionalidad                                                                                    |Prioridad|Complejidad|Dependencias|
|-----|-------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F5-01|Hook `useVoiceAssistant()`: orquesta escucha, parseo, ejecución y respuesta                      |🔴 M      |XL         |F1-09       |
|F5-02|Integración con Web Speech API SpeechRecognition en `es-PE` (escucha)                            |🔴 M      |M          |F5-01       |
|F5-03|Integración con Web Speech Synthesis API (respuestas en voz alta)                                |🔴 M      |M          |F5-01       |
|F5-04|Registro central de comandos (`commandRegistry`): mapea patrón de texto → acción → respuesta     |🔴 M      |L          |F5-01       |
|F5-05|Botón de micrófono flotante visible en todo el header de la app                                  |🔴 M      |S          |F5-01       |
|F5-06|Atajo de teclado `Alt+M` para activar/desactivar escucha                                         |🟡 S      |S          |F5-01       |
|F5-07|Indicador visual de estado: escuchando (rojo pulsando) / procesando (azul) / respondiendo (verde)|🔴 M      |S          |F5-02       |
|F5-08|Modo silencioso: ejecuta acciones sin responder en voz alta                                      |🟡 S      |S          |F5-03       |
|F5-09|Comando “silencio” activa modo silencioso; “habla de nuevo” lo desactiva                         |🟡 S      |S          |F5-08       |
|F5-10|Mensaje de advertencia si el navegador no soporta Web Speech API                                 |🔴 M      |XS         |F5-02       |
|F5-11|Tarjeta de referencia de comandos en pantalla (activada con “ayuda”)                             |🟡 S      |M          |F5-04       |
|F5-12|Tarjeta de referencia imprimible en PDF con todos los comandos por grupo                         |🟢 C      |M          |F5-04       |
|F5-13|Escucha continua: tras ejecutar un comando vuelve automáticamente a escuchar                     |🔴 M      |M          |F5-02       |

-----

### MÓDULO 5B — Login por Voz (PIN de Voz)

|ID   |Funcionalidad                                                                                   |Prioridad|Complejidad|Dependencias|
|-----|------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F5-14|Campo de configuración del PIN de voz (4 dígitos) en el perfil del usuario                      |🔴 M      |M          |F1-36       |
|F5-15|Almacenamiento del PIN de voz como hash seguro (bcrypt) en la base de datos                     |🔴 M      |S          |F5-14       |
|F5-16|Botón de micrófono visible en la pantalla de login                                              |🔴 M      |S          |F1-07       |
|F5-17|Reconocimiento del comando de login: “Doctor [nombre] PIN [dígito][dígito][dígito][dígito]”     |🔴 M      |L          |F5-02, F5-15|
|F5-18|Verificación del PIN de voz y autenticación de sesión                                           |🔴 M      |M          |F5-17       |
|F5-19|Respuesta de bienvenida en voz: nombre del doctor, número de pacientes del día y primer paciente|🔴 M      |M          |F5-18, F2-14|
|F5-20|Bloqueo tras 3 intentos fallidos de PIN de voz (exige login manual)                             |🔴 M      |S          |F5-17       |
|F5-21|Sesión de 14 horas de duración para no expirar durante la jornada laboral                       |🔴 M      |S          |F5-18       |

-----

### MÓDULO 5C — Comandos de Consulta de Agenda

|ID   |Funcionalidad                                                                     |Prioridad|Complejidad|Dependencias       |
|-----|----------------------------------------------------------------------------------|:-------:|:---------:|-------------------|
|F5-22|Comando “¿Cuántos pacientes tengo hoy?” → consulta agenda y responde en voz       |🔴 M      |M          |F5-04, F2-14       |
|F5-23|Comando “¿Quién es mi primer/siguiente/último paciente?” → nombre, hora y motivo  |🔴 M      |M          |F5-04, F2-14       |
|F5-24|Comando “¿A qué hora es mi próxima cita?” → hora de la siguiente cita pendiente   |🔴 M      |S          |F5-04, F2-14       |
|F5-25|Comando “¿Cuántas citas me quedan?” → citas no atendidas del día                  |🔴 M      |S          |F5-04, F2-14       |
|F5-26|Comando “Dame el resumen del día” → completados, pendientes, cancelados e ingresos|🟡 S      |M          |F5-04, F2-14, F3-01|
|F5-27|Comando “¿Cuánto he facturado hoy?” → total facturado y cobrado en el día         |🟡 S      |M          |F5-04, F3-01       |

-----

### MÓDULO 5D — Comandos de Navegación

|ID   |Funcionalidad                                                                                   |Prioridad|Complejidad|Dependencias       |
|-----|------------------------------------------------------------------------------------------------|:-------:|:---------:|-------------------|
|F5-28|Comando “Ir al inicio” / “Ir al dashboard” → navega al Dashboard                                |🔴 M      |S          |F5-04              |
|F5-29|Comando “Abrir agenda” / “Ver citas” → navega al Calendario                                     |🔴 M      |S          |F5-04              |
|F5-30|Comando “Abrir pacientes” → navega al listado de pacientes                                      |🔴 M      |S          |F5-04              |
|F5-31|Comando “Abrir inventario” → navega al módulo de inventario                                     |🟡 S      |S          |F5-04              |
|F5-32|Comando “Abrir configuración” → navega a Configuración                                          |🟡 S      |S          |F5-04              |
|F5-33|Comando “Abrir el primer paciente” → abre ficha del 1er paciente de la agenda de hoy            |🔴 M      |M          |F5-04, F2-14, F2-08|
|F5-34|Comando “Abrir el siguiente paciente” → abre ficha del siguiente en agenda                      |🔴 M      |M          |F5-04, F2-14, F2-08|
|F5-35|Comando “Abrir el odontograma de [nombre]” → busca paciente por nombre y navega a su odontograma|🔴 M      |M          |F5-04, F2-43       |
|F5-36|Comando “Cerrar sesión” → cierra la sesión y responde en voz con despedida                      |🟡 S      |S          |F5-04, F1-12       |

-----

### MÓDULO 5E — Comandos de Gestión de Citas

|ID   |Funcionalidad                                                                                     |Prioridad|Complejidad|Dependencias|
|-----|--------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F5-37|Comando “Paciente en sala” / “Inicio de atención” → cambia cita activa a “En curso”               |🔴 M      |M          |F5-04, F2-23|
|F5-38|Comando “Finalizar cita” / “Cita completada” → cambia a “Completada” y pregunta si generar factura|🔴 M      |M          |F5-04, F2-23|
|F5-39|Comando “Paciente no asistió” → cambia a “No asistió” e informa del siguiente paciente            |🟡 S      |M          |F5-04, F2-23|

-----

### MÓDULO 5F — Comandos de Plan de Tratamiento

|ID   |Funcionalidad                                                                             |Prioridad|Complejidad|Dependencias       |
|-----|------------------------------------------------------------------------------------------|:-------:|:---------:|-------------------|
|F5-40|Comando “¿Cuántos tratamientos tiene este paciente?” → cuenta ítems del plan activo       |🟡 S      |M          |F5-04, F2-35       |
|F5-41|Comando “Procederé con los tratamientos” → cambia todos los ítems del plan a “En progreso”|🔴 M      |M          |F5-04, F2-35, F2-36|
|F5-42|Comando “Tratamiento finalizado” → marca el ítem activo del plan como “Completado”        |🔴 M      |M          |F5-04, F2-35, F2-36|
|F5-43|Comando “Tratamiento pendiente” → marca el ítem activo como “Pendiente” para próxima cita |🔴 M      |M          |F5-04, F2-35, F2-36|
|F5-44|Comando “Siguiente tratamiento” → avanza al siguiente ítem del plan y lo enuncia en voz   |🟡 S      |S          |F5-04, F2-35       |

-----

### MÓDULO 5G — Comandos de Facturación por Voz

|ID   |Funcionalidad                                                                                       |Prioridad|Complejidad|Dependencias|
|-----|----------------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F5-45|Comando “Generar factura” → crea factura automáticamente desde el plan completado y enuncia el total|🔴 M      |M          |F5-04, F3-02|
|F5-46|Comando “Pago en efectivo” → registra el pago y marca factura como Pagada                           |🔴 M      |M          |F5-04, F3-10|
|F5-47|Comando “Pago con tarjeta” → registra el pago con tarjeta                                           |🔴 M      |S          |F5-04, F3-10|
|F5-48|Comando “Pago por transferencia” → registra el pago por transferencia bancaria                      |🔴 M      |S          |F5-04, F3-10|
|F5-49|Comando “Imprimir factura” → lanza impresión del PDF de la factura activa                           |🔴 M      |S          |F5-04, F3-16|

-----

## RESUMEN EJECUTIVO DEL FEATURE MAP (ACTUALIZADO)

### Conteo por prioridad

|Prioridad     |Cantidad de funcionalidades|
|--------------|:-------------------------:|
|🔴 Must Have   |117                        |
|🟡 Should Have |52                         |
|🟢 Could Have  |15                         |
|**Total v1.0**|**184**                    |

### Conteo por fase

|Fase                     |Módulos                   |Funcionalidades totales|
|-------------------------|--------------------------|:---------------------:|
|Fase 1 — Fundación       |1A, 1B, 1C, 1D, 1E        |35                     |
|Fase 2 — Núcleo Clínico  |2A, 2B, 2C, 2D, 2E        |75                     |
|Fase 3 — Administración  |3A, 3B, 3C, **3D**        |40                     |
|Fase 4 — Comunicaciones  |4A, 4B                    |19                     |
|Fase 5 — Asistente de Voz|5A, 5B, 5C, 5D, 5E, 5F, 5G|36                     |
|**Total**                |**15 módulos**            |**205**                |

### Funcionalidades de mayor complejidad (XL)

|ID   |Funcionalidad                                                 |Fase  |
|-----|--------------------------------------------------------------|------|
|F2-43|Renderizado SVG del odontograma adulto completo               |Fase 2|
|F2-60|Parser de comando de voz del odontograma                      |Fase 2|
|F3-55|Motor de cálculo del Estado de Resultados (P&L)               |Fase 3|
|F5-01|Hook `useVoiceAssistant()` — orquestador central del asistente|Fase 5|

### Orden de construcción recomendado para la IA

```
Fase 1 completa (F1-01 → F1-36)
  ↓
Módulo 2A — Pacientes
  ↓
Módulo 2B — Agenda / Calendario
  ↓
Módulo 2C — Historia Clínica
  ↓
Módulo 2D — Odontograma manual (SVG)
  ↓
Módulo 2E — Odontograma por voz
  ↓
Módulo 3A — Facturación
  ↓
Módulo 3B — Inventario
  ↓
Módulo 3D — Gestión Financiera y Rentabilidad  ← NUEVO (antes del Dashboard)
  ↓
Módulo 3C — Dashboard de Métricas  (ahora consume datos de 3D)
  ↓
Módulo 4A — Notificaciones Email
  ↓
Módulo 4B — Notificaciones WhatsApp
  ↓
Módulo 5A — Infraestructura del Asistente de Voz
  ↓
Módulos 5B → 5G — Comandos del Asistente (en orden)
  ↓
Módulo 6A → 6C — Panel Super Admin (en paralelo a cualquier fase)
```

-----

## FASE 6 — PANEL SUPER ADMIN TOOTH X

> **Objetivo:** Construir el panel de gestión de la plataforma SaaS. Solo accesible por el operador de TOOTH X. No expone datos clínicos de ningún consultorio. Se puede desarrollar en paralelo a cualquier otra fase.

### MÓDULO 6A — Dashboard de la Plataforma

|ID   |Funcionalidad                                                                          |Prioridad|Complejidad|Dependencias|
|-----|---------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F6-01|Página principal del Super Admin con métricas globales de la plataforma                |🔴 M      |M          |F1-15       |
|F6-02|Tarjeta: total de consultorios activos en la plataforma                                |🔴 M      |S          |F6-01       |
|F6-03|Tarjeta: nuevos consultorios registrados en el mes actual vs. mes anterior             |🟡 S      |S          |F6-01       |
|F6-04|Tarjeta: consultorios con plan activo (pagando) vs. en prueba / expirados              |🔴 M      |S          |F6-01       |
|F6-05|Gráfico de barras: nuevos consultorios por mes (últimos 12 meses)                      |🟡 S      |M          |F6-01       |
|F6-06|Tarjeta: ingresos de suscripciones del mes actual                                      |🟡 S      |M          |F6-01       |

-----

### MÓDULO 6B — Gestión de Consultorios

|ID   |Funcionalidad                                                                                   |Prioridad|Complejidad|Dependencias|
|-----|-----------------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F6-07|Lista paginada de todos los consultorios con búsqueda por nombre, RUC, email y país            |🔴 M      |M          |F1-15       |
|F6-08|Filtros: por plan (básico/pro), por estado (activo/suspendido/expirado), por país              |🟡 S      |S          |F6-07       |
|F6-09|Ficha del consultorio: datos del tenant, plan, fechas, admin principal y usuario count         |🔴 M      |M          |F6-07       |
|F6-10|Acción: suspender consultorio (is_active = false) con motivo                                   |🔴 M      |S          |F6-09       |
|F6-11|Acción: reactivar consultorio suspendido                                                       |🔴 M      |S          |F6-10       |
|F6-12|Acción: extender fecha de vencimiento del plan manualmente                                     |🟡 S      |S          |F6-09       |
|F6-13|Acción: cambiar el plan del consultorio (básico ↔ pro)                                        |🟡 S      |S          |F6-09       |
|F6-14|Vista de historial de cambios del consultorio (auditoría de acciones del super admin)          |🟢 C      |M          |F6-09       |
|F6-15|Indicador de uso: número de pacientes, citas y facturas del consultorio (sin ver el contenido) |🟢 C      |M          |F6-09       |

> ⚠️ El Super Admin **NUNCA** puede ver datos clínicos (nombres de pacientes, diagnósticos, facturas). Solo ve conteos y metadatos del consultorio.

-----

### MÓDULO 6C — Gestión de Planes y Configuración

|ID   |Funcionalidad                                                                        |Prioridad|Complejidad|Dependencias|
|-----|-------------------------------------------------------------------------------------|:-------:|:---------:|------------|
|F6-16|Lista de planes disponibles de la plataforma (nombre, precio, características)       |🔴 M      |S          |F1-15       |
|F6-17|Crear nuevo plan con nombre, precio mensual, límites (usuarios, storage, funciones)  |🟡 S      |M          |F6-16       |
|F6-18|Editar nombre y precio de plan existente                                              |🟡 S      |S          |F6-16       |
|F6-19|Configuración global: email de soporte, URL de documentación, aviso de mantenimiento |🟢 C      |S          |F1-15       |
|F6-20|Banner de mantenimiento programado: mensaje visible para todos los tenants            |🟢 C      |S          |F6-19       |

-----

*TOOTH X — Documento 2: Feature Map · v1.0 · Mayo 2026*
*Próximo documento: User Flows detallados (Documento 3)*