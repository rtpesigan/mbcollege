import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { DashboardStats, ApiResponse } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<DashboardStats>>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, authOptions)
    
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' })
    }

    const userRole = session.user.role
    const isAdmin = userRole === 'ADMIN' || userRole === 'REGISTRAR'

    let stats: DashboardStats

    if (isAdmin) {
      // Admin/Registrar stats
      const [
        totalStudents,
        approvedStudents,
        pendingApplications,
        totalRevenue,
      ] = await Promise.all([
        prisma.user.count({
          where: { role: 'STUDENT', isActive: true }
        }),
        prisma.user.count({
          where: { 
            role: 'STUDENT', 
            enrollmentStatus: 'APPROVED',
            isActive: true 
          }
        }),
        prisma.application.count({
          where: { status: 'PENDING' }
        }),
        prisma.payment.aggregate({
          where: { status: 'APPROVED' },
          _sum: { amount: true }
        }),
      ])

      stats = {
        totalStudents,
        approvedStudents,
        pendingApplications,
        totalRevenue: totalRevenue._sum.amount || 0,
        documentsSubmitted: 0,
        paymentsMade: 0,
        subjectsEnrolled: 0,
        daysActive: 0,
      }
    } else {
      // Student stats
      const userId = session.user.id
      const [
        documentsSubmitted,
        paymentsData,
        subjectsEnrolled,
        user,
      ] = await Promise.all([
        prisma.document.count({
          where: { 
            userId,
            status: 'APPROVED'
          }
        }),
        prisma.payment.aggregate({
          where: { 
            userId,
            status: 'APPROVED'
          },
          _sum: { amount: true },
          _count: { _all: true }
        }),
        prisma.enrollment.count({
          where: { 
            userId,
            status: 'ACTIVE'
          }
        }),
        prisma.user.findUnique({
          where: { id: userId },
          select: { createdAt: true }
        }),
      ])

      const daysActive = user ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)) : 0

      stats = {
        totalStudents: 0,
        approvedStudents: 0,
        pendingApplications: 0,
        totalRevenue: 0,
        documentsSubmitted,
        paymentsMade: paymentsData._count._all || 0,
        subjectsEnrolled,
        daysActive,
      }
    }

    res.status(200).json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Dashboard stats error:', error)
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error
          ? error.message
          : String(error)

    res.status(500).json({
      success: false,
      error: message
    })
  }
}
