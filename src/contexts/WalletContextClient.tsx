'use client';

import React, { createContext, useContext, useEffect, useState } from 'react'
import { DatabaseService, Wallet } from '@/lib/database'
import { useAuth } from './AuthContext'

interface WalletContextType {
  wallets: Wallet[]
  defaultWallet: Wallet | null
  isLoading: boolean
  createWallet: (walletData: {
    walletName: string
    walletType: 'hot' | 'cold' | 'hardware' | 'imported'
    blockchain: string
    walletAddress: string
    publicKey: string
    encryptedPrivateKey?: string
    derivationPath?: string
  }) => Promise<Wallet>
  updateWallet: (walletId: string, updates: Partial<Wallet>) => Promise<void>
  setDefaultWallet: (walletId: string) => Promise<void>
  refreshWallets: () => Promise<void>
  getWalletBalance: (walletId: string) => Promise<number>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [defaultWallet, setDefaultWalletState] = useState<Wallet | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshWallets = async () => {
    if (!user) {
      setWallets([])
      setDefaultWalletState(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const userWallets = await DatabaseService.getUserWallets(user.$id)
      setWallets(userWallets)
      
      const defaultWal = userWallets.find(w => w.isDefault) || userWallets[0] || null
      setDefaultWalletState(defaultWal)
    } catch (error) {
      console.error('Failed to fetch wallets:', error)
      setWallets([])
      setDefaultWalletState(null)
    } finally {
      setIsLoading(false)
    }
  }

  const createWallet = async (walletData: {
    walletName: string
    walletType: 'hot' | 'cold' | 'hardware' | 'imported'
    blockchain: string
    walletAddress: string
    publicKey: string
    encryptedPrivateKey?: string
    derivationPath?: string
  }): Promise<Wallet> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // If this is the first wallet, make it default
      const isFirstWallet = wallets.length === 0

      const newWallet = await DatabaseService.createWallet({
          userId: user.$id,
          ...walletData,
          isDefault: isFirstWallet,
          isActive: true,
          balance: 0,
          name: '',
          address: ''
      })

      // Log security event
      await DatabaseService.createSecurityLog({
        userId: user.$id,
        action: 'wallet_created',
        ipAddress: 'unknown',
        success: true,
        riskScore: 1,
        metadata: JSON.stringify({ 
          blockchain: walletData.blockchain, 
          walletType: walletData.walletType 
        })
      })

      await refreshWallets()
      return newWallet
    } catch (error) {
      console.error('Failed to create wallet:', error)
      throw error
    }
  }

  const updateWallet = async (walletId: string, updates: Partial<Wallet>) => {
    try {
      await DatabaseService.updateWallet(walletId, updates)
      
      // Log security event for sensitive updates
      if (updates.encryptedPrivateKey || updates.publicKey) {
        await DatabaseService.createSecurityLog({
          userId: user!.$id,
          action: 'wallet_keys_updated',
          ipAddress: 'unknown',
          success: true,
          riskScore: 2,
          metadata: JSON.stringify({ walletId })
        })
      }

      await refreshWallets()
    } catch (error) {
      console.error('Failed to update wallet:', error)
      throw error
    }
  }

  const setDefaultWallet = async (walletId: string) => {
    if (!user) throw new Error('User not authenticated')

    try {
      await DatabaseService.setDefaultWallet(user.$id, walletId)
      
      // Log security event
      await DatabaseService.createSecurityLog({
        userId: user.$id,
        action: 'default_wallet_changed',
        ipAddress: 'unknown',
        success: true,
        riskScore: 1,
        metadata: JSON.stringify({ walletId })
      })

      await refreshWallets()
    } catch (error) {
      console.error('Failed to set default wallet:', error)
      throw error
    }
  }

  const getWalletBalance = async (walletId: string): Promise<number> => {
    try {
      const wallet = await DatabaseService.getWallet(walletId)
      
      // In a real app, you'd fetch from blockchain here
      // For now, return the cached balance and update it
      
      // TODO: Implement actual blockchain balance fetching
      // const realBalance = await fetchBalanceFromBlockchain(wallet.walletAddress, wallet.blockchain)
      // await updateWallet(walletId, { balance: realBalance, lastSyncAt: new Date().toISOString() })
      
      return wallet.balance
    } catch (error) {
      console.error('Failed to get wallet balance:', error)
      return 0
    }
  }

  useEffect(() => {
    refreshWallets()
  }, [user])

  return (
    <WalletContext.Provider value={{
      wallets,
      defaultWallet,
      isLoading,
      createWallet,
      updateWallet,
      setDefaultWallet,
      refreshWallets,
      getWalletBalance
    }}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}