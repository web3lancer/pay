'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { setThemePreference } from '@/services/themeService'
import { FiSun, FiMoon } from 'react-icons/fi'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const { theme, setTheme } = useTheme()
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleThemeChange = async () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    
    // Update local theme immediately
    setTheme(newTheme)
    
    // Sync to Appwrite if authenticated
    if (isAuthenticated) {
      setSyncing(true)
      try {
        await setThemePreference(newTheme as 'light' | 'dark')
      } catch (error) {
        console.error('Failed to sync theme to Appwrite:', error)
      } finally {
        setSyncing(false)
      }
    }
  }

  if (!mounted) {
    return (
      <button className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 h-10 w-10" disabled>
        <div className="h-5 w-5 rounded bg-neutral-300 dark:bg-neutral-600" />
      </button>
    )
  }

  return (
    <button
      onClick={handleThemeChange}
      disabled={syncing}
      className="p-2 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors duration-200 disabled:opacity-50"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <FiSun className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
      ) : (
        <FiMoon className="h-5 w-5 text-neutral-900 dark:text-neutral-100" />
      )}
    </button>
  )
}
