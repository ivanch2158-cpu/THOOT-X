# DOCUMENTO 7 — MODELO DE DATOS

## TOOTH X · Esquema de Base de Datos y Relaciones

-----

|Campo                      |Detalle                  |
|---------------------------|-------------------------|
|**Proyecto**               |TOOTH X                  |
|**Versión**                |v1.0                     |
|**Fecha**                  |Mayo 2026                |
|**Motor de BD**            |PostgreSQL (via Supabase)|
|**ORM**                    |Prisma                   |
|**Herramienta de diagrama**|dbdiagram.io (DBML)      |

-----

## 1. MAPA DE ENTIDADES Y RELACIONES

```
tenants (consultorios)
  │
  ├──< users (usuarios del consultorio)
  │
  ├──< pacientes
  │     ├──< citas ──────────────────────── users (doctor)
  │     ├──< evoluciones ────────────────── users (doctor)
  │     │     └──< odontograma_items
  │     │     └──< plan_tratamiento_items ──< factura_items
  │     ├──< facturas
  │     │     ├──< factura_items
  │     │     └──< pagos
  │     └──< documentos_adjuntos
  │
  ├──< gastos (gestión financiera)
  │     └── pacientes (opcional, para laboratorio dental)
  │
  ├──< equipos (inventario)
  │
  └──< insumos (inventario)
        └──< movimientos_insumo
```

-----

## 2. CÓDIGO DBML PARA dbdiagram.io

> Copia y pega todo el bloque en <https://dbdiagram.io/d> para generar el diagrama visual.

```dbml
// TOOTH X — Modelo de Datos v1.0
// Pega este código en dbdiagram.io

// ─── TABLA CENTRAL DE TENANTS ───────────────────────────────
Table tenants {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  name                text        [not null, note: 'Nombre del consultorio']
  slug                text        [unique, not null, note: 'Identificador único URL-friendly']
  ruc                 text        [note: 'RUC o número fiscal del consultorio']
  address             text
  phone               text
  country             text        [default: 'PE']
  logo_url            text        [note: 'URL en Supabase Storage']
  primary_color       text        [default: '#1D4ED8']
  secondary_color     text        [default: '#0F766E']
  font_family         text        [default: 'Inter']
  plan                text        [default: 'basico', note: 'basico | pro']
  plan_expires_at     timestamptz
  is_active           boolean     [default: true]
  onboarding_complete boolean     [default: false]
  // Configuración de horarios (JSON)
  horarios_atencion   jsonb       [note: '{"lunes":{"activo":true,"inicio":"08:00","fin":"18:00"},...}']
  duracion_cita_min   integer     [default: 45, note: 'Duración por defecto de citas en minutos']
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── USUARIOS DEL CONSULTORIO ───────────────────────────────
Table users {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  supabase_auth_id    uuid        [unique, not null, note: 'ID del usuario en Supabase Auth']
  email               text        [not null]
  full_name           text        [not null]
  app_role            text        [not null, note: 'admin | doctor | secretary | super_admin']
  specialty           text        [note: 'Especialidad odontológica (solo para doctores)']
  photo_url           text
  voice_pin_hash      text        [note: 'bcrypt hash del PIN de voz de 4 dígitos']
  voice_pin_attempts  integer     [default: 0, note: 'Intentos fallidos. Bloquea en 3.']
  is_active           boolean     [default: true]
  invitation_token    text        [note: 'Token del email de invitación']
  invitation_expires  timestamptz
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── PACIENTES ───────────────────────────────────────────────
Table pacientes {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  nombres             text        [not null]
  apellidos           text        [not null]
  tipo_documento      text        [note: 'DNI | CE | pasaporte']
  numero_documento    text
  fecha_nacimiento    date
  sexo                text        [note: 'M | F | otro']
  telefono            text
  email               text
  direccion           text
  grupo_sanguineo     text
  alergias            text
  antecedentes_medicos text
  foto_url            text
  is_active           boolean     [default: true]
  created_by          uuid        [ref: > users.id]
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── CITAS / AGENDA ─────────────────────────────────────────
Table citas {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  paciente_id         uuid        [not null, ref: > pacientes.id]
  doctor_id           uuid        [not null, ref: > users.id]
  created_by          uuid        [ref: > users.id]
  fecha_hora_inicio   timestamptz [not null]
  fecha_hora_fin      timestamptz [not null]
  duracion_min        integer     [not null, default: 45]
  motivo              text
  estado              text        [not null, default: 'programada',
                                  note: 'programada | confirmada | en_curso | completada | cancelada | no_asistio']
  notas               text
  // Notificaciones enviadas
  email_confirmacion_enviado   boolean [default: false]
  email_recordatorio_enviado   boolean [default: false]
  whatsapp_confirmacion_enviado boolean [default: false]
  whatsapp_recordatorio_enviado boolean [default: false]
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── EVOLUCIONES (HISTORIA CLÍNICA) ─────────────────────────
Table evoluciones {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  paciente_id         uuid        [not null, ref: > pacientes.id]
  doctor_id           uuid        [not null, ref: > users.id]
  cita_id             uuid        [ref: > citas.id, note: 'Cita que originó esta evolución']
  fecha               date        [not null, default: `current_date`]
  motivo_consulta     text        [not null]
  anamnesis           text
  examen_clinico      text
  diagnostico         text
  plan_tratamiento_texto text
  notas               text
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
  updated_by          uuid        [ref: > users.id]
}

// ─── ODONTOGRAMA (HALLAZGOS POR DIENTE Y SUPERFICIE) ────────
Table odontograma_items {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  paciente_id         uuid        [not null, ref: > pacientes.id]
  evolucion_id        uuid        [ref: > evoluciones.id]
  numero_diente       integer     [not null, note: '11-48 adulto | 51-85 pediátrico (notación FDI)']
  superficie          text        [not null, note: 'oclusal | vestibular | palatino | mesial | distal | total']
  condicion           text        [not null,
                                  note: 'caries | obturacion | corona | ausente | fractura | implante | endodoncia | sellante | protesis | sano']
  tratamiento         text
  notas               text
  color_display       text        [note: 'Hex del color en el SVG del odontograma']
  registrado_por      uuid        [ref: > users.id]
  fecha_registro      timestamptz [default: `now()`]
}

// ─── PLAN DE TRATAMIENTO (ÍTEMS ESTRUCTURADOS) ───────────────
Table plan_tratamiento_items {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  evolucion_id        uuid        [not null, ref: > evoluciones.id]
  paciente_id         uuid        [not null, ref: > pacientes.id]
  numero_diente       integer     [note: 'Diente al que aplica el tratamiento']
  descripcion         text        [not null, note: 'Nombre del procedimiento']
  estado              text        [default: 'pendiente',
                                  note: 'pendiente | en_progreso | completado']
  costo_estimado      decimal(10,2) [default: 0]
  orden               integer     [default: 0, note: 'Orden de ejecución del tratamiento']
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── FACTURAS ────────────────────────────────────────────────
Table facturas {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  paciente_id         uuid        [not null, ref: > pacientes.id]
  doctor_id           uuid        [ref: > users.id]
  created_by          uuid        [ref: > users.id]
  numero_factura      integer     [not null, note: 'Correlativo por tenant. Reinicia en 1 por consultorio.']
  fecha_emision       date        [not null, default: `current_date`]
  subtotal            decimal(10,2) [not null, default: 0]
  descuento_global    decimal(10,2) [default: 0]
  descuento_tipo      text        [default: 'monto', note: 'monto | porcentaje']
  total               decimal(10,2) [not null, default: 0]
  monto_pagado        decimal(10,2) [default: 0]
  saldo_pendiente     decimal(10,2) [default: 0]
  estado              text        [default: 'pendiente',
                                  note: 'pendiente | parcial | pagada | cancelada']
  notas               text
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── ÍTEMS DE FACTURA ────────────────────────────────────────
Table factura_items {
  id                    uuid        [pk, default: `gen_random_uuid()`]
  factura_id            uuid        [not null, ref: > facturas.id]
  tenant_id             uuid        [not null, ref: > tenants.id]
  plan_item_id          uuid        [ref: > plan_tratamiento_items.id, note: 'Vínculo al plan (opcional)']
  descripcion           text        [not null]
  cantidad              decimal(10,2) [not null, default: 1]
  valor_unitario        decimal(10,2) [not null, default: 0]
  descuento_item        decimal(10,2) [default: 0]
  valor_total           decimal(10,2) [not null, default: 0]
}

// ─── PAGOS Y ABONOS ─────────────────────────────────────────
Table pagos {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  factura_id          uuid        [not null, ref: > facturas.id]
  tenant_id           uuid        [not null, ref: > tenants.id]
  monto               decimal(10,2) [not null]
  metodo_pago         text        [not null, note: 'efectivo | transferencia | tarjeta | cuotas']
  fecha_pago          date        [not null, default: `current_date`]
  referencia          text        [note: 'Número de transferencia, voucher, etc.']
  notas               text
  registered_by       uuid        [ref: > users.id]
  created_at          timestamptz [default: `now()`]
}

// ─── GASTOS OPERATIVOS (GESTIÓN FINANCIERA) ──────────────────
Table gastos {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  tipo                text        [not null, note: 'fijo | variable']
  categoria           text        [not null,
                                  note: 'arriendo | sueldos | servicios | seguros | suscripciones | otros_fijos | laboratorio | mantenimiento | marketing | capacitacion | otros_variables']
  descripcion         text        [not null]
  monto               decimal(10,2) [not null]
  fecha               date        [not null]
  es_recurrente       boolean     [default: false, note: 'Si es true, se registra automáticamente el día 1 de cada mes']
  paciente_id         uuid        [ref: > pacientes.id, note: 'Solo para laboratorio dental vinculado a paciente']
  plan_item_id        uuid        [ref: > plan_tratamiento_items.id, note: 'Solo para laboratorio vinculado a tratamiento']
  notas               text
  created_by          uuid        [ref: > users.id]
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── EQUIPOS (INVENTARIO) ────────────────────────────────────
Table equipos {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  nombre              text        [not null]
  categoria           text        [note: 'equipo_clinico | mobiliario | tecnologia | otro']
  marca               text
  modelo              text
  serial              text
  proveedor           text
  fecha_compra        date
  valor_compra        decimal(12,2) [note: 'Valor de adquisición']
  valor_residual      decimal(12,2) [default: 0, note: 'Valor estimado al final de la vida útil']
  vida_util_anios     integer     [note: 'Años de vida útil para calcular depreciación']
  estado              text        [default: 'activo', note: 'activo | en_mantenimiento | dado_de_baja']
  notas               text
  foto_url            text
  created_by          uuid        [ref: > users.id]
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── INSUMOS (INVENTARIO) ────────────────────────────────────
Table insumos {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  nombre              text        [not null]
  categoria           text        [note: 'anestesia | materiales_restauracion | instrumental | higiene | rx | otro']
  unidad_medida       text        [not null, note: 'unidad | caja | frasco | rollo | par | ml | gr']
  stock_actual        decimal(10,2) [not null, default: 0]
  stock_minimo        decimal(10,2) [not null, default: 0]
  precio_unitario     decimal(10,2) [not null, default: 0]
  proveedor           text
  is_active           boolean     [default: true]
  created_at          timestamptz [default: `now()`]
  updated_at          timestamptz [default: `now()`]
}

// ─── MOVIMIENTOS DE INSUMOS ──────────────────────────────────
Table movimientos_insumo {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  insumo_id           uuid        [not null, ref: > insumos.id]
  tenant_id           uuid        [not null, ref: > tenants.id]
  tipo                text        [not null, note: 'entrada | salida']
  cantidad            decimal(10,2) [not null]
  precio_unitario_entrada decimal(10,2) [note: 'Precio de compra en entradas']
  stock_resultante    decimal(10,2) [not null, note: 'Stock después del movimiento']
  proveedor           text        [note: 'Solo para entradas']
  paciente_id         uuid        [ref: > pacientes.id, note: 'Solo para salidas vinculadas a paciente']
  fecha               date        [not null, default: `current_date`]
  notas               text
  registered_by       uuid        [ref: > users.id]
  created_at          timestamptz [default: `now()`]
}

// ─── DOCUMENTOS ADJUNTOS ────────────────────────────────────
Table documentos_adjuntos {
  id                  uuid        [pk, default: `gen_random_uuid()`]
  tenant_id           uuid        [not null, ref: > tenants.id]
  paciente_id         uuid        [not null, ref: > pacientes.id]
  evolucion_id        uuid        [ref: > evoluciones.id]
  nombre_archivo      text        [not null]
  tipo_archivo        text        [note: 'image/jpeg | image/png | application/pdf']
  storage_url         text        [not null, note: 'URL en Supabase Storage']
  tamanio_bytes       integer
  uploaded_by         uuid        [ref: > users.id]
  created_at          timestamptz [default: `now()`]
}

// ─── RELACIONES EXPLÍCITAS PARA dbdiagram.io ─────────────────
Ref: users.tenant_id > tenants.id
Ref: pacientes.tenant_id > tenants.id
Ref: citas.tenant_id > tenants.id
Ref: citas.paciente_id > pacientes.id
Ref: citas.doctor_id > users.id
Ref: evoluciones.paciente_id > pacientes.id
Ref: evoluciones.doctor_id > users.id
Ref: evoluciones.cita_id > citas.id
Ref: odontograma_items.paciente_id > pacientes.id
Ref: odontograma_items.evolucion_id > evoluciones.id
Ref: plan_tratamiento_items.evolucion_id > evoluciones.id
Ref: facturas.paciente_id > pacientes.id
Ref: factura_items.factura_id > facturas.id
Ref: factura_items.plan_item_id > plan_tratamiento_items.id
Ref: pagos.factura_id > facturas.id
Ref: gastos.tenant_id > tenants.id
Ref: gastos.paciente_id > pacientes.id
Ref: equipos.tenant_id > tenants.id
Ref: insumos.tenant_id > tenants.id
Ref: movimientos_insumo.insumo_id > insumos.id
Ref: documentos_adjuntos.paciente_id > pacientes.id
Ref: documentos_adjuntos.evolucion_id > evoluciones.id
```

-----

## 3. SCHEMA DE PRISMA (schema.prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ─── TENANTS ─────────────────────────────────────────────────
model Tenant {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name                String
  slug                String    @unique
  ruc                 String?
  address             String?
  phone               String?
  country             String    @default("PE")
  logo_url            String?
  primary_color       String    @default("#1D4ED8")
  secondary_color     String    @default("#0F766E")
  font_family         String    @default("Inter")
  plan                String    @default("basico")
  plan_expires_at     DateTime? @db.Timestamptz
  is_active           Boolean   @default(true)
  onboarding_complete Boolean   @default(false)
  horarios_atencion   Json?
  duracion_cita_min   Int       @default(45)
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  // Relaciones
  users               User[]
  pacientes           Paciente[]
  citas               Cita[]
  evoluciones         Evolucion[]
  facturas            Factura[]
  gastos              Gasto[]
  equipos             Equipo[]
  insumos             Insumo[]

  @@map("tenants")
}

// ─── USERS ───────────────────────────────────────────────────
model User {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  supabase_auth_id    String    @unique @db.Uuid
  email               String
  full_name           String
  app_role            String    // admin | doctor | secretary | super_admin
  specialty           String?
  photo_url           String?
  voice_pin_hash      String?
  voice_pin_attempts  Int       @default(0)
  is_active           Boolean   @default(true)
  invitation_token    String?
  invitation_expires  DateTime? @db.Timestamptz
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  tenant              Tenant    @relation(fields: [tenant_id], references: [id])
  citas_como_doctor   Cita[]    @relation("CitaDoctor")
  evoluciones         Evolucion[]
  gastos_registrados  Gasto[]

  @@index([tenant_id])
  @@index([supabase_auth_id])
  @@map("users")
}

// ─── PACIENTES ───────────────────────────────────────────────
model Paciente {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  nombres             String
  apellidos           String
  tipo_documento      String?
  numero_documento    String?
  fecha_nacimiento    DateTime? @db.Date
  sexo                String?
  telefono            String?
  email               String?
  direccion           String?
  grupo_sanguineo     String?
  alergias            String?
  antecedentes_medicos String?
  foto_url            String?
  is_active           Boolean   @default(true)
  created_by          String?   @db.Uuid
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  tenant              Tenant    @relation(fields: [tenant_id], references: [id])
  citas               Cita[]
  evoluciones         Evolucion[]
  facturas            Factura[]
  odontograma_items   OdontogramaItem[]
  plan_items          PlanTratamientoItem[]
  documentos          DocumentoAdjunto[]
  gastos_laboratorio  Gasto[]

  @@index([tenant_id])
  @@index([tenant_id, numero_documento])
  @@index([tenant_id, apellidos])
  @@map("pacientes")
}

// ─── CITAS ───────────────────────────────────────────────────
model Cita {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  paciente_id         String    @db.Uuid
  doctor_id           String    @db.Uuid
  created_by          String?   @db.Uuid
  fecha_hora_inicio   DateTime  @db.Timestamptz
  fecha_hora_fin      DateTime  @db.Timestamptz
  duracion_min        Int       @default(45)
  motivo              String?
  estado              String    @default("programada")
  notas               String?
  email_confirmacion_enviado    Boolean @default(false)
  email_recordatorio_enviado    Boolean @default(false)
  whatsapp_confirmacion_enviado Boolean @default(false)
  whatsapp_recordatorio_enviado Boolean @default(false)
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  tenant              Tenant    @relation(fields: [tenant_id], references: [id])
  paciente            Paciente  @relation(fields: [paciente_id], references: [id])
  doctor              User      @relation("CitaDoctor", fields: [doctor_id], references: [id])
  evoluciones         Evolucion[]

  @@index([tenant_id])
  @@index([tenant_id, fecha_hora_inicio])
  @@index([tenant_id, doctor_id, fecha_hora_inicio])
  @@index([tenant_id, estado])
  @@map("citas")
}

// ─── EVOLUCIONES ─────────────────────────────────────────────
model Evolucion {
  id                    String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id             String    @db.Uuid
  paciente_id           String    @db.Uuid
  doctor_id             String    @db.Uuid
  cita_id               String?   @db.Uuid
  fecha                 DateTime  @db.Date
  motivo_consulta       String
  anamnesis             String?
  examen_clinico        String?
  diagnostico           String?
  plan_tratamiento_texto String?
  notas                 String?
  created_at            DateTime  @default(now()) @db.Timestamptz
  updated_at            DateTime  @updatedAt @db.Timestamptz
  updated_by            String?   @db.Uuid

  tenant                Tenant    @relation(fields: [tenant_id], references: [id])
  paciente              Paciente  @relation(fields: [paciente_id], references: [id])
  doctor                User      @relation(fields: [doctor_id], references: [id])
  cita                  Cita?     @relation(fields: [cita_id], references: [id])
  odontograma_items     OdontogramaItem[]
  plan_items            PlanTratamientoItem[]
  documentos            DocumentoAdjunto[]

  @@index([tenant_id, paciente_id])
  @@index([tenant_id, fecha])
  @@map("evoluciones")
}

// ─── ODONTOGRAMA ─────────────────────────────────────────────
model OdontogramaItem {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  paciente_id         String    @db.Uuid
  evolucion_id        String?   @db.Uuid
  numero_diente       Int
  superficie          String    // oclusal | vestibular | palatino | mesial | distal | total
  condicion           String
  tratamiento         String?
  notas               String?
  color_display       String?
  registrado_por      String?   @db.Uuid
  fecha_registro      DateTime  @default(now()) @db.Timestamptz

  paciente            Paciente  @relation(fields: [paciente_id], references: [id])
  evolucion           Evolucion? @relation(fields: [evolucion_id], references: [id])

  @@index([tenant_id, paciente_id])
  @@index([tenant_id, paciente_id, numero_diente])
  @@map("odontograma_items")
}

// ─── PLAN DE TRATAMIENTO ─────────────────────────────────────
model PlanTratamientoItem {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  evolucion_id        String    @db.Uuid
  paciente_id         String    @db.Uuid
  numero_diente       Int?
  descripcion         String
  estado              String    @default("pendiente")
  costo_estimado      Decimal   @default(0) @db.Decimal(10, 2)
  orden               Int       @default(0)
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  evolucion           Evolucion @relation(fields: [evolucion_id], references: [id])
  paciente            Paciente  @relation(fields: [paciente_id], references: [id])
  factura_items       FacturaItem[]
  gastos_laboratorio  Gasto[]

  @@index([tenant_id, paciente_id])
  @@index([tenant_id, estado])
  @@map("plan_tratamiento_items")
}

// ─── FACTURAS ────────────────────────────────────────────────
model Factura {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  paciente_id         String    @db.Uuid
  doctor_id           String?   @db.Uuid
  created_by          String?   @db.Uuid
  numero_factura      Int
  fecha_emision       DateTime  @db.Date
  subtotal            Decimal   @db.Decimal(10, 2)
  descuento_global    Decimal   @default(0) @db.Decimal(10, 2)
  descuento_tipo      String    @default("monto")
  total               Decimal   @db.Decimal(10, 2)
  monto_pagado        Decimal   @default(0) @db.Decimal(10, 2)
  saldo_pendiente     Decimal   @default(0) @db.Decimal(10, 2)
  estado              String    @default("pendiente")
  notas               String?
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  tenant              Tenant    @relation(fields: [tenant_id], references: [id])
  paciente            Paciente  @relation(fields: [paciente_id], references: [id])
  items               FacturaItem[]
  pagos               Pago[]

  @@unique([tenant_id, numero_factura])
  @@index([tenant_id, fecha_emision])
  @@index([tenant_id, estado])
  @@index([tenant_id, paciente_id])
  @@map("facturas")
}

// ─── ÍTEMS DE FACTURA ────────────────────────────────────────
model FacturaItem {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  factura_id          String    @db.Uuid
  tenant_id           String    @db.Uuid
  plan_item_id        String?   @db.Uuid
  descripcion         String
  cantidad            Decimal   @db.Decimal(10, 2)
  valor_unitario      Decimal   @db.Decimal(10, 2)
  descuento_item      Decimal   @default(0) @db.Decimal(10, 2)
  valor_total         Decimal   @db.Decimal(10, 2)

  factura             Factura   @relation(fields: [factura_id], references: [id])
  plan_item           PlanTratamientoItem? @relation(fields: [plan_item_id], references: [id])

  @@index([factura_id])
  @@map("factura_items")
}

// ─── PAGOS Y ABONOS ─────────────────────────────────────────
model Pago {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  factura_id          String    @db.Uuid
  tenant_id           String    @db.Uuid
  monto               Decimal   @db.Decimal(10, 2)
  metodo_pago         String    // efectivo | transferencia | tarjeta | cuotas
  fecha_pago          DateTime  @db.Date
  referencia          String?
  notas               String?
  registered_by       String?   @db.Uuid
  created_at          DateTime  @default(now()) @db.Timestamptz

  factura             Factura   @relation(fields: [factura_id], references: [id])

  @@index([factura_id])
  @@index([tenant_id, fecha_pago])
  @@map("pagos")
}

// ─── GASTOS OPERATIVOS ───────────────────────────────────────
model Gasto {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  tipo                String    // fijo | variable
  categoria           String
  descripcion         String
  monto               Decimal   @db.Decimal(10, 2)
  fecha               DateTime  @db.Date
  es_recurrente       Boolean   @default(false)
  paciente_id         String?   @db.Uuid
  plan_item_id        String?   @db.Uuid
  notas               String?
  created_by          String?   @db.Uuid
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  tenant              Tenant    @relation(fields: [tenant_id], references: [id])
  paciente            Paciente? @relation(fields: [paciente_id], references: [id])
  plan_item           PlanTratamientoItem? @relation(fields: [plan_item_id], references: [id])
  created_by_user     User?     @relation(fields: [created_by], references: [id])

  @@index([tenant_id, fecha])
  @@index([tenant_id, tipo, categoria])
  @@index([tenant_id, es_recurrente])
  @@map("gastos")
}

// ─── EQUIPOS ─────────────────────────────────────────────────
model Equipo {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  nombre              String
  categoria           String?
  marca               String?
  modelo              String?
  serial              String?
  proveedor           String?
  fecha_compra        DateTime? @db.Date
  valor_compra        Decimal?  @db.Decimal(12, 2)
  valor_residual      Decimal   @default(0) @db.Decimal(12, 2)
  vida_util_anios     Int?
  estado              String    @default("activo")
  notas               String?
  foto_url            String?
  created_by          String?   @db.Uuid
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  tenant              Tenant    @relation(fields: [tenant_id], references: [id])

  @@index([tenant_id, estado])
  @@map("equipos")
}

// ─── INSUMOS ─────────────────────────────────────────────────
model Insumo {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  nombre              String
  categoria           String?
  unidad_medida       String
  stock_actual        Decimal   @default(0) @db.Decimal(10, 2)
  stock_minimo        Decimal   @default(0) @db.Decimal(10, 2)
  precio_unitario     Decimal   @default(0) @db.Decimal(10, 2)
  proveedor           String?
  is_active           Boolean   @default(true)
  created_at          DateTime  @default(now()) @db.Timestamptz
  updated_at          DateTime  @updatedAt @db.Timestamptz

  tenant              Tenant    @relation(fields: [tenant_id], references: [id])
  movimientos         MovimientoInsumo[]

  @@index([tenant_id])
  @@index([tenant_id, stock_actual])
  @@map("insumos")
}

// ─── MOVIMIENTOS DE INSUMOS ──────────────────────────────────
model MovimientoInsumo {
  id                      String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  insumo_id               String    @db.Uuid
  tenant_id               String    @db.Uuid
  tipo                    String    // entrada | salida
  cantidad                Decimal   @db.Decimal(10, 2)
  precio_unitario_entrada Decimal?  @db.Decimal(10, 2)
  stock_resultante        Decimal   @db.Decimal(10, 2)
  proveedor               String?
  paciente_id             String?   @db.Uuid
  fecha                   DateTime  @db.Date
  notas                   String?
  registered_by           String?   @db.Uuid
  created_at              DateTime  @default(now()) @db.Timestamptz

  insumo                  Insumo    @relation(fields: [insumo_id], references: [id])

  @@index([insumo_id])
  @@index([tenant_id, fecha])
  @@map("movimientos_insumo")
}

// ─── DOCUMENTOS ADJUNTOS ────────────────────────────────────
model DocumentoAdjunto {
  id                  String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  tenant_id           String    @db.Uuid
  paciente_id         String    @db.Uuid
  evolucion_id        String?   @db.Uuid
  nombre_archivo      String
  tipo_archivo        String?
  storage_url         String
  tamanio_bytes       Int?
  uploaded_by         String?   @db.Uuid
  created_at          DateTime  @default(now()) @db.Timestamptz

  paciente            Paciente  @relation(fields: [paciente_id], references: [id])
  evolucion           Evolucion? @relation(fields: [evolucion_id], references: [id])

  @@index([tenant_id, paciente_id])
  @@map("documentos_adjuntos")
}
```

-----

## 4. ÍNDICES CRÍTICOS PARA RENDIMIENTO

```sql
-- Los más importantes para queries frecuentes del sistema

-- Búsqueda de pacientes por nombre (Full Text Search)
CREATE INDEX idx_pacientes_nombre_fts
ON pacientes USING gin(to_tsvector('spanish', nombres || ' ' || apellidos));

-- Agenda: citas de hoy y de la semana (el más consultado)
CREATE INDEX idx_citas_fecha_tenant
ON citas (tenant_id, fecha_hora_inicio);

-- Citas por doctor y fecha (para la vista por odontólogo)
CREATE INDEX idx_citas_doctor_fecha
ON citas (tenant_id, doctor_id, fecha_hora_inicio);

-- Facturas pendientes de cobro (cartera)
CREATE INDEX idx_facturas_estado
ON facturas (tenant_id, estado) WHERE estado IN ('pendiente', 'parcial');

-- Estado de Resultados: gastos por mes y categoría
CREATE INDEX idx_gastos_fecha_categoria
ON gastos (tenant_id, fecha, categoria);

-- Insumos con stock bajo (alerta en Dashboard)
CREATE INDEX idx_insumos_stock_bajo
ON insumos (tenant_id) WHERE stock_actual <= stock_minimo;

-- Movimientos por insumo y fecha (para calcular costo de insumos del P&L)
CREATE INDEX idx_movimientos_tipo_fecha
ON movimientos_insumo (tenant_id, tipo, fecha) WHERE tipo = 'salida';

-- Odontograma por paciente y diente (para renderizado del SVG)
CREATE INDEX idx_odontograma_paciente_diente
ON odontograma_items (tenant_id, paciente_id, numero_diente);
```

-----

## 5. POLICIES RLS POR TABLA

|Tabla                   |Política principal                  |Restricción adicional de rol         |
|------------------------|------------------------------------|-------------------------------------|
|`tenants`               |Solo el Super Admin puede leer todos|—                                    |
|`users`                 |Solo usuarios del mismo tenant      |—                                    |
|`pacientes`             |Solo tenant_id coincidente          |—                                    |
|`citas`                 |Solo tenant_id coincidente          |—                                    |
|`evoluciones`           |Solo tenant_id coincidente          |Solo `admin` y `doctor`              |
|`odontograma_items`     |Solo tenant_id coincidente          |Solo `admin` y `doctor`              |
|`plan_tratamiento_items`|Solo tenant_id coincidente          |Solo `admin` y `doctor`              |
|`facturas`              |Solo tenant_id coincidente          |—                                    |
|`factura_items`         |Solo tenant_id coincidente          |—                                    |
|`pagos`                 |Solo tenant_id coincidente          |—                                    |
|`gastos`                |Solo tenant_id coincidente          |Solo `admin`                         |
|`equipos`               |Solo tenant_id coincidente          |Lectura todos, escritura solo `admin`|
|`insumos`               |Solo tenant_id coincidente          |Lectura todos, escritura solo `admin`|
|`movimientos_insumo`    |Solo tenant_id coincidente          |Escritura solo `admin`               |
|`documentos_adjuntos`   |Solo tenant_id coincidente          |—                                    |

-----

## 6. CAMPOS CALCULADOS (NO SE ALMACENAN EN BD)

Estos valores se calculan en el servidor en tiempo real y no se guardan como columna:

|Campo calculado              |Dónde    |Cómo                                                             |
|-----------------------------|---------|-----------------------------------------------------------------|
|Depreciación anual del equipo|Equipos  |`(valor_compra - valor_residual) / vida_util_anios`              |
|Valor en libros actual       |Equipos  |`valor_compra - (depreciacion_anual × años_transcurridos)`       |
|Depreciación mensual total   |Motor P&L|`SUM(depreciacion_anual / 12)` de todos los equipos activos      |
|Costo de insumos consumidos  |Motor P&L|`SUM(cantidad × precio_unitario)` de salidas del período         |
|Utilidad bruta               |Motor P&L|`ingresos - costos_directos`                                     |
|Resultado neto               |Motor P&L|`utilidad_bruta - gastos_fijos - gastos_variables - depreciacion`|
|Saldo pendiente de factura   |Facturas |`total - monto_pagado` (se actualiza en cada pago registrado)    |
|Edad del paciente            |Pacientes|`EXTRACT(YEAR FROM AGE(fecha_nacimiento))`                       |

-----

## 7. CONVENCIONES DE NOMENCLATURA

|Elemento    |Convención                          |Ejemplo                                                       |
|------------|------------------------------------|--------------------------------------------------------------|
|Tablas      |`snake_case` plural                 |`plan_tratamiento_items`                                      |
|Columnas    |`snake_case`                        |`fecha_hora_inicio`                                           |
|Primary keys|`id` tipo UUID                      |`id uuid`                                                     |
|Foreign keys|`[tabla]_id`                        |`paciente_id`, `tenant_id`                                    |
|Booleans    |Prefijo `is_` o `es_`               |`is_active`, `es_recurrente`                                  |
|Timestamps  |`_at` al final                      |`created_at`, `updated_at`                                    |
|Soft delete |Campo `is_active`                   |No se eliminan, se desactivan                                 |
|Enums       |Texto plano con valores documentados|No se usan tipos ENUM de PostgreSQL para facilitar migraciones|

-----

*TOOTH X — Documento 7: Modelo de Datos · v1.0 · Mayo 2026*
*Próximo documento: Master Prompt Document para la IA (Documento 8)*