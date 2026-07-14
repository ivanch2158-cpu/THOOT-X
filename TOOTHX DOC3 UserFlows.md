# DOCUMENTO 3 — USER FLOWS

## TOOTH X · Flujos de Usuario Detallados

-----

|Campo                  |Detalle             |
|-----------------------|--------------------|
|**Proyecto**           |TOOTH X             |
|**Versión**            |v1.0                |
|**Flujos documentados**|9 flujos principales|
|**Fecha del documento**|Mayo 2026           |

-----

## GUÍA DE LECTURA

Cada flujo incluye:

- **Actor:** quién ejecuta el flujo
- **Disparador:** qué acción o evento inicia el flujo
- **Pre-condiciones:** qué debe existir antes de que el flujo comience
- **Flujo principal:** el camino ideal sin errores (Happy Path)
- **Flujos alternativos:** desvíos por errores, cancelaciones o decisiones del usuario
- **Post-condición:** el estado del sistema al finalizar el flujo

**Notación:**

- `→` Acción del usuario
- `⟶` Respuesta del sistema
- `[?]` Punto de decisión
- `[E]` Flujo de error
- `[V]` Acción ejecutada por comando de voz

-----

## FLUJO 1 — Onboarding de Nuevo Consultorio

**Actor:** Odontólogo propietario (futuro Admin del consultorio)
**Disparador:** El odontólogo se registra por primera vez en TOOTH X
**Pre-condición:** Ninguna. El consultorio no existe aún en el sistema.

### Flujo Principal

```
→ El admin accede a toothx.app/registro
⟶ Se muestra el formulario de registro del consultorio

→ Completa: nombre del consultorio, RUC, país, email del admin, contraseña
→ Acepta los Términos y Condiciones
→ Hace clic en "Crear mi consultorio"
⟶ Sistema crea el tenant en la base de datos
⟶ Sistema crea el usuario admin vinculado al tenant
⟶ Sistema envía email de verificación al correo registrado

→ Admin abre su correo y hace clic en "Verificar email"
⟶ Email verificado. Sistema redirige al Asistente de Configuración (Wizard)

--- WIZARD PASO 1: Datos del consultorio ---
⟶ Pantalla muestra formulario con campos precargados del registro
→ Admin revisa y completa: dirección, teléfono, especialidad principal
→ Clic en "Siguiente"
⟶ Sistema guarda los datos del consultorio

--- WIZARD PASO 2: Identidad visual ---
⟶ Pantalla muestra opciones de personalización de marca
→ Admin sube su logo (PNG o JPG, máximo 2MB)
→ Selecciona color primario con selector de color
→ Selecciona color secundario
→ Elige tipografía del menú desplegable (Inter, Plus Jakarta Sans, Nunito, Poppins, DM Sans)
→ Clic en "Siguiente"
⟶ Sistema guarda los valores visuales
⟶ Sistema aplica inmediatamente el nuevo tema visual al wizard

--- WIZARD PASO 3: Horarios de atención ---
⟶ Pantalla muestra tabla con los 7 días de la semana
→ Admin activa/desactiva los días que atiende
→ Para cada día activo, define hora de apertura y hora de cierre
→ Define duración por defecto de cada cita (30, 45 o 60 minutos)
→ Clic en "Siguiente"
⟶ Sistema guarda la configuración de horarios

--- WIZARD PASO 4: Crear usuarios ---
⟶ Pantalla muestra formulario para agregar miembros del consultorio
→ Admin completa: nombre, email, rol (Odontólogo / Secretaria)
→ Clic en "Agregar usuario"
⟶ Sistema envía email de invitación al nuevo usuario con enlace para crear su contraseña
→ Admin puede agregar más usuarios o hacer clic en "Finalizar configuración"

--- WIZARD PASO 5: Completado ---
⟶ Pantalla de bienvenida con resumen de la configuración
⟶ Botón "Ir al Dashboard"
→ Admin hace clic
⟶ Sistema redirige al Dashboard del consultorio, ya personalizado con su marca
⟶ Dashboard muestra mensaje: "¡Bienvenido! Tu consultorio está listo para operar."
```

### Flujos Alternativos

```
[E1] El email ya está registrado en el sistema
⟶ Sistema muestra: "Este email ya tiene una cuenta. ¿Deseas iniciar sesión?"
→ Admin hace clic en "Iniciar sesión" → redirige al Login

[E2] El admin no verifica su email en 24 horas
⟶ El enlace de verificación expira
→ Admin intenta ingresar
⟶ Sistema muestra: "Tu email no ha sido verificado. ¿Reenviar el correo de verificación?"

[E3] Admin omite subir el logo en el Paso 2
⟶ Sistema usa un logo placeholder con las iniciales del consultorio
⟶ El logo puede subirse después desde Configuración

[E4] Admin cierra el navegador durante el wizard
⟶ Al volver a ingresar, el sistema detecta que el onboarding está incompleto
⟶ Redirige automáticamente al último paso pendiente del wizard
```

**Post-condición:** El consultorio está creado, configurado visualmente y tiene al menos 1 usuario admin activo. El sistema está listo para recibir pacientes y citas.

-----

## FLUJO 2 — Login por Voz (Mañana de jornada laboral)

**Actor:** Odontólogo con PIN de voz configurado
**Disparador:** El odontólogo llega al consultorio, enciende la tablet y abre el navegador
**Pre-condición:** El PIN de voz debe estar configurado en el perfil del usuario (mínimo una vez previamente).

### Flujo Principal

```
→ Odontólogo abre el navegador en la tablet
⟶ Sistema muestra la pantalla de Login con el botón de micrófono visible

→ Odontólogo toca el botón de micrófono en la pantalla de login
⟶ Indicador visual: micrófono rojo pulsando + texto "Escuchando..."
⟶ Sonido suave de activación

→ [V] Odontólogo dice: "Doctor Carlos PIN dos cuatro uno siete"
⟶ Sistema transcribe el audio en tiempo real
⟶ Parser extrae: nombre = "Carlos", PIN = "2417"
⟶ Sistema busca el usuario con ese nombre en el tenant
⟶ Sistema compara el hash del PIN con el almacenado

[?] ¿El PIN es correcto?
→ SÍ:
⟶ Sesión iniciada (duración: 14 horas)
⟶ Sistema consulta la agenda del día en tiempo real
⟶ Asistente responde en voz alta:
   "Buenos días, Doctor Carlos. Hoy tienes 6 pacientes.
   Tu primera cita es con Ana Torres a las 9:00 AM
   por tratamiento de conducto."
⟶ Sistema navega automáticamente al Dashboard
⟶ Dashboard muestra el resumen visual del día
```

### Flujos Alternativos

```
[E1] PIN incorrecto (intento 1 o 2)
⟶ Asistente responde: "PIN incorrecto. Tienes [X] intentos restantes."
⟶ Sistema vuelve a modo escucha para un nuevo intento

[E2] PIN incorrecto por tercera vez
⟶ Asistente responde: "PIN bloqueado. Por seguridad debes ingresar manualmente."
⟶ Sistema desactiva el login por voz
⟶ Muestra el formulario de login manual (email + contraseña)
⟶ Tras login manual exitoso, el bloqueo se libera automáticamente

[E3] El nombre dicho no coincide con ningún usuario del consultorio
⟶ Asistente responde: "No encontré un usuario con ese nombre. Por favor intenta de nuevo o ingresa manualmente."

[E4] El navegador no reconoce el audio (ruido o problema de micrófono)
⟶ Sistema muestra en pantalla: "No pude escucharte. Revisa el micrófono o ingresa manualmente."

[E5] El odontólogo no tiene PIN de voz configurado aún
⟶ Al tocar el micrófono el sistema muestra:
   "Para usar el login por voz primero debes configurar tu PIN de voz en tu perfil."
⟶ Botón directo: "Ir a configurar PIN" (requiere login manual primero)

[A1] El odontólogo prefiere login manual
→ Ignora el botón de micrófono
→ Escribe email y contraseña normalmente
→ Clic en "Ingresar"
⟶ Login estándar, sin respuesta de voz
```

**Post-condición:** La sesión del odontólogo está activa con duración de 14 horas. El asistente de voz está disponible en toda la app.

-----

## FLUJO 3 — Secretaria Agenda una Cita

**Actor:** Secretaria
**Disparador:** Un paciente llama por teléfono o se presenta en el consultorio para agendar una cita
**Pre-condición:** La secretaria tiene sesión activa. Los horarios de atención del consultorio están configurados.

### Flujo Principal

```
→ Secretaria hace clic en el módulo "Agenda" en el sidebar
⟶ Sistema muestra el calendario semanal con los slots de hora disponibles

→ Secretaria navega a la fecha deseada (flechas de navegación o clic en día)
⟶ Sistema muestra los slots del día: verdes (disponibles), grises (fuera de horario),
   de colores (ocupados por citas existentes)

→ Secretaria hace clic en un slot de hora disponible
⟶ Se abre el modal "Nueva Cita" con la fecha y hora precargadas

--- Formulario de Nueva Cita ---
→ Secretaria escribe el nombre del paciente en el campo de búsqueda
⟶ Sistema muestra sugerencias en tiempo real conforme escribe

[?] ¿El paciente existe en el sistema?
→ SÍ: Secretaria selecciona el paciente de la lista desplegable
→ NO: Aparece opción "Crear nuevo paciente"
   → Secretaria hace clic en "Crear nuevo paciente"
   ⟶ Se abre un formulario rápido dentro del modal:
      nombre, apellido, teléfono, documento
   → Secretaria llena los campos mínimos y hace clic en "Guardar paciente"
   ⟶ Paciente creado y seleccionado automáticamente en el modal de cita

→ Secretaria selecciona el odontólogo (si hay más de uno en el consultorio)
→ Secretaria verifica/ajusta la hora de inicio
→ Secretaria selecciona la duración de la cita (o usa la duración por defecto)
→ Secretaria escribe el motivo de la cita (campo de texto libre)
→ Clic en "Guardar cita"

⟶ Sistema valida que no haya conflicto de horario para ese odontólogo
⟶ Cita guardada en la base de datos del consultorio
⟶ Modal se cierra
⟶ La cita aparece inmediatamente en el slot correspondiente del calendario
   con el color del estado "Programada"
⟶ Sistema dispara notificación automática al paciente
   (WhatsApp si tiene número / Email si tiene correo)
⟶ Toast de confirmación: "Cita agendada para [nombre] el [fecha] a las [hora]"
```

### Flujos Alternativos

```
[E1] Conflicto de horario: el odontólogo ya tiene otra cita a esa hora
⟶ Sistema muestra alerta dentro del modal:
   "El Dr. [nombre] ya tiene una cita a esa hora. Elige otro horario."
⟶ El modal permanece abierto para que la secretaria cambie la hora

[E2] El horario seleccionado está fuera del horario de atención configurado
⟶ Sistema muestra: "Ese horario está fuera del horario de atención del consultorio."

[A1] Secretaria cancela antes de guardar
→ Clic en "Cancelar" o cierra el modal
⟶ No se guarda ningún dato. El calendario no cambia.

[A2] Secretaria necesita reagendar una cita existente
→ Hace clic sobre la cita en el calendario
⟶ Se abre el panel de detalle de la cita
→ Clic en "Editar"
⟶ Se abre el modal con los datos de la cita precargados
→ Cambia la fecha u hora
→ Clic en "Guardar cambios"
⟶ Sistema actualiza la cita y envía notificación de reagendamiento al paciente
```

**Post-condición:** La cita está registrada en el calendario del consultorio con estado “Programada”. El paciente recibió notificación automática.

-----

## FLUJO 4 — Jornada Completa de Atención por Voz

**Actor:** Odontólogo (con sesión activa, modo voz habilitado)
**Disparador:** Llega la hora de la primera cita del día
**Pre-condición:** Login completado, citas programadas en el calendario para hoy.

### Flujo Principal

```
--- INICIO DE ATENCIÓN ---
→ [V] "Paciente en sala"
⟶ Sistema identifica la cita más próxima del día con estado "Programada"
⟶ Cambia el estado de esa cita a "En curso"
⟶ Asistente responde: "Cita de Ana Torres marcada como en curso."

→ [V] "Abrir el primer paciente"
⟶ Sistema navega a la ficha de Ana Torres
⟶ Asistente responde: "Abriendo la ficha de Ana Torres."
⟶ Pantalla muestra la ficha completa del paciente

--- EXPLORACIÓN Y ODONTOGRAMA ---
→ [V] "Activar odontograma"
⟶ Sistema navega a la pestaña de odontograma dentro de la ficha
⟶ Modo voz del odontograma se activa automáticamente
⟶ Asistente responde: "Odontograma activo. Puedes dictar los hallazgos."

→ [V] "Diente dieciséis oclusal caries"
⟶ Barra de confirmación: "Diente 16 · Oclusal · Caries — ¿Confirmar?"
⟶ Diente 16 resaltado en amarillo (previsualización)
→ [V] "Confirmar"
⟶ Superficie oclusal del diente 16 se colorea en rojo
⟶ Asistente responde: "Guardado. Continúa."

→ [V] "Diente treinta y seis mesial fractura"
⟶ Barra de confirmación: "Diente 36 · Mesial · Fractura — ¿Confirmar?"
→ [V] "Confirmar"
⟶ Guardado. [Repite para más hallazgos...]

→ [V] "Terminar exploración"
⟶ Modo voz del odontograma se cierra
⟶ Asistente responde: "Exploración finalizada. 4 hallazgos registrados."

--- PLAN DE TRATAMIENTO ---
→ [V] "Procederé con los tratamientos"
⟶ Sistema cambia todos los ítems del plan de tratamiento a "En progreso"
⟶ Asistente responde: "Plan de tratamiento activado. 2 procedimientos en progreso."

[Odontólogo realiza los tratamientos...]

→ [V] "Tratamiento finalizado"
⟶ Ítem activo del plan se marca como "Completado"
⟶ Asistente responde: "Tratamiento marcado como completado."

--- CIERRE DE LA ATENCIÓN ---
→ [V] "Finalizar cita"
⟶ Estado de la cita cambia a "Completada"
⟶ Asistente responde: "Cita de Ana Torres completada. ¿Deseas generar la factura?"

--- FACTURACIÓN ---
→ [V] "Generar factura"
⟶ Sistema crea automáticamente la factura con los ítems del plan completado
⟶ Asistente responde: "Factura generada. Total: 180 soles. ¿Cuál es el método de pago?"

→ [V] "Pago en efectivo"
⟶ Sistema registra el pago y marca la factura como "Pagada"
⟶ Asistente responde: "Factura pagada en efectivo. ¿Deseas imprimirla?"

→ [V] "Imprimir factura"
⟶ Sistema lanza la impresión del PDF
⟶ Asistente responde: "Enviando a impresora."

--- SIGUIENTE PACIENTE ---
→ [V] "¿Quién es el siguiente paciente?"
⟶ Asistente responde: "Tu siguiente paciente es Luis García a las 10:00 AM
   por limpieza dental."
```

### Flujos Alternativos

```
[A1] El tratamiento queda pendiente para otra cita
→ [V] "Tratamiento pendiente"
⟶ Ítem del plan se marca como "Pendiente"
⟶ Asistente responde: "Tratamiento marcado como pendiente para próxima cita."
→ [V] "Finalizar cita"
⟶ La factura solo incluye los ítems completados en esta sesión

[A2] El paciente paga solo un abono parcial
→ [V] "Generar factura"
⟶ Factura generada
→ Odontólogo / secretaria registra el abono manualmente en la pantalla
   (el monto parcial no tiene comando de voz por seguridad de exactitud)
⟶ Factura queda en estado "Parcial" con el saldo pendiente visible

[E1] No hay ninguna cita "En curso" al decir "Tratamiento finalizado"
⟶ Asistente responde: "No hay ninguna cita activa en este momento. 
   Primero di 'Paciente en sala' para iniciar una atención."
```

**Post-condición:** La cita está completada, el odontograma actualizado, el plan de tratamiento con su estado, y la factura generada y cobrada. Todo sin haber tocado la pantalla.

-----

## FLUJO 5 — Registro Manual de Evolución Clínica

**Actor:** Odontólogo
**Disparador:** El odontólogo quiere registrar la historia clínica de una consulta
**Pre-condición:** El paciente existe en el sistema. El odontólogo tiene sesión activa.

### Flujo Principal

```
→ Odontólogo abre la ficha del paciente (búsqueda o desde el calendario)
⟶ Sistema muestra la ficha con sus pestañas

→ Clic en la pestaña "Historia Clínica"
⟶ Sistema muestra la lista de evoluciones previas ordenadas de más reciente a más antigua

→ Clic en "Nueva Evolución"
⟶ Se abre el formulario de nueva evolución

→ Completa el campo "Motivo de consulta"
→ Completa el campo "Anamnesis" (antecedentes relevantes para esta consulta)
→ Completa el campo "Examen clínico" (hallazgos físicos)
→ Completa el campo "Diagnóstico"
→ Completa el campo "Plan de tratamiento en texto libre"

→ [Opcional] Agrega ítems al plan de tratamiento estructurado:
   → Clic en "Agregar ítem al plan"
   → Completa: diente, procedimiento, estado (Pendiente), costo estimado
   → Clic en "Agregar"
   ⟶ Ítem aparece en la tabla del plan de tratamiento

→ [Opcional] Adjunta imágenes clínicas:
   → Clic en "Adjuntar imagen"
   → Selecciona archivo desde el dispositivo
   ⟶ Imagen cargada y vinculada a la evolución

→ Clic en "Guardar evolución"
⟶ Sistema guarda la evolución vinculada al paciente y al tenant
⟶ Toast de confirmación: "Evolución guardada correctamente"
⟶ Sistema regresa a la lista de evoluciones, con la nueva al tope
```

### Flujos Alternativos

```
[E1] Odontólogo intenta guardar sin llenar el campo "Motivo de consulta"
⟶ Sistema resalta el campo vacío en rojo
⟶ Mensaje: "El motivo de consulta es obligatorio."
⟶ No se guarda hasta completarlo

[A1] Odontólogo quiere editar una evolución ya guardada
→ Hace clic en la evolución de la lista
⟶ Se abre en modo lectura
→ Clic en "Editar evolución"
⟶ Formulario editable (solo disponible para el odontólogo que la creó o el admin)
→ Realiza cambios → Clic en "Guardar cambios"
⟶ Sistema guarda con registro de la última edición (fecha y usuario)

[A2] Odontólogo quiere ver el odontograma dentro de la evolución
→ Clic en la pestaña "Odontograma" dentro de la ficha del paciente
⟶ Sistema muestra el odontograma con el estado actual
→ Puede registrar hallazgos por clic o por voz como en el Flujo 4
```

**Post-condición:** La evolución está guardada en la historia clínica del paciente con fecha, hora y nombre del odontólogo.

-----

## FLUJO 6 — Generar y Cobrar Factura (Manual, por Secretaria)

**Actor:** Secretaria
**Disparador:** El odontólogo termina una atención y le indica a la secretaria que genere la factura
**Pre-condición:** El paciente existe. Hay al menos un ítem en su plan de tratamiento o la secretaria agregará ítems manualmente.

### Flujo Principal

```
→ Secretaria abre la ficha del paciente
→ Clic en la pestaña "Facturación"
⟶ Sistema muestra el historial de facturas del paciente

→ Clic en "Nueva Factura"
⟶ Sistema abre el formulario de nueva factura
⟶ Si hay ítems de plan de tratamiento marcados como "Completado",
   se cargan automáticamente como ítems sugeridos en la factura

→ Secretaria revisa los ítems:
   [?] ¿Los ítems son correctos?
   → SÍ: Los deja como están
   → NO: Edita descripción, cantidad o precio por ítem
         O elimina ítems que no correspondan
         O agrega nuevos ítems manualmente

→ [Opcional] Aplica descuento global: escribe el porcentaje o monto
⟶ Sistema recalcula el total en tiempo real

→ Secretaria selecciona el método de pago:
   Efectivo / Transferencia bancaria / Tarjeta / Cuotas

→ Clic en "Emitir factura"
⟶ Sistema asigna número de factura automático (correlativo por consultorio)
⟶ Factura guardada en estado "Pagada" (si el pago fue completo)
⟶ PDF generado automáticamente con:
   logo del consultorio, datos fiscales, datos del paciente,
   ítems, totales, método de pago y número de factura

⟶ Sistema muestra botones: "Descargar PDF" e "Imprimir"
→ Secretaria hace clic en "Imprimir"
⟶ Se abre el diálogo de impresión del navegador
→ Secretaria imprime y entrega al paciente
```

### Flujos Alternativos

```
[A1] El paciente paga en cuotas o abona parcialmente
→ Secretaria selecciona método "Cuotas" o ingresa el monto recibido
⟶ Sistema calcula el saldo pendiente
⟶ Factura queda en estado "Parcial"
⟶ En futuras visitas, secretaria puede registrar nuevos abonos desde
   la misma factura → Clic en "Registrar abono"

[A2] La factura ya fue emitida pero el paciente quiere anularla
→ Solo el Admin puede anular facturas emitidas
→ Admin hace clic en "Anular factura"
⟶ Sistema pide confirmación: "Esta acción no se puede deshacer. ¿Confirmar anulación?"
→ Admin confirma
⟶ Factura queda en estado "Anulada" (no se elimina, queda en el historial)
⟶ El saldo del paciente se actualiza

[E1] El consultorio no tiene datos fiscales completos (RUC / dirección)
⟶ Sistema muestra advertencia antes de emitir:
   "Tu factura no tiene RUC o dirección del consultorio.
   ¿Deseas completarlos en Configuración antes de emitir?"
```

**Post-condición:** La factura está emitida con número correlativo, el pago registrado, y el PDF disponible para impresión o descarga.

-----

## FLUJO 6B — Registro de Gastos Operativos del Consultorio

**Actor:** Admin del consultorio (odontólogo propietario)
**Disparador:** El Admin necesita registrar un gasto del mes (arriendo, sueldo, servicio, laboratorio, etc.)
**Pre-condición:** El Admin tiene sesión activa.

### Flujo Principal — Gasto nuevo no recurrente

```
→ Admin hace clic en "Gestión Financiera" en el sidebar
⟶ Sistema muestra el listado de gastos del mes actual
   con el resumen: total ingresos, total gastos, resultado neto del mes

→ Clic en "Registrar gasto"
⟶ Se abre el formulario de nuevo gasto

→ Admin selecciona el tipo: Fijo / Variable
→ Admin selecciona la categoría:
   [Si Fijo]: Arriendo / Sueldos / Servicios públicos / Seguros / Suscripciones / Otros fijos
   [Si Variable]: Laboratorio dental / Mantenimiento / Marketing / Capacitación / Otros variables

→ Admin completa:
   Descripción (ej: "Sueldo secretaria marzo", "Prótesis total paciente García")
   Monto en soles
   Fecha del gasto

→ [Si es Laboratorio dental] Aparece campo opcional:
   "¿Vincular a paciente?" → busca y selecciona al paciente
   "¿Vincular a tratamiento?" → muestra los ítems del plan del paciente

→ [?] ¿El gasto se repite cada mes?
   → SÍ: Admin activa el toggle "Gasto recurrente mensual"
   → NO: Lo deja desactivado

→ Clic en "Guardar gasto"
⟶ Gasto registrado en la base de datos del consultorio (con tenant_id)
⟶ Sistema recalcula automáticamente el Estado de Resultados del mes
⟶ Las tarjetas del Dashboard se actualizan en tiempo real
⟶ Toast: "Gasto registrado. Resultado neto actualizado."
```

### Flujo — Gastos recurrentes al inicio del mes

```
⟶ [Automático — Día 1 de cada mes]
   Sistema detecta todos los gastos marcados como recurrentes del consultorio
   Sistema los registra automáticamente para el nuevo mes
   Sistema envía notificación interna al Admin:
   "Se registraron [N] gastos recurrentes por un total de S/. [monto].
    Revísalos y ajusta los montos si cambiaron."

→ Admin abre la notificación
⟶ Sistema muestra la lista de gastos recurrentes del mes recién creados

→ Admin revisa cada uno:
   [?] ¿El monto cambió?
   → SÍ: Hace clic en "Editar" y actualiza el monto → "Guardar"
   → NO: Los deja como están

→ Admin cierra la pantalla
⟶ Los gastos quedan confirmados para el mes en curso
```

### Flujos Alternativos

```
[A1] Admin necesita editar un gasto ya registrado
→ Hace clic sobre el gasto en la lista
→ Clic en "Editar"
⟶ Formulario precargado con los datos del gasto
→ Modifica los campos necesarios → "Guardar cambios"
⟶ Estado de Resultados recalculado automáticamente

[A2] Admin necesita eliminar un gasto registrado por error
→ Hace clic sobre el gasto → Clic en "Eliminar"
⟶ Confirmación: "¿Seguro que deseas eliminar este gasto? Esta acción no se puede deshacer."
→ Confirma
⟶ Gasto eliminado. Estado de Resultados recalculado.

[E1] Admin intenta guardar un gasto sin monto o sin categoría
⟶ Sistema resalta los campos vacíos en rojo
⟶ Mensaje: "El monto y la categoría son obligatorios."
```

**Post-condición:** El gasto está registrado. El Estado de Resultados del mes se recalculó automáticamente incluyendo el nuevo gasto.

-----

## FLUJO 6C — Consultar Rentabilidad del Consultorio

**Actor:** Admin del consultorio
**Disparador:** El Admin quiere saber si su consultorio está siendo rentable en el mes o en el año
**Pre-condición:** Existen facturas cobradas y gastos registrados en el período consultado.

### Flujo Principal

```
→ Admin va al Dashboard
⟶ Sección de rentabilidad visible en el Dashboard (solo para Admin):
   - Tarjeta: "Resultado neto de [mes actual]" con monto en verde (ganancia) o rojo (pérdida)
   - Tarjeta: "Ingresos del mes: S/. XXXX | Gastos del mes: S/. XXXX"
   - Gráfico de línea doble: ingresos vs. gastos de los últimos 12 meses

→ Admin quiere ver el detalle completo
→ Hace clic en "Ver Estado de Resultados completo"
⟶ Sistema navega a /finanzas/estado-resultados

⟶ Pantalla muestra el Estado de Resultados del mes actual:

   (+) INGRESOS
       Facturación cobrada del mes              S/. XXXX
       ─────────────────────────────────────────────────
       TOTAL INGRESOS                           S/. XXXX

   (-) COSTOS DIRECTOS
       Insumos consumidos (automático)          S/. XXXX
       Trabajos de laboratorio dental           S/. XXXX
       ─────────────────────────────────────────────────
       UTILIDAD BRUTA                           S/. XXXX  (XX%)

   (-) GASTOS OPERATIVOS FIJOS
       Arriendo del local                       S/. XXXX
       Sueldos                                  S/. XXXX
       Servicios públicos                       S/. XXXX
       Otros fijos                              S/. XXXX
       ─────────────────────────────────────────────────

   (-) GASTOS VARIABLES
       Mantenimiento                            S/. XXXX
       Marketing                                S/. XXXX
       ─────────────────────────────────────────────────

   (-) DEPRECIACIÓN (automático)
       Depreciación mensual de equipos          S/. XXXX
       ─────────────────────────────────────────────────

       RESULTADO NETO                           S/. XXXX
       ✅ GANANCIA / ❌ PÉRDIDA   |   Margen: XX%

→ Admin selecciona otro período con el selector de fecha
⟶ Estado de Resultados se actualiza para el período seleccionado

→ Admin quiere comparar con el mes anterior
→ Clic en "Ver comparativo"
⟶ Sistema muestra dos columnas: mes actual vs. mes anterior
   con flechas de variación (▲ subió / ▼ bajó) por rubro

→ Admin quiere exportar el reporte
→ Clic en "Exportar PDF"
⟶ Sistema genera el PDF del Estado de Resultados con logo del consultorio
⟶ Descarga automática en el navegador
```

### Flujos Alternativos

```
[A1] No hay gastos registrados en el período
⟶ Sistema muestra el Estado de Resultados con los rubros de gastos en S/. 0
⟶ Mensaje informativo: "No hay gastos registrados para este período.
   Registra tus gastos para ver tu rentabilidad real."
⟶ Botón directo: "Registrar gastos del mes"

[A2] No hay facturas cobradas en el período
⟶ Ingresos = S/. 0
⟶ Resultado neto negativo (todos los gastos sin ingresos)
⟶ Indicador ❌ PÉRDIDA con el monto total de gastos
```

**Post-condición:** El Admin tiene visibilidad completa de la rentabilidad real de su consultorio en el período consultado.

-----

## FLUJO 7 — Registro de Insumos en Inventario

**Actor:** Admin del consultorio (odontólogo propietario)
**Disparador:** Llega un nuevo pedido de insumos o se compra material
**Pre-condición:** El insumo existe previamente registrado en el sistema, o debe crearse.

### Flujo Principal

```
→ Admin hace clic en "Inventario" en el sidebar
→ Clic en la pestaña "Insumos"
⟶ Sistema muestra la lista de insumos con su stock actual

[?] ¿El insumo ya existe en la lista?
→ SÍ: Admin hace clic sobre el nombre del insumo
      → Clic en "Registrar entrada"
→ NO: → Clic en "Nuevo insumo"
        → Completa: nombre, categoría, unidad de medida,
                    stock mínimo, precio unitario, proveedor
        → Clic en "Guardar insumo"
        ⟶ Insumo creado con stock en 0
        → Clic en "Registrar entrada"

--- Formulario de entrada de insumos ---
⟶ Se abre modal "Registrar entrada"
→ Admin completa:
   Cantidad recibida
   Precio unitario de esta compra (puede variar del precio base)
   Nombre del proveedor
   Fecha de recepción
   [Opcional] Notas (número de factura del proveedor, lote, etc.)
→ Clic en "Guardar entrada"

⟶ Sistema actualiza el stock del insumo (stock anterior + cantidad ingresada)
⟶ Movimiento registrado en el historial del insumo con fecha y usuario
⟶ Si el stock ya estaba en nivel mínimo, la alerta roja del insumo desaparece
⟶ Toast: "Entrada registrada. Stock actual de [insumo]: [cantidad] [unidad]"
```

### Flujos Alternativos

```
[A1] Admin registra una salida/uso de insumo
→ Hace clic sobre el insumo → Clic en "Registrar salida"
→ Completa cantidad usada y fecha
→ Clic en "Guardar salida"
⟶ Stock se reduce
⟶ Si el nuevo stock cae al nivel mínimo o por debajo:
   Badge rojo aparece junto al insumo
   Alerta aparece en el Dashboard

[E1] La cantidad a retirar es mayor al stock disponible
⟶ Sistema muestra: "Stock insuficiente. Solo tienes [N] [unidades] disponibles."
⟶ No permite guardar hasta corregir la cantidad
```

**Post-condición:** El stock del insumo está actualizado, el movimiento quedó registrado con trazabilidad completa (fecha, cantidad, usuario).

-----

## FLUJO 8 — Paciente Recibe Recordatorio y Confirma Cita

**Actor:** Paciente (externo al sistema) + Sistema automático
**Disparador:** Son las 9:00 AM del día anterior a la cita del paciente
**Pre-condición:** La cita existe con estado “Programada”. El paciente tiene teléfono o email registrado.

### Flujo Principal

```
⟶ [Automático - 9:00 AM, día anterior]
   Sistema identifica todas las citas del día siguiente con estado "Programada"
   Para cada cita con paciente que tenga teléfono registrado:
   ⟶ Sistema envía mensaje de WhatsApp usando la plantilla preaprobada:
      "Hola [Nombre] 👋 Te recordamos tu cita en [Consultorio]
       📅 [Fecha] 🕐 [Hora] 👨‍⚕️ [Odontólogo]
       Para cualquier cambio: [Teléfono del consultorio]"
   Para cada cita con paciente que tenga email registrado:
   ⟶ Sistema envía email de recordatorio desde citas@toothx.app

⟶ [2 horas antes de la cita]
   Sistema envía segundo recordatorio por WhatsApp (más breve)

→ Paciente recibe el mensaje en su WhatsApp / correo
→ Paciente no necesita hacer nada (el sistema no espera respuesta en v1.0)

⟶ [Día de la cita]
   La secretaria o el odontólogo actualizan manualmente el estado de la cita
   a "Confirmada" al hablar con el paciente o al llegar al consultorio
```

### Flujos Alternativos

```
[E1] El paciente no tiene teléfono ni email registrado
⟶ Sistema omite el envío de notificación para esa cita
⟶ No hay error, simplemente no se envía nada

[E2] Se agota la cuota gratuita mensual de WhatsApp (1,000 conversaciones)
⟶ Los mensajes de WhatsApp fallan silenciosamente
⟶ Los emails siguen funcionando con normalidad (cuota separada)
⟶ En el panel de configuración aparece un indicador de cuota consumida

[A1] La secretaria cambia el estado de la cita a "Confirmada" manualmente
→ Abre el calendario → Clic sobre la cita
→ Clic en el selector de estado → Selecciona "Confirmada"
⟶ El color de la cita en el calendario cambia al color de "Confirmada"
```

**Post-condición:** El paciente fue notificado de su cita. El estado de la cita puede ser actualizado manualmente a “Confirmada” por el personal del consultorio.

-----

## FLUJO 9 — Primer Acceso de Usuario Invitado (Odontólogo o Secretaria)

**Actor:** Odontólogo o secretaria recién invitado por el Admin
**Disparador:** El usuario recibe el email de invitación enviado por el Admin durante el onboarding o desde Configuración > Usuarios
**Pre-condición:** El Admin creó el usuario en el sistema y el sistema envió el email de invitación.

### Flujo Principal

```
→ Usuario recibe email con asunto:
  "[Nombre del consultorio] te invita a TOOTH X"
→ Usuario hace clic en el botón "Activar mi cuenta"

⟶ Navegador abre la página de activación de cuenta de TOOTH X
⟶ El email del usuario ya está precargado y no es editable
⟶ Muestra el nombre del consultorio al que pertenecerá

→ Usuario completa:
   Nombre completo
   Contraseña (mínimo 8 caracteres, al menos 1 número)
   Confirmación de contraseña

→ [Opcional] Configura su PIN de voz de 4 dígitos
   (puede omitirlo y configurarlo después desde su perfil)

→ Clic en "Activar cuenta"
⟶ Cuenta activada y sesión iniciada automáticamente
⟶ Sistema redirige al Dashboard del consultorio
⟶ Mensaje de bienvenida: "¡Bienvenido/a a [Nombre del consultorio]!"
⟶ La vista del Dashboard está filtrada según el rol del usuario:
   - Odontólogo: ve agenda, pacientes, métricas clínicas
   - Secretaria: ve agenda, pacientes, facturación (sin métricas financieras)
```

### Flujos Alternativos

```
[E1] El enlace de invitación ya expiró (más de 72 horas)
⟶ Sistema muestra: "Este enlace ha expirado."
⟶ Instrucción: "Pide al administrador de tu consultorio que te reenvíe la invitación."

[E2] El usuario intenta usar un enlace ya utilizado
⟶ Sistema muestra: "Esta invitación ya fue usada. Intenta iniciar sesión directamente."
⟶ Botón "Ir al Login"

[E3] Las contraseñas no coinciden
⟶ Campo "Confirmación" resaltado en rojo
⟶ Mensaje: "Las contraseñas no coinciden."
⟶ No se activa la cuenta hasta corregirlo
```

**Post-condición:** El usuario tiene su cuenta activa, su contraseña configurada y acceso al consultorio con el rol que le asignó el Admin. Opcionalmente tiene su PIN de voz configurado.

-----

## MAPA DE INTERACCIONES ENTRE FLUJOS

```
FLUJO 1 (Onboarding)
  └──► FLUJO 9 (Activación de usuarios invitados)
         └──► FLUJO 2 (Login por voz — cada día)
                └──► FLUJO 3 (Secretaria agenda citas)
                       └──► FLUJO 8 (Notificaciones automáticas)
                └──► FLUJO 4 (Jornada completa por voz)
                       ├──► FLUJO 5 (Historia clínica manual)
                       └──► FLUJO 6 (Facturación manual)
                └──► FLUJO 7 (Inventario de insumos)
```

-----

*TOOTH X — Documento 3: User Flows · v1.0 · Mayo 2026*
*Próximo documento: Sitemap Visual (Documento 4)*