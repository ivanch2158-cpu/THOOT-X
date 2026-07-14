// lib/auth/roles.ts
// Constantes de roles — archivo sin imports de servidor, seguro para usar en Client Components

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  ODONTOLOGIST = 'odontologist',
  SECRETARY = 'secretary',
}
