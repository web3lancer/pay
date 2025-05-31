'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { usePaymentRequest } from '@/contexts/PaymentRequestContext'
import { AppShell } from '@/components/AppShell'
import { FiArrowLeft, FiQrCode, FiMail, FiCalendar, FiDollarSign, FiAlertCircle, FiCheck } from 'react-icons/fi'
import Link from 'next/link'

export default function CreateRequestPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { createPaymentRequest } = usePaymentRequest()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    toEmail: '',
    tokenId: 'btc',
    amount: '',
    description: '',
    dueDate: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setError('')
    setSuccess('')

    try {
      const request = await createPaymentRequest(formData)
      setSuccess(`Payment request created! Invoice: ${request.invoiceNumber}`)
      
      // Reset form
      setFormData({
        toEmail: '',
        tokenId: 'btc',
        amount: '',
        description: '',
        dueDate: ''
      })

      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/requests')
      }, 3000)
    } catch (error: any) {
      setError(error.message || 'Failed to create payment request')
    } finally {
      setIsLoading(false)
    }
  }

  const isValidForm = () => {
    return (
      formData.amount &&
      parseFloat(formData.amount) > 0
    )
  }

  const tokenOptions = [
    { id: 'btc', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'eth', name: 'Ethereum', symbol: 'ETH' },
    { id: 'matic', name: 'Polygon', symbol: 'MATIC' },
    { id: 'bnb', name: 'BNB', symbol: 'BNB' },
    { id: 'usdt', name: 'Tether USD', symbol: 'USDT' },
    { id: 'usdc', name: 'USD Coin', symbol: 'USDC' }
  ]

  // Set default due date to 7 days from now
  const getDefaultDueDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 7)
    return date.toISOString().split('T')[0]
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/requests"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Payment Requests
          </Link>
          <h1 className="text-3xl font-bold text-neutral-900">Create Payment Request</h1>
          <p className="text-neutral-600 mt-2">
            Generate an invoice and request payment from someone
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
          {/* Recipient Email */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <FiMail className="w-4 h-4 inline mr-2" />
              Recipient Email (Optional)
            </label>
            <input
              type="email"
              value={formData.toEmail}
              onChange={(e) => setFormData({ ...formData, toEmail: e.target.value })}
              placeholder="recipient@example.com"
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-sm text-neutral-500 mt-2">
              If provided, we'll send the payment request link to this email
            </p>
          </div>

          {/* Token Selection */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <FiDollarSign className="w-4 h-4 inline mr-2" />
              Token
            </label>
            <select
              value={formData.tokenId}
              onChange={(e) => setFormData({ ...formData, tokenId: e.target.value })}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              required
            >
              {tokenOptions.map((token) => (
                <option key={token.id} value={token.id}>
                  {token.name} ({token.symbol})
                </option>
              ))}
            </select>
          </div>

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
            <p className="text-sm text-neutral-500 mt-2">
              The amount you want to request
            </p>
          </div>

          {/* Description */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What is this payment for?"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-sm text-neutral-500 mt-2">
              Describe what this payment is for
            </p>
          </div>

          {/* Due Date */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              <FiCalendar className="w-4 h-4 inline mr-2" />
              Due Date (Optional)
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            />
            <p className="text-sm text-neutral-500 mt-2">
              When should this payment be made? Default is 7 days from now
            </p>
          </div>

          {/* Preview */}
          {isValidForm() && (
            <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-6">
              <h3 className="font-medium text-cyan-900 mb-3">
                <FiQrCode className="w-4 h-4 inline mr-2" />
                Payment Request Preview
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-cyan-700">Amount:</span>
                  <span className="font-medium text-cyan-900">
                    {formData.amount} {tokenOptions.find(t => t.id === formData.tokenId)?.symbol}
                  </span>
                </div>
                {formData.description && (
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Description:</span>
                    <span className="font-medium text-cyan-900">{formData.description}</span>
                  </div>
                )}
                {formData.toEmail && (
                  <div className="flex justify-between">
                    <span className="text-cyan-700">Recipient:</span>
                    <span className="font-medium text-cyan-900">{formData.toEmail}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-cyan-700">Due Date:</span>
                  <span className="font-medium text-cyan-900">
                    {formData.dueDate || getDefaultDueDate()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex space-x-4">
            <Link
              href="/requests"
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
                'Creating...'
              ) : (
                <>
                  <FiQrCode className="w-4 h-4 mr-2" />
                  Create Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  )
}