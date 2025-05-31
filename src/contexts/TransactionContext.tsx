import React, { createContext, useContext, useEffect, useState } from 'react'
import { DatabaseService, Transaction } from '@/lib/database'
import { useAuth } from './AuthContext'
import { useWallet } from './WalletContext'

interface TransactionContextType {
  transactions: Transaction[]
  isLoading: boolean
  sendTransaction: (transactionData: {
    toAddress: string
    tokenId: string
    amount: string
    description?: string
    fromWalletId: string
  }) => Promise<Transaction>
  refreshTransactions: () => Promise<void>
  getTransactionsByWallet: (walletId: string) => Transaction[]
  getTransactionsByType: (type: 'send' | 'receive' | 'swap' | 'stake') => Transaction[]
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined)

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const { wallets } = useWallet()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshTransactions = async () => {
    if (!user) {
      setTransactions([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const userTransactions = await DatabaseService.getUserTransactions(user.$id, 100)
      setTransactions(userTransactions)
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
      setTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  const sendTransaction = async (transactionData: {
    toAddress: string
    tokenId: string
    amount: string
    description?: string
    fromWalletId: string
  }): Promise<Transaction> => {
    if (!user) throw new Error('User not authenticated')

    const fromWallet = wallets.find(w => w.walletId === transactionData.fromWalletId)
    if (!fromWallet) throw new Error('Wallet not found')

    try {
      // Create transaction record
      const newTransaction = await DatabaseService.createTransaction({
        fromUserId: user.$id,
        fromWalletId: transactionData.fromWalletId,
        fromAddress: fromWallet.walletAddress,
        toAddress: transactionData.toAddress,
        tokenId: transactionData.tokenId,
        amount: transactionData.amount,
        feeAmount: '0.001', // Mock fee
        status: 'pending',
        type: 'send',
        description: transactionData.description,
        confirmations: 0
      })

      // Log security event
      await DatabaseService.createSecurityLog({
        userId: user.$id,
        action: 'transaction_created',
        ipAddress: 'unknown',
        success: true,
        riskScore: 2,
        metadata: JSON.stringify({
          transactionId: newTransaction.transactionId,
          amount: transactionData.amount,
          tokenId: transactionData.tokenId
        })
      })

      // Simulate blockchain processing
      setTimeout(async () => {
        try {
          // Mock transaction hash
          const txHash = '0x' + Math.random().toString(16).substring(2, 66)
          
          await DatabaseService.updateTransaction(newTransaction.transactionId, {
            status: 'confirmed',
            txHash,
            confirmations: 1,
            confirmedAt: new Date().toISOString()
          })

          // Log confirmation
          await DatabaseService.createSecurityLog({
            userId: user.$id,
            action: 'transaction_confirmed',
            ipAddress: 'unknown',
            success: true,
            riskScore: 0,
            metadata: JSON.stringify({
              transactionId: newTransaction.transactionId,
              txHash
            })
          })

          // Refresh transactions
          refreshTransactions()
        } catch (error) {
          console.error('Failed to confirm transaction:', error)
          await DatabaseService.updateTransaction(newTransaction.transactionId, {
            status: 'failed'
          })
        }
      }, 3000) // 3 second delay to simulate blockchain confirmation

      await refreshTransactions()
      return newTransaction
    } catch (error) {
      console.error('Failed to send transaction:', error)
      throw error
    }
  }

  const getTransactionsByWallet = (walletId: string): Transaction[] => {
    return transactions.filter(tx => 
      tx.fromWalletId === walletId || tx.toWalletId === walletId
    )
  }

  const getTransactionsByType = (type: 'send' | 'receive' | 'swap' | 'stake'): Transaction[] => {
    return transactions.filter(tx => tx.type === type)
  }

  useEffect(() => {
    refreshTransactions()
  }, [user])

  return (
    <TransactionContext.Provider value={{
      transactions,
      isLoading,
      sendTransaction,
      refreshTransactions,
      getTransactionsByWallet,
      getTransactionsByType
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