type User = any
type Course = any
type Subject = any
type Application = any
type Document = any
type Enrollment = any
type Payment = any
type Grade = any
type ActivityLog = any

// User Types
export interface UserWithRelations extends User {
  applications?: Application[]
  payments?: Payment[]
  documents?: Document[]
  enrollments?: Enrollment[]
  grades?: Grade[]
  activityLogs?: ActivityLog[]
}

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  dateOfBirth?: Date
  role: string
  studentId?: string
  course?: string
  yearLevel?: number
  enrollmentStatus: string
  idPicture?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Course Types
export interface CourseWithRelations extends Course {
  subjects?: Subject[]
  enrollments?: Enrollment[]
  applications?: Application[]
}

// Subject Types
export interface SubjectWithRelations extends Subject {
  course: Course
  enrollments?: Enrollment[]
  grades?: Grade[]
}

// Application Types
export interface ApplicationWithRelations extends Application {
  user: User
  course: Course
  documents?: Document[]
}

// Document Types
export interface DocumentWithRelations extends Document {
  user: User
  application?: Application
}

// Enrollment Types
export interface EnrollmentWithRelations extends Enrollment {
  user: User
  course: Course
  subject: Subject
  grades?: Grade[]
}

// Payment Types
export interface PaymentWithRelations extends Payment {
  user: User
}

// Grade Types
export interface GradeWithRelations extends Grade {
  user: User
  enrollment: Enrollment
  subject: Subject
}

// Activity Log Types
export interface ActivityLogWithRelations extends ActivityLog {
  user?: User
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Form Types
export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  phone?: string
  address?: string
  dateOfBirth?: string
  studentId?: string
  course?: string
  yearLevel?: number
}

export interface PersonalInfoForm {
  firstName: string
  lastName: string
  phone?: string
  address?: string
  dateOfBirth?: string
}

export interface AcademicInfoForm {
  course: string
  yearLevel: number
}

export interface DocumentUploadForm {
  type: string
  file: File
}

export interface PaymentForm {
  amount: number
  paymentMethod: string
  referenceNo?: string
  description?: string
  proofFile?: File
}

export interface SubjectEnrollmentForm {
  subjectIds: string[]
}

export interface GradeForm {
  enrollmentId: string
  midterm?: number
  finals?: number
  remarks?: string
}

// Dashboard Statistics
export interface DashboardStats {
  totalStudents: number
  approvedStudents: number
  pendingApplications: number
  totalRevenue: number
  documentsSubmitted: number
  paymentsMade: number
  subjectsEnrolled: number
  daysActive: number
}

export interface EnrollmentAnalytics {
  date: string
  applications: number
  approved: number
  rejected: number
}

// Filter and Search Types
export interface UserFilters {
  role?: string
  course?: string
  yearLevel?: number
  enrollmentStatus?: string
  search?: string
}

export interface ApplicationFilters {
  status?: string
  courseId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface PaymentFilters {
  status?: string
  paymentMethod?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface GradeFilters {
  subjectId?: string
  semester?: number
  academicYear?: string
  search?: string
}

// Chart Data Types
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string[]
    borderColor?: string[]
    borderWidth?: number
  }[]
}

// System Settings
export interface SystemSettings {
  schoolName: string
  schoolAddress: string
  schoolPhone: string
  schoolEmail: string
  currentSemester: number
  currentAcademicYear: string
  enrollmentStartDate: string
  enrollmentEndDate: string
  paymentDeadline: string
}

// Notification Types
export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  userId: string
}

// Report Types
export interface EnrollmentReport {
  totalStudents: number
  newStudents: number
  returningStudents: number
  byCourse: {
    courseName: string
    count: number
  }[]
  byYearLevel: {
    yearLevel: number
    count: number
  }[]
}

export interface PaymentReport {
  totalRevenue: number
  totalPayments: number
  averagePayment: number
  paymentMethods: {
    method: string
    amount: number
    count: number
  }[]
  monthlyRevenue: {
    month: string
    amount: number
  }[]
}

export interface GradeReport {
  averageGrade: number
  passingRate: number
  failingRate: number
  bySubject: {
    subjectName: string
    averageGrade: number
    passingRate: number
  }[]
}

// Utility Types
export type Role = 'STUDENT' | 'REGISTRAR' | 'ADMIN' | 'CASHIER'
export type ApplicationStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
export type DocumentType = 'BIRTH_CERTIFICATE' | 'FORM_137' | 'GOOD_MORAL' | 'MEDICAL_CERTIFICATE' | 'ID_PICTURE' | 'TRANSFER_CERTIFICATE' | 'DIPLOMA' | 'OTHER'
export type DocumentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED'
export type EnrollmentStatus = 'PENDING' | 'APPROVED' | 'ENROLLED' | 'DROPPED' | 'GRADUATED' | 'INACTIVE' | 'ACTIVE'
export type PaymentMethod = 'CASH' | 'GCASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK'
export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED'

// NextAuth Types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      firstName: string
      lastName: string
      role: string
      image?: string | null
      studentId?: string
      course?: string
      yearLevel?: number
      enrollmentStatus?: string
    }
  }

  interface User {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
    image?: string | null
    studentId?: string
    course?: string
    yearLevel?: number
    enrollmentStatus?: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    role: string
    firstName: string
    lastName: string
    studentId?: string
    course?: string
    yearLevel?: number
    enrollmentStatus?: string
  }
}
