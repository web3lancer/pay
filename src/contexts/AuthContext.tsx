/**
 * Appwrite Authentication Context
 * Properly detects and manages Appwrite sessions
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { account } from '@/lib/appwrite/client'
import { getCurrentUserId, getCurrentUser } from '@/lib/appwrite/auth'
import { getUser } from '@/lib/appwrite/users'
import { initializeSessionMonitoring, onSessionChange } from '@/lib/sessionSync'

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

let sessionMonitoringInitialized = false

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | undefined>()

  // Check Appwrite session status
  const checkAppwriteSession = useCallback(async () => {
    try {
      setLoading(true)
      
      // Try to get current user from Appwrite account
      const userId = await getCurrentUserId()
      
      if (userId) {
        // User is authenticated
        setIsAuthenticated(true)
        
        // Fetch full account details
        try {
          const accountData = await getCurrentUser()
          
          // Try to fetch user profile from PayDB
          let userFromDb = null
          try {
            userFromDb = await getUser(userId)
          } catch (err) {
            console.warn('Could not fetch user from PayDB:', err)
          }
          
          // Merge account and database data
          const mergedUser: UserProfile = {
            userId,
            $id: accountData?.$id || userId,
            email: accountData?.email || userFromDb?.email || '',
            name: accountData?.name || userFromDb?.displayName || '',
            displayName: userFromDb?.displayName || accountData?.name || '',
            username: userFromDb?.username || '',
            email_verified: accountData?.emailVerification || false,
            ...userFromDb,
            ...accountData,
          }
          
          setUser(mergedUser)
        } catch (profileError) {
          console.warn('Could not fetch user profile:', profileError)
          // Still authenticated even if profile fetch fails
          setUser({
            userId,
            $id: userId,
            email: '',
          })
        }
      } else {
        // No active session
        setIsAuthenticated(false)
        setUser(undefined)
      }
    } catch (error) {
      console.error('Session check error:', error)
      setIsAuthenticated(false)
      setUser(undefined)
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial auth check and setup session monitoring
  useEffect(() => {
    let checkCount = 0
    let initCheckInterval: NodeJS.Timeout | null = null
    let timeoutId: NodeJS.Timeout | null = null

    // Do multiple checks in the first 3 seconds for better detection
    const initialCheck = async () => {
      await checkAppwriteSession()
      checkCount++
      
      // Do 3 quick checks (0ms, 500ms, 1000ms) to catch session
      if (checkCount < 3) {
        initCheckInterval = setTimeout(initialCheck, 500)
      }
    }

    initialCheck()

    // Safety timeout - ensure loading is false after 5 seconds
    timeoutId = setTimeout(() => {
      setLoading(false)
    }, 5000)

    // Initialize session monitoring (only once globally)
    if (!sessionMonitoringInitialized) {
      sessionMonitoringInitialized = true
      initializeSessionMonitoring()
    }

    // Subscribe to session changes
    const unsubscribe = onSessionChange((session) => {
      if (session.isAuthenticated) {
        setIsAuthenticated(true)
        setUser({
          userId: session.userId || '',
          ...session.userProfile,
          email: session.userProfile?.email,
          displayName: session.userProfile?.name || session.userProfile?.displayName,
        } as UserProfile)
      } else {
        setIsAuthenticated(false)
        setUser(undefined)
      }
    })

    return () => {
      if (initCheckInterval) clearTimeout(initCheckInterval)
      if (timeoutId) clearTimeout(timeoutId)
      unsubscribe()
    }
  }, [])

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

