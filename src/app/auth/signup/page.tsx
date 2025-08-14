'use client'

import { AuthClient } from '../AuthClient'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function SignupPage() {
  const { refreshProfile } = useAuth()
  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line
  }, [])
  return <AuthClient mode="signup" />
}