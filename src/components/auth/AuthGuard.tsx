'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/auth/login' 
}: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, needsProfileCompletion } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // If auth is required and user is not authenticated, redirect to login
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    // If user is authenticated but needs profile completion
    if (isAuthenticated && needsProfileCompletion) {
      // Don't redirect if already on profile completion page
      if (pathname !== '/auth/complete-profile') {
        console.log('User needs profile completion, redirecting...')
        router.push('/auth/complete-profile')
        return
      }
    }

    // If user has complete profile but is on completion page, redirect to dashboard
    if (isAuthenticated && !needsProfileCompletion && pathname === '/auth/complete-profile') {
      console.log('Profile already complete, redirecting to dashboard...')
      router.push('/dashboard')
      return
    }
  }, [isLoading, isAuthenticated, needsProfileCompletion, pathname, router, requireAuth, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show children if all conditions are met
  if (requireAuth && isAuthenticated && !needsProfileCompletion) {
    return <>{children}</>
  }

  // Show children for non-protected routes
  if (!requireAuth) {
    return <>{children}</>
  }

  // Show profile completion if needed
  if (isAuthenticated && needsProfileCompletion && pathname === '/auth/complete-profile') {
    return <>{children}</>
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting...</p>
      </div>
    </div>
  )
}