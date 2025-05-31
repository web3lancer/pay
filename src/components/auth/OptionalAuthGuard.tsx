'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface OptionalAuthGuardProps {
  children: React.ReactNode
  enhancedFeaturesOnly?: boolean // If true, shows message about enhanced features requiring auth
}

export function OptionalAuthGuard({
  children,
  enhancedFeaturesOnly = false
}: OptionalAuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Auth pages that redirect authenticated users
  const authPages = ['/auth/login', '/auth/signup', '/auth/complete-profile']
  const isAuthPage = authPages.some(page => pathname.startsWith(page))

  useEffect(() => {
    // If authenticated and on auth pages, redirect to home
    if (!isLoading && isAuthenticated && isAuthPage) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, isAuthPage, router])

  // Show loading while checking auth (minimal loading for public pages)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  // Show enhanced features message for wallet management pages
  if (enhancedFeaturesOnly && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-neutral-200 p-6 text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">
            Enhanced Features Require Account
          </h2>
          <p className="text-neutral-600 mb-6">
            Wallet management and transaction history require a free account for security and data persistence.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/auth/signup')}
              className="flex-1 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
            >
              Create Account
            </button>
            <button
              onClick={() => router.push('/auth/login')}
              className="flex-1 bg-neutral-100 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-200 transition-colors"
            >
              Sign In
            </button>
          </div>
          <button
            onClick={() => router.push('/')}
            className="mt-4 text-neutral-500 hover:text-neutral-700 text-sm"
          >
            ← Back to payment features
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}