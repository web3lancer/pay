'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Auth-related pages that don't need protection
  const publicPages = [
    '/auth/login',
    '/auth/signup', 
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify',
    '/auth/complete-profile'
  ]

  const isPublicPage = publicPages.some(page => pathname.startsWith(page))

  useEffect(() => {
    if (!isLoading) {
      // If not authenticated and trying to access protected page
      if (!isAuthenticated && !isPublicPage) {
        router.push('/auth/login')
        return
      }

      // If authenticated but profile incomplete, redirect to complete profile
      if (isAuthenticated && user && (!user.profile || !user.profile.username) && pathname !== '/auth/complete-profile') {
        console.log('User needs to complete profile, redirecting...')
        router.push('/auth/complete-profile')
        return
      }

      // If authenticated with complete profile but on auth pages, redirect to dashboard
      if (isAuthenticated && user && user.profile && user.profile.username && isPublicPage && pathname !== '/auth/complete-profile') {
        router.push('/')
        return
      }
    }
  }, [isLoading, isAuthenticated, user, router, pathname, isPublicPage])

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <>{children}</>
}