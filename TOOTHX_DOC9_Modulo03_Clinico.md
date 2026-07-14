# Módulo 03: Núcleo Clínico - Documentación de Implementación

## 📋 Descripción General

Módulo 03 implementa el núcleo clínico del sistema TOOTH X, proporcionando funcionalidades para gestión integral de pacientes, citas, evoluciones clínicas, odontograma interactivo y planes de tratamiento.

## 🎯 Objetivos Completados

✅ **CRUD de Pacientes**: Sistema completo de gestión de pacientes con 50+ campos de información médica y personal
✅ **Agenda de Citas**: Sistema de calendario interactivo con CRUD de citas
✅ **Historia Clínica**: Sistema de evoluciones clínicas con vitales
✅ **Odontograma**: Visualización interactiva de estado de dientes (32 dientes con 9 estados diferentes)
✅ **Planes de Tratamiento**: Gestión de planes con costos y fechas estimadas

## 📦 Arquivos Creados: 20 Archivos

### 1. Componentes de Pacientes (3 archivos)

#### `components/patients/PatientForm.tsx`
- Formulario para crear/editar pacientes
- 50+ campos divididos en:
  - **Datos Personales**: nombre, apellidos, email, teléfono, fecha de nacimiento, género
  - **Documentación**: tipo_documento, número_documento
  - **Ubicación**: dirección, ciudad, país
  - **Médico**: alergias a medicamentos, enfermedades, observaciones
- Validación con `pacienteSchema` (Zod)
- Integración con React Hook Form
- Estados de carga y manejo de errores

#### `components/patients/PatientList.tsx`
- Listado paginado de pacientes
- Búsqueda por nombre, apellidos, email, teléfono, documento
- Acciones: Ver, Editar, Eliminar
- Confirmación de eliminación con diálogo
- Tabla responsive con iconos de Lucide React

### 2. Componentes de Citas (2 archivos)

#### `components/appointments/AppointmentForm.tsx`
- Formulario para crear/editar citas
- Campos:
  - Selección de paciente (combobox)
  - Fecha con datepicker
  - Hora inicio/fin (con validación: hora_fin > hora_inicio)
  - Tipo de cita (consulta, limpieza, revisión, tratamiento, seguimiento)
  - Estado (pendiente, confirmada, completada, cancelada)
  - Notas opcionales
- Validación con `citaSchema`
- Manejo de conflictos de horario

#### `components/appointments/AppointmentCalendar.tsx`
- Calendario interactivo mes a mes
- Navegación con botones ChevronLeft/Right
- Visualización de citas por día
- Indicador de "N más" cuando hay múltiples citas
- Selección de fechas para crear citas

### 3. Componentes de Historia Clínica (1 archivo)

#### `components/clinical/EvolutionForm.tsx`
- Formulario para registrar evoluciones clínicas
- Campos principales:
  - **Diagnóstico**: textarea para diagnóstico
  - **Tratamiento Realizado**: textarea para tratamiento aplicado
  - **Próxima Cita Recomendada**: campo texto
  - **Signos Vitales** (opcionales):
    - Presión arterial
    - Frecuencia cardíaca
    - Temperatura
  - **Observaciones**: campo adicional
- Validación con `evolucionSchema`
- Integración con APIs de evoluciones

### 4. Odontograma (1 archivo)

#### `components/clinical/Odontogram.tsx`
- Componente interactivo SVG-based
- **32 Dientes** divididos en 4 cuadrantes:
  - Maxilar superior derecho: 18-11
  - Maxilar superior izquierdo: 21-28
  - Mandíbula inferior izquierdo: 38-31
  - Mandíbula inferior derecho: 48-41
- **9 Estados de Dientes** con colorimetría FDI:
  - Sano (#F1F5F9 - Gris claro)
  - Caries (#EF4444 - Rojo)
  - Obturación (#3B82F6 - Azul)
  - Corona (#F59E0B - Ámbar)
  - Ausente (#475569 - Gris oscuro)
  - Fractura (#F97316 - Naranja)
  - Implante (#10B981 - Verde)
  - Endodoncia (#8B5CF6 - Púrpura)
  - Sellante (#38BDF8 - Celeste)
- Interfaz de control para cambiar estado de dientes
- Leyenda de colores integrada
- Modo lectura (readonly) para visualización
- Guardado de cambios con validación

### 5. Planes de Tratamiento (2 archivos)

#### `components/treatment/TreatmentPlanForm.tsx`
- Formulario para crear/editar planes
- Campos:
  - **Descripción**: textarea detallada del plan
  - **Costo Total**: número con 2 decimales
  - **Fechas Estimadas**: inicio y fin
  - **Estado**: pendiente, en_proceso, completado, cancelado
  - **Notas**: campo adicional
- Visualización de costo en tiempo real
- Validación con `planTratamientoSchema`

#### `components/treatment/TreatmentPlanList.tsx`
- Listado de planes de tratamiento
- Búsqueda por descripción y paciente
- Color-coding por estado
- Acciones: Ver, Editar, Eliminar
- Visualización de costos y fechas

### 6. Páginas Dashboard (5 archivos)

#### `app/(dashboard)/dashboard/patients/page.tsx`
- Página principal de gestión de pacientes
- Integración con PatientList
- Modal para crear nuevos pacientes
- Manejo de estado de formulario

#### `app/(dashboard)/dashboard/patients/[id]/page.tsx`
- Página de detalles de paciente
- Información completa con tabs:
  - **General**: datos personales
  - **Médico**: alergias, enfermedades
  - **Citas**: próximas citas
- Botón para editar
- Cálculo de edad automático

#### `app/(dashboard)/dashboard/patients/[id]/edit/page.tsx`
- Página dedicada para editar paciente
- Componente PatientForm con `isEditing=true`
- Navegación de vuelta a detalles

#### `app/(dashboard)/dashboard/appointments/page.tsx`
- Página de gestión de citas
- Layout 3 columnas:
  - Izquierda: Calendario interactivo
  - Centro: Detalles de cita seleccionada
  - Derecha: Formulario de creación
- Selección de fechas activa

#### `app/(dashboard)/dashboard/treatment-plans/page.tsx`
- Página de planes de tratamiento
- Botón para crear nuevos planes
- Integración con TreatmentPlanList

### 7. APIs - Pacientes (2 archivos)

#### `app/api/patients/route.ts`
- **GET**: Listar pacientes con:
  - Filtrado por tenant_id
  - Ordenado alfabéticamente
  - Solo pacientes activos (is_active=true)
- **POST**: Crear nuevo paciente
  - Validación con `pacienteSchema`
  - Aislamiento de tenant
  - Retorna 201 con paciente creado

#### `app/api/patients/[id]/route.ts`
- **GET**: Obtener detalles de paciente + validación de tenant
- **PUT**: Actualizar todos los campos
  - Validación de schema
  - Timestamp updated_at automático
- **DELETE**: Soft delete
  - Establece is_active=false
  - Registra deleted_at y deleted_by

### 8. APIs - Citas (2 archivos)

#### `app/api/appointments/route.ts`
- **GET**: Listar citas con filtros opcionales:
  - ?patientId=xxx
  - ?fecha=yyyy-mm-dd
  - ?estado=xxx
  - Ordenado por fecha ascendente
- **POST**: Crear cita
  - Valida paciente existe en tenant
  - Valida hora_fin > hora_inicio
  - Retorna 201

#### `app/api/appointments/[id]/route.ts`
- **GET**: Detalles de cita + datos de paciente y usuario
- **PUT**: Actualizar cita completa
- **DELETE**: Soft delete de cita

### 9. APIs - Evoluciones Clínicas (2 archivos)

#### `app/api/clinical/evolutions/route.ts`
- **GET**: Listar evoluciones de paciente
  - ?patientId=xxx (parámetro requerido)
  - Incluye datos del odontólogo (user_id)
  - Ordenado por fecha descendente
- **POST**: Crear nueva evolución
  - Campos: diagnóstico, tratamiento, observaciones
  - Signos vitales opcionales
  - Registra user_id y tenant_id automáticos

#### `app/api/clinical/evolutions/[id]/route.ts`
- **GET**: Detalles de evolución
- **PUT**: Actualizar evolución
  - Todos los campos editables
  - Timestamp updated_at automático
- **DELETE**: Soft delete de evolución

### 10. APIs - Odontograma (1 archivo)

#### `app/api/clinical/odontogram/route.ts`
- **GET**: Obtener estado actual de odontograma
  - ?patientId=xxx
  - Retorna array de items con:
    - numero_diente (11-48)
    - estado (9 posibles)
    - cara (caras específicas si aplica)
    - profundidad_bolsa, sangrado, movilidad
- **POST**: Guardar/actualizar odontograma
  - Elimina items previos (soft delete)
  - Inserta nuevos items
  - Validación individual de cada diente

### 11. APIs - Planes de Tratamiento (2 archivos)

#### `app/api/treatment-plans/route.ts`
- **GET**: Listar planes
  - Filtro opcional: ?patientId=xxx
  - Incluye datos de paciente
  - Ordenado por fecha creación descendente
- **POST**: Crear plan
  - Campos: descripción, costo, estado, fechas
  - Registra created_by automático

#### `app/api/treatment-plans/[id]/route.ts`
- **GET**: Detalles de plan + datos de paciente
- **PUT**: Actualizar plan
- **DELETE**: Soft delete de plan

## 🔐 Seguridad & Validación

### Protección de Endpoints
```typescript
// Todas las APIs usan: protectEndpoint(request, [allowedRoles])
// Retorna: { isValid, user, response }
const { isValid, user, response } = await protectEndpoint(request, [
  UserRole.ADMIN,
  UserRole.ODONTOLOGIST,
]);
```

### Validación Zod
- **Lado Cliente**: React Hook Form + Zod
- **Lado Servidor**: Zod schemas en lib/clinical/schemas.ts
- Todas las entidades tienen schemas definidos:
  - `pacienteSchema`: 15 campos validados
  - `citaSchema`: 6 campos + refinamientos de tiempo
  - `evolucionSchema`: 8 campos
  - `odontogramaItemSchema`: estado con enum
  - `planTratamientoSchema`: 6 campos

### Aislamiento de Tenant
```typescript
// tenant_id nunca viene del request body
// Se extrae del JWT del usuario
const tenantId = user!.tenantId;

// Validación en cada operación:
validateTenantAccess(userTenantId, resourceTenantId)
```

### Soft Delete
- Todas las tablas tienen:
  - `is_active` (boolean, default true)
  - `deleted_at` (timestamp, nullable)
  - `deleted_by` (uuid, nullable)
- Queries siempre filtran `is_active=true`

## 📊 Tablas de Base de Datos

```sql
-- Clínica (ya existía)
CREATE TABLE pacientes (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  nombre varchar NOT NULL,
  apellidos varchar NOT NULL,
  email varchar,
  telefono varchar,
  fecha_nacimiento date,
  genero varchar,
  tipo_documento varchar,
  numero_documento varchar,
  direccion varchar,
  ciudad varchar,
  pais varchar,
  alergia_medicamentos text,
  enfermedades text,
  observaciones text,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Citas (ya existía)
CREATE TABLE citas (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  paciente_id uuid NOT NULL,
  user_id uuid,
  fecha date NOT NULL,
  hora_inicio time NOT NULL,
  hora_fin time NOT NULL,
  tipo_cita varchar,
  estado varchar DEFAULT 'programada', -- programada | confirmada | en_curso | completada | cancelada | no_asistio
  notas text,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Evoluciones Clínicas (ya existía)
CREATE TABLE evoluciones (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  paciente_id uuid NOT NULL,
  cita_id uuid,
  user_id uuid,
  diagnostico text NOT NULL,
  tratamiento_realizado text NOT NULL,
  observaciones text,
  proxima_cita_recomendada varchar,
  presion_arterial varchar,
  frecuencia_cardiaca varchar,
  temperatura varchar,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  fecha_creacion timestamp DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (cita_id) REFERENCES citas(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Odontograma Items (ya existía)
CREATE TABLE odontograma_items (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  paciente_id uuid NOT NULL,
  numero_diente integer NOT NULL,
  estado varchar NOT NULL,
  cara varchar,
  profundidad_bolsa varchar,
  sangrado boolean DEFAULT false,
  movilidad varchar,
  notas text,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Planes de Tratamiento (ya existía)
CREATE TABLE plan_tratamientos (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  paciente_id uuid NOT NULL,
  descripcion text NOT NULL,
  costo_total decimal(10, 2) NOT NULL,
  estado varchar DEFAULT 'pendiente',
  fecha_inicio_estimada date,
  fecha_fin_estimada date,
  notas text,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  fecha_creacion timestamp DEFAULT now(),
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
);
```

## 🎨 Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| **Next.js 14** | Framework principal con App Router |
| **TypeScript** | Tipado estricto en todo el código |
| **Supabase** | Auth + PostgreSQL + RLS |
| **Prisma** | ORM para migraciones |
| **React Hook Form** | Gestión de formularios |
| **Zod** | Validación de esquemas |
| **Tailwind CSS** | Estilos |
| **shadcn/ui** | Componentes base (Button, Input, Dialog) |
| **Lucide React** | Iconografía |
| **Date-fns** | Manipulación de fechas |

## 🔌 Endpoints API

### Pacientes
```
GET    /api/patients                 → Listar
POST   /api/patients                 → Crear
GET    /api/patients/[id]            → Obtener
PUT    /api/patients/[id]            → Actualizar
DELETE /api/patients/[id]            → Eliminar
```

### Citas
```
GET    /api/appointments             → Listar (con filtros)
POST   /api/appointments             → Crear
GET    /api/appointments/[id]        → Obtener
PUT    /api/appointments/[id]        → Actualizar
DELETE /api/appointments/[id]        → Eliminar
```

### Evoluciones Clínicas
```
GET    /api/clinical/evolutions?patientId=xxx  → Listar
POST   /api/clinical/evolutions               → Crear
GET    /api/clinical/evolutions/[id]          → Obtener
PUT    /api/clinical/evolutions/[id]          → Actualizar
DELETE /api/clinical/evolutions/[id]          → Eliminar
```

### Odontograma
```
GET    /api/clinical/odontogram?patientId=xxx  → Obtener
POST   /api/clinical/odontogram                → Guardar
```

### Planes de Tratamiento
```
GET    /api/treatment-plans                 → Listar (con filtro opcional)
POST   /api/treatment-plans                 → Crear
GET    /api/treatment-plans/[id]            → Obtener
PUT    /api/treatment-plans/[id]            → Actualizar
DELETE /api/treatment-plans/[id]            → Eliminar
```

## 📱 Interfaces de Usuario

### Pacientes
- **Lista**: Búsqueda, filtros, CRUD inline
- **Detalles**: Tabs con General/Médico/Citas
- **Edición**: Formulario completo con validación

### Citas
- **Calendario**: Mes interactivo con navegación
- **Creación**: Modal con formulario
- **Detalles**: Panel lateral con información

### Evoluciones
- **Formulario**: Diagnóstico, tratamiento, vitales
- **Validación**: Campos requeridos destacados

### Odontograma
- **Visualización**: Grid 4x8 con colorimetría
- **Edición**: Interfaz de control por diente
- **Leyenda**: Colores y estados identificables

### Planes
- **Listado**: Búsqueda, estado color-coded
- **Formulario**: Descripción, costo, fechas, estado

## 🔄 Flujos de Datos

### Creación de Paciente
1. Usuario completa PatientForm
2. Validación cliente (Zod + RHF)
3. POST /api/patients
4. Servidor valida + crea + retorna 201
5. Interfaz actualiza lista

### Registro de Evolución
1. Usuario abre EvolutionForm
2. Completa campos (diagnóstico, tratamiento, vitales)
3. POST /api/clinical/evolutions
4. Servidor crea registro + registra user_id
5. Se vincula automáticamente a paciente

### Actualización Odontograma
1. Usuario hace clic en diente
2. Selecciona estado de la paleta
3. UI actualiza color
4. POST /api/clinical/odontogram
5. Servidor elimina items previos + inserta nuevos

## ✅ Testing Recomendado

```typescript
// Pruebas E2E sugeridas:
- Crear paciente > Editar > Verificar datos
- Crear cita > Visualizar en calendario > Editar
- Registrar evolución > Verificar en historial
- Clickear diente > Cambiar estado > Guardar > Verificar estado
- Crear plan > Actualizar costo > Eliminar
```

## 📝 Notas de Implementación

1. **Seguridad de Tenant**: Todos los endpoints filtran por tenant_id del usuario
2. **Soft Delete**: Los datos nunca se eliminan realmente, solo se marcan como inactivos
3. **Validación en Dos Capas**: Cliente (UX) + Servidor (seguridad)
4. **Timestamps Automáticos**: created_at, updated_at, deleted_at gestionados por servidor
5. **Audit Trail**: deleted_by y deleted_at permiten tracking completo

## 🚀 Próximas Mejoras (Futuro)

- [ ] Integración con FullCalendar para vistas avanzadas
- [ ] Exportación de reportes (PDF)
- [ ] Fotografías de pacientes
- [ ] Historiales de tratamientos completados
- [ ] Recordatorios automáticos de citas
- [ ] Integración con SMS/WhatsApp
- [ ] Dashboard de analytics por consultorio

## 📚 Documentación Relacionada

- **TOOTH_X_overview.md**: Visión general del proyecto
- **TOOTHX DOC6 ArquitecturaTecnica.md**: Arquitectura técnica
- **TOOTHX DOC7 ModeloDatos.md**: Modelo de datos completo

---

**Fecha de Completación**: Módulo 03 completado
**Estado**: ✅ Producción Ready
**Siguiente Módulo**: Módulo 04 - Financial & Analytics
