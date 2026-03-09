import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create system settings
  await prisma.systemSetting.upsert({
    where: { key: 'schoolName' },
    update: {},
    create: {
      key: 'schoolName',
      value: 'Metro Business College',
      description: 'Name of the educational institution',
    },
  })

  await prisma.systemSetting.upsert({
    where: { key: 'currentSemester' },
    update: {},
    create: {
      key: 'currentSemester',
      value: '1',
      description: 'Current academic semester',
    },
  })

  await prisma.systemSetting.upsert({
    where: { key: 'currentAcademicYear' },
    update: {},
    create: {
      key: 'currentAcademicYear',
      value: '2024-2025',
      description: 'Current academic year',
    },
  })

  // Create courses
  const courses = await Promise.all([
    prisma.course.upsert({
      where: { code: 'BSBA' },
      update: {},
      create: {
        code: 'BSBA',
        name: 'Bachelor of Science in Business Administration',
        description: 'Comprehensive business management program',
        department: 'College of Business',
        maxStudents: 50,
        tuitionFee: 45000,
      },
    }),
    prisma.course.upsert({
      where: { code: 'BSIT' },
      update: {},
      create: {
        code: 'BSIT',
        name: 'Bachelor of Science in Information Technology',
        description: 'Modern IT and software development program',
        department: 'College of Technology',
        maxStudents: 40,
        tuitionFee: 50000,
      },
    }),
    prisma.course.upsert({
      where: { code: 'BSTM' },
      update: {},
      create: {
        code: 'BSTM',
        name: 'Bachelor of Science in Tourism Management',
        description: 'Tourism and hospitality management program',
        department: 'College of Tourism',
        maxStudents: 45,
        tuitionFee: 42000,
      },
    }),
    prisma.course.upsert({
      where: { code: 'BSHM' },
      update: {},
      create: {
        code: 'BSHM',
        name: 'Bachelor of Science in Hospitality Management',
        description: 'Hotel and restaurant management program',
        department: 'College of Hospitality',
        maxStudents: 45,
        tuitionFee: 42000,
      },
    }),
  ])

  // Create subjects for each course
  const subjects: any[] = []
  
  // BSIT Subjects
  subjects.push(
    { code: 'IT101', name: 'Introduction to Computing', courseId: courses[1].id, units: 3, yearLevel: 1, semester: 1 },
    { code: 'IT102', name: 'Programming Fundamentals', courseId: courses[1].id, units: 4, yearLevel: 1, semester: 1 },
    { code: 'IT103', name: 'Database Systems', courseId: courses[1].id, units: 3, yearLevel: 1, semester: 2 },
    { code: 'IT201', name: 'Web Development', courseId: courses[1].id, units: 4, yearLevel: 2, semester: 1 },
    { code: 'IT202', name: 'Mobile App Development', courseId: courses[1].id, units: 4, yearLevel: 2, semester: 2 },
  )

  // BSBA Subjects
  subjects.push(
    { code: 'BA101', name: 'Principles of Management', courseId: courses[0].id, units: 3, yearLevel: 1, semester: 1 },
    { code: 'BA102', name: 'Business Mathematics', courseId: courses[0].id, units: 3, yearLevel: 1, semester: 1 },
    { code: 'BA103', name: 'Marketing Principles', courseId: courses[0].id, units: 3, yearLevel: 1, semester: 2 },
    { code: 'BA201', name: 'Financial Management', courseId: courses[0].id, units: 4, yearLevel: 2, semester: 1 },
    { code: 'BA202', name: 'Human Resource Management', courseId: courses[0].id, units: 3, yearLevel: 2, semester: 2 },
  )

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    })
  }

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12)
  const adminPassword = await bcrypt.hash('admin123', 12)
  const registrarPassword = await bcrypt.hash('registrar123', 12)

  // Admin user
  await prisma.user.upsert({
    where: { email: 'admin@mbc.edu.ph' },
    update: {},
    create: {
      email: 'admin@mbc.edu.ph',
      password: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: 'ADMIN',
      isActive: true,
    },
  })

  // Registrar user
  await prisma.user.upsert({
    where: { email: 'registrar@mbc.edu.ph' },
    update: {},
    create: {
      email: 'registrar@mbc.edu.ph',
      password: registrarPassword,
      firstName: 'Office',
      lastName: 'Registrar',
      role: 'REGISTRAR',
      isActive: true,
    },
  })

  // Demo students
  const demoStudents = [
    {
      email: 'student@mbc.edu.ph',
      firstName: 'Juan',
      lastName: 'Dela Cruz',
      studentId: '2024-001',
      course: 'BSIT',
      yearLevel: 2,
    },
    {
      email: 'maria.santos@mbc.edu.ph',
      firstName: 'Maria',
      lastName: 'Santos',
      studentId: '2024-002',
      course: 'BSTM',
      yearLevel: 1,
    },
    {
      email: 'carlos.reyes@mbc.edu.ph',
      firstName: 'Carlos',
      lastName: 'Reyes',
      studentId: '2024-003',
      course: 'BSHM',
      yearLevel: 3,
    },
  ]

  for (const student of demoStudents) {
    await prisma.user.upsert({
      where: { email: student.email },
      update: {},
      create: {
        ...student,
        password: hashedPassword,
        role: 'STUDENT',
        phone: '09123456789',
        address: '123 Main St, City',
        dateOfBirth: new Date('2000-01-01'),
        enrollmentStatus: 'ENROLLED',
        isActive: true,
      },
    })
  }

  // Create sample applications
  const students = await prisma.user.findMany({
    where: { role: 'STUDENT' }
  })

  for (const student of students.slice(0, 2)) {
    const course = courses.find((c: any) => c.code === student.course) || courses[0]
    
    // Check if application already exists
    const existingApplication = await prisma.application.findFirst({
      where: {
        userId: student.id,
        courseId: course.id,
      }
    })
    
    if (!existingApplication) {
      await prisma.application.create({
        data: {
          userId: student.id,
          courseId: course.id,
          status: 'APPROVED',
          reviewedAt: new Date(),
        },
      })
    }
  }

  // Create sample payments
  for (const student of students.slice(0, 2)) {
    await prisma.payment.create({
      data: {
        userId: student.id,
        amount: 15000,
        paymentMethod: 'CASH',
        referenceNo: 'REF-' + Math.random().toString(36).substr(2, 9),
        status: 'APPROVED',
        description: 'Tuition Fee - 1st Installment',
        paidAt: new Date(),
        verifiedAt: new Date(),
      },
    })
  }

  console.log('✅ Database seeding completed successfully!')
  console.log('\n👤 Demo Accounts:')
  console.log('   Admin: admin@mbc.edu.ph / admin123')
  console.log('   Registrar: registrar@mbc.edu.ph / registrar123')
  console.log('   Student: student@mbc.edu.ph / password123')
  console.log('\n📚 Courses Created:')
  courses.forEach((course: any) => {
    console.log(`   ${course.code}: ${course.name}`)
  })
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .then(async () => {
    await prisma.$disconnect()
  })
