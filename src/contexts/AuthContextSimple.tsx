'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { account } from '@/lib/appwrite/client'

interface UserProfile {
  userId?: string
  $id?: string
  email?: string
  name?: string
  [key: string]: any
}

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  user?: UserProfile
  account?: any
  isLoading?: boolean
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<UserProfile | undefined>()

  useEffect(() => {
    account.get()
      .then((acc) => {
        setIsAuthenticated(true)
        setUser({ userId: acc.$id, $id: acc.$id, email: acc.email, name: acc.name, ...acc })
      })
      .catch(() => {
        setIsAuthenticated(false)
        setUser(undefined)
      })
      .finally(() => setLoading(false))
  }, [])

  const logout = useCallback(async () => {
    try {
      await account.deleteSession('current')
      setIsAuthenticated(false)
      setUser(undefined)
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      loading,
      isLoading: loading,
      user,
      account: user,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
