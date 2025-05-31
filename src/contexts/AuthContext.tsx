'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authService, User, UserProfile } from '@/lib/auth'

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendEmailVerification: () => Promise<void>
  sendPasswordRecovery: (email: string) => Promise<void>
  sendMagicURL: (email: string) => Promise<void>
  sendEmailOTP: (email: string) => Promise<void>
  loginWithMagicURL: (userId: string, secret: string) => Promise<void>
  loginWithEmailOTP: (userId: string, otp: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  enableMFA: () => Promise<void>
  disableMFA: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Initialize auth state
  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      setIsLoading(true)
      const currentUser = await authService.getCurrentUser()
      
      if (currentUser) {
        setUser(currentUser)
        
        // Get user profile from database
        const profile = await authService.getUserProfile(currentUser.$id)
        setUserProfile(profile)
        
        // If no profile exists, create one
        if (!profile) {
          const newProfile = await authService.createUserProfile(currentUser)
          setUserProfile(newProfile as unknown as UserProfile)
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshUser = async () => {
    await checkAuthState()
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true)
      const response = await authService.signUp(email, password, name)
      
      // Auto sign in after signup
      await signIn(email, password)
      
      // Log security event
      if (user) {
        await authService.logSecurityEvent(user.$id, 'signup', { email })
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      await authService.signIn(email, password)
      await checkAuthState()
      
      // Log security event
      if (user) {
        await authService.logSecurityEvent(user.$id, 'login', { email, method: 'email_password' })
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setIsLoading(true)
      
      // Log security event before signing out
      if (user) {
        await authService.logSecurityEvent(user.$id, 'logout', {})
      }
      
      await authService.signOut()
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const sendEmailVerification = async () => {
    try {
      await authService.sendEmailVerification()
    } catch (error) {
      throw error
    }
  }

  const sendPasswordRecovery = async (email: string) => {
    try {
      await authService.sendPasswordRecovery(email)
    } catch (error) {
      throw error
    }
  }

  const sendMagicURL = async (email: string) => {
    try {
      await authService.sendMagicURL(email)
    } catch (error) {
      throw error
    }
  }

  const sendEmailOTP = async (email: string) => {
    try {
      await authService.sendEmailOTP(email)
    } catch (error) {
      throw error
    }
  }

  const loginWithMagicURL = async (userId: string, secret: string) => {
    try {
      setIsLoading(true)
      await authService.loginWithMagicURL(userId, secret)
      await checkAuthState()
      
      // Log security event
      if (user) {
        await authService.logSecurityEvent(user.$id, 'login', { method: 'magic_url' })
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithEmailOTP = async (userId: string, otp: string) => {
    try {
      setIsLoading(true)
      await authService.loginWithEmailOTP(userId, otp)
      await checkAuthState()
      
      // Log security event
      if (user) {
        await authService.logSecurityEvent(user.$id, 'login', { method: 'email_otp' })
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    try {
      // OAuth redirects away from the page, so we don't set loading here
      await authService.signInWithOAuth('google' as any)
    } catch (error) {
      throw error
    }
  }

  const signInWithGithub = async () => {
    try {
      // OAuth redirects away from the page, so we don't set loading here
      await authService.signInWithOAuth('github' as any)
    } catch (error) {
      throw error
    }
  }

  const enableMFA = async () => {
    try {
      await authService.enableMFA()
      await checkAuthState() // Refresh user data
    } catch (error) {
      throw error
    }
  }

  const disableMFA = async () => {
    try {
      await authService.disableMFA()
      await checkAuthState() // Refresh user data
    } catch (error) {
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    userProfile,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    sendEmailVerification,
    sendPasswordRecovery,
    sendMagicURL,
    sendEmailOTP,
    loginWithMagicURL,
    loginWithEmailOTP,
    signInWithGoogle,
    signInWithGithub,
    enableMFA,
    disableMFA,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}