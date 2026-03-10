/**
 * CRUD API for Users
 * Endpoints: GET, POST, PUT, DELETE
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import {
  sendSuccess,
  sendError,
  sendMessage,
  requirePermission,
  getPaginationParams,
  checkOwnDataAccess,
  type ApiResponse,
} from '@/lib/apiUtils'
import bcrypt from 'bcryptjs'
import type { User } from '@prisma/client'
import type { Role } from '@/lib/rbac'

type UserResponse = Omit<User, 'password'>

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<any>>
) {
  try {
    if (req.method === 'GET') {
      return handleGet(req, res)
    }
    if (req.method === 'POST') {
      return handlePost(req, res)
    }
    if (req.method === 'PUT') {
      return handlePut(req, res)
    }
    if (req.method === 'DELETE') {
      return handleDelete(req, res)
    }

    return sendError(res, 405, 'Method not allowed')
  } catch (error) {
    console.error('Users API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'users', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single user
      const user = await prisma.user.findUnique({
        where: { id: String(id) },
        select: {
          id: true,
          email: true,
          username: true,
          firstName: true,
          lastName: true,
          phone: true,
          address: true,
          dateOfBirth: true,
          role: true,
          studentId: true,
          course: true,
          yearLevel: true,
          enrollmentStatus: true,
          idPicture: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!user) return sendError(res, 404, 'User not found')

      // Check own data access for students
      if (!checkOwnDataAccess(session.user.id, user.id, 'users', session.user.role as Role)) {
        return sendError(res, 403, 'Forbidden - Can only access own data')
      }

      return sendSuccess(res, user)
    }

    // List users with pagination
    const users = await prisma.user.findMany({
      skip,
      take,
      where: req.query.role ? { role: String(req.query.role) as Role } : undefined,
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        studentId: true,
        course: true,
        enrollmentStatus: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.user.count({
      where: req.query.role ? { role: String(req.query.role) as Role } : undefined,
    })

    return sendSuccess(res, { users, total, page: Math.floor(skip / take) + 1, pageSize: take })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch users')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'users', 'create')
  if (!session) return

  const {
    email,
    username,
    password,
    firstName,
    lastName,
    phone,
    address,
    dateOfBirth,
    role,
    studentId,
    course,
    yearLevel,
  } = req.body

  try {
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return sendError(res, 400, 'Missing required fields: email, password, firstName, lastName')
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return sendError(res, 400, 'User with this email already exists')
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        role: role || 'STUDENT',
        studentId,
        course,
        yearLevel,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        studentId: true,
        course: true,
        yearLevel: true,
        isActive: true,
        createdAt: true,
      },
    })

    return sendSuccess(res, user, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create user')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'users', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'User ID is required')

  const { firstName, lastName, phone, address, dateOfBirth, course, yearLevel, isActive, role } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { id: String(id) } })
    if (!user) return sendError(res, 404, 'User not found')

    // Check own data access
    if (!checkOwnDataAccess(session.user.id, user.id, 'users', session.user.role as Role)) {
      return sendError(res, 403, 'Forbidden - Can only update own data')
    }

    // Update user
    const updated = await prisma.user.update({
      where: { id: String(id) },
      data: {
        firstName,
        lastName,
        phone,
        address,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        course,
        yearLevel,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
        role: session.user.role === 'ADMIN' ? role : undefined, // Only admin can change role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        course: true,
        yearLevel: true,
        isActive: true,
        updatedAt: true,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update user')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'users', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'User ID is required')

  try {
    const user = await prisma.user.findUnique({ where: { id: String(id) } })
    if (!user) return sendError(res, 404, 'User not found')

    // Prevent self-deletion
    if (session.user.id === user.id) {
      return sendError(res, 400, 'Cannot delete your own account')
    }

    // Delete user
    await prisma.user.delete({ where: { id: String(id) } })

    return sendMessage(res, 'User deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete user')
  }
}
