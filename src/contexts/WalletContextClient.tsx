'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as appwrite from '@/lib/appwrite'
import { useAuth } from './AuthContext'
import { Wallets } from '@/types/appwrite.d'
import { Models } from 'appwrite'

interface WalletContextType {
  wallets: Wallets[]
  defaultWallet: Wallets | null
  isLoading: boolean
  error: Error | null
  createWallet: (walletData: {
    walletName: string
    walletType: 'hot' | 'cold' | 'hardware' | 'imported' | 'inbuilt' | 'external'
    blockchain: string
    walletAddress: string
    publicKey: string
    encryptedPrivateKey?: string
    derivationPath?: string
  }) => Promise<Wallets>
  updateWallet: (walletId: string, updates: Partial<Wallets>) => Promise<void>
  setDefaultWallet: (walletId: string) => Promise<void>
  refreshWallets: () => Promise<void>
  getWalletBalance: (walletId: string) => Promise<number>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const { account } = useAuth()
  const [wallets, setWallets] = useState<Wallets[]>([])
  const [defaultWallet, setDefaultWalletState] = useState<Wallets | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshWallets = useCallback(async () => {
    if (!account) {
      setWallets([])
      setDefaultWalletState(null)
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const userWalletsResponse = await appwrite.listWalletsByUser(account.$id)
      const userWallets = userWalletsResponse.documents as unknown as Wallets[]
      setWallets(userWallets)
      
      const defaultWal = userWallets.find(w => w.isDefault) || userWallets[0] || null
      setDefaultWalletState(defaultWal)
    } catch (err) {
      console.error('Failed to fetch wallets:', err)
      const fetchError = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(fetchError)
      setWallets([])
      setDefaultWalletState(null)
    } finally {
      setIsLoading(false)
    }
  }, [account])

  const createWallet = async (walletData: {
    walletName: string
    walletType: 'hot' | 'cold' | 'hardware' | 'imported' | 'inbuilt' | 'external'
    blockchain: string
    walletAddress: string
    publicKey: string
    encryptedPrivateKey?: string
    derivationPath?: string
  }): Promise<Wallets> => {
    if (!account) throw new Error('User not authenticated')

    try {
      const isFirstWallet = wallets.length === 0
      const newWalletData = {
          userId: account.$id,
          ...walletData,
          isDefault: isFirstWallet,
          isActive: true,
          balance: 0,
      }

      // The appwrite.ts createWallet is generic, so we can pass the data object.
      const newWallet = await appwrite.createWallet(newWalletData)

      // Log security event
      await appwrite.createSecurityLog({
        userId: account.$id,
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

  const updateWallet = async (walletId: string, updates: Partial<Wallets>) => {
    if (!account) throw new Error('User not authenticated')
    try {
      await appwrite.updateWallet(walletId, updates)
      
      if (updates.encryptedPrivateKey || updates.publicKey) {
        await appwrite.createSecurityLog({
          userId: account.$id,
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
    if (!account) throw new Error('User not authenticated')

    try {
      // Get all user wallets
      const userWalletsResponse = await appwrite.listWalletsByUser(account.$id)
      const userWallets = userWalletsResponse.documents

      // Create a batch of update promises
      const updatePromises = userWallets.map(wallet => {
        const isNewDefault = wallet.$id === walletId
        // Only update if the status is changing
        if (wallet.isDefault !== isNewDefault) {
          return appwrite.updateWallet(wallet.$id, { isDefault: isNewDefault })
        }
        return Promise.resolve() // No update needed
      })

      await Promise.all(updatePromises)
      
      await appwrite.createSecurityLog({
        userId: account.$id,
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
      const wallet = await appwrite.getWallet(walletId) as unknown as Wallets
      
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
  }, [refreshWallets])

  return (
    <WalletContext.Provider value={{
      wallets,
      defaultWallet,
      isLoading,
      error,
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