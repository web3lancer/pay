'use client'

import { useState, useCallback } from 'react'
import {
  getUserProfile,
  updateUserProfile,
  updateUserSettings,
  getUserSettings,
  checkEmailVerified,
  sendVerificationEmail,
  getUserSessions,
  logoutFromSession,
  exportUserData,
  type UserProfile,
  type UserSettings
} from '@/integrations/appwrite/accountService'
import toast from 'react-hot-toast'

export function useAppwriteAccount() {
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<UserSettings>({})
  const [error, setError] = useState<string | null>(null)

  /**
   * Fetch user profile
   */
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserProfile()
      setProfile(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch profile'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update profile
   */
  const updateProfile = useCallback(
    async (data: {
      name?: string
      displayName?: string
      bio?: string
      avatar?: string
    }) => {
      try {
        setLoading(true)
        setError(null)
        const updated = await updateUserProfile(data)
        setProfile(updated)
        toast.success('Profile updated successfully')
        return updated
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update profile'
        setError(message)
        toast.error(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Fetch settings
   */
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getUserSettings()
      setSettings(data)
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch settings'
      setError(message)
      return {}
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Update settings
   */
  const updateSettings = useCallback(async (data: UserSettings) => {
    try {
      setLoading(true)
      setError(null)
      const updated = await updateUserSettings(data)
      setSettings(updated)
      toast.success('Settings updated successfully')
      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update settings'
      setError(message)
      toast.error(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Check email verification
   */
  const checkVerified = useCallback(async () => {
    try {
      const verified = await checkEmailVerified()
      return verified
    } catch (err) {
      console.error('Failed to check verification:', err)
      return false
    }
  }, [])

  /**
   * Send verification email
   */
  const sendVerification = useCallback(async (redirectUrl: string) => {
    try {
      setLoading(true)
      setError(null)
      await sendVerificationEmail(redirectUrl)
      toast.success('Verification email sent')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send verification email'
      setError(message)
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Get all sessions
   */
  const fetchSessions = useCallback(async () => {
    try {
      setLoading(true)
      const sessions = await getUserSessions()
      return sessions
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Logout from specific session
   */
  const logoutSession = useCallback(async (sessionId: string) => {
    try {
      setLoading(true)
      await logoutFromSession(sessionId)
      toast.success('Session ended')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to logout from session'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Export user data
   */
  const exportData = useCallback(async () => {
    try {
      setLoading(true)
      const data = await exportUserData()
      
      // Download as JSON
      const element = document.createElement('a')
      element.setAttribute(
        'href',
        'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2))
      )
      element.setAttribute('download', `user-data-${new Date().toISOString().split('T')[0]}.json`)
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
      
      toast.success('Data exported successfully')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to export data'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    profile,
    settings,
    fetchProfile,
    updateProfile,
    fetchSettings,
    updateSettings,
    checkVerified,
    sendVerification,
    fetchSessions,
    logoutSession,
    exportData
  }
}
