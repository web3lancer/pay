/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 * Based on Next.js and Appwrite Functions documentation patterns
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { 
  authenticateWithPasskey, 
  authenticateWithWallet,
  sendEmailOTP,
  verifyEmailOTP,
  getCurrentUser,
  logout as logoutHelper,
  isAuthenticated as checkAuthenticated
} from '@/lib/auth/helpers'
import type { Models } from 'appwrite'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  loading: boolean
  isAuthenticated: boolean
  loginWithPasskey: (email: string) => Promise<{ success: boolean; error?: string }>
  loginWithWallet: (email: string) => Promise<{ success: boolean; error?: string }>
  sendOTP: (email: string) => Promise<{ success: boolean; userId?: string; error?: string }>
  verifyOTP: (userId: string, otp: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionChecked, setSessionChecked] = useState(false)

  // Check authentication status on mount and when window gains focus
  useEffect(() => {
    checkAuth()
    
    // Re-check auth when window gains focus (user returns to tab)
    const handleFocus = () => {
      if (sessionChecked) {
        checkAuth()
      }
    }
    
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [sessionChecked])

  const checkAuth = async () => {
    try {
      // First check if there's an Appwrite session cookie
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
      const hasCookie = document.cookie.includes(`a_session_${projectId}`)
      
      if (!hasCookie) {
        // No session cookie, user is not authenticated
        setUser(null)
        setLoading(false)
        setSessionChecked(true)
        return
      }
      
      // Session cookie exists, verify with Appwrite
      const userData = await getCurrentUser()
      
      if (userData) {
        setUser(userData)
      } else {
        setUser(null)
      }
    } catch (error: any) {
      console.error('Auth check error:', error)
      // If session is invalid, clear it
      setUser(null)
      
      // If error is 401, session is expired/invalid
      if (error.code === 401 || error.type === 'user_unauthorized') {
        console.log('Session expired or invalid, clearing...')
      }
    } finally {
      setLoading(false)
      setSessionChecked(true)
    }
  }

  const refreshUser = useCallback(async () => {
    try {
      // Check session cookie first
      const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID
      const hasCookie = document.cookie.includes(`a_session_${projectId}`)
      
      if (!hasCookie) {
        setUser(null)
        return
      }
      
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error: any) {
      console.error('Refresh user error:', error)
      setUser(null)
      
      // If session is invalid, we've already cleared the user
      if (error.code === 401 || error.type === 'user_unauthorized') {
        console.log('Session invalid during refresh')
      }
    }
  }, [])

  const loginWithPasskey = useCallback(async (email: string) => {
    try {
      const result = await authenticateWithPasskey({ email })

      if (result.success) {
        await refreshUser()
      }

      return result
    } catch (error: any) {
      console.error('Passkey login error:', error)
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }, [refreshUser])

  const loginWithWallet = useCallback(async (email: string) => {
    try {
      const result = await authenticateWithWallet({ email })

      if (result.success) {
        await refreshUser()
      }

      return result
    } catch (error: any) {
      console.error('Wallet login error:', error)
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }, [refreshUser])

  const sendOTP = useCallback(async (email: string) => {
    try {
      const result = await sendEmailOTP({ email })
      return result
    } catch (error: any) {
      console.error('Send OTP error:', error)
      return {
        success: false,
        error: error.message || 'Failed to send OTP'
      }
    }
  }, [])

  const verifyOTP = useCallback(async (userId: string, otp: string) => {
    try {
      const result = await verifyEmailOTP({ userId, otp })

      if (result.success) {
        await refreshUser()
      }

      return result
    } catch (error: any) {
      console.error('Verify OTP error:', error)
      return {
        success: false,
        error: error.message || 'Verification failed'
      }
    }
  }, [refreshUser])

  const logout = useCallback(async () => {
    try {
      await logoutHelper()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear user on client side even if server logout fails
      setUser(null)
    }
  }, [])

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithPasskey,
    loginWithWallet,
    sendOTP,
    verifyOTP,
    logout,
    refreshUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
