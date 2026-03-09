import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import { EnrollmentAnalytics, ApiResponse } from '@/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<EnrollmentAnalytics[]>>
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

    if (!isAdmin) {
      return res.status(200).json({ success: true, data: [] })
    }

    // Get analytics for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const applications = await prisma.application.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        }
      },
      _count: {
        id: true
      }
    })

    const approved = await prisma.application.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: {
          gte: sevenDaysAgo
        },
        status: 'APPROVED'
      },
      _count: {
        id: true
      }
    })

    // Generate date range for the last 7 days
    const analytics: EnrollmentAnalytics[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayApplications = applications.find(app => 
        app.createdAt.toISOString().split('T')[0] === dateStr
      )?._count.id || 0

      const dayApproved = approved.find(app => 
        app.createdAt.toISOString().split('T')[0] === dateStr
      )?._count.id || 0

      analytics.push({
        date: dateStr,
        applications: dayApplications,
        approved: dayApproved,
        rejected: 0, // Can be calculated similarly
      })
    }

    res.status(200).json({
      success: true,
      data: analytics
    })

  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
}
