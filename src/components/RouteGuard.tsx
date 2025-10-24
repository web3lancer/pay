/**
 * Route Protection Component
 * 
 * Protects routes that require authentication
 * Redirects to external auth service if user is not authenticated
 */

'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FiLoader } from 'react-icons/fi'

interface RouteGuardProps {
  children: React.ReactNode
}

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/home',
  '/send',
  '/receive',
  '/history',
  '/transactions',
  '/wallets',
  '/cards',
  '/requests',
  '/settings',
  '/profile',
]

// Check if route requires authentication
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

export function RouteGuard({ children }: RouteGuardProps) {
  const { isAuthenticated, loading, redirectToAuth } = useAuth()
  const pathname = usePathname()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return

    const needsAuth = isProtectedRoute(pathname)

    if (needsAuth && !isAuthenticated) {
      setRedirecting(true)
      redirectToAuth()
    }
  }, [isAuthenticated, loading, pathname, redirectToAuth])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin text-cyan-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show redirecting state
  if (redirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin text-cyan-600 mx-auto" />
          <p className="mt-4 text-gray-600">Redirecting to authentication...</p>
        </div>
      </div>
    )
  }

  // Show children if authenticated or not protected
  if (isAuthenticated || !isProtectedRoute(pathname)) {
    return <>{children}</>
  }

  // Fallback: show loading (should redirect via useEffect)
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FiLoader className="h-8 w-8 animate-spin text-cyan-600 mx-auto" />
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  )
}
