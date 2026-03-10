/**
 * CRUD API for Enrollments
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
import type { Role } from '@/lib/rbac'

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
    console.error('Enrollments API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'enrollments', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single enrollment
      const enrollment = await prisma.enrollment.findUnique({
        where: { id: String(id) },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          course: { select: { id: true, code: true, name: true } },
          subject: { select: { id: true, code: true, name: true, units: true } },
          grades: true,
        },
      })

      if (!enrollment) return sendError(res, 404, 'Enrollment not found')

      // Check own data access
      if (!checkOwnDataAccess(session.user.id, enrollment.userId, 'enrollments', session.user.role as Role)) {
        return sendError(res, 403, 'Forbidden - Can only view own enrollments')
      }

      return sendSuccess(res, enrollment)
    }

    // List enrollments with filtering
    const where: any = {}

    // Students see only their enrollments
    if (session.user.role === 'STUDENT') {
      where.userId = session.user.id
    }

    // Filter by userId if staff and provided
    if (session.user.role !== 'STUDENT' && req.query.userId) {
      where.userId = String(req.query.userId)
    }

    if (req.query.status) where.status = String(req.query.status)
    if (req.query.courseId) where.courseId = String(req.query.courseId)
    if (req.query.academicYear) where.academicYear = String(req.query.academicYear)

    const enrollments = await prisma.enrollment.findMany({
      skip,
      take,
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        course: { select: { id: true, code: true, name: true } },
        subject: { select: { id: true, code: true, name: true, units: true } },
      },
      orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }, { enrolledAt: 'desc' }],
    })

    const total = await prisma.enrollment.count({ where })

    return sendSuccess(res, {
      enrollments,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch enrollments')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'enrollments', 'create')
  if (!session) return

  const { userId, courseId, subjectId, section, semester, academicYear } = req.body

  try {
    if (!courseId || !subjectId || !semester || !academicYear) {
      return sendError(
        res,
        400,
        'Missing required fields: courseId, subjectId, semester, academicYear'
      )
    }

    const enrolleeId = session.user.role === 'STUDENT' ? session.user.id : userId

    if (!enrolleeId) {
      return sendError(res, 400, 'User ID is required')
    }

    // Verify user, course, and subject exist
    const user = await prisma.user.findUnique({ where: { id: enrolleeId } })
    if (!user) return sendError(res, 404, 'User not found')

    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) return sendError(res, 404, 'Course not found')

    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject) return sendError(res, 404, 'Subject not found')

    // Check for duplicate enrollment
    const existing = await prisma.enrollment.findFirst({
      where: {
        userId: enrolleeId,
        subjectId,
        academicYear,
        semester,
      },
    })

    if (existing) {
      return sendError(res, 400, 'Enrollment already exists for this subject and semester')
    }

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: enrolleeId,
        courseId,
        subjectId,
        section: section || 'A',
        semester,
        academicYear,
        status: 'ENROLLED',
      },
      include: {
        user: true,
        course: true,
        subject: true,
      },
    })

    return sendSuccess(res, enrollment, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create enrollment')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'enrollments', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Enrollment ID is required')

  const { status, section } = req.body

  try {
    const enrollment = await prisma.enrollment.findUnique({ where: { id: String(id) } })
    if (!enrollment) return sendError(res, 404, 'Enrollment not found')

    const updated = await prisma.enrollment.update({
      where: { id: String(id) },
      data: {
        status,
        section,
      },
      include: {
        user: true,
        course: true,
        subject: true,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update enrollment')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'enrollments', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Enrollment ID is required')

  try {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id: String(id) },
      include: { _count: { select: { grades: true } } },
    })

    if (!enrollment) return sendError(res, 404, 'Enrollment not found')

    // Cannot delete if grades are recorded
    if (enrollment._count.grades > 0) {
      return sendError(res, 400, 'Cannot delete enrollment with recorded grades')
    }

    await prisma.enrollment.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Enrollment deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete enrollment')
  }
}
