'use client'

import { useEffect } from 'react'
import { useTheme } from 'next-themes'
import { useAuth } from '@/contexts/AuthContext'
import { getThemePreference } from '@/services/themeService'

/**
 * Hook to load and sync theme preference from Appwrite on app initialization
 * Only runs once when component mounts
 */
export function useThemeSync() {
  const { setTheme } = useTheme()
  const { isAuthenticated, loading: authLoading } = useAuth()

  useEffect(() => {
    // Only load theme if authenticated and auth is done loading
    if (!authLoading && isAuthenticated) {
      const loadThemeFromAppwrite = async () => {
        try {
          const savedTheme = await getThemePreference()
          // Only set if it's 'light' or 'dark' (not 'system')
          if (savedTheme === 'light' || savedTheme === 'dark') {
            setTheme(savedTheme)
          }
        } catch (error) {
          console.error('Failed to load theme from Appwrite:', error)
        }
      }

      loadThemeFromAppwrite()
    }
  }, [isAuthenticated, authLoading, setTheme])
}
