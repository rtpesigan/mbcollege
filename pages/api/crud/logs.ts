/**
 * CRUD API for Activity Logs
 * Endpoints: GET, POST (read-only operations)
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
    if (req.method === 'DELETE') {
      return handleDelete(req, res)
    }

    return sendError(res, 405, 'Method not allowed')
  } catch (error) {
    console.error('Activity Logs API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'logs', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single log entry
      const log = await prisma.activityLog.findUnique({
        where: { id: String(id) },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      })

      if (!log) return sendError(res, 404, 'Log entry not found')
      return sendSuccess(res, log)
    }

    // List logs with filtering
    const where: any = {}

    if (req.query.userId) where.userId = String(req.query.userId)
    if (req.query.module) where.module = String(req.query.module)
    if (req.query.action) where.action = String(req.query.action)

    // Date range filtering
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {}
      if (req.query.startDate) {
        where.createdAt.gte = new Date(String(req.query.startDate))
      }
      if (req.query.endDate) {
        where.createdAt.lte = new Date(String(req.query.endDate))
      }
    }

    const logs = await prisma.activityLog.findMany({
      skip,
      take,
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.activityLog.count({ where })

    // Get module statistics
    const moduleStats = await prisma.activityLog.groupBy({
      by: ['module'],
      where,
      _count: true,
    })

    return sendSuccess(res, {
      logs,
      total,
      moduleStats,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch logs')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'logs', 'read')
  if (!session) return

  const { action, module, details, ipAddress, userAgent } = req.body

  try {
    if (!action || !module) {
      return sendError(res, 400, 'Missing required fields: action, module')
    }

    const log = await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action,
        module,
        details,
        ipAddress,
        userAgent,
      },
      include: {
        user: true,
      },
    })

    return sendSuccess(res, log, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create log entry')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  // Only admin can delete logs
  const session = await requirePermission(req, res, 'logs', 'read')
  if (!session) return

  if (session.user.role !== 'ADMIN') {
    return sendError(res, 403, 'Only admins can delete logs')
  }

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Log ID is required')

  try {
    const log = await prisma.activityLog.findUnique({ where: { id: String(id) } })
    if (!log) return sendError(res, 404, 'Log entry not found')

    await prisma.activityLog.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Log entry deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete log entry')
  }
}
