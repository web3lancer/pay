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
    
    // Enhanced OAuth redirect detection
    const handleOAuthRedirect = async () => {
      // Check if this is an OAuth redirect by looking for common OAuth parameters
      const urlParams = new URLSearchParams(window.location.search)
      const hasOAuthParams = urlParams.has('code') || urlParams.has('state') || 
                           window.location.hash.includes('access_token') ||
                           document.referrer.includes('accounts.google.com') ||
                           document.referrer.includes('github.com')
      
      if (hasOAuthParams) {
        console.log('OAuth redirect detected, checking for session...')
        // Wait a bit longer for OAuth session to be established
        setTimeout(() => {
          checkUser()
        }, 1500)
      }
    }
    
    handleOAuthRedirect()
    
    // Additional check for OAuth redirects with delay
    const timer = setTimeout(() => {
      checkUser()
    }, 3000)
    
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
          
          // For OAuth users, ensure profile exists
          if (session.provider && session.provider !== 'email') {
            await ensureOAuthUserProfile(currentUser, session.provider)
          }
        } catch (sessionError) {
          console.log('Could not get session info:', sessionError)
        }
        
        // Fetch user profile from database
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

  const ensureOAuthUserProfile = async (user: Models.User<Models.Preferences>, provider: string) => {
    try {
      // Check if profile already exists
      await databases.getDocument(DATABASE_ID, COLLECTION_IDS.USERS, user.$id)
    } catch (error) {
      // Profile doesn't exist, create it for OAuth user
      console.log('Creating profile for OAuth user')
      await createUserProfile(user.$id, user.email, user.name)
    }
  }

  const getUserProfile = async (userId: string) => {
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        userId
      )
      return {
        displayName: profile.displayName,
        profileImage: profile.profileImage,
        phoneNumber: profile.phoneNumber,
        kycStatus: profile.kycStatus,
        kycLevel: profile.kycLevel,
        twoFactorEnabled: profile.twoFactorEnabled,
        country: profile.country,
        timezone: profile.timezone,
        preferredCurrency: profile.preferredCurrency,
      }
    } catch (error) {
      console.log('Profile not found, user may need to complete setup')
      return {}
    }
  }

  const createUserProfile = async (userId: string, email: string, name: string) => {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        userId,
        {
          userId,
          email,
          username: email.split('@')[0],
          displayName: name,
          kycStatus: 'pending',
          kycLevel: 0,
          twoFactorEnabled: false,
          isActive: true,
          preferredCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      )
    } catch (error) {
      console.error('Failed to create user profile:', error)
      // Don't throw error as this is not critical for OAuth login
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await account.create(ID.unique(), email, password, name)
      await createUserProfile(response.$id, email, name)
      await account.createVerification(window.location.origin + '/auth/verify')
      await account.createEmailPasswordSession(email, password)
      await checkUser()
    } catch (error) {
      console.error('Sign up failed:', error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password)
      await checkUser()
    } catch (error) {
      console.error('Sign in failed:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await account.deleteSession('current')
      setUser(null)
      setIsAuthenticated(false)
    } catch (error) {
      console.error('Sign out failed:', error)
      throw error
    }
  }

  // OAuth methods - These trigger redirects, don't return promises
  const signInWithGoogle = () => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Google,
        `${window.location.origin}`, // Success redirect
        `${window.location.origin}/auth/login` // Failure redirect
      )
    } catch (error) {
      console.error('Google sign in failed:', error)
    }
  }

  const signInWithGithub = () => {
    try {
      account.createOAuth2Session(
        OAuthProvider.Github,
        `${window.location.origin}`, // Success redirect
        `${window.location.origin}/auth/login` // Failure redirect
      )
    } catch (error) {
      console.error('GitHub sign in failed:', error)
    }
  }

  // Other auth methods...
  const sendMagicURL = async (email: string) => {
    try {
      await account.createMagicURLToken(
        ID.unique(),
        email,
        `${window.location.origin}/auth/login?userId={userId}&secret={secret}`
      )
    } catch (error) {
      console.error('Magic URL failed:', error)
      throw error
    }
  }

  const loginWithMagicURL = async (userId: string, secret: string) => {
    try {
      await account.updateMagicURLSession(userId, secret)
      await checkUser()
    } catch (error) {
      console.error('Magic URL login failed:', error)
      throw error
    }
  }

  const sendEmailOTP = async (email: string) => {
    try {
      const response = await account.createEmailToken(ID.unique(), email)
      return { userId: response.userId }
    } catch (error) {
      console.error('Email OTP failed:', error)
      throw error
    }
  }

  const loginWithEmailOTP = async (userId: string, otp: string) => {
    try {
      await account.createSession(userId, otp)
      await checkUser()
    } catch (error) {
      console.error('Email OTP login failed:', error)
      throw error
    }
  }

  const sendPhoneOTP = async (phone: string) => {
    try {
      const response = await account.createPhoneToken(ID.unique(), phone)
      return { userId: response.userId }
    } catch (error) {
      console.error('Phone OTP failed:', error)
      throw error
    }
  }

  const loginWithPhoneOTP = async (userId: string, otp: string) => {
    try {
      await account.createSession(userId, otp)
      await checkUser()
    } catch (error) {
      console.error('Phone OTP login failed:', error)
      throw error
    }
  }

  const updateProfile = async (data: Partial<User['profile']>) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        user.$id,
        {
          ...data,
          updatedAt: new Date().toISOString(),
        }
      )
      
      setUser(prev => prev ? {
        ...prev,
        profile: { ...prev.profile, ...data }
      } : null)
    } catch (error) {
      console.error('Profile update failed:', error)
      throw error
    }
  }

  const enableTwoFactor = async () => {
    try {
      await account.createMfaAuthenticator(AuthenticatorType.Totp)
    } catch (error) {
      console.error('Enable 2FA failed:', error)
      throw error
    }
  }

  const disableTwoFactor = async () => {
    try {
      await account.deleteMfaAuthenticator(AuthenticatorType.Totp)
    } catch (error) {
      console.error('Disable 2FA failed:', error)
      throw error
    }
  }

  const sendEmailVerification = async () => {
    try {
      await account.createVerification(window.location.origin + '/auth/verify')
    } catch (error) {
      console.error('Email verification failed:', error)
      throw error
    }
  }

  const verifyEmail = async (userId: string, secret: string) => {
    try {
      await account.updateVerification(userId, secret)
      await checkUser()
    } catch (error) {
      console.error('Email verification confirmation failed:', error)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    sendMagicURL,
    loginWithMagicURL,
    sendEmailOTP,
    loginWithEmailOTP,
    sendPhoneOTP,
    loginWithPhoneOTP,
    signInWithGoogle,
    signInWithGithub,
    updateProfile,
    enableTwoFactor,
    disableTwoFactor,
    sendEmailVerification,
    verifyEmail,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}