import { useState } from 'react'
import { PaymentRequest } from '@/lib/database'

interface BlessNetworkPayment {
  transactionId?: string
  escrowId?: string
  blessHash?: string
  networkFee?: string
  error?: string
}

interface UseBlessNetworkOptions {
  blessNetworkEndpoint?: string
  apiKey?: string
}

export function useBlessNetwork(options: UseBlessNetworkOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const blessEndpoint = options.blessNetworkEndpoint || process.env.NEXT_PUBLIC_BLESS_ENDPOINT || 'https://your-bless-function.blockless.network'

  /**
   * Process a Web2 payment request on Bless Network
   */
  const processOnBlessNetwork = async (
    paymentRequest: PaymentRequest,
    processOptions: {
      fromAddress: string
      toAddress: string
      useEscrow?: boolean
      freelancerData?: {
        freelancerAddress: string
        projectId: string
        milestones?: Array<{
          id: string
          description: string
          amount: string
          deadline: number
          deliverables: string[]
        }>
      }
    }
  ): Promise<BlessNetworkPayment> => {
    setIsProcessing(true)
    setError(null)

    try {
      const payload = {
        action: processOptions.useEscrow ? 'createFreelancerEscrow' : 'processPayment',
        data: processOptions.useEscrow ? {
          web2RequestId: paymentRequest.requestId,
          freelancerData: processOptions.freelancerData
        } : {
          requestId: paymentRequest.requestId,
          amount: paymentRequest.amount,
          tokenSymbol: mapTokenSymbol(paymentRequest.tokenId),
          fromAddress: processOptions.fromAddress,
          toAddress: processOptions.toAddress,
          description: paymentRequest.description,
          metadata: {
            web2PaymentId: paymentRequest.requestId,
            invoiceId: paymentRequest.invoiceNumber,
            web3LancerUserId: paymentRequest.fromUserId
          }
        }
      }

      const response = await fetch(blessEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.apiKey && { 'Authorization': `Bearer ${options.apiKey}` })
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`Bless Network error: ${response.statusText}`)
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Bless Network processing failed')
      }

      return {
        transactionId: result.transactionId,
        escrowId: result.escrowId,
        blessHash: result.blessHash,
        networkFee: result.networkFee
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Get Bless Network transaction status
   */
  const getBlessTransactionStatus = async (transactionId: string): Promise<{
    status: 'pending' | 'confirmed' | 'failed'
    confirmations: number
  }> => {
    try {
      const response = await fetch(blessEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.apiKey && { 'Authorization': `Bearer ${options.apiKey}` })
        },
        body: JSON.stringify({
          action: 'getPaymentStatus',
          data: { transactionId }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to get transaction status: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      console.error('Error getting Bless transaction status:', err)
      return { status: 'pending', confirmations: 0 }
    }
  }

  /**
   * Release escrow payment
   */
  const releaseEscrowPayment = async (escrowId: string, milestoneId?: string): Promise<void> => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch(blessEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.apiKey && { 'Authorization': `Bearer ${options.apiKey}` })
        },
        body: JSON.stringify({
          action: 'releaseFreelancerPayment',
          data: { escrowId, milestoneId }
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to release escrow: ${response.statusText}`)
      }

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to release escrow')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  /**
   * Create a wallet on Bless Network
   */
  const createBlessWallet = async (): Promise<{
    address: string
    publicKey: string
    mnemonic?: string
  }> => {
    setIsProcessing(true)
    setError(null)

    try {
      const response = await fetch(blessEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(options.apiKey && { 'Authorization': `Bearer ${options.apiKey}` })
        },
        body: JSON.stringify({
          action: 'createWallet',
          data: {}
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to create wallet: ${response.statusText}`)
      }

      return await response.json()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    processOnBlessNetwork,
    getBlessTransactionStatus,
    releaseEscrowPayment,
    createBlessWallet,
    isProcessing,
    error
  }
}

// Helper function to map token symbols
function mapTokenSymbol(tokenId: string): string {
  const mapping: Record<string, string> = {
    'btc': 'BTC',
    'eth': 'ETH',
    'usdc': 'USDC',
    'usdt': 'USDT',
    'bls': 'BLS'
  }
  return mapping[tokenId.toLowerCase()] || tokenId.toUpperCase()
}