/**
 * CRUD API for Applications
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
    console.error('Applications API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'applications', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single application
      const application = await prisma.application.findUnique({
        where: { id: String(id) },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true, course: true } },
          course: { select: { id: true, code: true, name: true } },
          documents: true,
        },
      })

      if (!application) return sendError(res, 404, 'Application not found')

      // Check own data access
      if (!checkOwnDataAccess(session.user.id, application.userId, 'applications', session.user.role as Role)) {
        return sendError(res, 403, 'Forbidden - Can only view own applications')
      }

      return sendSuccess(res, application)
    }

    // List applications with filtering
    const where: any = {}

    // Students see only their applications
    if (session.user.role === 'STUDENT') {
      where.userId = session.user.id
    }

    // Filter by status if provided
    if (req.query.status) where.status = String(req.query.status)

    // Filter by userId if staff and provided
    if (session.user.role !== 'STUDENT' && req.query.userId) {
      where.userId = String(req.query.userId)
    }

    const applications = await prisma.application.findMany({
      skip,
      take,
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        course: { select: { id: true, code: true, name: true } },
        _count: { select: { documents: true } },
      },
      orderBy: { submittedAt: 'desc' },
    })

    const total = await prisma.application.count({ where })

    return sendSuccess(res, {
      applications,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch applications')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'applications', 'create')
  if (!session) return

  const { courseId, userId } = req.body
  const applicantId = session.user.role === 'STUDENT' ? session.user.id : userId

  try {
    if (!courseId) {
      return sendError(res, 400, 'Missing required field: courseId')
    }

    if (!applicantId) {
      return sendError(res, 400, 'User ID is required')
    }

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return sendError(res, 404, 'Course not found')
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: applicantId } })
    if (!user) {
      return sendError(res, 404, 'User not found')
    }

    // Check for existing application
    const existing = await prisma.application.findFirst({
      where: { userId: applicantId, courseId },
    })

    if (existing) {
      return sendError(res, 400, 'Application already exists for this course')
    }

    const application = await prisma.application.create({
      data: {
        userId: applicantId,
        courseId,
        status: 'PENDING',
      },
      include: {
        user: true,
        course: true,
      },
    })

    return sendSuccess(res, application, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create application')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'applications', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Application ID is required')

  const { status, remarks, reviewedBy } = req.body

  try {
    const application = await prisma.application.findUnique({ where: { id: String(id) } })
    if (!application) return sendError(res, 404, 'Application not found')

    const updated = await prisma.application.update({
      where: { id: String(id) },
      data: {
        status,
        remarks,
        reviewedAt: status !== 'PENDING' && status !== application.status ? new Date() : undefined,
        reviewedBy: status !== 'PENDING' && status !== application.status ? session.user.id : undefined,
      },
      include: {
        user: true,
        course: true,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update application')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'applications', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Application ID is required')

  try {
    const application = await prisma.application.findUnique({ where: { id: String(id) } })
    if (!application) return sendError(res, 404, 'Application not found')

    // Check own data access for students
    if (!checkOwnDataAccess(session.user.id, application.userId, 'applications', session.user.role as Role)) {
      return sendError(res, 403, 'Forbidden - Can only delete own applications')
    }

    // Can only delete pending applications
    if (application.status !== 'PENDING') {
      return sendError(res, 400, 'Can only delete pending applications')
    }

    await prisma.application.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Application deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete application')
  }
}
