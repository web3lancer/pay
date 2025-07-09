'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useTransaction } from '@/contexts/TransactionContext'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { FiArrowLeft, FiSend, FiAlertCircle, FiCheck } from 'react-icons/fi'
import Link from 'next/link'
import dynamic from "next/dynamic"

const ZoraTradeWidget = dynamic(
  () => import('@/integrations/zora/ui/ZoraTradeWidget'),
  { ssr: false }
)

const integrationZora = process.env.NEXT_PUBLIC_INTEGRATION_ZORA === "true"

export default function SendPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { wallets, defaultWallet } = useWallet()
  const { sendTransaction } = useTransaction()
  const { calculateUsdValue, formatUsdValue } = useExchangeRate()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    fromWalletId: defaultWallet?.walletId || '',
    toAddress: '',
    amount: '',
    tokenId: 'btc',
    description: ''
  })

  const selectedWallet = wallets.find(w => w.walletId === formData.fromWalletId)

  // Calculate USD equivalent for amount preview
  const usdEquivalent = selectedWallet && formData.amount 
    ? calculateUsdValue(formData.amount, selectedWallet.blockchain)
    : 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !selectedWallet) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const transaction = await sendTransaction({
        toAddress: formData.toAddress,
        tokenId: formData.tokenId,
        amount: formData.amount,
        description: formData.description,
        fromWalletId: formData.fromWalletId,
        type: 'receive',
        status: 'pending',
        fromUserId: '',
        fromAddress: '',
        feeAmount: '',
        confirmations: 0
      })

      setSuccess(`Transaction created! ID: ${transaction.transactionId}`)
      
      // Reset form
      setFormData({
        fromWalletId: defaultWallet?.walletId || '',
        toAddress: '',
        amount: '',
        tokenId: 'btc',
        description: ''
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to send transaction')
    } finally {
      setIsLoading(false)
    }
  }

  const validateAddress = (address: string, blockchain: string) => {
    // Basic validation - in real app, use proper address validation
    if (!address) return false
    
    switch (blockchain) {
      case 'bitcoin':
        return address.startsWith('bc1') || address.startsWith('1') || address.startsWith('3')
      case 'ethereum':
      case 'polygon':
      case 'bsc':
        return address.startsWith('0x') && address.length === 42
      default:
        return false
    }
  }

  const isValidForm = () => {
    return (
      formData.fromWalletId &&
      formData.toAddress &&
      formData.amount &&
      parseFloat(formData.amount) > 0 &&
      selectedWallet &&
      validateAddress(formData.toAddress, selectedWallet.blockchain)
    )
  }

  const getTokenOptions = (blockchain: string) => {
    const tokens: Record<string, Array<{id: string, name: string, symbol: string}>> = {
      bitcoin: [{ id: 'btc', name: 'Bitcoin', symbol: 'BTC' }],
      ethereum: [
        { id: 'eth', name: 'Ethereum', symbol: 'ETH' },
        { id: 'usdt', name: 'Tether USD', symbol: 'USDT' },
        { id: 'usdc', name: 'USD Coin', symbol: 'USDC' }
      ],
      polygon: [
        { id: 'matic', name: 'Polygon', symbol: 'MATIC' },
        { id: 'usdc', name: 'USD Coin', symbol: 'USDC' }
      ],
      bsc: [
        { id: 'bnb', name: 'BNB', symbol: 'BNB' },
        { id: 'usdt', name: 'Tether USD', symbol: 'USDT' }
      ]
    }
    return tokens[blockchain] || []
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-2xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-neutral-900">Send Crypto</h1>
        <p className="text-neutral-600 mt-2">
          Send cryptocurrency to any wallet address
        </p>
      </div>

      {/* Status Messages */}
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* From Wallet */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            From Wallet
          </label>
          <select
            value={formData.fromWalletId}
            onChange={(e) => setFormData({ ...formData, fromWalletId: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
          >
            <option value="">Select wallet</option>
            {wallets.map((wallet) => (
              <option key={wallet.walletId} value={wallet.walletId}>
                {wallet.walletName} ({wallet.blockchain}) - Balance: {wallet.balance}
              </option>
            ))}
          </select>
          {selectedWallet && (
            <p className="text-sm text-neutral-500 mt-2">
              Address: {selectedWallet.walletAddress}
            </p>
          )}
        </div>

        {/* To Address */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            To Address
          </label>
          <input
            type="text"
            required
            value={formData.toAddress}
            onChange={(e) => setFormData({ ...formData, toAddress: e.target.value })}
            placeholder={selectedWallet ? `Enter ${selectedWallet.blockchain} address` : 'Enter wallet address'}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {formData.toAddress && selectedWallet && !validateAddress(formData.toAddress, selectedWallet.blockchain) && (
            <p className="text-sm text-red-500 mt-1">
              Invalid {selectedWallet.blockchain} address format
            </p>
          )}
        </div>

        {/* Token Selection */}
        {selectedWallet && (
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Token
            </label>
            <select
              value={formData.tokenId}
              onChange={(e) => setFormData({ ...formData, tokenId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            >
              {getTokenOptions(selectedWallet.blockchain).map((token) => (
                <option key={token.id} value={token.id}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Amount */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Amount
          </label>
          <input
            type="number"
            step="0.000001"
            min="0"
            required
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
          {selectedWallet && parseFloat(formData.amount) > selectedWallet.balance && (
            <p className="text-sm text-red-500 mt-1">
              Insufficient balance. Available: {selectedWallet.balance}
            </p>
          )}
          {usdEquivalent > 0 && (
            <p className="text-sm text-neutral-500 mt-1">
              Approx. USD Value: {formatUsdValue(usdEquivalent)}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl border border-neutral-200 p-6">
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Payment description"
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          />
        </div>

        {/* Submit */}
        <div className="flex space-x-4">
          <Link
            href="/"
            className="flex-1 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors text-center"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading || !isValidForm()}
            className="flex-1 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              'Sending...'
            ) : (
              <>
                <FiSend className="w-4 h-4 mr-2" />
                Send Transaction
              </>
            )}
          </button>
        </div>
      </form>
      {/* Zora Integration */}
      {integrationZora && (
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-2 text-cyan-700">Alternative: Send with Zora Coins</h2>
          <p className="text-sm text-gray-600 mb-4">
            Convert your payment to trending Zora coins for enhanced value and community engagement
          </p>
          <ZoraTradeWidget 
            context="send" 
            suggestedAmount={formData.amount}
            suggestedToken={formData.tokenId}
          />
        </div>
      )}
    </div>
  )
}