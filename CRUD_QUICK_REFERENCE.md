# CRUD API Quick Reference Guide

## Overview
Complete CRUD (Create, Read, Update, Delete) API system with role-based access control for all modules.

## What Was Created

### 1. Core Utilities
- **`lib/rbac.ts`** - Role-Based Access Control system
  - Define roles: STUDENT, REGISTRAR, ADMIN, CASHIER
  - Permission matrix for each module
  - Permission checking functions

- **`lib/apiUtils.ts`** - Common API utilities
  - Session management
  - Permission checking middleware
  - Error handling helpers
  - Pagination utilities

- **`lib/crudIndex.ts`** - API reference for developers
  - Endpoint mapping
  - Permission overview
  - Constants and types

### 2. CRUD API Endpoints
Located in `/api/crud/`:

| Module | Endpoint | CRUD Support |
|--------|----------|------|
| Users | `users.ts` | ✅ Full CRUD |
| Courses | `courses.ts` | ✅ Full CRUD |
| Subjects | `subjects.ts` | ✅ Full CRUD |
| Applications | `applications.ts` | ✅ Full CRUD |
| Documents | `documents.ts` | ✅ Full CRUD |
| Enrollments | `enrollments.ts` | ✅ Full CRUD |
| Grades | `grades.ts` | ✅ Full CRUD |
| Payments | `payments.ts` | ✅ Full CRUD |
| System Settings | `settings.ts` | ✅ Full CRUD |
| Activity Logs | `logs.ts` | ✅ Read/Create/Delete |

### 3. Documentation
- **`API_DOCUMENTATION.md`** - Complete API documentation with examples

## Role Permissions Summary

### STUDENT
- **Can**: Read/manage own profile, Create applications, Upload documents, View grades, Make payments
- **Cannot**: Manage courses/subjects, Modify other users' records, Delete non-pending records

### REGISTRAR
- **Can**: Manage courses, subjects, enrollments, and applications; Verify documents; Record grades
- **Cannot**: Delete records completely, Manage payments, Modify system settings

### ADMIN
- **Can**: Full access to all modules including create, update, and delete
- **Cannot**: Limit activity logs (can read and delete but not create manually)

### CASHIER
- **Can**: Process and verify payments, View all user and payment data
- **Cannot**: Create/modify courses or users, Delete records

## File Structure

```
pages/api/crud/
├── users.ts          # User management (GET, POST, PUT, DELETE)
├── courses.ts        # Course management
├── subjects.ts       # Subject management
├── applications.ts   # Application management
├── documents.ts      # Document management
├── enrollments.ts    # Enrollment management
├── grades.ts         # Grade management
├── payments.ts       # Payment management
├── settings.ts       # System settings
└── logs.ts           # Activity logging

lib/
├── rbac.ts           # Permission definitions and checking
├── apiUtils.ts       # Shared API utilities
└── crudIndex.ts      # Developer reference
```

## How to Use

### Example 1: Create a New Course (Admin/Registrar)
```typescript
const response = await fetch('/api/crud/courses', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    code: 'BSIT',
    name: 'Bachelor of Science in Information Technology',
    department: 'College of Technology',
    maxStudents: 40,
    tuitionFee: 50000,
  }),
})
```

### Example 2: Get Student's Enrollments (Any role viewing own/allowed data)
```typescript
const response = await fetch('/api/crud/enrollments?page=1&limit=10&status=ENROLLED', {
  method: 'GET',
})
```

### Example 3: Update Grade (Registrar/Admin)
```typescript
const response = await fetch('/api/crud/grades?id=grade_123', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    midterm: 85,
    finals: 90,
    remarks: 'Good performance',
  }),
})
```

### Example 4: Process Payment (Cashier)
```typescript
const response = await fetch('/api/crud/payments?id=payment_456', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'VERIFIED',
    remarks: 'Payment confirmed through bank transfer',
  }),
})
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    "id": "123",
    "name": "John Doe",
    // ... other fields
  }
}
```

### List Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Unauthorized - No create permission for courses"
}
```

## HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

## Key Features

✅ **Role-Based Access Control** - Fine-grained permissions per role
✅ **Complete CRUD Operations** - All modules support Create, Read, Update, Delete
✅ **Pagination** - Built-in pagination with customizable limits (1-100 records)
✅ **Filtering** - Advanced filtering options (by status, user, course, etc.)
✅ **Data Validation** - Required fields validation
✅ **Error Handling** - Comprehensive error messages
✅ **Auto-Calculations** - Grade averages, GPA calculations
✅ **Audit Trail** - Activity logging for sensitive operations
✅ **Own Data Protection** - Students can only access their own records
✅ **Referential Integrity** - Prevents invalid deletions (e.g., courses with enrollments)

## Advanced Features

### Grade Calculation
Automatically computes:
- Average score from midterm and finals
- Letter grade (A-F based on 90-60 scale)

### Payment Status Flow
- PENDING → VERIFIED → APPROVED → (complete)
- Alternative flows: REJECTED, CANCELLED, REFUNDED

### Application Status Flow
- PENDING → UNDER_REVIEW → APPROVED/REJECTED
- Can be CANCELLED at any time

### Enrollment Status Options
- PENDING, APPROVED, ENROLLED, DROPPED, GRADUATED, INACTIVE, ACTIVE

## Security Considerations

1. **Authentication Required** - All endpoints require valid NextAuth session
2. **Role-Based Authorization** - Permissions checked before operation
3. **Own Data Access** - Students limited to their own records
4. **Referential Integrity** - Can't delete records with dependencies
5. **Audit Logging** - All operations tracked in activity logs
6. **Status Validation** - Prevents invalid state transitions

## Database Requirements

- MySQL database with Prisma ORM
- Tables: users, courses, subjects, applications, documents, enrollments, grades, payments, system_settings, activity_logs

## Extending the System

To add CRUD for a new module:

1. Create `pages/api/crud/[module].ts`
2. Implement GET, POST, PUT, DELETE handlers
3. Add permission checks using `requirePermission()`
4. Update `CRUD_ENDPOINTS` in `lib/crudIndex.ts`
5. Add permission matrix entry in `lib/rbac.ts`
6. Document in `API_DOCUMENTATION.md`

## Common Issues & Solutions

**Issue**: "Forbidden - No read permission"
- **Solution**: User role doesn't have read permission for this module

**Issue**: "Can only delete pending records"
- **Solution**: Only pending applications/documents/payments can be deleted

**Issue**: "Cannot delete with existing enrollments"
- **Solution**: Remove all enrollments for the course before deletion

**Issue**: "User not found"
- **Solution**: Verify user ID exists and is active

## Testing

To test endpoints, use tools like:
- Postman
- Thunder Client
- cURL
- VS Code REST Client

Example cURL:
```bash
curl -X GET 'http://localhost:3000/api/crud/users?page=1&limit=10' \
  -H 'Content-Type: application/json'
```

## Performance Tips

1. Use pagination for large datasets
2. Filter results before fetching
3. Cache frequently accessed data
4. Implement debouncing on client-side searches
5. Use appropriate database indexes

## Support & Documentation

- Full API docs: See `API_DOCUMENTATION.md`
- RBAC reference: See `lib/rbac.ts`
- Constants & types: See `lib/crudIndex.ts`
- Utilities documentation: See `lib/apiUtils.ts`
