/**
 * CRUD API for Subjects
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
  type ApiResponse,
} from '@/lib/apiUtils'

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
    console.error('Subjects API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'subjects', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single subject
      const subject = await prisma.subject.findUnique({
        where: { id: String(id) },
        include: {
          course: true,
          _count: {
            select: {
              enrollments: true,
              grades: true,
            },
          },
        },
      })

      if (!subject) return sendError(res, 404, 'Subject not found')
      return sendSuccess(res, subject)
    }

    // List subjects with optional filtering
    const where: any = {}
    if (req.query.courseId) where.courseId = String(req.query.courseId)
    if (req.query.yearLevel) where.yearLevel = parseInt(String(req.query.yearLevel))
    if (req.query.semester) where.semester = parseInt(String(req.query.semester))
    if (typeof req.query.isActive === 'string') where.isActive = req.query.isActive === 'true'

    const subjects = await prisma.subject.findMany({
      skip,
      take,
      where,
      include: {
        course: { select: { id: true, code: true, name: true } },
        _count: { select: { enrollments: true } },
      },
      orderBy: [{ courseId: 'asc' }, { yearLevel: 'asc' }, { semester: 'asc' }],
    })

    const total = await prisma.subject.count({ where })

    return sendSuccess(res, {
      subjects,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch subjects')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'subjects', 'create')
  if (!session) return

  const { code, name, description, units, yearLevel, semester, courseId, maxStudents } = req.body

  try {
    if (!code || !name || !yearLevel || !semester || !courseId) {
      return sendError(res, 400, 'Missing required fields: code, name, yearLevel, semester, courseId')
    }

    // Check if subject code already exists
    const existing = await prisma.subject.findUnique({ where: { code } })
    if (existing) {
      return sendError(res, 400, 'Subject code already exists')
    }

    // Check if course exists
    const course = await prisma.course.findUnique({ where: { id: courseId } })
    if (!course) {
      return sendError(res, 404, 'Course not found')
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        description,
        units: units || 3,
        yearLevel,
        semester,
        courseId,
        maxStudents: maxStudents || 40,
        isActive: true,
      },
      include: { course: true },
    })

    return sendSuccess(res, subject, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create subject')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'subjects', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Subject ID is required')

  const { name, description, units, yearLevel, semester, maxStudents, isActive } = req.body

  try {
    const subject = await prisma.subject.findUnique({ where: { id: String(id) } })
    if (!subject) return sendError(res, 404, 'Subject not found')

    const updated = await prisma.subject.update({
      where: { id: String(id) },
      data: {
        name,
        description,
        units,
        yearLevel,
        semester,
        maxStudents,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      },
      include: { course: true },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update subject')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'subjects', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Subject ID is required')

  try {
    const subject = await prisma.subject.findUnique({
      where: { id: String(id) },
      include: { _count: { select: { enrollments: true } } },
    })

    if (!subject) return sendError(res, 404, 'Subject not found')

    if (subject._count.enrollments > 0) {
      return sendError(res, 400, 'Cannot delete subject with existing enrollments')
    }

    await prisma.subject.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Subject deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete subject')
  }
}
