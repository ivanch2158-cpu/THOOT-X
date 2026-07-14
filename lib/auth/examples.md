// lib/auth/examples.md
# Ejemplos de Uso - Protección de Endpoints

## Proteger un endpoint simple

```typescript
// app/api/patients/route.ts
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Validar autenticación
  const { isValid, user, response } = await protectEndpoint(request);

  if (!isValid) {
    return response;
  }

  // Usuario está autenticado
  console.log(`Usuario ${user!.fullName} solicitando pacientes`);

  // Aquí va la lógica de la API...
}
```

## Proteger un endpoint con roles específicos

```typescript
// app/api/financial-reports/route.ts
import { protectEndpoint, UserRole } from '@/lib/auth/protect';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Solo admin y super_admin pueden ver reportes financieros
  const { isValid, user, response } = await protectEndpoint(request, [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ]);

  if (!isValid) {
    return response;
  }

  // Solo usuarios con rol permitido llegan aquí
  const adminUser = user!;
  console.log(`Admin ${adminUser.fullName} solicitando reportes`);
}
```

## Validar acceso al tenant

```typescript
// app/api/patients/[id]/route.ts
import { protectEndpoint, validateTenantAccess } from '@/lib/auth/protect';
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { isValid, user, response } = await protectEndpoint(request);

  if (!isValid) {
    return response;
  }

  const supabase = await createServerClient();

  // Obtener el paciente
  const { data: patient } = await supabase
    .from('pacientes')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!patient) {
    return NextResponse.json(
      { error: 'Paciente no encontrado' },
      { status: 404 }
    );
  }

  // Validar que el paciente pertenece al consultorio del usuario
  if (!validateTenantAccess(user!.tenantId, patient.tenant_id)) {
    return NextResponse.json(
      { error: 'No tienes acceso a este recurso' },
      { status: 403 }
    );
  }

  return NextResponse.json(patient);
}
```

## Roles disponibles

### 1. SUPER_ADMIN
- Acceso global a todo TOOTH X
- No ve datos clínicos de consultorios
- Panel administrativo global
- Gestión de suscripciones

### 2. ADMIN
- Acceso completo al consultorio
- Gestión financiera y reportes
- Gestión de usuarios del consultorio
- Configuración del consultorio

### 3. ODONTOLOGIST
- Acceso a pacientes asignados
- Historia clínica completa
- Odontograma y planes de tratamiento
- Facturación de servicios

### 4. SECRETARY
- Acceso a pacientes y agenda
- No puede ver historia clínica
- Facturación limitada
- Gestión de citas

## Patrones Comunes

### Obtener datos filtrados por tenant

```typescript
const { data: patients } = await supabase
  .from('pacientes')
  .select('*')
  .eq('tenant_id', user.tenantId);  // Siempre filtrar por tenant_id
```

### Auditoría de acciones

```typescript
// Registrar quién hizo qué
const { error } = await supabase
  .from('audit_logs')
  .insert({
    user_id: user.id,
    tenant_id: user.tenantId,
    action: 'view_patient',
    resource_id: patientId,
    timestamp: new Date(),
  });
```
