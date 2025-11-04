'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { account } from '@/lib/appwrite/client'

interface UserWalletPrefs {
  walletEth?: string
}

interface WalletContextType {
  userWallet: string | null
  loading: boolean
  error: string | null
  refreshUserWallet: () => Promise<void>
  openWalletManager: () => void
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [userWallet, setUserWallet] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshUserWallet = useCallback(async () => {
    if (!isAuthenticated || !user?.userId) {
      setUserWallet(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const appwriteAccount = await account.get()
      const prefs = (appwriteAccount.prefs || {}) as UserWalletPrefs
      const wallet = prefs.walletEth || null
      setUserWallet(wallet)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load wallet preference'
      setError(message)
      setUserWallet(null)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user?.userId])

  useEffect(() => {
    refreshUserWallet()
  }, [refreshUserWallet])

  const openWalletManager = useCallback(() => {
    const source = typeof window !== 'undefined' 
      ? window.location.href
      : 'https://pay.web3lancer.website'
    const authSubdomain = process.env.NEXT_PUBLIC_AUTH_SUBDOMAIN || 'accounts'
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'web3lancer.website'
    const walletManagerUrl = `https://${authSubdomain}.${appDomain}/settings?source=${encodeURIComponent(source)}`
    window.open(walletManagerUrl, '_blank', 'noopener,noreferrer')
  }, [])

  const value: WalletContextType = {
    userWallet,
    loading,
    error,
    refreshUserWallet,
    openWalletManager
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useUserWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useUserWallet must be used within WalletProvider')
  }
  return context
}
