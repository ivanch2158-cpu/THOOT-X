# DOCUMENTO 11 — POLÍTICAS DE ROW LEVEL SECURITY (RLS)

## TOOTH X · Aislamiento Multi-Tenant en PostgreSQL (Supabase)

-----

|Campo          |Detalle                                     |
|---------------|--------------------------------------------|
|**Proyecto**   |TOOTH X                                     |
|**Versión**    |v1.0                                        |
|**Fecha**      |Junio 2026                                  |
|**Motor BD**   |PostgreSQL via Supabase                     |
|**Propósito**  |Políticas SQL que garantizan el aislamiento entre consultorios|

-----

## 1. ESTRATEGIA DE AISLAMIENTO

### Dos capas de seguridad (nunca depender de solo una)

```
CAPA 1 — API Routes (Next.js)
  ├── tenant_id siempre extraído del JWT, nunca del body
  ├── Todas las queries filtran WHERE tenant_id = jwt.tenant_id
  └── protectEndpoint() valida sesión y rol antes de ejecutar

CAPA 2 — Row Level Security (PostgreSQL)
  ├── Activado en TODAS las tablas sin excepción
  ├── Bloquea acceso directo a la BD aunque se filtre la service_role key
  └── Defensa en profundidad: un bug en la API no expone datos de otros tenants
```

> **Importante:** Las API Routes de Next.js usan la `SUPABASE_SERVICE_ROLE_KEY` que bypasea RLS por defecto. Por eso en toda query del servidor se debe agregar `.setPostgresConfig({ search_path: 'public' })` o usar el cliente Prisma con filtros explícitos. RLS es la red de seguridad final.

### Obtener el tenant del usuario autenticado

El tenant_id y el rol se almacenan en `user_metadata` del JWT de Supabase Auth (cargados al hacer login). Esto evita queries adicionales a la BD en cada verificación RLS.

```sql
-- Funciones helper que leen del JWT activo
-- Se crean UNA SOLA VEZ en el editor SQL de Supabase

CREATE OR REPLACE FUNCTION get_my_tenant_id()
RETURNS UUID AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'tenant_id')::UUID,
    '00000000-0000-0000-0000-000000000000'::UUID
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'app_role',
    'anon'
  );
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT get_my_role() = 'super_admin';
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_admin_or_above()
RETURNS BOOLEAN AS $$
  SELECT get_my_role() IN ('admin', 'super_admin');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION is_clinical_role()
RETURNS BOOLEAN AS $$
  SELECT get_my_role() IN ('admin', 'doctor', 'super_admin');
$$ LANGUAGE SQL STABLE SECURITY DEFINER;
```

-----

## 2. ACTIVAR RLS EN TODAS LAS TABLAS

```sql
-- Ejecutar esto ANTES de crear las políticas
ALTER TABLE tenants            ENABLE ROW LEVEL SECURITY;
ALTER TABLE users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE citas              ENABLE ROW LEVEL SECURITY;
ALTER TABLE evoluciones        ENABLE ROW LEVEL SECURITY;
ALTER TABLE odontograma_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_tratamiento_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas           ENABLE ROW LEVEL SECURITY;
ALTER TABLE factura_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos             ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE insumos            ENABLE ROW LEVEL SECURITY;
ALTER TABLE movimientos_insumo ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos_adjuntos ENABLE ROW LEVEL SECURITY;
```

-----

## 3. POLÍTICAS POR TABLA

### 3.1 TABLA: `tenants`

| Acción | Quién puede |
|--------|------------|
| SELECT | Todos los roles del propio tenant + super_admin |
| INSERT | Solo super_admin (registro de nuevos consultorios) |
| UPDATE | admin del propio tenant + super_admin |
| DELETE | Solo super_admin |

```sql
-- SELECT: cada consultorio solo ve su propio registro
CREATE POLICY "tenants_select" ON tenants
  FOR SELECT USING (
    id = get_my_tenant_id()
    OR is_super_admin()
  );

-- INSERT: solo super_admin registra consultorios
CREATE POLICY "tenants_insert" ON tenants
  FOR INSERT WITH CHECK (is_super_admin());

-- UPDATE: admin actualiza su propio tenant, super_admin actualiza cualquiera
CREATE POLICY "tenants_update" ON tenants
  FOR UPDATE USING (
    (id = get_my_tenant_id() AND is_admin_or_above())
    OR is_super_admin()
  );

-- DELETE: solo super_admin
CREATE POLICY "tenants_delete" ON tenants
  FOR DELETE USING (is_super_admin());
```

-----

### 3.2 TABLA: `users`

| Acción | Quién puede |
|--------|------------|
| SELECT | Todos los roles del mismo tenant |
| INSERT | admin del tenant (invitar usuarios) |
| UPDATE | admin del mismo tenant + el propio usuario (su perfil) |
| DELETE | Solo admin (soft delete: is_active = false) |

```sql
CREATE POLICY "users_select" ON users
  FOR SELECT USING (
    tenant_id = get_my_tenant_id()
    OR is_super_admin()
  );

CREATE POLICY "users_insert" ON users
  FOR INSERT WITH CHECK (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
    OR is_super_admin()
  );

-- Admin gestiona usuarios del tenant; cada usuario puede editar su propio perfil
CREATE POLICY "users_update" ON users
  FOR UPDATE USING (
    (tenant_id = get_my_tenant_id() AND is_admin_or_above())
    OR supabase_auth_id = auth.uid()
    OR is_super_admin()
  );

CREATE POLICY "users_delete" ON users
  FOR DELETE USING (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
    OR is_super_admin()
  );
```

-----

### 3.3 TABLA: `pacientes`

Todos los roles del consultorio pueden gestionar pacientes (la secretaria también).

```sql
CREATE POLICY "pacientes_tenant_isolation" ON pacientes
  FOR ALL USING (tenant_id = get_my_tenant_id())
  WITH CHECK (tenant_id = get_my_tenant_id());
```

-----

### 3.4 TABLA: `citas`

Todos los roles del consultorio pueden ver y gestionar citas.

```sql
CREATE POLICY "citas_tenant_isolation" ON citas
  FOR ALL USING (tenant_id = get_my_tenant_id())
  WITH CHECK (tenant_id = get_my_tenant_id());
```

-----

### 3.5 TABLA: `evoluciones`

Solo admin y doctor. La secretaria no accede a historia clínica.

```sql
CREATE POLICY "evoluciones_clinical_only" ON evoluciones
  FOR ALL USING (
    tenant_id = get_my_tenant_id()
    AND is_clinical_role()
  )
  WITH CHECK (
    tenant_id = get_my_tenant_id()
    AND is_clinical_role()
  );
```

-----

### 3.6 TABLA: `odontograma_items`

Solo admin y doctor.

```sql
CREATE POLICY "odontograma_clinical_only" ON odontograma_items
  FOR ALL USING (
    tenant_id = get_my_tenant_id()
    AND is_clinical_role()
  )
  WITH CHECK (
    tenant_id = get_my_tenant_id()
    AND is_clinical_role()
  );
```

-----

### 3.7 TABLA: `plan_tratamiento_items`

Solo admin y doctor.

```sql
CREATE POLICY "plan_tratamiento_clinical_only" ON plan_tratamiento_items
  FOR ALL USING (
    tenant_id = get_my_tenant_id()
    AND is_clinical_role()
  )
  WITH CHECK (
    tenant_id = get_my_tenant_id()
    AND is_clinical_role()
  );
```

-----

### 3.8 TABLA: `facturas`

Todos los roles del consultorio pueden ver y gestionar facturas (la secretaria factura).

```sql
CREATE POLICY "facturas_tenant_isolation" ON facturas
  FOR ALL USING (tenant_id = get_my_tenant_id())
  WITH CHECK (tenant_id = get_my_tenant_id());
```

-----

### 3.9 TABLA: `factura_items`

Mismo acceso que facturas.

```sql
CREATE POLICY "factura_items_tenant_isolation" ON factura_items
  FOR ALL USING (tenant_id = get_my_tenant_id())
  WITH CHECK (tenant_id = get_my_tenant_id());
```

-----

### 3.10 TABLA: `pagos`

Todos los roles del consultorio.

```sql
CREATE POLICY "pagos_tenant_isolation" ON pagos
  FOR ALL USING (tenant_id = get_my_tenant_id())
  WITH CHECK (tenant_id = get_my_tenant_id());
```

-----

### 3.11 TABLA: `gastos`

Solo admin. Los datos financieros del negocio son confidenciales.

```sql
CREATE POLICY "gastos_admin_only" ON gastos
  FOR ALL USING (
    tenant_id = get_my_tenant_id()
    AND is_admin_or_above()
  )
  WITH CHECK (
    tenant_id = get_my_tenant_id()
    AND is_admin_or_above()
  );
```

-----

### 3.12 TABLA: `equipos`

Lectura: todos los roles. Escritura: solo admin.

```sql
-- Lectura: todos los roles del tenant
CREATE POLICY "equipos_select" ON equipos
  FOR SELECT USING (tenant_id = get_my_tenant_id());

-- Escritura: solo admin
CREATE POLICY "equipos_write" ON equipos
  FOR INSERT WITH CHECK (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
  );

CREATE POLICY "equipos_update" ON equipos
  FOR UPDATE USING (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
  );

CREATE POLICY "equipos_delete" ON equipos
  FOR DELETE USING (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
  );
```

-----

### 3.13 TABLA: `insumos`

Lectura: todos los roles. Escritura: solo admin.

```sql
CREATE POLICY "insumos_select" ON insumos
  FOR SELECT USING (tenant_id = get_my_tenant_id());

CREATE POLICY "insumos_write" ON insumos
  FOR INSERT WITH CHECK (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
  );

CREATE POLICY "insumos_update" ON insumos
  FOR UPDATE USING (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
  );

CREATE POLICY "insumos_delete" ON insumos
  FOR DELETE USING (
    tenant_id = get_my_tenant_id() AND is_admin_or_above()
  );
```

-----

### 3.14 TABLA: `movimientos_insumo`

Lectura: todos. Escritura: admin y doctor (pueden registrar salidas de insumos).

```sql
CREATE POLICY "movimientos_select" ON movimientos_insumo
  FOR SELECT USING (tenant_id = get_my_tenant_id());

CREATE POLICY "movimientos_write" ON movimientos_insumo
  FOR INSERT WITH CHECK (
    tenant_id = get_my_tenant_id()
    AND is_clinical_role()
  );
```

-----

### 3.15 TABLA: `documentos_adjuntos`

Todos los roles del consultorio pueden subir y ver documentos.
La secretaria puede subir radiografías y documentos del paciente.
El doctor no puede ver documentos de otro tenant.

```sql
CREATE POLICY "documentos_tenant_isolation" ON documentos_adjuntos
  FOR ALL USING (tenant_id = get_my_tenant_id())
  WITH CHECK (tenant_id = get_my_tenant_id());
```

-----

## 4. POLÍTICAS DE SUPABASE STORAGE

Los buckets de archivos también requieren políticas de acceso.

### Estructura de buckets

```
Supabase Storage
│
├── tenant-logos/          [PÚBLICO — lectura pública, escritura admin]
│   └── {tenant_id}/logo.{ext}
│
├── patient-photos/        [PRIVADO — solo mismo tenant]
│   └── {tenant_id}/{patient_id}/foto.{ext}
│
├── clinical-documents/    [PRIVADO — solo admin+doctor del mismo tenant]
│   └── {tenant_id}/{patient_id}/{filename}
│
└── invoice-pdfs/          [PRIVADO — todos los roles del mismo tenant]
    └── {tenant_id}/{invoice_id}.pdf
```

### Políticas SQL para Storage

```sql
-- ── BUCKET: tenant-logos ──────────────────────────────────────
-- Lectura pública (el logo aparece en la landing sin autenticación)
CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'tenant-logos');

-- Solo admin del tenant puede subir/actualizar su logo
CREATE POLICY "logos_admin_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'tenant-logos'
    AND is_admin_or_above()
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
  );

CREATE POLICY "logos_admin_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'tenant-logos'
    AND is_admin_or_above()
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
  );

-- ── BUCKET: patient-photos ────────────────────────────────────
-- Solo usuarios del mismo tenant
CREATE POLICY "patient_photos_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'patient-photos'
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
  );

CREATE POLICY "patient_photos_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'patient-photos'
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
  );

-- ── BUCKET: clinical-documents ────────────────────────────────
-- Solo admin y doctor
CREATE POLICY "clinical_docs_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'clinical-documents'
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
    AND is_clinical_role()
  );

CREATE POLICY "clinical_docs_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'clinical-documents'
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
    AND is_clinical_role()
  );

-- ── BUCKET: invoice-pdfs ──────────────────────────────────────
-- Todos los roles del mismo tenant pueden ver facturas
CREATE POLICY "invoice_pdfs_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'invoice-pdfs'
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
  );

CREATE POLICY "invoice_pdfs_write" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'invoice-pdfs'
    AND (storage.foldername(name))[1] = get_my_tenant_id()::TEXT
  );
```

-----

## 5. DÓNDE EJECUTAR ESTAS POLÍTICAS

1. Ir a **Supabase Dashboard → SQL Editor**
2. Ejecutar primero el bloque de **funciones helper** (sección 1)
3. Ejecutar el bloque de **ALTER TABLE ENABLE ROW LEVEL SECURITY** (sección 2)
4. Ejecutar las políticas **tabla por tabla** (sección 3)
5. Crear los buckets en **Storage → New Bucket** y ejecutar las políticas de storage (sección 4)

> ⚠️ Las políticas RLS **NO se aplican automáticamente** cuando se usa la `SUPABASE_SERVICE_ROLE_KEY` en el servidor (Next.js API Routes). La service_role key bypasea RLS. El aislamiento en las APIs se garantiza con los filtros explícitos `WHERE tenant_id = ...` en cada query de Prisma. RLS protege contra acceso directo a la BD y errores de programación.

## 6. VERIFICACIÓN DE AISLAMIENTO

Prueba manual recomendada después de activar RLS:

```sql
-- Simular sesión del usuario del Tenant A
SET request.jwt.claims = '{"user_metadata": {"tenant_id": "UUID-TENANT-A", "app_role": "admin"}}';

-- Esta query solo debe retornar pacientes del Tenant A
SELECT id, nombres FROM pacientes;

-- Intentar acceder a un paciente del Tenant B (debe retornar vacío)
SELECT id, nombres FROM pacientes WHERE tenant_id = 'UUID-TENANT-B';
```
