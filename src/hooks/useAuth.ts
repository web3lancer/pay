'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Client, Account, Avatars, ID, Models, OAuthProvider } from 'appwrite'

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

const account = new Account(client)
const avatars = new Avatars(client)

// Types
interface User extends Models.User<{}> {}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string) => Promise<void>
  signOut: () => Promise<void>
  sendMagicURL: (email: string, url?: string) => Promise<{ userId: string }>
  loginWithMagicURL: (userId: string, secret: string) => Promise<void>
  sendEmailOTP: (email: string) => Promise<{ userId: string }>
  loginWithEmailOTP: (userId: string, otp: string) => Promise<void>
  sendPhoneOTP: (phone: string) => Promise<{ userId: string }>
  loginWithPhoneOTP: (userId: string, otp: string) => Promise<void>
  signInWithGoogle: () => void
  signInWithGithub: () => void
  updateEmail: (email: string, password: string) => Promise<void>
  updatePassword: (password: string, oldPassword: string) => Promise<void>
  createVerification: (url: string) => Promise<void>
  updateVerification: (userId: string, secret: string) => Promise<void>
  createPasswordRecovery: (email: string, url: string) => Promise<void>
  updatePasswordRecovery: (userId: string, secret: string, password: string) => Promise<void>
  // MFA methods
  createMfaRecoveryCodes: () => Promise<{ recoveryCodes: string[] }>
  updateMFA: (enabled: boolean) => Promise<void>
  listMfaFactors: () => Promise<{ totp: boolean; email: boolean; phone: boolean }>
  createMfaChallenge: (factor: string) => Promise<{ $id: string }>
  updateMfaChallenge: (challengeId: string, otp: string) => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password)
      const currentUser = await account.get()
      setUser(currentUser)
    } catch (error: any) {
      // Check if MFA is required
      if (error.type === 'user_more_factors_required') {
        throw new Error('Multi-factor authentication required')
      }
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string) => {
    await account.create(ID.unique(), email, password, name)
    await signIn(email, password)
  }

  const signOut = async () => {
    await account.deleteSession('current')
    setUser(null)
  }

  const sendMagicURL = async (email: string, url?: string) => {
    const redirectUrl = url || `${window.location.origin}/auth/login`
    const response = await account.createMagicURLToken(ID.unique(), email, redirectUrl)
    return { userId: response.userId }
  }

  const loginWithMagicURL = async (userId: string, secret: string) => {
    await account.createSession(userId, secret)
    const currentUser = await account.get()
    setUser(currentUser)
  }

  const sendEmailOTP = async (email: string) => {
    const response = await account.createEmailToken(ID.unique(), email)
    return { userId: response.userId }
  }

  const loginWithEmailOTP = async (userId: string, otp: string) => {
    await account.createSession(userId, otp)
    const currentUser = await account.get()
    setUser(currentUser)
  }

  const sendPhoneOTP = async (phone: string) => {
    const response = await account.createPhoneToken(ID.unique(), phone)
    return { userId: response.userId }
  }

  const loginWithPhoneOTP = async (userId: string, otp: string) => {
    await account.createSession(userId, otp)
    const currentUser = await account.get()
    setUser(currentUser)
  }

  const signInWithGoogle = () => {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}`,
      `${window.location.origin}/auth/login`
    )
  }

  const signInWithGithub = () => {
    account.createOAuth2Session(
      OAuthProvider.Github,
      `${window.location.origin}`,
      `${window.location.origin}/auth/login`
    )
  }

  const updateEmail = async (email: string, password: string) => {
    await account.updateEmail(email, password)
    const currentUser = await account.get()
    setUser(currentUser)
  }

  const updatePassword = async (password: string, oldPassword: string) => {
    await account.updatePassword(password, oldPassword)
  }

  const createVerification = async (url: string) => {
    await account.createVerification(url)
  }

  const updateVerification = async (userId: string, secret: string) => {
    await account.updateVerification(userId, secret)
  }

  const createPasswordRecovery = async (email: string, url: string) => {
    await account.createRecovery(email, url)
  }

  const updatePasswordRecovery = async (userId: string, secret: string, password: string) => {
    await account.updateRecovery(userId, secret, password)
  }

  // MFA Methods
  const createMfaRecoveryCodes = async () => {
    const response = await account.createMfaRecoveryCodes()
    return { recoveryCodes: response.recoveryCodes }
  }

  const updateMFA = async (enabled: boolean) => {
    await account.updateMFA(enabled)
  }

  const listMfaFactors = async () => {
    return await account.listMfaFactors()
  }

  const createMfaChallenge = async (factor: string) => {
    return await account.createMfaChallenge(factor)
  }

  const updateMfaChallenge = async (challengeId: string, otp: string) => {
    await account.updateMfaChallenge(challengeId, otp)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    sendMagicURL,
    loginWithMagicURL,
    sendEmailOTP,
    loginWithEmailOTP,
    sendPhoneOTP,
    loginWithPhoneOTP,
    signInWithGoogle,
    signInWithGithub,
    updateEmail,
    updatePassword,
    createVerification,
    updateVerification,
    createPasswordRecovery,
    updatePasswordRecovery,
    createMfaRecoveryCodes,
    updateMFA,
    listMfaFactors,
    createMfaChallenge,
    updateMfaChallenge,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}