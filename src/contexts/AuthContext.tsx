/**
 * External Authentication Context
 * Redirects users to external auth service for login/logout
 * User data is managed by the external auth service
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface UserProfile {
  userId?: string
  username?: string
  email?: string
  displayName?: string
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
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<UserProfile | undefined>()

  // Check if user has auth token/cookie from external auth service
  useEffect(() => {
    const checkAuth = () => {
      try {
        // Check for auth token in localStorage or cookies
        const hasAuthToken = localStorage.getItem('auth_token') || 
                            document.cookie.includes('auth_token')
        setIsAuthenticated(!!hasAuthToken)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Re-check auth when window gains focus (user returns from auth service)
    const handleFocus = () => {
      checkAuth()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const redirectToAuth = useCallback(() => {
    const authUri = process.env.NEXT_PUBLIC_AUTH_URI
    if (!authUri) {
      console.error('NEXT_PUBLIC_AUTH_URI not configured')
      return
    }

    const source = typeof window !== 'undefined' ? window.location.origin : 'https://pay.web3lancer.website'
    const loginUrl = `${authUri}/login?source=${encodeURIComponent(source)}`
    window.location.href = loginUrl
  }, [])

  const logout = useCallback(() => {
    const authUri = process.env.NEXT_PUBLIC_AUTH_URI
    if (!authUri) {
      console.error('NEXT_PUBLIC_AUTH_URI not configured')
      return
    }

    // Clear local auth state
    localStorage.removeItem('auth_token')
    setIsAuthenticated(false)
    
    // Redirect to auth logout
    const source = typeof window !== 'undefined' ? window.location.origin : 'https://pay.web3lancer.website'
    const logoutUrl = `${authUri}/logout?redirect=${encodeURIComponent(source)}`
    window.location.href = logoutUrl
  }, [])

  const signOut = useCallback(async () => {
    logout()
  }, [logout])

  // Stub methods for compatibility - these would be handled by external auth service
  const completeProfile = useCallback(async () => {
    console.log('Profile completion handled by external auth service')
  }, [])

  const convertGuestToUser = useCallback(async () => {
    console.log('Guest conversion handled by external auth service')
  }, [])

  const createGuestSession = useCallback(async () => {
    console.log('Guest session handled by external auth service')
  }, [])

  const enableTwoFactor = useCallback(async () => {
    console.log('2FA handled by external auth service')
  }, [])

  const disableTwoFactor = useCallback(async () => {
    console.log('2FA handled by external auth service')
  }, [])

  const verifyTwoFactor = useCallback(async () => {
    console.log('2FA verification handled by external auth service')
  }, [])

  const createRecoveryCodes = useCallback(async () => {
    console.log('Recovery codes handled by external auth service')
  }, [])

  const refreshProfile = useCallback(async () => {
    console.log('Profile refresh handled by external auth service')
  }, [])

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    isLoading: loading,
    user,
    userProfile: user,
    account: undefined,
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

