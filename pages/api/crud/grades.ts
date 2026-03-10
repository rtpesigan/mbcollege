/**
 * CRUD API for Grades
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

function computeAverage(midterm: number | null, finals: number | null): number | null {
  if (midterm == null && finals == null) return null
  if (midterm == null) return finals
  if (finals == null) return midterm
  return Math.round(((midterm + finals) / 2) * 100) / 100
}

function computeGrade(average: number | null): string | null {
  if (average == null) return null
  if (average >= 90) return 'A'
  if (average >= 80) return 'B'
  if (average >= 70) return 'C'
  if (average >= 60) return 'D'
  return 'F'
}

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
    console.error('Grades API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'grades', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single grade
      const grade = await prisma.grade.findUnique({
        where: { id: String(id) },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          subject: { select: { id: true, code: true, name: true } },
          enrollment: true,
        },
      })

      if (!grade) return sendError(res, 404, 'Grade not found')

      // Check own data access
      if (!checkOwnDataAccess(session.user.id, grade.userId, 'grades', session.user.role as Role)) {
        return sendError(res, 403, 'Forbidden - Can only view own grades')
      }

      return sendSuccess(res, grade)
    }

    // List grades with filtering
    const where: any = {}

    // Students see only their grades
    if (session.user.role === 'STUDENT') {
      where.userId = session.user.id
    }

    // Filter by userId if staff and provided
    if (session.user.role !== 'STUDENT' && req.query.userId) {
      where.userId = String(req.query.userId)
    }

    if (req.query.subjectId) where.subjectId = String(req.query.subjectId)
    if (req.query.academicYear) where.academicYear = String(req.query.academicYear)
    if (req.query.semester) where.semester = parseInt(String(req.query.semester))

    const grades = await prisma.grade.findMany({
      skip,
      take,
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        subject: { select: { id: true, code: true, name: true } },
      },
      orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }, { createdAt: 'desc' }],
    })

    const total = await prisma.grade.count({ where })

    return sendSuccess(res, {
      grades,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch grades')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'grades', 'create')
  if (!session) return

  const { userId, enrollmentId, subjectId, midterm, finals, remarks, semester, academicYear } = req.body

  try {
    if (!userId || !enrollmentId || !subjectId || !semester || !academicYear) {
      return sendError(
        res,
        400,
        'Missing required fields: userId, enrollmentId, subjectId, semester, academicYear'
      )
    }

    // Verify enrollment exists
    const enrollment = await prisma.enrollment.findUnique({ where: { id: enrollmentId } })
    if (!enrollment) return sendError(res, 404, 'Enrollment not found')

    // Verify subject exists
    const subject = await prisma.subject.findUnique({ where: { id: subjectId } })
    if (!subject) return sendError(res, 404, 'Subject not found')

    // Check for duplicate grade
    const existing = await prisma.grade.findFirst({
      where: {
        userId,
        subjectId,
        academicYear,
        semester,
      },
    })

    if (existing) {
      return sendError(res, 400, 'Grade already exists for this subject and semester')
    }

    // Compute average and grade
    const average = computeAverage(midterm, finals)
    const grade = computeGrade(average)

    const gradeRecord = await prisma.grade.create({
      data: {
        userId,
        enrollmentId,
        subjectId,
        midterm: midterm || null,
        finals: finals || null,
        average,
        grade,
        remarks,
        semester,
        academicYear,
      },
      include: {
        user: true,
        subject: true,
      },
    })

    return sendSuccess(res, gradeRecord, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create grade')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'grades', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Grade ID is required')

  const { midterm, finals, remarks } = req.body

  try {
    const gradeRecord = await prisma.grade.findUnique({ where: { id: String(id) } })
    if (!gradeRecord) return sendError(res, 404, 'Grade not found')

    // Compute new average and grade if midterm or finals changed
    const average = computeAverage(
      midterm !== undefined ? midterm : gradeRecord.midterm,
      finals !== undefined ? finals : gradeRecord.finals
    )
    const grade = computeGrade(average)

    const updated = await prisma.grade.update({
      where: { id: String(id) },
      data: {
        midterm: midterm !== undefined ? midterm : undefined,
        finals: finals !== undefined ? finals : undefined,
        average,
        grade,
        remarks,
      },
      include: {
        user: true,
        subject: true,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update grade')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'grades', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Grade ID is required')

  try {
    const grade = await prisma.grade.findUnique({ where: { id: String(id) } })
    if (!grade) return sendError(res, 404, 'Grade not found')

    await prisma.grade.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Grade deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete grade')
  }
}
