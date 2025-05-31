'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Models, OAuthProvider, AuthenticatorType } from 'appwrite'
import { 
  account, 
  databases, 
  DATABASE_ID, 
  COLLECTION_IDS, 
  ID 
} from '@/lib/appwrite'

interface User extends Models.User<Models.Preferences> {
  profile?: {
    displayName?: string
    profileImage?: string
    phoneNumber?: string
    kycStatus?: string
    kycLevel?: number
    twoFactorEnabled?: boolean
    country?: string
    timezone?: string
    preferredCurrency?: string
  }
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  sendMagicURL: (email: string) => Promise<void>
  loginWithMagicURL: (userId: string, secret: string) => Promise<void>
  sendEmailOTP: (email: string) => Promise<{ userId: string }>
  loginWithEmailOTP: (userId: string, otp: string) => Promise<void>
  sendPhoneOTP: (phone: string) => Promise<{ userId: string }>
  loginWithPhoneOTP: (userId: string, otp: string) => Promise<void>
  signInWithGoogle: () => void
  signInWithGithub: () => void
  updateProfile: (data: Partial<User['profile']>) => Promise<void>
  enableTwoFactor: () => Promise<void>
  disableTwoFactor: () => Promise<void>
  sendEmailVerification: () => Promise<void>
  verifyEmail: (userId: string, secret: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is logged in on app start
  useEffect(() => {
    checkUser()
    
    // Additional check for OAuth redirects with delay
    const timer = setTimeout(() => {
      checkUser()
    }, 2000)
    
    return () => clearTimeout(timer)
  }, [])

  const checkUser = async () => {
    try {
      setIsLoading(true)
      const currentUser = await account.get()
      if (currentUser) {
        // Log session info for debugging OAuth
        try {
          const session = await account.getSession('current')
          console.log('Session info:', {
            provider: session.provider,
            providerUid: session.providerUid,
            userId: currentUser.$id
          })
        } catch (sessionError) {
          console.log('Could not get session info:', sessionError)
        }
        
        const userProfile = await getUserProfile(currentUser.$id)
        setUser({ ...currentUser, profile: userProfile })
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.log('No user session found')
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
    }
  }

  const logSessionInfo = async () => {
    try {
      const session = await account.getSession('current')
      console.log('Current session info:', {
        provider: session.provider,
        providerUid: session.providerUid,
        userId: session.userId
      })
    } catch (error) {
      console.log('No session or session info unavailable')
    }
  }

  const ensureOAuthUserProfile = async (user: Models.User<Models.Preferences>, session: any) => {
    try {
      // Check if profile already exists
      await databases.getDocument(DATABASE_ID, COLLECTION_IDS.USERS, user.$id)
    } catch (error) {
      // Profile doesn't exist, create it for OAuth user
      console.log('Creating profile for OAuth user')
      try {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTION_IDS.USERS,
          user.$id,
          {
            userId: user.$id,
            email: user.email,
            username: user.email.split('@')[0],
            displayName: user.name,
            kycStatus: 'pending',
            kycLevel: 0,
            twoFactorEnabled: false,
            isActive: true,
            preferredCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
            oauthProvider: session.provider,
            oauthProviderUid: session.providerUid,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
        )
      } catch (createError) {
        console.error('Failed to create OAuth user profile:', createError)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      // Create email session
      await account.createEmailPasswordSession(email, password)
      // Get user info after successful login
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Create account
      await account.create('unique()', email, password, name)
      // Automatically sign in after successful registration
      await signIn(email, password)
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      // Use OAuth2 session with Google provider
      await account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}/`, // Success redirect
        `${window.location.origin}/auth/login` // Failure redirect
      )
    } catch (error) {
      console.error('Google sign in error:', error)
      throw error
    }
  }

  const signInWithGithub = async () => {
    try {
      // Use OAuth2 session with GitHub provider
      await account.createOAuth2Session(
        OAuthProvider.Github,
        `${window.location.origin}/`, // Success redirect
        `${window.location.origin}/auth/login` // Failure redirect
      )
    } catch (error) {
      console.error('GitHub sign in error:', error)
      throw error
    }
  }

  const sendMagicURL = async (email: string) => {
    try {
      await account.createMagicURLToken('unique()', email, `${window.location.origin}/auth/login`)
    } catch (error) {
      console.error('Magic URL error:', error)
      throw error
    }
  }

  const sendEmailOTP = async (email: string): Promise<{ userId: string }> => {
    try {
      const response = await account.createEmailToken('unique()', email)
      return { userId: response.userId }
    } catch (error) {
      console.error('Email OTP error:', error)
      throw error
    }
  }

  const sendPhoneOTP = async (phone: string): Promise<{ userId: string }> => {
    try {
      const response = await account.createPhoneToken('unique()', phone)
      return { userId: response.userId }
    } catch (error) {
      console.error('Phone OTP error:', error)
      throw error
    }
  }

  const loginWithEmailOTP = async (userId: string, otp: string) => {
    try {
      await account.createSession(userId, otp)
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      console.error('Email OTP login error:', error)
      throw error
    }
  }

  const loginWithMagicURL = async (userId: string, secret: string) => {
    try {
      await account.createSession(userId, secret)
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      console.error('Magic URL login error:', error)
      throw error
    }
  }

  const loginWithPhoneOTP = async (userId: string, otp: string) => {
    try {
      await account.createSession(userId, otp)
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      console.error('Phone OTP login error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await account.deleteSession('current')
      setUser(null)
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<Models.User<Models.Preferences>>) => {
    try {
      const updatedUser = await account.updateName(data.name || '')
      setUser(updatedUser)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithGithub,
    sendMagicURL,
    sendEmailOTP,
    sendPhoneOTP,
    loginWithEmailOTP,
    loginWithMagicURL,
    loginWithPhoneOTP,
    signOut,
    updateProfile,
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