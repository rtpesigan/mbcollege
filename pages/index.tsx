import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function Home() {
  const router = useRouter()
  const { status } = useSession()

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'authenticated') {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [status, router])

  return null
}
