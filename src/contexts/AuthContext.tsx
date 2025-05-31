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
import { DatabaseService } from '@/lib/database'
import { useRouter, usePathname } from 'next/navigation'

interface User extends Models.User<Models.Preferences> {
  profile?: {
    username?: string
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
  needsProfileCompletion?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  isGuest: boolean
  needsProfileCompletion: boolean
  signUp: (email: string, password: string, name: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  createGuestSession: () => Promise<void>
  convertGuestToUser: (email: string, password: string, name: string) => Promise<void>
  sendMagicURL: (email: string) => Promise<void>
  loginWithMagicURL: (userId: string, secret: string) => Promise<void>
  sendEmailOTP: (email: string) => Promise<{ userId: string }>
  loginWithEmailOTP: (userId: string, otp: string) => Promise<void>
  sendPhoneOTP: (phone: string) => Promise<{ userId: string }>
  loginWithPhoneOTP: (userId: string, otp: string) => Promise<void>
  signInWithGoogle: () => void
  signInWithGithub: () => void
  updateProfile: (data: Partial<User['profile']>) => Promise<void>
  completeProfile: (data: { username: string; displayName: string; email: string }) => Promise<void>
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

  const router = useRouter()
  const pathname = usePathname()

  // Computed properties
  const isGuest = Boolean(user && user.email === '' && !user.emailVerification)
  const needsProfileCompletion = Boolean(
    isAuthenticated && 
    user && 
    !isGuest &&
    (!user.profile || !user.profile.username || !user.profile.displayName)
  )

  useEffect(() => {
    checkUser()

    const handleOAuthRedirect = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const hashParams = new URLSearchParams(window.location.hash.substring(1))

      const hasOAuthRelatedParams = urlParams.has('code') || urlParams.has('state') || urlParams.has('userId') || urlParams.has('secret') ||
                                   hashParams.has('access_token') || hashParams.has('code') ||
                                   document.referrer.includes('accounts.google.com') ||
                                   document.referrer.includes('github.com')

      if (hasOAuthRelatedParams) {
        console.log('OAuth or token-based redirect params detected. Attempting to establish session and check user.')

        const currentPath = pathname
        const newUrlParams = new URLSearchParams(window.location.search)
        newUrlParams.delete('code')
        newUrlParams.delete('state')
        newUrlParams.delete('userId')
        newUrlParams.delete('secret')

        const newSearch = newUrlParams.toString()
        const newUrl = newSearch ? `${currentPath}?${newSearch}` : currentPath

        if (window.location.search !== (newSearch ? `?${newSearch}` : '')) {
          router.replace(newUrl, { shallow: true })
        }

        setTimeout(() => {
          console.log('Post-OAuth redirect: Calling checkUser after delay.')
          checkUser()
        }, 1800)
      }
    }

    handleOAuthRedirect()

    const fallbackTimer = setTimeout(() => {
      if (isLoading) {
        console.log("Fallback timer: Re-checking user status as still loading.")
        checkUser()
      }
    }, 4000)

    return () => {
      clearTimeout(fallbackTimer)
    }
  }, [pathname, router])

  const checkUser = async () => {
    console.log('checkUser called. Current isLoading state:', isLoading)
    if (!isLoading && user !== null) {
    }
    setIsLoading(true)

    try {
      const currentUser = await account.get()
      console.log('Appwrite account.get() successful:', currentUser)

      let userProfileData: User['profile'] | null = null
      let localProfileExistsAndComplete = false

      if (currentUser.email) {
        console.log('User has email, attempting to fetch/create local profile.')
        try {
          userProfileData = await getUserProfile(currentUser.$id)
          console.log('Fetched local profile:', userProfileData)
          if (userProfileData && userProfileData.username && userProfileData.displayName) {
            localProfileExistsAndComplete = true
            console.log('Local profile exists and is complete.')
          } else {
            console.log('Local profile incomplete or not found. Will attempt to create.')
          }
        } catch (profileError) {
          console.log('Error fetching local profile (likely does not exist):', profileError)
        }

        if (!localProfileExistsAndComplete) {
          console.log('Attempting to create user profile for OAuth user or incomplete profile.')
          try {
            await createUserProfile(currentUser.$id, currentUser.email, currentUser.name || currentUser.email.split('@')[0])
            console.log('Profile creation function called. Re-fetching profile.')
            userProfileData = await getUserProfile(currentUser.$id)
            if (userProfileData && userProfileData.username && userProfileData.displayName) {
              localProfileExistsAndComplete = true
              console.log('Local profile successfully created/updated and is now complete.')
            } else {
              console.log('Local profile still incomplete after creation attempt. User will need to complete it via form.')
            }
          } catch (creationError) {
            console.error('Failed to create/ensure user profile during checkUser:', creationError)
          }
        }
      } else {
        console.log('User is anonymous (no email from Appwrite account.get()), skipping local profile creation.')
      }

      const finalProfileData = userProfileData || {}
      const isActualUserWithEmail = Boolean(currentUser.email)
      const isAppwriteAnonymous = Boolean(currentUser.email === '' && !currentUser.emailVerification)

      const hasCompleteLocalProfile = Boolean(finalProfileData.username && finalProfileData.displayName)

      const userWithProfile: User = {
        ...currentUser,
        profile: finalProfileData,
        needsProfileCompletion: isActualUserWithEmail && !hasCompleteLocalProfile,
      }

      setUser(userWithProfile)
      setIsAuthenticated(true)

      console.log('User state set in checkUser:', {
        userId: userWithProfile.$id,
        email: userWithProfile.email,
        name: userWithProfile.name,
        profile: userWithProfile.profile,
        isAuthenticated: true,
        isGuest: isAppwriteAnonymous,
        needsProfileCompletion: userWithProfile.needsProfileCompletion,
      })

    } catch (error) {
      console.log('No active Appwrite session found (account.get() failed or other error in checkUser):', error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setIsLoading(false)
      console.log('checkUser finished. isLoading set to false.')
    }
  }

  const getUserProfile = async (userId: string): Promise<User['profile']> => {
    try {
      const profile = await DatabaseService.getUser(userId)
      return {
        username: profile.username,
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
      console.log(`Profile not found for ${userId}, user may need to complete setup or it's a new OAuth user.`)
      return {}
    }
  }

  const createUserProfile = async (userId: string, email: string, name: string) => {
    try {
      console.log('Creating user profile in DB for:', { userId, email, name })

      const displayName = name || email.split('@')[0]
      const username = email.split('@')[0]

      const userProfile = await DatabaseService.createUser({
        userId,
        email,
        username: username,
        displayName: displayName,
        kycStatus: 'pending',
        kycLevel: 0,
        twoFactorEnabled: false,
        isActive: true,
        preferredCurrency: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || 'USD',
      })

      console.log('User profile created/updated in DB successfully:', userProfile.$id)
      return userProfile
    } catch (error: any) {
      console.error('Failed to create user profile in DB:', error)
      if (error?.code === 409 || error?.type === 'document_already_exists') {
        console.log('User profile already exists in DB, attempting to update if necessary or continuing...')
        return null
      }
      throw error
    }
  }

  const signOut = async () => {
    try {
      await account.deleteSession('current')
      setUser(null)
      setIsAuthenticated(false)
      console.log('User signed out, redirecting to login or home might be handled by AuthGuard or page logic')
    } catch (error) {
      console.error('Sign out failed:', error)
      setUser(null)
      setIsAuthenticated(false)
      throw error
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    isGuest,
    needsProfileCompletion,
    signUp,
    signIn,
    signOut,
    createGuestSession,
    convertGuestToUser,
    sendMagicURL,
    loginWithMagicURL,
    sendEmailOTP,
    loginWithEmailOTP,
    sendPhoneOTP,
    loginWithPhoneOTP,
    signInWithGoogle,
    signInWithGithub,
    updateProfile,
    completeProfile,
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