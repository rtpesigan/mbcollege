/**
 * Common API utilities and middleware
 */

import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import { canAccess, isOwnAccess, type Role, type Permissions } from './rbac'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export async function getSession(req: NextApiRequest, res: NextApiResponse) {
  return getServerSession(req, res, authOptions)
}

export function sendError(res: NextApiResponse, status: number, error: string) {
  return res.status(status).json({ success: false, error })
}

export function sendSuccess<T>(res: NextApiResponse, data: T, status = 200) {
  return res.status(status).json({ success: true, data })
}

export function sendMessage(res: NextApiResponse, message: string, status = 200) {
  return res.status(status).json({ success: true, message })
}

export async function requireAuth(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession(req, res)
  if (!session || !session.user) {
    sendError(res, 401, 'Unauthorized - No session')
    return null
  }
  return session
}

export async function requirePermission(
  req: NextApiRequest,
  res: NextApiResponse,
  module: keyof Permissions,
  action: 'read' | 'create' | 'update' | 'delete'
) {
  const session = await requireAuth(req, res)
  if (!session) return null

  const role = session.user.role as Role
  if (!canAccess(role, module, action)) {
    sendError(res, 403, `Forbidden - No ${action} permission for ${module}`)
    return null
  }

  return session
}

export function checkOwnDataAccess(
  userId: string,
  resourceUserId: string,
  module: keyof Permissions,
  role: Role | undefined
): boolean {
  // If accessing own data
  if (userId === resourceUserId) return true
  
  // If role doesn't have own-only restriction, can access any
  if (!isOwnAccess(role, module)) return true
  
  // Own-only restriction and not own data
  return false
}

export interface PaginationOptions {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export function getPaginationParams(query: any): { skip: number; take: number } {
  const page = Math.max(1, parseInt(query.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10))
  const skip = (page - 1) * limit
  return { skip, take: limit }
}
