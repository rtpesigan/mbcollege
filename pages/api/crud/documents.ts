/**
 * CRUD API for Documents
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
    console.error('Documents API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'documents', 'read')
  if (!session) return

  const { id } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (id) {
      // Get single document
      const document = await prisma.document.findUnique({
        where: { id: String(id) },
        include: {
          user: { select: { id: true, email: true, firstName: true, lastName: true } },
          application: true,
        },
      })

      if (!document) return sendError(res, 404, 'Document not found')

      // Check own data access
      if (!checkOwnDataAccess(session.user.id, document.userId, 'documents', session.user.role as Role)) {
        return sendError(res, 403, 'Forbidden - Can only view own documents')
      }

      return sendSuccess(res, document)
    }

    // List documents with filtering
    const where: any = {}

    // Students see only their documents
    if (session.user.role === 'STUDENT') {
      where.userId = session.user.id
    }

    // Filter by userId if staff and provided
    if (session.user.role !== 'STUDENT' && req.query.userId) {
      where.userId = String(req.query.userId)
    }

    if (req.query.status) where.status = String(req.query.status)
    if (req.query.type) where.type = String(req.query.type)

    const documents = await prisma.document.findMany({
      skip,
      take,
      where,
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
      },
      orderBy: { uploadedAt: 'desc' },
    })

    const total = await prisma.document.count({ where })

    return sendSuccess(res, {
      documents,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch documents')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'documents', 'create')
  if (!session) return

  const { type, fileName, filePath, fileSize, mimeType, applicationId, userId } = req.body
  const uploaderId = session.user.role === 'STUDENT' ? session.user.id : userId

  try {
    if (!type || !fileName || !filePath || !fileSize || !mimeType) {
      return sendError(
        res,
        400,
        'Missing required fields: type, fileName, filePath, fileSize, mimeType'
      )
    }

    if (!uploaderId) {
      return sendError(res, 400, 'User ID is required')
    }

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: uploaderId } })
    if (!user) {
      return sendError(res, 404, 'User not found')
    }

    const document = await prisma.document.create({
      data: {
        type,
        fileName,
        filePath,
        fileSize,
        mimeType,
        userId: uploaderId,
        applicationId,
        status: 'PENDING',
      },
      include: {
        user: true,
      },
    })

    return sendSuccess(res, document, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create document')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'documents', 'update')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Document ID is required')

  const { status, remarks, verifiedBy } = req.body

  try {
    const document = await prisma.document.findUnique({ where: { id: String(id) } })
    if (!document) return sendError(res, 404, 'Document not found')

    const updated = await prisma.document.update({
      where: { id: String(id) },
      data: {
        status,
        remarks,
        verifiedAt: status !== 'PENDING' && status !== document.status ? new Date() : undefined,
        verifiedBy: status !== 'PENDING' && status !== document.status ? session.user.id : undefined,
      },
      include: {
        user: true,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update document')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'documents', 'delete')
  if (!session) return

  const { id } = req.query
  if (!id) return sendError(res, 400, 'Document ID is required')

  try {
    const document = await prisma.document.findUnique({ where: { id: String(id) } })
    if (!document) return sendError(res, 404, 'Document not found')

    // Check own data access for students
    if (!checkOwnDataAccess(session.user.id, document.userId, 'documents', session.user.role as Role)) {
      return sendError(res, 403, 'Forbidden - Can only delete own documents')
    }

    // Can only delete pending documents
    if (document.status !== 'PENDING') {
      return sendError(res, 400, 'Can only delete pending documents')
    }

    await prisma.document.delete({ where: { id: String(id) } })

    return sendMessage(res, 'Document deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete document')
  }
}
