/**
 * Route Protection Component
 * 
 * Protects routes that require authentication
 * Shows auth modal if user is not authenticated
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { UnifiedAuthModal } from './auth/UnifiedAuthModal'
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
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (isLoading) return

    const needsAuth = isProtectedRoute(pathname)

    if (needsAuth && !isAuthenticated) {
      // Show auth modal instead of redirecting
      setShowAuthModal(true)
    } else {
      setShowAuthModal(false)
    }
  }, [isAuthenticated, isLoading, pathname])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiLoader className="h-8 w-8 animate-spin text-cyan-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show children if authenticated or not protected
  if (isAuthenticated || !isProtectedRoute(pathname)) {
    return <>{children}</>
  }

  // Show auth modal for protected routes
  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">W3</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Authentication Required
          </h1>
          <p className="text-gray-600 mb-6">
            Please sign in to access this page
          </p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full font-medium shadow-lg hover:scale-105 transition-all"
          >
            Sign In
          </button>
        </div>
      </div>

      <UnifiedAuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false)
          // Redirect to home page if user closes modal without auth
          router.push('/')
        }}
      />
    </>
  )
}
