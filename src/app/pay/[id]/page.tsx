'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useTransaction } from '@/contexts/TransactionContext'
import { usePaymentRequest } from '@/contexts/PaymentRequestContext'
import { DatabaseService, PaymentRequest } from '@/lib/database'
import { generatePaymentQR } from '@/lib/qr'
import { AppShell } from '@/components/AppShell'
import { FiCreditCard, FiCheck, FiAlertCircle, FiClock, FiUser, FiDollarSign } from 'react-icons/fi'

export default function PaymentPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { wallets } = useWallet()
  const { sendTransaction } = useTransaction()
  const { payPaymentRequest } = usePaymentRequest()
  
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedWalletId, setSelectedWalletId] = useState('')

  const requestId = params.id as string

  useEffect(() => {
    loadPaymentRequest()
  }, [requestId])

  const loadPaymentRequest = async () => {
    try {
      const request = await DatabaseService.getPaymentRequest(requestId)
      setPaymentRequest(request)
      
      // Generate QR code for the payment
      const qrUrl = await generatePaymentQR({
        requestId: request.requestId,
        amount: request.amount,
        tokenId: request.tokenId,
        description: request.description
      })
      setQrCodeUrl(qrUrl)
      
      // Auto-select a wallet if available
      if (wallets.length > 0) {
        const compatibleWallet = wallets.find(w => 
          getCompatibleTokens(w.blockchain).includes(request.tokenId)
        )
        if (compatibleWallet) {
          setSelectedWalletId(compatibleWallet.walletId)
        }
      }
    } catch (error) {
      setError('Payment request not found')
    } finally {
      setIsLoading(false)
    }
  }

  const getCompatibleTokens = (blockchain: string): string[] => {
    const tokens: Record<string, string[]> = {
      bitcoin: ['btc'],
      ethereum: ['eth', 'usdt', 'usdc'],
      polygon: ['matic', 'usdc'],
      bsc: ['bnb', 'usdt']
    }
    return tokens[blockchain] || []
  }

  const getCompatibleWallets = () => {
    if (!paymentRequest) return []
    return wallets.filter(wallet => 
      getCompatibleTokens(wallet.blockchain).includes(paymentRequest.tokenId)
    )
  }

  const handlePayment = async () => {
    if (!user || !paymentRequest || !selectedWalletId) return

    setIsProcessing(true)
    setError('')
    setSuccess('')

    try {
      // Create the transaction
      const transaction = await sendTransaction({
        toAddress: 'mock-payment-address', // In real app, get recipient address from user profile
        tokenId: paymentRequest.tokenId,
        amount: paymentRequest.amount,
        description: `Payment for ${paymentRequest.invoiceNumber}`,
        fromWalletId: selectedWalletId
      })

      // Mark payment request as paid
      await payPaymentRequest(paymentRequest.requestId, transaction.transactionId)

      setSuccess('Payment sent successfully!')
      
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/transactions')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to process payment')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTokenSymbol = (tokenId: string) => {
    const symbols: Record<string, string> = {
      btc: 'BTC',
      eth: 'ETH',
      matic: 'MATIC',
      bnb: 'BNB',
      usdt: 'USDT',
      usdc: 'USDC'
    }
    return symbols[tokenId] || tokenId.toUpperCase()
  }

  const isOverdue = () => {
    if (!paymentRequest?.dueDate) return false
    return new Date(paymentRequest.dueDate) < new Date()
  }

  const compatibleWallets = getCompatibleWallets()

  if (isLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500">Loading payment request...</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (error && !paymentRequest) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
            <div className="text-red-400 mb-4">
              <FiAlertCircle className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 mb-2">Payment Request Not Found</h3>
            <p className="text-neutral-500">{error}</p>
          </div>
        </div>
      </AppShell>
    )
  }

  if (!paymentRequest) return null

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Payment Request Details */}
        <div className="bg-white rounded-xl border border-neutral-200 p-8 mb-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">
              Payment Request
            </h1>
            <p className="text-neutral-600">
              Invoice #{paymentRequest.invoiceNumber}
            </p>
          </div>

          {/* Status */}
          <div className="flex justify-center mb-6">
            {paymentRequest.status === 'paid' ? (
              <span className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full">
                <FiCheck className="w-4 h-4 mr-2" />
                Paid
              </span>
            ) : paymentRequest.status === 'cancelled' ? (
              <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full">
                <FiAlertCircle className="w-4 h-4 mr-2" />
                Cancelled
              </span>
            ) : isOverdue() ? (
              <span className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-full">
                <FiClock className="w-4 h-4 mr-2" />
                Overdue
              </span>
            ) : (
              <span className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full">
                <FiClock className="w-4 h-4 mr-2" />
                Pending Payment
              </span>
            )}
          </div>

          {/* Amount */}
          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-neutral-900 mb-2">
              {paymentRequest.amount} {getTokenSymbol(paymentRequest.tokenId)}
            </div>
            {paymentRequest.description && (
              <p className="text-neutral-600">{paymentRequest.description}</p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <span className="text-neutral-600">Created</span>
              <span className="font-medium">{formatDate(paymentRequest.createdAt)}</span>
            </div>
            {paymentRequest.dueDate && (
              <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Due Date</span>
                <span className={`font-medium ${isOverdue() ? 'text-red-600' : ''}`}>
                  {formatDate(paymentRequest.dueDate)}
                </span>
              </div>
            )}
            {paymentRequest.toEmail && (
              <div className="flex items-center justify-between py-2 border-b border-neutral-100">
                <span className="text-neutral-600">Recipient</span>
                <span className="font-medium">{paymentRequest.toEmail}</span>
              </div>
            )}
          </div>

          {/* QR Code */}
          {qrCodeUrl && paymentRequest.status === 'pending' && (
            <div className="bg-neutral-50 rounded-lg p-6 mb-8 text-center">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                Scan to Pay
              </h3>
              <img 
                src={qrCodeUrl} 
                alt="Payment QR Code" 
                className="mx-auto mb-4 border border-neutral-200 rounded-lg"
                width={200}
                height={200}
              />
              <p className="text-sm text-neutral-600">
                Scan this QR code with your wallet app to pay
              </p>
            </div>
          )}

          {/* Payment Status Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FiAlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <FiCheck className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-green-700">{success}</span>
              </div>
            </div>
          )}

          {/* Payment Form */}
          {paymentRequest.status === 'pending' && user && (
            <div>
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                <FiCreditCard className="w-5 h-5 inline mr-2" />
                Pay with Your Wallet
              </h3>

              {compatibleWallets.length === 0 ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-700">
                    You don't have any wallets compatible with {getTokenSymbol(paymentRequest.tokenId)}. 
                    Please add a compatible wallet first.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Select Wallet
                    </label>
                    <select
                      value={selectedWalletId}
                      onChange={(e) => setSelectedWalletId(e.target.value)}
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      <option value="">Choose a wallet</option>
                      {compatibleWallets.map((wallet) => (
                        <option key={wallet.walletId} value={wallet.walletId}>
                          {wallet.walletName} ({wallet.blockchain}) - Balance: {wallet.balance}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handlePayment}
                    disabled={isProcessing || !selectedWalletId}
                    className="w-full px-4 py-3 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                  >
                    {isProcessing ? (
                      'Processing Payment...'
                    ) : (
                      <>
                        <FiDollarSign className="w-5 h-5 mr-2" />
                        Pay {paymentRequest.amount} {getTokenSymbol(paymentRequest.tokenId)}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Already Paid */}
          {paymentRequest.status === 'paid' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <FiCheck className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-green-900 mb-2">Payment Completed</h3>
              <p className="text-green-700">
                This payment request has been paid
                {paymentRequest.paidAt && ` on ${formatDate(paymentRequest.paidAt)}`}.
              </p>
            </div>
          )}

          {/* Not Logged In */}
          {!user && paymentRequest.status === 'pending' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <FiUser className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-blue-900 mb-2">Sign In to Pay</h3>
              <p className="text-blue-700 mb-4">
                You need to sign in to make a payment.
              </p>
              <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}