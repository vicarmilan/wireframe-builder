'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SSOCallback() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded || !user) return
    const role = (user.publicMetadata as Record<string, string>)?.role
    router.replace(role === 'admin' ? '/dashboard' : '/portal')
  }, [isLoaded, user, router])

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center">
      <div className="text-gray-400 text-sm">Laden...</div>
    </div>
  )
}
