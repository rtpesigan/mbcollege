import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

type GradeListItem = {
  id: string
  code: string
  subject: string
  midterm: number | null
  finals: number | null
  average: number | null
  remarks: string | null
  academicYear: string
  semester: number
}

function computeAverage(midterm: number | null, finals: number | null) {
  if (midterm == null && finals == null) return null
  if (midterm == null) return finals
  if (finals == null) return midterm
  return Math.round(((midterm + finals) / 2) * 100) / 100
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<GradeListItem[]>>
) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const role = session.user.role
    const isStaff = role === 'ADMIN' || role === 'REGISTRAR'

    if (req.method === 'GET') {
      const userId = isStaff && req.query.userId ? String(req.query.userId) : session.user.id

      const grades = await prisma.grade.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          subject: { select: { code: true, name: true } },
          enrollment: { select: { academicYear: true, semester: true } },
        },
      })

      const data: GradeListItem[] = grades.map((g) => ({
        id: g.id,
        code: g.subject.code,
        subject: g.subject.name,
        midterm: g.midterm,
        finals: g.finals,
        average: g.average ?? computeAverage(g.midterm, g.finals),
        remarks: g.remarks ?? null,
        academicYear: g.enrollment.academicYear,
        semester: g.enrollment.semester,
      }))

      return res.status(200).json({ success: true, data })
    }

    if (req.method === 'POST') {
      if (!isStaff) return res.status(403).json({ success: false, error: 'Forbidden' })

      const { userId, enrollmentId, subjectId, midterm, finals, remarks } = req.body ?? {}
      if (!userId || !enrollmentId || !subjectId) {
        return res.status(400).json({ success: false, error: 'userId, enrollmentId, and subjectId are required' })
      }

      const mid = midterm === '' || midterm == null ? null : Number(midterm)
      const fin = finals === '' || finals == null ? null : Number(finals)
      const avg = computeAverage(mid, fin)

      const created = await prisma.grade.create({
        data: {
          userId: String(userId),
          enrollmentId: String(enrollmentId),
          subjectId: String(subjectId),
          midterm: mid,
          finals: fin,
          average: avg,
          remarks: remarks ? String(remarks) : null,
        },
      })

      return res.status(201).json({
        success: true,
        data: [{
          id: created.id,
          code: '',
          subject: '',
          midterm: created.midterm,
          finals: created.finals,
          average: created.average,
          remarks: created.remarks ?? null,
          academicYear: '',
          semester: 0,
        }],
        message: 'Grade recorded',
      })
    }

    if (req.method === 'PATCH') {
      if (!isStaff) return res.status(403).json({ success: false, error: 'Forbidden' })

      const { gradeId, midterm, finals, remarks } = req.body ?? {}
      if (!gradeId) return res.status(400).json({ success: false, error: 'gradeId is required' })

      const mid = midterm === '' || midterm == null ? null : Number(midterm)
      const fin = finals === '' || finals == null ? null : Number(finals)
      const avg = computeAverage(mid, fin)

      const updated = await prisma.grade.update({
        where: { id: String(gradeId) },
        data: {
          midterm: mid,
          finals: fin,
          average: avg,
          remarks: remarks ? String(remarks) : null,
        },
      })

      return res.status(200).json({
        success: true,
        data: [{
          id: updated.id,
          code: '',
          subject: '',
          midterm: updated.midterm,
          finals: updated.finals,
          average: updated.average,
          remarks: updated.remarks ?? null,
          academicYear: '',
          semester: 0,
        }],
        message: 'Grade updated',
      })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Grades API error:', error)
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error
          ? error.message
          : String(error)

    return res.status(500).json({ success: false, error: message })
  }
}
