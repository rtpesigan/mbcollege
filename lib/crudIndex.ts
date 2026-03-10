/**
 * CRUD API Routes Index
 * 
 * This index provides overview of all CRUD endpoints available in the system.
 * All endpoints are protected by role-based access control (RBAC).
 */

export const CRUD_ENDPOINTS = {
  // Users Management
  USERS: {
    LIST: '/api/crud/users',
    GET: '/api/crud/users?id=:id',
    CREATE: '/api/crud/users',
    UPDATE: '/api/crud/users?id=:id',
    DELETE: '/api/crud/users?id=:id',
  },

  // Courses Management
  COURSES: {
    LIST: '/api/crud/courses',
    GET: '/api/crud/courses?id=:id',
    CREATE: '/api/crud/courses',
    UPDATE: '/api/crud/courses?id=:id',
    DELETE: '/api/crud/courses?id=:id',
  },

  // Subjects Management
  SUBJECTS: {
    LIST: '/api/crud/subjects',
    GET: '/api/crud/subjects?id=:id',
    CREATE: '/api/crud/subjects',
    UPDATE: '/api/crud/subjects?id=:id',
    DELETE: '/api/crud/subjects?id=:id',
  },

  // Applications Management
  APPLICATIONS: {
    LIST: '/api/crud/applications',
    GET: '/api/crud/applications?id=:id',
    CREATE: '/api/crud/applications',
    UPDATE: '/api/crud/applications?id=:id',
    DELETE: '/api/crud/applications?id=:id',
  },

  // Documents Management
  DOCUMENTS: {
    LIST: '/api/crud/documents',
    GET: '/api/crud/documents?id=:id',
    CREATE: '/api/crud/documents',
    UPDATE: '/api/crud/documents?id=:id',
    DELETE: '/api/crud/documents?id=:id',
  },

  // Enrollments Management
  ENROLLMENTS: {
    LIST: '/api/crud/enrollments',
    GET: '/api/crud/enrollments?id=:id',
    CREATE: '/api/crud/enrollments',
    UPDATE: '/api/crud/enrollments?id=:id',
    DELETE: '/api/crud/enrollments?id=:id',
  },

  // Grades Management
  GRADES: {
    LIST: '/api/crud/grades',
    GET: '/api/crud/grades?id=:id',
    CREATE: '/api/crud/grades',
    UPDATE: '/api/crud/grades?id=:id',
    DELETE: '/api/crud/grades?id=:id',
  },

  // Payments Management
  PAYMENTS: {
    LIST: '/api/crud/payments',
    GET: '/api/crud/payments?id=:id',
    CREATE: '/api/crud/payments',
    UPDATE: '/api/crud/payments?id=:id',
    DELETE: '/api/crud/payments?id=:id',
  },

  // System Settings
  SETTINGS: {
    LIST: '/api/crud/settings',
    GET: '/api/crud/settings?key=:key',
    CREATE: '/api/crud/settings',
    UPDATE: '/api/crud/settings?key=:key',
    DELETE: '/api/crud/settings?key=:key',
  },

  // Activity Logs
  LOGS: {
    LIST: '/api/crud/logs',
    GET: '/api/crud/logs?id=:id',
    CREATE: '/api/crud/logs',
    DELETE: '/api/crud/logs?id=:id',
  },
} as const

/**
 * Role Permissions Overview
 * 
 * Each role has specific permissions for each module:
 * - C = Create
 * - R = Read
 * - U = Update
 * - D = Delete
 * - R(own) = Read own records only
 * - D(pending) = Delete only pending records
 */
export const ROLE_PERMISSIONS = {
  STUDENT: {
    users: { create: false, read: true, update: true, delete: false, ownOnly: true },
    courses: { create: false, read: true, update: false, delete: false, ownOnly: false },
    subjects: { create: false, read: true, update: false, delete: false, ownOnly: false },
    applications: { create: true, read: true, update: false, delete: false, ownOnly: true },
    documents: { create: true, read: true, update: false, delete: true, ownOnly: true, deletePendingOnly: true },
    enrollments: { create: true, read: true, update: false, delete: false, ownOnly: true },
    grades: { create: false, read: true, update: false, delete: false, ownOnly: true },
    payments: { create: true, read: true, update: false, delete: true, ownOnly: true, deletePendingOnly: true },
    settings: { create: false, read: false, update: false, delete: false },
    logs: { create: false, read: false, update: false, delete: false },
  },

  REGISTRAR: {
    users: { create: true, read: true, update: true, delete: false, ownOnly: false },
    courses: { create: true, read: true, update: true, delete: false, ownOnly: false },
    subjects: { create: true, read: true, update: true, delete: false, ownOnly: false },
    applications: { create: false, read: true, update: true, delete: false, ownOnly: false },
    documents: { create: false, read: true, update: true, delete: false, ownOnly: false },
    enrollments: { create: true, read: true, update: true, delete: false, ownOnly: false },
    grades: { create: true, read: true, update: true, delete: false, ownOnly: false },
    payments: { create: false, read: true, update: false, delete: false },
    settings: { create: false, read: true, update: false, delete: false },
    logs: { create: false, read: true, update: false, delete: false },
  },

  ADMIN: {
    users: { create: true, read: true, update: true, delete: true, ownOnly: false },
    courses: { create: true, read: true, update: true, delete: true, ownOnly: false },
    subjects: { create: true, read: true, update: true, delete: true, ownOnly: false },
    applications: { create: true, read: true, update: true, delete: true, ownOnly: false },
    documents: { create: true, read: true, update: true, delete: true, ownOnly: false },
    enrollments: { create: true, read: true, update: true, delete: true, ownOnly: false },
    grades: { create: true, read: true, update: true, delete: true, ownOnly: false },
    payments: { create: true, read: true, update: true, delete: true, ownOnly: false },
    settings: { create: true, read: true, update: true, delete: true, ownOnly: false },
    logs: { create: false, read: true, update: false, delete: true },
  },

  CASHIER: {
    users: { create: false, read: true, update: false, delete: false },
    courses: { create: false, read: true, update: false, delete: false },
    subjects: { create: false, read: true, update: false, delete: false },
    applications: { create: false, read: true, update: false, delete: false },
    documents: { create: false, read: true, update: false, delete: false },
    enrollments: { create: false, read: true, update: false, delete: false },
    grades: { create: false, read: true, update: false, delete: false },
    payments: { create: true, read: true, update: true, delete: false },
    settings: { create: false, read: false, update: false, delete: false },
    logs: { create: false, read: true, update: false, delete: false },
  },
} as const

/**
 * HTTP Methods and Status Codes
 */
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
} as const

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  INTERNAL_ERROR: 500,
} as const

/**
 * Query parameters used across endpoints
 */
export const QUERY_PARAMS = {
  PAGINATION: {
    page: 'number (default: 1)',
    limit: 'number (default: 10, max: 100)',
  },
  FILTERING: {
    id: 'Record ID for single item fetch',
    role: 'User role filter',
    status: 'Status filter (varies by module)',
    courseId: 'Course ID filter',
    userId: 'User ID filter',
    subjectId: 'Subject ID filter',
    academicYear: 'Academic year filter',
    semester: 'Semester filter',
    paymentMethod: 'Payment method filter',
    type: 'Type filter (for documents)',
    module: 'Module filter (for logs)',
    action: 'Action filter (for logs)',
    startDate: 'Start date for range filters',
    endDate: 'End date for range filters',
  },
} as const

/**
 * Response Format
 * All endpoints return responses in this format:
 */
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

/**
 * Common request/response patterns by operation
 */
export const OPERATION_PATTERNS = {
  LIST: {
    method: 'GET',
    queryParams: ['page', 'limit', 'filters...'],
    response: {
      success: true,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    },
  },

  GET_SINGLE: {
    method: 'GET',
    queryParams: ['id'],
    response: {
      success: true,
      data: { /* single item */ },
    },
  },

  CREATE: {
    method: 'POST',
    body: { /* required fields for resource */ },
    response: {
      success: true,
      data: { /* created item with all fields */ },
    },
    status: 201,
  },

  UPDATE: {
    method: 'PUT',
    queryParams: ['id'],
    body: { /* fields to update */ },
    response: {
      success: true,
      data: { /* updated item */ },
    },
  },

  DELETE: {
    method: 'DELETE',
    queryParams: ['id'],
    response: {
      success: true,
      message: 'Resource deleted successfully',
    },
  },

  ERROR: {
    success: false,
    error: 'Description of what went wrong',
  },
} as const

/**
 * Module names used in system
 */
export const MODULES = {
  USERS: 'users',
  COURSES: 'courses',
  SUBJECTS: 'subjects',
  APPLICATIONS: 'applications',
  DOCUMENTS: 'documents',
  ENROLLMENTS: 'enrollments',
  GRADES: 'grades',
  PAYMENTS: 'payments',
  SETTINGS: 'settings',
  LOGS: 'logs',
} as const

/**
 * Document types available
 */
export const DOCUMENT_TYPES = [
  'BIRTH_CERTIFICATE',
  'FORM_137',
  'GOOD_MORAL',
  'MEDICAL_CERTIFICATE',
  'ID_PICTURE',
  'TRANSFER_CERTIFICATE',
  'DIPLOMA',
  'OTHER',
] as const

/**
 * Status values for different modules
 */
export const STATUSES = {
  APPLICATION: ['PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'CANCELLED'],
  DOCUMENT: ['PENDING', 'APPROVED', 'REJECTED', 'EXPIRED'],
  ENROLLMENT: ['PENDING', 'APPROVED', 'ENROLLED', 'DROPPED', 'GRADUATED', 'INACTIVE', 'ACTIVE'],
  PAYMENT: ['PENDING', 'VERIFIED', 'APPROVED', 'REJECTED', 'CANCELLED', 'REFUNDED'],
} as const

/**
 * Payment methods available
 */
export const PAYMENT_METHODS = [
  'CASH',
  'GCASH',
  'BANK_TRANSFER',
  'CREDIT_CARD',
  'CHECK',
] as const

export default {
  CRUD_ENDPOINTS,
  ROLE_PERMISSIONS,
  HTTP_METHODS,
  HTTP_STATUS,
  QUERY_PARAMS,
  OPERATION_PATTERNS,
  MODULES,
  DOCUMENT_TYPES,
  STATUSES,
  PAYMENT_METHODS,
}
