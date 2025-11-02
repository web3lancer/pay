'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import * as appwrite from '@/lib/appwrite'
import { useAuth } from './AuthContext'
import { PaymentRequests } from '@/types/appwrite.d'
import { Models } from 'appwrite'

interface PaymentRequestContextType {
  paymentRequests: PaymentRequests[]
  isLoading: boolean
  error: Error | null
  createPaymentRequest: (requestData: {
    toEmail?: string
    tokenId: string
    amount: string
    description?: string
    dueDate?: string
  }) => Promise<Models.Document>
  payPaymentRequest: (requestId: string, transactionId: string) => Promise<void>
  cancelPaymentRequest: (requestId: string) => Promise<void>
  refreshPaymentRequests: () => Promise<void>
  getActiveRequests: () => PaymentRequests[]
  getPaidRequests: () => PaymentRequests[]
}

const PaymentRequestContext = createContext<PaymentRequestContextType | undefined>(undefined)

export function PaymentRequestProvider({ children }: { children: React.ReactNode }) {
  const { account, isAuthenticated } = useAuth()
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequests[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const refreshPaymentRequests = useCallback(async () => {
    if (!account) {
      setPaymentRequests([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const response = await appwrite.listPaymentRequestsByUser(account.$id)
      setPaymentRequests(response.documents as unknown as PaymentRequests[])
    } catch (err) {
      console.error('Failed to fetch payment requests:', err)
      const fetchError = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(fetchError)
      setPaymentRequests([])
    } finally {
      setIsLoading(false)
    }
  }, [account])

  const createPaymentRequest = async (requestData: {
    toEmail?: string
    tokenId: string
    amount: string
    description?: string
    dueDate?: string
  }): Promise<Models.Document> => {
    if (!account) throw new Error('User not authenticated')

    try {
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      const dueDate = requestData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const newRequestData = {
        fromUserId: account.$id,
        toEmail: requestData.toEmail,
        tokenId: requestData.tokenId,
        amount: requestData.amount,
        description: requestData.description,
        dueDate,
        status: 'pending',
        invoiceNumber
      }

      const newRequest = await appwrite.createPaymentRequest(newRequestData)

      await appwrite.createSecurityLog({
        userId: account.$id,
        action: 'payment_request_created',
        ipAddress: 'unknown',
        success: true,
        riskScore: 1,
        metadata: JSON.stringify({
          requestId: newRequest.$id,
          amount: requestData.amount,
          tokenId: requestData.tokenId,
          invoiceNumber
        })
      })

      await refreshPaymentRequests()
      return newRequest
    } catch (error) {
      console.error('Failed to create payment request:', error)
      throw error
    }
  }

  const payPaymentRequest = async (requestId: string, transactionId: string): Promise<void> => {
    if (!account) throw new Error('User not authenticated')
    try {
      await appwrite.markPaymentRequestPaid(requestId, transactionId)

      await appwrite.createSecurityLog({
        userId: account.$id,
        action: 'payment_request_paid',
        ipAddress: 'unknown',
        success: true,
        riskScore: 0,
        metadata: JSON.stringify({
          requestId,
          transactionId
        })
      })

      await refreshPaymentRequests()
    } catch (error) {
      console.error('Failed to pay payment request:', error)
      throw error
    }
  }

  const cancelPaymentRequest = async (requestId: string): Promise<void> => {
    if (!account) throw new Error('User not authenticated')
    try {
      await appwrite.cancelPaymentRequest(requestId)

      await appwrite.createSecurityLog({
        userId: account.$id,
        action: 'payment_request_cancelled',
        ipAddress: 'unknown',
        success: true,
        riskScore: 0,
        metadata: JSON.stringify({ requestId })
      })

      await refreshPaymentRequests()
    } catch (error) {
      console.error('Failed to cancel payment request:', error)
      throw error
    }
  }

  const getActiveRequests = (): PaymentRequests[] => {
    return (paymentRequests || []).filter(req => req.status === 'pending')
  }

  const getPaidRequests = (): PaymentRequests[] => {
    return (paymentRequests || []).filter(req => req.status === 'paid')
  }

  useEffect(() => {
    if (isAuthenticated) {
      refreshPaymentRequests()
    }
  }, [isAuthenticated])

  return (
    <PaymentRequestContext.Provider value={{
      paymentRequests,
      isLoading,
      error,
      createPaymentRequest,
      payPaymentRequest,
      cancelPaymentRequest,
      refreshPaymentRequests,
      getActiveRequests,
      getPaidRequests
    }}>
      {children}
    </PaymentRequestContext.Provider>
  )
}

export function usePaymentRequest() {
  const context = useContext(PaymentRequestContext)
  if (context === undefined) {
    throw new Error('usePaymentRequest must be used within a PaymentRequestProvider')
  }
  return context
}