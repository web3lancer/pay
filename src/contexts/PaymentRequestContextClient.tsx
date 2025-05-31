'use client';

import React, { createContext, useContext, useEffect, useState } from 'react'
import { DatabaseService, PaymentRequest } from '@/lib/database'
import { useAuth } from './AuthContext'

interface PaymentRequestContextType {
  paymentRequests: PaymentRequest[]
  isLoading: boolean
  createPaymentRequest: (requestData: {
    toEmail?: string
    tokenId: string
    amount: string
    description?: string
    dueDate?: string
  }) => Promise<PaymentRequest>
  payPaymentRequest: (requestId: string, transactionId: string) => Promise<void>
  cancelPaymentRequest: (requestId: string) => Promise<void>
  refreshPaymentRequests: () => Promise<void>
  getActiveRequests: () => PaymentRequest[]
  getPaidRequests: () => PaymentRequest[]
}

const PaymentRequestContext = createContext<PaymentRequestContextType | undefined>(undefined)

export function PaymentRequestProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const refreshPaymentRequests = async () => {
    if (!user) {
      setPaymentRequests([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    try {
      const requests = await DatabaseService.getUserPaymentRequests(user.$id)
      setPaymentRequests(requests)
    } catch (error) {
      console.error('Failed to fetch payment requests:', error)
      setPaymentRequests([])
    } finally {
      setIsLoading(false)
    }
  }

  const createPaymentRequest = async (requestData: {
    toEmail?: string
    tokenId: string
    amount: string
    description?: string
    dueDate?: string
  }): Promise<PaymentRequest> => {
    if (!user) throw new Error('User not authenticated')

    try {
      // Generate invoice number
      const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      
      // Set due date (default 7 days if not provided)
      const dueDate = requestData.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const newRequest = await DatabaseService.createPaymentRequest({
        fromUserId: user.$id,
        toEmail: requestData.toEmail,
        tokenId: requestData.tokenId,
        amount: requestData.amount,
        description: requestData.description,
        dueDate,
        status: 'pending',
        invoiceNumber
      })

      // Log security event
      await DatabaseService.createSecurityLog({
        userId: user.$id,
        action: 'payment_request_created',
        ipAddress: 'unknown',
        success: true,
        riskScore: 1,
        metadata: JSON.stringify({
          requestId: newRequest.requestId,
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
    try {
      await DatabaseService.updatePaymentRequest(requestId, {
        status: 'paid',
        paymentTxId: transactionId,
        paidAt: new Date().toISOString()
      })

      // Log security event
      await DatabaseService.createSecurityLog({
        userId: user!.$id,
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
    try {
      await DatabaseService.updatePaymentRequest(requestId, {
        status: 'cancelled'
      })

      // Log security event
      await DatabaseService.createSecurityLog({
        userId: user!.$id,
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

  const getActiveRequests = (): PaymentRequest[] => {
    return paymentRequests.filter(req => req.status === 'pending')
  }

  const getPaidRequests = (): PaymentRequest[] => {
    return paymentRequests.filter(req => req.status === 'paid')
  }

  useEffect(() => {
    refreshPaymentRequests()
  }, [user])

  return (
    <PaymentRequestContext.Provider value={{
      paymentRequests,
      isLoading,
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