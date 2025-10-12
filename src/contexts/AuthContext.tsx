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

  // Check authentication status on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = useCallback(async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error('Refresh user error:', error)
      setUser(null)
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
