'use client';

import { createContext, useEffect, useState } from "react";
import { Models } from 'appwrite'
import { DatabaseService, UserProfile } from '@/lib/database'
import { account } from "@/lib/appwrite";


interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  userProfile: UserProfile | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Generate username from email
  const generateUsername = (email: string): string => {
    return email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
  }

  // Create or get user profile
  const createOrGetProfile = async (authUser: Models.User<Models.Preferences>) => {
    try {
      // Try to get existing profile
      let profile = await DatabaseService.getUser(authUser.$id)
      if (profile) {
        setUserProfile(profile)
        return profile
      }
    } catch (error) {
      // Profile doesn't exist, create new one
      console.log('Creating new user profile...')
    }

    try {
      // Create new profile
      const username = generateUsername(authUser.email)
      const profileData = {
        userId: authUser.$id,
        email: authUser.email,
        username,
        displayName: authUser.name || username,
        kycStatus: 'pending' as const,
        kycLevel: 0,
        twoFactorEnabled: false,
        isActive: true,
        preferredCurrency: 'USD'
      }

      const newProfile = await DatabaseService.createUser(profileData)
      setUserProfile(newProfile)

      // Log security event
      await DatabaseService.createSecurityLog({
        userId: authUser.$id,
        action: 'profile_created',
        ipAddress: 'unknown', // Would get from request in real app
        success: true,
        riskScore: 0
      })

      return newProfile
    } catch (error) {
      console.error('Failed to create user profile:', error)
      throw error
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    
    try {
      const profile = await DatabaseService.getUser(user.$id)
      setUserProfile(profile)
    } catch (error) {
      console.error('Failed to refresh profile:', error)
    }
  }

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await account.createEmailPasswordSession(email, password)
      const authUser = await account.get()
      setUser(authUser)
      
      // Create or get profile
      await createOrGetProfile(authUser)

      // Log successful login
      await DatabaseService.createSecurityLog({
        userId: authUser.$id,
        action: 'login_success',
        ipAddress: 'unknown',
        success: true,
        riskScore: 0
      })
    } catch (error: any) {
      // Log failed login attempt
      if (email) {
        try {
          const existingUser = await DatabaseService.getUserByEmail(email)
          if (existingUser) {
            await DatabaseService.createSecurityLog({
              userId: existingUser.userId,
              action: 'login_failed',
              ipAddress: 'unknown',
              success: false,
              riskScore: 3
            })
          }
        } catch (dbError) {
          console.error('Failed to log security event:', dbError)
        }
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      const authUser = await account.create('unique()', email, password, name)
      await account.createEmailPasswordSession(email, password)
      const user = await account.get()
      setUser(user)
      
      // Create profile
      await createOrGetProfile(user)
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (user) {
        // Log logout
        await DatabaseService.createSecurityLog({
          userId: user.$id,
          action: 'logout',
          ipAddress: 'unknown',
          success: true,
          riskScore: 0
        })
      }
      
      await account.deleteSession('current')
      setUser(null)
      setUserProfile(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const authUser = await account.get()
        setUser(authUser)
        
        // Get or create profile
        await createOrGetProfile(authUser)
      } catch (error) {
        setUser(null)
        setUserProfile(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      isLoading,
      login,
      register,
      logout,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  )
}

// const AuthContext = createContext<AuthContextType | undefined>(undefined)
// export the AuthContext itself, not the useAuth


// export AuthContext