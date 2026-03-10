# CRUD API Documentation

This document provides comprehensive documentation for all CRUD API endpoints available in the system.

## Base URL
```
/api/crud
```

## Authentication
All endpoints require authentication via NextAuth session. Include valid session in your requests.

---

## API Endpoints by Module

### 1. Users Module (`/api/crud/users`)

**Role-Based Access:**
- STUDENT: Read own profile, Update own profile
- REGISTRAR: Read all, Create, Update users
- ADMIN: Full CRUD access
- CASHIER: Read only

#### GET - List Users
```
GET /api/crud/users?page=1&limit=10&role=STUDENT
```

Query Parameters:
- `page`: Page number (default: 1)
- `limit`: Records per page (default: 10, max: 100)
- `role`: Filter by role (STUDENT, REGISTRAR, ADMIN, CASHIER)

Response:
```json
{
  "success": true,
  "data": {
    "users": [...],
    "total": 50,
    "page": 1,
    "pageSize": 10
  }
}
```

#### GET - Get Single User
```
GET /api/crud/users?id=user_id
```

#### POST - Create User
```
POST /api/crud/users
Content-Type: application/json

{
  "email": "student@example.com",
  "username": "student123",
  "password": "securepass123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "09123456789",
  "address": "123 Main St",
  "dateOfBirth": "2000-01-15",
  "role": "STUDENT",
  "studentId": "2024-001",
  "course": "BSIT",
  "yearLevel": 1
}
```

#### PUT - Update User
```
PUT /api/crud/users?id=user_id
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "09987654321",
  "course": "BSHM",
  "yearLevel": 2
}
```

#### DELETE - Delete User
```
DELETE /api/crud/users?id=user_id
```

---

### 2. Courses Module (`/api/crud/courses`)

**Role-Based Access:**
- STUDENT: Read only
- REGISTRAR: Read, Create, Update
- ADMIN: Full CRUD access

#### GET - List Courses
```
GET /api/crud/courses?page=1&limit=10&isActive=true
```

#### GET - Get Single Course (with subjects)
```
GET /api/crud/courses?id=course_id
```

#### POST - Create Course
```
POST /api/crud/courses
{
  "code": "BSIT",
  "name": "Bachelor of Science in Information Technology",
  "description": "IT program description",
  "department": "College of Technology",
  "maxStudents": 40,
  "tuitionFee": 50000
}
```

#### PUT - Update Course
```
PUT /api/crud/courses?id=course_id
{
  "name": "Updated Course Name",
  "maxStudents": 45,
  "tuitionFee": 52000,
  "isActive": true
}
```

#### DELETE - Delete Course
```
DELETE /api/crud/courses?id=course_id
```
Note: Cannot delete courses with active enrollments.

---

### 3. Subjects Module (`/api/crud/subjects`)

**Role-Based Access:**
- STUDENT: Read only
- REGISTRAR: Read, Create, Update (per course)
- ADMIN: Full CRUD access

#### GET - List Subjects
```
GET /api/crud/subjects?page=1&limit=10&courseId=course_id&yearLevel=1&semester=1
```

#### GET - Get Single Subject
```
GET /api/crud/subjects?id=subject_id
```

#### POST - Create Subject
```
POST /api/crud/subjects
{
  "code": "IT101",
  "name": "Introduction to Computing",
  "description": "Basic computing concepts",
  "units": 3,
  "yearLevel": 1,
  "semester": 1,
  "courseId": "course_id",
  "maxStudents": 40
}
```

#### PUT - Update Subject
```
PUT /api/crud/subjects?id=subject_id
{
  "name": "Updated Subject Name",
  "units": 4,
  "maxStudents": 45
}
```

#### DELETE - Delete Subject
```
DELETE /api/crud/subjects?id=subject_id
```

---

### 4. Applications Module (`/api/crud/applications`)

**Role-Based Access:**
- STUDENT: Read own, Create
- REGISTRAR: Full CRUD
- ADMIN: Full CRUD
- CASHIER: Read only

#### GET - List Applications
```
GET /api/crud/applications?page=1&limit=10&status=PENDING&userId=user_id
```

Query Parameters:
- `status`: PENDING, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED
- `userId`: Filter by student (staff only)

#### GET - Get Single Application
```
GET /api/crud/applications?id=app_id
```

#### POST - Create Application
```
POST /api/crud/applications
{
  "courseId": "course_id",
  "userId": "user_id"  // Required if not a student
}
```

#### PUT - Update Application Status
```
PUT /api/crud/applications?id=app_id
{
  "status": "APPROVED",
  "remarks": "Approved based on documents"
}
```

#### DELETE - Delete Application
```
DELETE /api/crud/applications?id=app_id
```
Note: Only pending applications can be deleted.

---

### 5. Documents Module (`/api/crud/documents`)

**Role-Based Access:**
- STUDENT: Read own, Create own, Delete own
- REGISTRAR: Full CRUD
- ADMIN: Full CRUD
- CASHIER: Read only

#### GET - List Documents
```
GET /api/crud/documents?page=1&limit=10&userId=user_id&type=BIRTH_CERTIFICATE&status=PENDING
```

Available Types:
- BIRTH_CERTIFICATE
- FORM_137
- GOOD_MORAL
- MEDICAL_CERTIFICATE
- ID_PICTURE
- TRANSFER_CERTIFICATE
- DIPLOMA
- OTHER

#### GET - Get Single Document
```
GET /api/crud/documents?id=doc_id
```

#### POST - Upload Document
```
POST /api/crud/documents
{
  "type": "BIRTH_CERTIFICATE",
  "fileName": "birth_cert.pdf",
  "filePath": "/uploads/documents/birth_cert.pdf",
  "fileSize": 1024000,
  "mimeType": "application/pdf",
  "applicationId": "app_id",
  "userId": "user_id"  // Required if not a student
}
```

#### PUT - Update Document Status
```
PUT /api/crud/documents?id=doc_id
{
  "status": "APPROVED",
  "remarks": "Document verified"
}
```

#### DELETE - Delete Document
```
DELETE /api/crud/documents?id=doc_id
```
Note: Only pending documents can be deleted.

---

### 6. Enrollments Module (`/api/crud/enrollments`)

**Role-Based Access:**
- STUDENT: Read own, Create own
- REGISTRAR: Full CRUD
- ADMIN: Full CRUD
- CASHIER: Read only

#### GET - List Enrollments
```
GET /api/crud/enrollments?page=1&limit=10&userId=user_id&status=ENROLLED&courseId=course_id&academicYear=2024-2025
```

Statuses:
- PENDING
- APPROVED
- ENROLLED
- DROPPED
- GRADUATED
- INACTIVE
- ACTIVE

#### GET - Get Single Enrollment
```
GET /api/crud/enrollments?id=enrollment_id
```

#### POST - Enroll Student
```
POST /api/crud/enrollments
{
  "courseId": "course_id",
  "subjectId": "subject_id",
  "section": "A",
  "semester": 1,
  "academicYear": "2024-2025",
  "userId": "user_id"  // Required if not a student
}
```

#### PUT - Update Enrollment
```
PUT /api/crud/enrollments?id=enrollment_id
{
  "status": "DROPPED",
  "section": "B"
}
```

#### DELETE - Delete Enrollment
```
DELETE /api/crud/enrollments?id=enrollment_id
```
Note: Cannot delete enrollments with recorded grades.

---

### 7. Grades Module (`/api/crud/grades`)

**Role-Based Access:**
- STUDENT: Read own
- REGISTRAR: Full CRUD
- ADMIN: Full CRUD
- CASHIER: Read only

#### GET - List Grades
```
GET /api/crud/grades?page=1&limit=10&userId=user_id&subjectId=subject_id&academicYear=2024-2025&semester=1
```

#### GET - Get Single Grade
```
GET /api/crud/grades?id=grade_id
```

#### POST - Record Grade
```
POST /api/crud/grades
{
  "userId": "student_id",
  "enrollmentId": "enrollment_id",
  "subjectId": "subject_id",
  "midterm": 85.5,
  "finals": 88.0,
  "remarks": "Good performance",
  "semester": 1,
  "academicYear": "2024-2025"
}
```

Note: Average and grade are auto-calculated.
- A: 90-100
- B: 80-89
- C: 70-79
- D: 60-69
- F: Below 60

#### PUT - Update Grade
```
PUT /api/crud/grades?id=grade_id
{
  "midterm": 87.0,
  "finals": 89.5,
  "remarks": "Updated grades after recalculation"
}
```

#### DELETE - Delete Grade
```
DELETE /api/crud/grades?id=grade_id
```

---

### 8. Payments Module (`/api/crud/payments`)

**Role-Based Access:**
- STUDENT: Read own, Create own, Delete own pending
- REGISTRAR: Read only
- ADMIN: Full CRUD
- CASHIER: Full CRUD on payments

#### GET - List Payments
```
GET /api/crud/payments?page=1&limit=10&userId=user_id&status=PENDING&paymentMethod=CASH
```

Payment Methods:
- CASH
- GCASH
- BANK_TRANSFER
- CREDIT_CARD
- CHECK

Payment Statuses:
- PENDING
- VERIFIED
- APPROVED
- REJECTED
- CANCELLED
- REFUNDED

#### GET - Get Single Payment
```
GET /api/crud/payments?id=payment_id
```

#### POST - Create Payment
```
POST /api/crud/payments
{
  "amount": 15000,
  "paymentMethod": "GCASH",
  "referenceNo": "GCASH-12345",
  "description": "Tuition Fee - 1st Installment",
  "proofFile": "/uploads/payments/proof.jpg",
  "userId": "user_id"  // Required if not a student
}
```

#### PUT - Update Payment Status
```
PUT /api/crud/payments?id=payment_id
{
  "status": "VERIFIED",
  "remarks": "Payment verified by cashier"
}
```

#### DELETE - Delete Payment
```
DELETE /api/crud/payments?id=payment_id
```
Note: Only pending payments can be deleted.

---

### 9. System Settings Module (`/api/crud/settings`)

**Role-Based Access:**
- STUDENT: Read-only
- REGISTRAR: Read-only
- ADMIN: Full CRUD
- CASHIER: Read-only

#### GET - List Settings
```
GET /api/crud/settings?page=1&limit=50
```

#### GET - Get Single Setting
```
GET /api/crud/settings?key=currentSemester
```

#### POST - Create Setting
```
POST /api/crud/settings
{
  "key": "maxStudentsPerClass",
  "value": "50",
  "description": "Maximum number of students per class"
}
```

#### PUT - Update Setting
```
PUT /api/crud/settings?key=currentSemester
{
  "value": "2",
  "description": "Current academic semester"
}
```

#### DELETE - Delete Setting
```
DELETE /api/crud/settings?key=customSetting
```
Note: Cannot delete critical settings (schoolName, currentSemester, currentAcademicYear).

---

### 10. Activity Logs Module (`/api/crud/logs`)

**Role-Based Access:**
- STUDENT: Read-only (own logs)
- REGISTRAR: Read
- ADMIN: Full access including delete
- CASHIER: Read-only

#### GET - List Logs
```
GET /api/crud/logs?page=1&limit=50&userId=user_id&module=users&action=CREATE&startDate=2024-01-01&endDate=2024-12-31
```

#### GET - Get Single Log Entry
```
GET /api/crud/logs?id=log_id
```

#### POST - Create Log Entry
```
POST /api/crud/logs
{
  "action": "UPDATE",
  "module": "users",
  "details": "Updated user profile",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

#### DELETE - Delete Log (Admin only)
```
DELETE /api/crud/logs?id=log_id
```

---

## Error Responses

All endpoints follow this error format:

```json
{
  "success": false,
  "error": "Error message describing what went wrong"
}
```

Common HTTP Status Codes:
- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Missing or invalid parameters
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `405 Method Not Allowed` - Wrong HTTP method
- `500 Internal Server Error` - Server error

---

## Permission Matrix Summary

| Module | STUDENT | REGISTRAR | ADMIN | CASHIER |
|--------|---------|-----------|-------|---------|
| Users | R(own) | CRUD | CRUD | R |
| Courses | R | CRU | CRUD | R |
| Subjects | R | CRU | CRUD | R |
| Applications | R(own),C | CRUD | CRUD | R |
| Documents | R(own),C,D(own,pending) | CRUD | CRUD | R |
| Enrollments | R(own),C | CRUD | CRUD | R |
| Grades | R(own) | CRUD | CRUD | R |
| Payments | R(own),C,D(own,pending) | R | CRUD | CRUD |
| Settings | R | R | CRUD | R |
| Logs | R(own) | R | CRUD | R |

Legend: C=Create, R=Read, U=Update, D=Delete

---

## Usage Examples

### Example 1: Student Creating an Application
```bash
curl -X POST http://localhost:3000/api/crud/applications \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "course_123"
  }'
```

### Example 2: Registrar Updating Student Grade
```bash
curl -X PUT http://localhost:3000/api/crud/grades?id=grade_456 \
  -H "Content-Type: application/json" \
  -d '{
    "midterm": 85,
    "finals": 90
  }'
```

### Example 3: Cashier Verifying Payment
```bash
curl -X PUT http://localhost:3000/api/crud/payments?id=payment_789 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "VERIFIED",
    "remarks": "Payment confirmed through bank"
  }'
```

### Example 4: Admin Creating New Course
```bash
curl -X POST http://localhost:3000/api/crud/courses \
  -H "Content-Type: application/json" \
  -d '{
    "code": "BSBA",
    "name": "Bachelor of Science in Business Administration",
    "department": "College of Business",
    "maxStudents": 50,
    "tuitionFee": 45000
  }'
```

---

## Best Practices

1. **Always validate user permissions** on the client side before attempting requests
2. **Use pagination** for large result sets
3. **Handle errors gracefully** - check `success` flag before accessing `data`
4. **Include meaningful descriptions** in remarks and details fields
5. **Use consistent date formats** (ISO 8601: YYYY-MM-DD)
6. **Log all sensitive operations** - they'll be tracked in activity logs
7. **Cache frequently accessed data** to reduce API calls
8. **Implement proper error handling** on the client side

---

## Notes

- All timestamps are in UTC
- Academic year format: "2024-2025"
- Students can only see/modify their own records by default
- Registrar can manage courses, subjects, and enrollments
- Admin has unrestricted access
- Cashier handles payment processing and verification
- Sensitive operations are logged automatically
