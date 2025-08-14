'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import {
  getAccount,
  getCurrentUserProfile,
  loginEmailPassword,
  signupEmailPassword,
  logout,
} from '@/lib/appwrite'
import type { Users } from '@/types/appwrite.d'

export type AuthContextType = {
  account: any | null
  userProfile: Users | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInWithGithub: () => Promise<void>
  sendMagicURL: (email: string) => Promise<void>
  loginWithMagicURL: (userId: string, secret: string) => Promise<void>
  sendEmailOTP: (email: string) => Promise<{ userId: string }>
  loginWithEmailOTP: (userId: string, otp: string) => Promise<void>
  sendPhoneOTP: (phone: string) => Promise<{ userId: string }>
  loginWithPhoneOTP: (userId: string, otp: string) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [account, setAccount] = useState<any | null>(null)
  const [userProfile, setUserProfile] = useState<Users | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const isAuthenticated = !!account

  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const login = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      await loginEmailPassword(email, password)
      await refreshProfile()
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (email: string, password: string, name: string) => {
    setIsLoading(true)
    try {
      await signupEmailPassword(email, password, name)
      await login(email, password)
    } finally {
      setIsLoading(false)
    }
  }

  const logoutHandler = async () => {
    setIsLoading(true)
    try {
      await logout()
      setAccount(null)
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshProfile = async () => {
    setIsLoading(true)
    try {
      const acc = await getAccount()
      setAccount(acc)
      const profile = await getCurrentUserProfile()
      setUserProfile(profile)
    } catch {
      setAccount(null)
      setUserProfile(null)
    } finally {
      setIsLoading(false)
    }
  }

  // --- OAuth2 Sign-In ---
  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const successUrl = window.location.origin + '/auth/login'
      const failureUrl = window.location.origin + '/auth/login?error=google'
      await import('appwrite').then(({ OAuthProvider }) =>
        import('@/lib/appwrite').then(({ account }) =>
          account.createOAuth2Session(OAuthProvider.Google, successUrl, failureUrl)
        )
      )
      // Appwrite will redirect, so no need to refresh profile here
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGithub = async () => {
    setIsLoading(true)
    try {
      const successUrl = window.location.origin + '/auth/login'
      const failureUrl = window.location.origin + '/auth/login?error=github'
      await import('appwrite').then(({ OAuthProvider }) =>
        import('@/lib/appwrite').then(({ account }) =>
          account.createOAuth2Session(OAuthProvider.Github, successUrl, failureUrl)
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  // --- Magic Link ---
  const sendMagicURL = async (email: string) => {
    setIsLoading(true)
    try {
      const redirectUrl = window.location.origin + '/auth/login'
      await import('@/lib/appwrite').then(({ sendMagicUrl }) =>
        sendMagicUrl(email, redirectUrl)
      )
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithMagicURL = async (userId: string, secret: string) => {
    setIsLoading(true)
    try {
      await import('@/lib/appwrite').then(({ completeMagicUrlLogin }) =>
        completeMagicUrlLogin(userId, secret)
      )
      await refreshProfile()
    } finally {
      setIsLoading(false)
    }
  }

  // --- Email OTP ---
  const sendEmailOTP = async (email: string) => {
    setIsLoading(true)
    try {
      const res = await import('@/lib/appwrite').then(({ sendEmailOtp }) =>
        sendEmailOtp(email)
      )
      return { userId: res.userId }
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithEmailOTP = async (userId: string, otp: string) => {
    setIsLoading(true)
    try {
      await import('@/lib/appwrite').then(({ completeEmailOtpLogin }) =>
        completeEmailOtpLogin(userId, otp)
      )
      await refreshProfile()
    } finally {
      setIsLoading(false)
    }
  }

  // --- Phone OTP ---
  const sendPhoneOTP = async (phone: string) => {
    setIsLoading(true)
    try {
      const res = await import('@/lib/appwrite').then(({ account, ID }) =>
        account.createPhoneToken(ID.unique(), phone)
      )
      return { userId: res.userId }
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithPhoneOTP = async (userId: string, otp: string) => {
    setIsLoading(true)
    try {
      await import('@/lib/appwrite').then(({ account }) =>
        account.createSession(userId, otp)
      )
      await refreshProfile()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      account,
      userProfile,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout: logoutHandler,
      refreshProfile,
      signInWithGoogle,
      signInWithGithub,
      sendMagicURL,
      loginWithMagicURL,
      sendEmailOTP,
      loginWithEmailOTP,
      sendPhoneOTP,
      loginWithPhoneOTP,
    }}>
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