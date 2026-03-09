'use client'

import { useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

type RequireRoleOptions = {
  redirectTo?: string
}

export function useRequireRole(allowedRoles: string[] | null, options: RequireRoleOptions = {}) {
  const { data: session, status } = useSession()
  const router = useRouter()

  const role = session?.user?.role

  const isAllowed = useMemo(() => {
    if (status !== 'authenticated') return false
    if (!allowedRoles || allowedRoles.length === 0) return true
    return !!role && allowedRoles.includes(role)
  }, [allowedRoles, role, status])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
      return
    }

    if (status === 'authenticated') {
      if (allowedRoles && allowedRoles.length > 0 && (!role || !allowedRoles.includes(role))) {
        router.push(options.redirectTo || '/dashboard')
      }
    }
  }, [allowedRoles, options.redirectTo, role, router, status])

  return { session, status, role, isAllowed }
}
