/**
 * External Authentication Context
 * Redirects users to external auth service for login/logout
 */

'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'

interface AuthContextType {
  isAuthenticated: boolean
  loading: boolean
  redirectToAuth: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check if user has auth token/cookie from external auth service
  useEffect(() => {
    // Simple check: if there's any authentication cookie from the auth service
    // You can enhance this based on how your auth service sets cookies
    const checkAuth = () => {
      try {
        // Check for auth token in localStorage or cookies
        const hasAuthToken = localStorage.getItem('auth_token') || 
                            document.cookie.includes('auth_token')
        setIsAuthenticated(!!hasAuthToken)
      } catch (error) {
        console.error('Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()

    // Re-check auth when window gains focus (user returns from auth service)
    const handleFocus = () => {
      checkAuth()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

  const redirectToAuth = useCallback(() => {
    const authUri = process.env.NEXT_PUBLIC_AUTH_URI
    if (!authUri) {
      console.error('NEXT_PUBLIC_AUTH_URI not configured')
      return
    }

    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const loginUrl = `${authUri}/login?source=${encodeURIComponent(currentOrigin)}`
    window.location.href = loginUrl
  }, [])

  const logout = useCallback(() => {
    const authUri = process.env.NEXT_PUBLIC_AUTH_URI
    if (!authUri) {
      console.error('NEXT_PUBLIC_AUTH_URI not configured')
      return
    }

    // Clear local auth state
    localStorage.removeItem('auth_token')
    
    // Redirect to auth logout
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
    const logoutUrl = `${authUri}/logout?redirect=${encodeURIComponent(currentOrigin)}`
    window.location.href = logoutUrl
  }, [])

  const value: AuthContextType = {
    isAuthenticated,
    loading,
    redirectToAuth,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

