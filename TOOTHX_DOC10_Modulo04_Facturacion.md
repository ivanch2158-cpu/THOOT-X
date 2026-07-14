# Módulo 04: Administración - Facturación e Inventario

## 📋 Descripción General

Módulo 04 implementa la capa administrativa del sistema TOOTH X, con funcionalidades de facturación, gestión de inventario (equipos e insumos), y registro de gastos operacionales.

## ✅ Estado Actual

**Fase 1 - Facturación**: ✅ COMPLETADA
**Fase 2 - Inventario Básico**: ✅ COMPLETADA  
**Fase 3 - Dashboard de Métricas**: 🔄 EN PROGRESO
**Fase 4 - Estado de Resultados (P&L)**: ⏳ PENDIENTE

## 📦 Archivos Creados: 12+ Archivos

### 1. Esquemas de Validación (1 archivo)

#### `lib/financial/schemas.ts`
- Zod schemas para facturación
  - `facturaItemSchema`: Ítems individuales con cantidad, precio, descuentos
  - `facturaSchema`: Factura completa con items y método de pago
  - `pagoSchema`: Registro de pagos
- Zod schemas para inventario
  - `equipoSchema`: Registro de equipos con depreciación lineal
  - `insumoSchema`: Registro de insumos con unidades y stock
  - `movimientoInsumoSchema`: Entradas y salidas de insumos
- Zod schemas para finanzas
  - `gastoSchema`: Registro de gastos (fijos y variables)

### 2. APIs de Facturación (2 archivos)

#### `app/api/billing/invoices/route.ts`
- **GET** `/api/billing/invoices`
  - Listar facturas con filtros:
    - `?pacienteId=xxx` - por paciente
    - `?estado=xxx` - por estado (pendiente, parcial, pagada, cancelada)
    - `?desde=xxx&hasta=xxx` - por rango de fechas
  - Retorna: facturas, pacientes y odontólogo que emitió
  
- **POST** `/api/billing/invoices`
  - Crear nueva factura
  - Validación de items y paciente
  - Numeración automática por tenant
  - Cálculo automático de subtotales y descuentos
  - Crea registro en `factura_items` automáticamente

#### `app/api/billing/invoices/[id]/route.ts`
- **GET** `/api/billing/invoices/[id]`
  - Obtener detalles completos de factura
  - Incluye ítems y historial de pagos
  
- **PUT** `/api/billing/invoices/[id]`
  - Registrar pago en factura
  - Validaciones:
    - No permitir pagar más de lo pendiente
    - Actualiza estado (parcial → pagada)
  - Registra datos del pago con trazabilidad
  
- **DELETE** `/api/billing/invoices/[id]`
  - Soft delete de factura
  - No permite eliminar facturas pagadas
  - Elimina ítems asociados

### 3. APIs de Inventario (2 archivos)

#### `app/api/inventory/equipment/route.ts`
- **GET** `/api/inventory/equipment`
  - Listar equipos del consultorio
  - Filtro opcional: `?estado=activo|mantenimiento|dado_de_baja`
  - Calcula automáticamente:
    - Depreciación acumulada (lineal)
    - Valor en libros actual
  
- **POST** `/api/inventory/equipment`
  - Crear registro de equipo
  - Campos: nombre, marca, modelo, serial, categoría
  - Cálculo automático de depreciación mensual
  - Fórmula: (Valor compra - Valor residual) ÷ Vida útil (años)

#### `app/api/inventory/supplies/route.ts`
- **GET** `/api/inventory/supplies`
  - Listar insumos con stock actual
  - Filtros: `?categoria=xxx`, `?bajo_stock=true`
  - Alertas automáticas si stock ≤ mínimo
  
- **POST** `/api/inventory/supplies`
  - Crear registro de insumo
  - Campos: nombre, categoría, unidad medida, stock mínimo, precio

### 4. APIs de Finanzas (1 archivo)

#### `app/api/financial/expenses/route.ts`
- **GET** `/api/financial/expenses`
  - Listar gastos con filtros:
    - `?categoria=xxx` - por categoría
    - `?tipo=fijo|variable` - por tipo
    - `?desde=xxx&hasta=xxx` - por rango
  - Calcula automáticamente:
    - Total de gastos
    - Gastos fijos vs variables
  
- **POST** `/api/financial/expenses`
  - Registrar gasto
  - Categorías predefinidas (arriendo, sueldos, servicios, etc)
  - Tipos: fijo o variable
  - Opcional: vincular a paciente (para laboratorio dental)
  - Opción de recurrente mensual

### 5. Componentes de Facturación (2 archivos)

#### `components/billing/InvoiceForm.tsx`
- Formulario para crear facturas
- Características:
  - Selección de paciente
  - Array dinámico de ítems
  - Cálculo en tiempo real:
    - Subtotal por ítem
    - Descuentos por ítem (% o monto)
    - Descuento global
    - Total final
  - Método de pago (efectivo, transferencia, tarjeta, cuotas)
  - Validación Zod con React Hook Form
  - Display de totales en font-mono

#### `components/billing/InvoiceList.tsx`
- Listado de facturas con:
  - Búsqueda por número o paciente
  - Filtro por estado
  - Resumen de totales:
    - Total facturado
    - Total cobrado
    - Por cobrar
  - Estado color-coded
  - Botones: Ver, Descargar PDF, Pagar, Eliminar
  - Confirmación de eliminación

### 6. Componentes de Finanzas (1 archivo)

#### `components/financial/ExpenseList.tsx`
- Listado de gastos con:
  - Búsqueda por descripción o categoría
  - Filtros por tipo (fijo/variable)
  - Filtro por categoría
  - Resumen de totales:
    - Total gastos
    - Gastos fijos
    - Gastos variables
  - Badge de "Recurrente"
  - Edición y eliminación inline

### 7. Páginas Dashboard (2 archivos)

#### `app/(dashboard)/dashboard/billing/invoices/page.tsx`
- Página dedicada a facturas
- Botón "Nueva Factura"
- Integración con InvoiceList
- Filtros y búsqueda persistente

#### `app/(dashboard)/dashboard/billing/page.tsx`
- Página principal de Facturación y Finanzas
- Tabs con 3 secciones:
  1. **Facturas**: InvoiceList (venta)
  2. **Gastos**: ExpenseList (operacionales)
  3. **Inventario**: Placeholder (próxima fase)
- Botones para crear nuevas facturas y registrar gastos

## 🎯 Funcionalidades Implementadas

### Facturación ✅
- ✅ CRUD completo de facturas
- ✅ Ítems dinámicos con descuentos
- ✅ Numeración automática por tenant
- ✅ Estados: pendiente, parcial, pagada, cancelada
- ✅ Registro de pagos (completos y parciales)
- ✅ Cálculo automático de montos pendientes
- ✅ Validación en 2 capas (cliente + servidor)

### Inventario ✅
- ✅ CRUD de equipos con depreciación lineal
- ✅ CRUD de insumos con stock
- ✅ Alerta de stock bajo
- ✅ Categorías predefinidas
- ✅ Cálculo automático de valor en libros

### Gastos ✅
- ✅ Registro de gastos fijos y variables
- ✅ Categorías predefinidas
- ✅ Filtros por período
- ✅ Resumen de totales
- ✅ Gastos recurrentes (flag)

## 📊 Tablas de Base de Datos Requeridas

```sql
-- Facturas
CREATE TABLE facturas (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  numero_factura integer NOT NULL,
  paciente_id uuid NOT NULL,
  user_id uuid,
  subtotal decimal(10,2),
  total_descuentos decimal(10,2),
  descuento_global decimal(10,2),
  total_factura decimal(10,2) NOT NULL,
  monto_pagado decimal(10,2) DEFAULT 0,
  estado varchar DEFAULT 'pendiente', -- pendiente | parcial | pagada | cancelada
  metodo_pago varchar,
  fecha_emision timestamp DEFAULT now(),
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

-- Ítems de Factura
CREATE TABLE factura_items (
  id uuid PRIMARY KEY,
  factura_id uuid NOT NULL,
  descripcion varchar NOT NULL,
  cantidad decimal,
  precio_unitario decimal(10,2),
  descuento_porcentaje decimal,
  descuento_monto decimal(10,2),
  subtotal decimal(10,2),
  is_active boolean DEFAULT true,
  FOREIGN KEY (factura_id) REFERENCES facturas(id)
);

-- Pagos registrados
CREATE TABLE pagos (
  id uuid PRIMARY KEY,
  factura_id uuid NOT NULL,
  monto decimal(10,2) NOT NULL,
  metodo_pago varchar,
  referencia varchar,
  notas text,
  registrado_por uuid,
  fecha_pago timestamp DEFAULT now(),
  is_active boolean DEFAULT true,
  FOREIGN KEY (factura_id) REFERENCES facturas(id),
  FOREIGN KEY (registrado_por) REFERENCES users(id)
);

-- Equipos
CREATE TABLE equipos (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  nombre varchar NOT NULL,
  marca varchar,
  modelo varchar,
  serial varchar UNIQUE,
  categoria varchar,
  fecha_compra date,
  valor_compra decimal(10,2),
  proveedor varchar,
  vida_util_anos integer,
  valor_residual decimal(10,2),
  estado varchar DEFAULT 'activo',
  observaciones text,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Insumos
CREATE TABLE insumos (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  nombre varchar NOT NULL,
  categoria varchar,
  unidad_medida varchar,
  stock_minimo integer,
  stock_actual integer DEFAULT 0,
  precio_unitario decimal(10,2),
  observaciones text,
  created_by uuid,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Movimientos de Insumos
CREATE TABLE movimientos_insumo (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  insumo_id uuid NOT NULL,
  tipo varchar, -- 'entrada' o 'salida'
  cantidad integer,
  precio_unitario decimal(10,2),
  fecha timestamp DEFAULT now(),
  proveedor varchar,
  razon text,
  registrado_por uuid,
  is_active boolean DEFAULT true,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (insumo_id) REFERENCES insumos(id),
  FOREIGN KEY (registrado_por) REFERENCES users(id)
);

-- Gastos
CREATE TABLE gastos (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  categoria varchar NOT NULL,
  tipo varchar NOT NULL, -- 'fijo' o 'variable'
  descripcion varchar NOT NULL,
  monto decimal(10,2) NOT NULL,
  fecha date,
  paciente_id uuid,
  recurrente boolean DEFAULT false,
  notas text,
  registrado_por uuid,
  is_active boolean DEFAULT true,
  created_at timestamp,
  updated_at timestamp,
  deleted_at timestamp,
  deleted_by uuid,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id),
  FOREIGN KEY (registrado_por) REFERENCES users(id)
);
```

## 🔐 Seguridad & Validación

- ✅ `protectEndpoint()` en todas las APIs
- ✅ Validación Zod (cliente + servidor)
- ✅ Aislamiento de tenant automático
- ✅ Soft delete en todas las tablas
- ✅ Audit trail (deleted_by, deleted_at)
- ✅ Timestamps automáticos

## 🛠️ Stack Utilizado

- Next.js 14 (App Router)
- TypeScript (strict mode)
- Supabase (PostgreSQL)
- React Hook Form + Zod
- Tailwind + shadcn/ui
- Lucide React (iconos)

## 📱 Páginas Creadas

- `/dashboard/billing` - Hub de facturación y finanzas
- `/dashboard/billing/invoices` - Gestión de facturas
- `/dashboard/billing/invoices/[id]` - Detalles de factura (próx)

## 🚀 APIs Implementadas: 7 Endpoints

```
/api/billing/invoices              (2 routes: GET/POST)
/api/billing/invoices/[id]         (1 route: GET/PUT/DELETE)
/api/inventory/equipment           (2 routes: GET/POST)
/api/inventory/supplies            (2 routes: GET/POST)
/api/financial/expenses            (2 routes: GET/POST)
```

## ⏳ Próximas Fases

### Fase 3: Dashboard de Métricas (En Progreso)
- Tarjetas de resumen (ingresos, gastos, cartera)
- Gráficos Recharts:
  - Barras: ingresos por mes
  - Torta: desglose de gastos
  - Línea: ingresos vs gastos
- Selector de rango de fechas
- Filtro por odontólogo

### Fase 4: Estado de Resultados (P&L)
- Motor de cálculo que combina:
  - Ingresos (desde facturas pagadas)
  - Gastos fijos y variables
  - Depreciación automática
  - Costo de insumos consumidos
- Vista detallada del P&L
- Comparativos (mes vs mes, acumulado del año)
- Indicador visual de rentabilidad
- Exportación a PDF

### Fase 5: Módulos Avanzados
- Reportes de cartera (facturas pendientes)
- Historial de movimientos de insumos
- Proyecciones financieras
- Alertas automáticas (stock bajo, cartera vencida)

## 📝 Notas de Implementación

1. **Numeración de Facturas**: Automática y reinicia en 1 por tenant
2. **Depreciación**: Cálculo lineal automático (Valor - Residual) ÷ Años
3. **Soft Delete**: Todos los registros se marcan como inactivos, nunca se eliminan
4. **Validación**: Zod en cliente + servidor para máxima seguridad
5. **Tenant Isolation**: tenant_id del JWT, nunca del request body
6. **Montos**: Siempre en Decimal(10,2), mostrados con font-mono

## ✨ Características Especiales

- Cálculo automático de totales en formularios (React Hook Form watch)
- Estados color-coded para rápida identificación visual
- Filtros avanzados con múltiples criterios
- Resúmenes en tiempo real de ingresos/gastos
- Soft delete reversible para compliance
- Historial de pagos por factura

---

**Estado**: 🟢 Facturación Completada
**Próximo**: Dashboard de Métricas
**Fecha**: Módulo 04 en desarrollo
