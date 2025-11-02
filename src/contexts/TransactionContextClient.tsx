'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import * as appwrite from '@/lib/appwrite'
import { useAuth } from './AuthContext'
import { Transactions } from '@/types/appwrite.d'
import { Models } from 'appwrite'

interface TransactionContextType {
  transactions: Transactions[]
  isLoading: boolean
  error: Error | null
  sendTransaction: (transaction: Omit<Transactions, '$id' | '$collectionId' | '$databaseId' | '$createdAt' | '$updatedAt' | '$permissions'>) => Promise<Models.Document>
  getTransactionsByWallet: (walletId: string) => Transactions[]
  refreshTransactions: () => Promise<void>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { account, isAuthenticated } = useAuth()
  const [transactions, setTransactions] = useState<Transactions[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const refreshTransactions = useCallback(async () => {
    if (!account) {
      setTransactions([])
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const response = await appwrite.listTransactionsByUser(account.$id)
      setTransactions(response.documents as unknown as Transactions[])
    } catch (err) {
      console.error('Failed to load transactions:', err)
      const fetchError = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(fetchError)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }, [account])

  const sendTransaction = async (
    transactionData: Omit<Transactions, '$id' | '$collectionId' | '$databaseId' | '$createdAt' | '$updatedAt' | '$permissions'>
  ): Promise<Models.Document> => {
    if (!account) throw new Error('User is not authenticated')
    try {
      const newTransactionData = {
        ...transactionData,
        fromUserId: account.$id,
      }
      const transaction = await appwrite.createTransaction(newTransactionData)
      await refreshTransactions()
      return transaction
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw error
    }
  }

  const getTransactionsByWallet = (walletId: string): Transactions[] => {
    return (transactions || []).filter(tx => tx.fromWalletId === walletId || tx.toWalletId === walletId)
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshTransactions()
    }
  }, [isAuthenticated])

  return (
    <TransactionContext.Provider value={{
      transactions,
      isLoading,
      error,
      sendTransaction,
      getTransactionsByWallet,
      refreshTransactions
    }}>
      {children}
    </TransactionContext.Provider>
  )
}

export function useTransaction() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error('useTransaction must be used within a TransactionProvider')
  }
  return context
}