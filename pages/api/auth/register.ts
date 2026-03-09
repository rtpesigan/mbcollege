import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { ApiResponse } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const {
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      dateOfBirth,
      studentId,
      course,
      yearLevel,
    } = req.body

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, first name, and last name are required'
      })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
      })
    }

    // Check if student ID already exists (if provided)
    if (studentId) {
      const existingStudentId = await prisma.user.findUnique({
        where: { studentId }
      })

      if (existingStudentId) {
        return res.status(400).json({
          success: false,
          error: 'Student ID already exists'
        })
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone: phone || null,
        address: address || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        studentId: studentId || null,
        course: course || null,
        yearLevel: yearLevel ? parseInt(yearLevel) : null,
        role: 'STUDENT',
        enrollmentStatus: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        studentId: true,
        course: true,
        yearLevel: true,
        enrollmentStatus: true,
        createdAt: true,
      }
    })

    // Handle file uploads
    const files = req.files as any
    if (files) {
      const documents = []
      
      if (files.idPicture) {
        documents.push({
          userId: user.id,
          type: 'ID_PICTURE',
          fileName: files.idPicture.name,
          filePath: `/uploads/${files.idPicture.name}`,
          fileSize: files.idPicture.size,
          mimeType: files.idPicture.mimetype,
          status: 'PENDING',
        })
      }

      if (files.birthCertificate) {
        documents.push({
          userId: user.id,
          type: 'BIRTH_CERTIFICATE',
          fileName: files.birthCertificate.name,
          filePath: `/uploads/${files.birthCertificate.name}`,
          fileSize: files.birthCertificate.size,
          mimeType: files.birthCertificate.mimetype,
          status: 'PENDING',
        })
      }

      if (documents.length > 0) {
        await prisma.document.createMany({
          data: documents
        })
      }
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        action: 'USER_REGISTERED',
        module: 'AUTHENTICATION',
        details: `User ${email} registered successfully`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      }
    })

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
