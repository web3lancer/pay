'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import {
  getAccount,
  getCurrentUserProfile,
  logout,
} from '@/lib/appwrite'
import type { Users } from '@/types/appwrite.d'

export type AuthContextType = {
  account: any | null
  userProfile: Users | null
  isAuthenticated: boolean
  isLoading: boolean
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
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

  return (
    <AuthContext.Provider value={{
      account,
      userProfile,
      isAuthenticated,
      isLoading,
      logout: logoutHandler,
      refreshProfile,
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