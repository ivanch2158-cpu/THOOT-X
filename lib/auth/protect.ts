// lib/auth/protect.ts
// Helpers para protección de endpoints y validación de roles

import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Tipos de roles en el sistema
 */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',        // Admin global de TOOTH X
  ADMIN = 'admin',                     // Admin del consultorio
  ODONTOLOGIST = 'odontologist',       // Odontólogo
  SECRETARY = 'secretary',             // Secretaria
}

/**
 * Estructura de usuario autenticado
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  tenantId: string;
  role: UserRole;
  iat: number;
  exp: number;
}

/**
 * Valida que el usuario esté autenticado y retorna sus datos
 */
export async function validateAuth(): Promise<AuthenticatedUser | null> {
  try {
    const supabase = await createServerClient();

    // Obtener sesión actual
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session?.user) {
      return null;
    }

    // Obtener datos del usuario desde la BD
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, full_name, tenant_id, role')
      .eq('id', session.user.id)
      .single();

    if (userError || !userData) {
      return null;
    }

    return {
      id: userData.id,
      email: userData.email,
      fullName: userData.full_name,
      tenantId: userData.tenant_id,
      role: userData.role as UserRole,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
    };
  } catch (error) {
    console.error('Auth validation error:', error);
    return null;
  }
}

/**
 * Protege un endpoint y verifica autenticación
 */
export async function protectEndpoint(
  _request: NextRequest,
  allowedRoles?: UserRole[]
) {
  try {
    const user = await validateAuth();

    // Usuario no autenticado
    if (!user) {
      return {
        isValid: false,
        user: null,
        response: NextResponse.json(
          { error: 'No autenticado' },
          { status: 401 }
        ),
      };
    }

    // Verificar roles si se especificaron
    if (allowedRoles && allowedRoles.length > 0) {
      if (!allowedRoles.includes(user.role)) {
        return {
          isValid: false,
          user,
          response: NextResponse.json(
            { error: 'Permiso denegado. Rol insuficiente.' },
            { status: 403 }
          ),
        };
      }
    }

    return {
      isValid: true,
      user,
      response: null,
    };
  } catch (error) {
    console.error('Endpoint protection error:', error);
    return {
      isValid: false,
      user: null,
      response: NextResponse.json(
        { error: 'Error interno del servidor' },
        { status: 500 }
      ),
    };
  }
}

/**
 * Verifica que el tenant_id del usuario coincida con el recurso
 */
export function validateTenantAccess(
  userTenantId: string,
  resourceTenantId: string
): boolean {
  return userTenantId === resourceTenantId;
}

/**
 * Enriquece una consulta Supabase con filtro de tenant
 */
export async function withTenantFilter(
  query: any,
  tableName: string
) {
  const user = await validateAuth();

  if (!user) {
    return null;
  }

  // Agregar filtro de tenant automáticamente
  return query.eq(`${tableName}.tenant_id`, user.tenantId);
}
