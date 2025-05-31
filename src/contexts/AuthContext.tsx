'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { account } from '@/lib/appwrite'
import { Models, OAuthProvider } from 'appwrite'

interface AuthContextType {
  user: Models.User<Models.Preferences> | null
  isAuthenticated: boolean
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  sendMagicURL: (email: string) => Promise<void>
  sendEmailOTP: (email: string) => Promise<{ userId: string }>
  sendPhoneOTP: (phone: string) => Promise<{ userId: string }>
  loginWithEmailOTP: (userId: string, otp: string) => Promise<void>
  loginWithMagicURL: (userId: string, secret: string) => Promise<void>
  loginWithPhoneOTP: (userId: string, otp: string) => Promise<void>
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
    
    // Check if we're returning from OAuth redirect
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') || urlParams.get('error')) {
      // We're returning from OAuth, check auth again after a brief delay
      setTimeout(() => {
        checkAuth()
        // Clean up URL parameters
        window.history.replaceState({}, document.title, window.location.pathname)
      }, 100)
    }
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
    isAuthenticated: !!user,
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