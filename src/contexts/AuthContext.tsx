'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { account } from '@/lib/appwrite'
import { Models } from 'appwrite'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (data: Partial<Models.User<Models.Preferences>>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check authentication status on mount and when the context loads
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      setIsLoading(true)
      // Use account.get() as recommended in Appwrite docs
      const currentUser = await account.get()
      setUser(currentUser)
      console.log('Auth check successful:', currentUser)
    } catch (error) {
      // If there's an error, user is not authenticated
      setUser(null)
      console.log('No active session:', error)
    } finally {
      setIsLoading(false)
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
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
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