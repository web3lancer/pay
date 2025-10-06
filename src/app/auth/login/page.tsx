'use client'

import { AuthClient } from '@/components/auth/AuthClient'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const { refreshProfile } = useAuth()
  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line
  }, [])
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600">
      <div className="backdrop-blur-lg bg-white/60 rounded-xl shadow-xl border border-white/30 p-8">
        <AuthClient mode="login" />
      </div>
    </div>
  )
}
