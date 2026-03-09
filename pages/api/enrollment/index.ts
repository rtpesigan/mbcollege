import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

type EnrollmentListItem = {
  id: string
  code: string
  subject: string
  units: number
  status: string
  semester: number
  academicYear: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<EnrollmentListItem[]>>
) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const userId = session.user.id

    if (req.method === 'GET') {
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        orderBy: [{ academicYear: 'desc' }, { semester: 'desc' }, { createdAt: 'desc' }],
        include: { subject: { select: { code: true, name: true, units: true } } },
      })

      const data: EnrollmentListItem[] = enrollments.map((e) => ({
        id: e.id,
        code: e.subject.code,
        subject: e.subject.name,
        units: e.subject.units,
        status: e.status,
        semester: e.semester,
        academicYear: e.academicYear,
      }))

      return res.status(200).json({ success: true, data })
    }

    if (req.method === 'POST') {
      const { subjectId, semester, academicYear } = req.body ?? {}
      if (!subjectId) return res.status(400).json({ success: false, error: 'subjectId is required' })

      const subject = await prisma.subject.findUnique({ where: { id: String(subjectId) }, select: { id: true, courseId: true } })
      if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' })

      const currentSemesterSetting = await prisma.systemSetting.findUnique({ where: { key: 'currentSemester' } })
      const currentAcademicYearSetting = await prisma.systemSetting.findUnique({ where: { key: 'currentAcademicYear' } })

      const sem = semester ? Number(semester) : Number(currentSemesterSetting?.value ?? 1)
      const ay = academicYear ? String(academicYear) : String(currentAcademicYearSetting?.value ?? '2024-2025')

      const enrollment = await prisma.enrollment.upsert({
        where: {
          userId_subjectId_academicYear_semester: {
            userId,
            subjectId: subject.id,
            academicYear: ay,
            semester: sem,
          },
        },
        update: { status: 'ACTIVE' },
        create: {
          userId,
          courseId: subject.courseId,
          subjectId: subject.id,
          semester: sem,
          academicYear: ay,
          status: 'ACTIVE',
        },
      })

      return res.status(201).json({ success: true, data: [
        {
          id: enrollment.id,
          code: '',
          subject: '',
          units: 0,
          status: enrollment.status,
          semester: enrollment.semester,
          academicYear: enrollment.academicYear,
        },
      ], message: 'Enrolled successfully' })
    }

    if (req.method === 'PATCH') {
      const { enrollmentId, status } = req.body ?? {}
      if (!enrollmentId || !status) return res.status(400).json({ success: false, error: 'enrollmentId and status are required' })

      const updated = await prisma.enrollment.update({
        where: { id: String(enrollmentId) },
        data: { status: String(status) as any },
      })

      return res.status(200).json({ success: true, data: [
        {
          id: updated.id,
          code: '',
          subject: '',
          units: 0,
          status: updated.status,
          semester: updated.semester,
          academicYear: updated.academicYear,
        },
      ], message: 'Enrollment updated' })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Enrollment API error:', error)
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error
          ? error.message
          : String(error)

    return res.status(500).json({ success: false, error: message })
  }
}
