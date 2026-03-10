/**
 * Role-Based Access Control (RBAC) utility
 * Defines roles, permissions, and access control for all modules
 */

export type Role = 'STUDENT' | 'REGISTRAR' | 'ADMIN' | 'CASHIER'

export interface Permission {
  read: boolean
  create: boolean
  update: boolean
  delete: boolean
  own?: boolean // Can only access own records
}

export type Permissions = {
  [key in 'users' | 'courses' | 'subjects' | 'applications' | 'documents' | 'enrollments' | 'grades' | 'payments' | 'settings' | 'logs']: Permission
}

interface RolePermissions {
  [role: string]: Permissions
}

export const permissionMatrix: RolePermissions = {
  STUDENT: {
    users: { read: true, create: false, update: false, delete: false, own: true },
    courses: { read: true, create: false, update: false, delete: false },
    subjects: { read: true, create: false, update: false, delete: false },
    applications: { read: true, create: true, update: false, delete: false, own: true },
    documents: { read: true, create: true, update: false, delete: false, own: true },
    enrollments: { read: true, create: false, update: false, delete: false, own: true },
    grades: { read: true, create: false, update: false, delete: false, own: true },
    payments: { read: true, create: true, update: false, delete: false, own: true },
    settings: { read: false, create: false, update: false, delete: false },
    logs: { read: false, create: false, update: false, delete: false },
  },
  REGISTRAR: {
    users: { read: true, create: true, update: true, delete: false },
    courses: { read: true, create: true, update: true, delete: false },
    subjects: { read: true, create: true, update: true, delete: false },
    applications: { read: true, create: false, update: true, delete: false },
    documents: { read: true, create: false, update: true, delete: false },
    enrollments: { read: true, create: true, update: true, delete: false },
    grades: { read: true, create: true, update: true, delete: false },
    payments: { read: true, create: false, update: false, delete: false },
    settings: { read: true, create: false, update: false, delete: false },
    logs: { read: true, create: false, update: false, delete: false },
  },
  ADMIN: {
    users: { read: true, create: true, update: true, delete: true },
    courses: { read: true, create: true, update: true, delete: true },
    subjects: { read: true, create: true, update: true, delete: true },
    applications: { read: true, create: true, update: true, delete: true },
    documents: { read: true, create: true, update: true, delete: true },
    enrollments: { read: true, create: true, update: true, delete: true },
    grades: { read: true, create: true, update: true, delete: true },
    payments: { read: true, create: true, update: true, delete: true },
    settings: { read: true, create: true, update: true, delete: true },
    logs: { read: true, create: false, update: false, delete: false },
  },
  CASHIER: {
    users: { read: true, create: false, update: false, delete: false },
    courses: { read: true, create: false, update: false, delete: false },
    subjects: { read: true, create: false, update: false, delete: false },
    applications: { read: true, create: false, update: false, delete: false },
    documents: { read: true, create: false, update: false, delete: false },
    enrollments: { read: true, create: false, update: false, delete: false },
    grades: { read: true, create: false, update: false, delete: false },
    payments: { read: true, create: true, update: true, delete: false },
    settings: { read: false, create: false, update: false, delete: false },
    logs: { read: true, create: false, update: false, delete: false },
  },
}

export function checkPermission(role: Role | undefined, module: keyof Permissions, action: keyof Permission): boolean {
  if (!role) return false
  const permissions = permissionMatrix[role]
  if (!permissions) return false
  return permissions[module][action] === true
}

export function canAccess(role: Role | undefined, module: keyof Permissions, action: 'read' | 'create' | 'update' | 'delete'): boolean {
  return checkPermission(role, module, action)
}

export function isOwnAccess(role: Role | undefined, module: keyof Permissions): boolean {
  if (!role) return false
  const permissions = permissionMatrix[role]
  return permissions[module]?.own === true
}
