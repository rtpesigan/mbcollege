/**
 * CRUD API for System Settings
 * Endpoints: GET, POST, PUT, DELETE
 * Admin only
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
    console.error('Settings API Error:', error)
    return sendError(res, 500, 'Internal server error')
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'settings', 'read')
  if (!session) return

  const { key } = req.query
  const { skip, take } = getPaginationParams(req.query)

  try {
    if (key) {
      // Get single setting
      const setting = await prisma.systemSetting.findUnique({
        where: { key: String(key) },
      })

      if (!setting) return sendError(res, 404, 'Setting not found')
      return sendSuccess(res, setting)
    }

    // List all settings with pagination
    const settings = await prisma.systemSetting.findMany({
      skip,
      take,
      orderBy: { key: 'asc' },
    })

    const total = await prisma.systemSetting.count()

    return sendSuccess(res, {
      settings,
      total,
      page: Math.floor(skip / take) + 1,
      pageSize: take,
    })
  } catch (error) {
    console.error('GET error:', error)
    return sendError(res, 500, 'Failed to fetch settings')
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'settings', 'create')
  if (!session) return

  const { key, value, description } = req.body

  try {
    if (!key || !value) {
      return sendError(res, 400, 'Missing required fields: key, value')
    }

    // Check if key already exists
    const existing = await prisma.systemSetting.findUnique({ where: { key } })
    if (existing) {
      return sendError(res, 400, 'Setting key already exists')
    }

    const setting = await prisma.systemSetting.create({
      data: {
        key,
        value,
        description,
      },
    })

    return sendSuccess(res, setting, 201)
  } catch (error) {
    console.error('POST error:', error)
    return sendError(res, 500, 'Failed to create setting')
  }
}

async function handlePut(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'settings', 'update')
  if (!session) return

  const { key } = req.query
  if (!key) return sendError(res, 400, 'Setting key is required')

  const { value, description } = req.body

  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: String(key) } })
    if (!setting) return sendError(res, 404, 'Setting not found')

    const updated = await prisma.systemSetting.update({
      where: { key: String(key) },
      data: {
        value: value !== undefined ? value : undefined,
        description: description !== undefined ? description : undefined,
      },
    })

    return sendSuccess(res, updated)
  } catch (error) {
    console.error('PUT error:', error)
    return sendError(res, 500, 'Failed to update setting')
  }
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse) {
  const session = await requirePermission(req, res, 'settings', 'delete')
  if (!session) return

  const { key } = req.query
  if (!key) return sendError(res, 400, 'Setting key is required')

  try {
    const setting = await prisma.systemSetting.findUnique({ where: { key: String(key) } })
    if (!setting) return sendError(res, 404, 'Setting not found')

    // Prevent deletion of critical settings
    const criticalKeys = ['schoolName', 'currentSemester', 'currentAcademicYear']
    if (criticalKeys.includes(String(key))) {
      return sendError(res, 400, 'Cannot delete critical system settings')
    }

    await prisma.systemSetting.delete({ where: { key: String(key) } })

    return sendMessage(res, 'Setting deleted successfully')
  } catch (error) {
    console.error('DELETE error:', error)
    return sendError(res, 500, 'Failed to delete setting')
  }
}
