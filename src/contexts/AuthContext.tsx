/**
 * Appwrite Authentication Context
 * Properly detects and manages Appwrite sessions
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { account } from '@/lib/appwrite/client'
import { getCurrentUserId, getCurrentUser } from '@/lib/appwrite/auth'

interface UserProfile {
  userId?: string
  username?: string
  email?: string
  displayName?: string
  $id?: string
  name?: string
  email_verified?: boolean
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user?: UserProfile
  userProfile?: UserProfile
  account?: any
  isGuest?: boolean
  isLoading?: boolean
  redirectToAuth: () => void
  logout: () => void
  signOut?: () => Promise<void>
  completeProfile?: (data: any) => Promise<void>
  convertGuestToUser?: (data: any) => Promise<void>
  createGuestSession?: () => Promise<void>
  enableTwoFactor?: () => Promise<void>
  disableTwoFactor?: () => Promise<void>
  verifyTwoFactor?: (code: string) => Promise<void>
  createRecoveryCodes?: () => Promise<void>
  refreshProfile?: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | undefined>()

  // Check Appwrite session status - SIMPLE VERSION
  const checkAppwriteSession = useCallback(async () => {
    try {
      const userId = await getCurrentUserId()
      
      if (userId) {
        setIsAuthenticated(true)
        
        try {
          const accountData = await getCurrentUser()
          setUser({
            userId,
            $id: accountData?.$id || userId,
            email: accountData?.email || '',
            name: accountData?.name || '',
            displayName: accountData?.name || '',
            email_verified: accountData?.emailVerification || false,
          })
        } catch {
          setUser({ userId, $id: userId, email: '' })
        }
      } else {
        setIsAuthenticated(false)
        setUser(undefined)
      }
    } catch (error) {
      setIsAuthenticated(false)
      setUser(undefined)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial auth check - SIMPLE VERSION
  useEffect(() => {
    checkAppwriteSession()
  }, [checkAppwriteSession])

  const redirectToAuth = useCallback(() => {
    const authUri = process.env.NEXT_PUBLIC_AUTH_URI
    if (!authUri) {
      console.error('NEXT_PUBLIC_AUTH_URI not configured')
      return
    }

    const source = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.host}`
      : 'https://pay.web3lancer.website'
    const loginUrl = `${authUri}/login?source=${encodeURIComponent(source)}`
    window.location.href = loginUrl
  }, [])

  const logout = useCallback(async () => {
    try {
      // First logout from Appwrite
      const { logout: appwriteLogout } = await import('@/lib/appwrite')
      await appwriteLogout()
    } catch (error) {
      console.error('Appwrite logout error:', error)
    }

    // Clear local state
    setIsAuthenticated(false)
    setUser(undefined)

    // Check if external auth URI is configured
    const authUri = process.env.NEXT_PUBLIC_AUTH_URI
    if (authUri) {
      // Redirect to external auth service logout
      const source = typeof window !== 'undefined' 
        ? `${window.location.protocol}//${window.location.host}`
        : 'https://pay.web3lancer.website'
      const logoutUrl = `${authUri}/logout?redirect=${encodeURIComponent(source)}`
      window.location.href = logoutUrl
    }
  }, [])

  const signOut = useCallback(async () => {
    await logout()
  }, [logout])

  const refreshProfile = useCallback(async () => {
    await checkAppwriteSession()
  }, [])

  // Stub methods for compatibility
  const completeProfile = useCallback(async () => {
    console.log('Profile completion handled')
  }, [])

  const convertGuestToUser = useCallback(async () => {
    console.log('Guest conversion handled')
  }, [])

  const createGuestSession = useCallback(async () => {
    console.log('Guest session handled')
  }, [])

  const enableTwoFactor = useCallback(async () => {
    console.log('2FA handled')
  }, [])

  const disableTwoFactor = useCallback(async () => {
    console.log('2FA disabled')
  }, [])

  const verifyTwoFactor = useCallback(async () => {
    console.log('2FA verification handled')
  }, [])

  const createRecoveryCodes = useCallback(async () => {
    console.log('Recovery codes handled')
  }, [])

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    isLoading: loading,
    user,
    userProfile: user,
    account: user,
    isGuest: false,
    redirectToAuth,
    logout,
    signOut,
    completeProfile,
    convertGuestToUser,
    createGuestSession,
    enableTwoFactor,
    disableTwoFactor,
    verifyTwoFactor,
    createRecoveryCodes,
    refreshProfile
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

