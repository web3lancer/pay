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
  const { user, isLoading, isAuthenticated, isGuest, needsProfileCompletion } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Don't redirect while loading
    if (isLoading) return

    // For non-protected routes, never redirect for auth
    if (!requireAuth) {
      return
    }

    // If auth is required and user is not authenticated (and not a guest), redirect to login
    if (requireAuth && !isAuthenticated && !isGuest) {
      console.log('Auth required but user not authenticated, redirecting to login')
      router.push(redirectTo)
      return
    }

    // If user is authenticated (not guest) but needs profile completion
    if (isAuthenticated && !isGuest && needsProfileCompletion) {
      // Don't redirect if already on profile completion page
      if (pathname !== '/auth/complete-profile') {
        console.log('User needs profile completion, redirecting...')
        router.push('/auth/complete-profile')
        return
      }
    }

    // If user has complete profile but is on completion page, redirect to dashboard
    if (isAuthenticated && !isGuest && !needsProfileCompletion && pathname === '/auth/complete-profile') {
      console.log('Profile already complete, redirecting to dashboard...')
      router.push('/dashboard')
      return
    }
  }, [isLoading, isAuthenticated, isGuest, needsProfileCompletion, pathname, router, requireAuth, redirectTo])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show children if authenticated (including guests) and no profile completion needed
  if ((isAuthenticated || isGuest) && !needsProfileCompletion) {
    return <>{children}</>
  }

  // Show children for non-protected routes
  if (!requireAuth) {
    return <>{children}</>
  }

  // Allow guests to access the app even if auth is required
  if (isGuest) {
    return <>{children}</>
  }

  // Show profile completion if needed (authenticated users only, not guests)
  if (isAuthenticated && !isGuest && needsProfileCompletion && pathname === '/auth/complete-profile') {
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