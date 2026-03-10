/**
 * CRUD API for Payments
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
    console.error('Payments API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'payments', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single payment
      const payment = await prisma.payment.findUnique({
        where: { id: String(id) },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
        },
      })

      if (!payment) return sendError(res, 404, 'Payment not found')

      // Check own data access
      if (!checkOwnDataAccess(session.user.id, payment.userId, 'payments', session.user.role as Role)) {
        return sendError(res, 403, 'Forbidden - Can only view own payments')
      }

      return sendSuccess(res, payment)
    }

    // List payments with filtering
    const where: any = {}

    // Students see only their payments
    if (session.user.role === 'STUDENT') {
      where.userId = session.user.id
    }

    // Filter by userId if staff and provided
    if (session.user.role !== 'STUDENT' && req.query.userId) {
      where.userId = String(req.query.userId)
    }

    if (req.query.status) where.status = String(req.query.status)
    if (req.query.paymentMethod) where.paymentMethod = String(req.query.paymentMethod)

    const payments = await prisma.payment.findMany({
      skip,
      take,
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const total = await prisma.payment.count({ where })

    // Calculate statistics if filtering
    const stats = {
      total: 0,
      pending: 0,
      verified: 0,
      approved: 0,
      rejected: 0,
    }

    if (!req.query.userId && session.user.role !== 'STUDENT') {
      const statResults = await prisma.payment.groupBy({
        by: ['status'],
        where,
        _count: true,
      })
      statResults.forEach((stat: any) => {
        stats.total += stat._count
        if (stat.status === 'PENDING') stats.pending = stat._count
        if (stat.status === 'VERIFIED') stats.verified = stat._count
        if (stat.status === 'APPROVED') stats.approved = stat._count
        if (stat.status === 'REJECTED') stats.rejected = stat._count
      })
    }

    return sendSuccess(res, {
      payments,
      total,
      stats,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch payments')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'payments', 'create')
  if (!session) return

  const { userId, amount, paymentMethod, referenceNo, description, proofFile } = req.body
  const payerId = session.user.role === 'STUDENT' ? session.user.id : userId

  try {
    if (!amount || !paymentMethod) {
      return sendError(res, 400, 'Missing required fields: amount, paymentMethod')
    }

    if (!payerId) {
      return sendError(res, 400, 'User ID is required')
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: payerId } })
    if (!user) return sendError(res, 404, 'User not found')

    const payment = await prisma.payment.create({
      data: {
        userId: payerId,
        amount,
        paymentMethod,
        referenceNo,
        description,
        proofFile,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    })

    return sendSuccess(res, payment, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create payment')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'payments', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Payment ID is required')

  const { status, remarks, proofFile } = req.body

  try {
    const payment = await prisma.payment.findUnique({ where: { id: String(id) } })
    if (!payment) return sendError(res, 404, 'Payment not found')

    // Can only verify from PENDING or VERIFIED state
    const isVerification = (status === 'VERIFIED' || status === 'APPROVED') && 
                           session.user.role !== 'STUDENT' &&
                           (payment.status === 'PENDING' || status === 'APPROVED')

    const updated = await prisma.payment.update({
      where: { id: String(id) },
      data: {
        status,
        remarks,
        proofFile,
        verifiedAt: isVerification && !payment.verifiedAt ? new Date() : undefined,
        verifiedBy: isVerification && !payment.verifiedBy ? session.user.id : undefined,
        paidAt: status === 'APPROVED' && !payment.paidAt ? new Date() : undefined,
      },
      include: {
        user: true,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update payment')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'payments', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Payment ID is required')

  try {
    const payment = await prisma.payment.findUnique({ where: { id: String(id) } })
    if (!payment) return sendError(res, 404, 'Payment not found')

    // Check own data access
    if (!checkOwnDataAccess(session.user.id, payment.userId, 'payments', session.user.role as Role)) {
      return sendError(res, 403, 'Forbidden - Can only delete own payments')
    }

    // Can only delete pending payments
    if (payment.status !== 'PENDING') {
      return sendError(res, 400, 'Can only delete pending payments')
    }

    await prisma.payment.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Payment deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete payment')
  }
}
