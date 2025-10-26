'use client'

import { useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Hook to refresh auth state on route changes or visibility changes
 */
export function useAuthRefresh() {
  const { refreshProfile } = useAuth()

  useEffect(() => {
    // Refresh auth state when component mounts
    refreshProfile?.()

    // Refresh when document becomes visible (browser tab focused)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProfile?.()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [refreshProfile])
}

/**
 * Hook to listen for auth state changes and react to them
 */
export function useAuthState() {
  const { isAuthenticated, loading, user } = useAuth()

  const isReady = !loading
  const hasUser = isAuthenticated && !!user?.userId

  return {
    isAuthenticated,
    loading,
    user,
    isReady,
    hasUser
  }
}
