import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]'
import { prisma } from '@/lib/prisma'
import type { ApiResponse } from '@/types'

type PaymentListItem = {
  id: string
  createdAt: string
  description: string | null
  paymentMethod: string
  amount: number
  status: string
  referenceNo: string | null
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse<PaymentListItem[]>>
) {
  try {
    const session = await getServerSession(req, res, authOptions)
    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' })

    const userId = session.user.id
    const role = session.user.role
    const isAdmin = role === 'ADMIN' || role === 'REGISTRAR' || role === 'CASHIER'

    if (req.method === 'GET') {
      const payments = await prisma.payment.findMany({
        where: isAdmin && req.query.userId ? { userId: String(req.query.userId) } : { userId },
        orderBy: { createdAt: 'desc' },
      })

      const data: PaymentListItem[] = payments.map((p) => ({
        id: p.id,
        createdAt: p.createdAt.toISOString(),
        description: p.description ?? null,
        paymentMethod: p.paymentMethod,
        amount: p.amount,
        status: p.status,
        referenceNo: p.referenceNo ?? null,
      }))

      return res.status(200).json({ success: true, data })
    }

    if (req.method === 'POST') {
      const { amount, paymentMethod, description, referenceNo } = req.body ?? {}
      if (!amount || !paymentMethod) return res.status(400).json({ success: false, error: 'amount and paymentMethod are required' })

      const created = await prisma.payment.create({
        data: {
          userId,
          amount: Number(amount),
          paymentMethod: String(paymentMethod) as any,
          description: description ? String(description) : null,
          referenceNo: referenceNo ? String(referenceNo) : null,
          status: 'PENDING',
        },
      })

      return res.status(201).json({
        success: true,
        data: [{
          id: created.id,
          createdAt: created.createdAt.toISOString(),
          description: created.description ?? null,
          paymentMethod: created.paymentMethod,
          amount: created.amount,
          status: created.status,
          referenceNo: created.referenceNo ?? null,
        }],
        message: 'Payment created',
      })
    }

    if (req.method === 'PATCH') {
      if (!isAdmin) return res.status(403).json({ success: false, error: 'Forbidden' })

      const { paymentId, status } = req.body ?? {}
      if (!paymentId || !status) return res.status(400).json({ success: false, error: 'paymentId and status are required' })

      const updated = await prisma.payment.update({
        where: { id: String(paymentId) },
        data: { status: String(status) as any, verifiedAt: new Date(), verifiedBy: session.user.id },
      })

      return res.status(200).json({
        success: true,
        data: [{
          id: updated.id,
          createdAt: updated.createdAt.toISOString(),
          description: updated.description ?? null,
          paymentMethod: updated.paymentMethod,
          amount: updated.amount,
          status: updated.status,
          referenceNo: updated.referenceNo ?? null,
        }],
        message: 'Payment updated',
      })
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' })
  } catch (error) {
    console.error('Payments API error:', error)
    const message =
      process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : error instanceof Error
          ? error.message
          : String(error)

    return res.status(500).json({ success: false, error: message })
  }
}
