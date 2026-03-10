/**
 * CRUD API for Courses
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
    console.error('Courses API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'courses', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single course with subjects
      const course = await prisma.course.findUnique({
        where: { id: String(id) },
        include: {
          subjects: {
            select: {
              id: true,
              code: true,
              name: true,
              units: true,
              yearLevel: true,
              semester: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              applications: true,
            },
          },
        },
      })

      if (!course) return sendError(res, 404, 'Course not found')
      return sendSuccess(res, course)
    }

    // List courses with pagination
    const courses = await prisma.course.findMany({
      skip,
      take,
      where: typeof req.query.isActive === 'string' ? { isActive: req.query.isActive === 'true' } : undefined,
      include: {
        _count: {
          select: {
            subjects: true,
            enrollments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.course.count()

    return sendSuccess(res, {
      courses,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch courses')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'courses', 'create')
  if (!session) return

  const { code, name, description, department, maxStudents, tuitionFee } = req.body

  try {
    if (!code || !name) {
      return sendError(res, 400, 'Missing required fields: code, name')
    }

    // Check if course code already exists
    const existing = await prisma.course.findUnique({ where: { code } })
    if (existing) {
      return sendError(res, 400, 'Course code already exists')
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description,
        department,
        maxStudents: maxStudents || 50,
        tuitionFee: tuitionFee || 0,
        isActive: true,
      },
    })

    return sendSuccess(res, course, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create course')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'courses', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Course ID is required')

  const { name, description, department, maxStudents, tuitionFee, isActive } = req.body

  try {
    const course = await prisma.course.findUnique({ where: { id: String(id) } })
    if (!course) return sendError(res, 404, 'Course not found')

    const updated = await prisma.course.update({
      where: { id: String(id) },
      data: {
        name,
        description,
        department,
        maxStudents,
        tuitionFee,
        isActive: typeof isActive === 'boolean' ? isActive : undefined,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update course')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'courses', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Course ID is required')

  try {
    const course = await prisma.course.findUnique({
      where: { id: String(id) },
      include: { _count: { select: { enrollments: true } } },
    })

    if (!course) return sendError(res, 404, 'Course not found')

    if (course._count.enrollments > 0) {
      return sendError(res, 400, 'Cannot delete course with existing enrollments')
    }

    await prisma.course.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Course deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete course')
  }
}
