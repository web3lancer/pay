'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { DatabaseService, Transaction } from '@/lib/database'

interface TransactionContextType {
  transactions: Transaction[]
  isLoading: boolean
  sendTransaction: (transaction: Omit<Transaction, 'transactionId' | 'createdAt'>) => Promise<string>
  getTransactionsByWallet: (walletId: string) => Transaction[]
  refreshTransactions: () => Promise<void>
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadTransactions = async () => {
    setIsLoading(true)
    try {
      const userTransactions = await DatabaseService.getUserTransactions('current-user-id')
      setTransactions(userTransactions)
    } catch (error) {
      console.error('Failed to load transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendTransaction = async (
    transactionData: Omit<Transaction, 'transactionId' | 'createdAt'>
  ): Promise<string> => {
    try {
      const transaction = await DatabaseService.createTransaction(transactionData)

      // Refresh transactions to show the new one
      await loadTransactions()
      
      return transaction.transactionId
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw error
    }
  }

  const getTransactionsByWallet = (walletId: string): Transaction[] => {
    return transactions.filter(tx => tx.fromWalletId === walletId || tx.toAddress === walletId)
  }

  const refreshTransactions = async () => {
    await loadTransactions()
  }

  useEffect(() => {
    loadTransactions()
  }, [])

  return (
    <TransactionContext.Provider value={{
      transactions,
      isLoading,
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