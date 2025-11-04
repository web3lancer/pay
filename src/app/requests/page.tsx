'use client'

import {
  useEffect,
  useState,
} from 'react';

import Link from 'next/link';
import {
  FiArrowLeft,
  FiCheck,
  FiCode,
  FiCopy,
  FiExternalLink,
  FiFilter,
  FiMail,
  FiPlus,
  FiX,
} from 'react-icons/fi';

import { usePaymentRequest } from '@/contexts/PaymentRequestContext';

export default function PaymentRequestsPage() {
  const { paymentRequests, isLoading, cancelPaymentRequest } = usePaymentRequest()
  const [filteredRequests, setFilteredRequests] = useState(paymentRequests)
  const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled' | 'overdue'>('all')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    filterRequests()
  }, [paymentRequests, filter])

  const filterRequests = () => {
    let filtered = paymentRequests

    switch (filter) {
      case 'pending':
        filtered = paymentRequests.filter(req => req.status === 'pending')
        break
      case 'paid':
        filtered = paymentRequests.filter(req => req.status === 'paid')
        break
      case 'cancelled':
        filtered = paymentRequests.filter(req => req.status === 'cancelled')
        break
      case 'overdue':
        const now = new Date()
        filtered = paymentRequests.filter(req => 
          req.status === 'pending' && req.dueDate && new Date(req.dueDate) < now
        )
        break
      default:
        filtered = paymentRequests
    }

    setFilteredRequests(filtered)
  }

  const handleCopyLink = (requestId: string) => {
    const link = `${window.location.origin}/pay/${requestId}`
    navigator.clipboard.writeText(link)
    setCopiedId(requestId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleCancel = async (requestId: string) => {
    if (confirm('Are you sure you want to cancel this payment request?')) {
      try {
        await cancelPaymentRequest(requestId)
      } catch (error) {
        console.error('Failed to cancel request:', error)
      }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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

  const isOverdue = (dueDate: string | undefined, status: string) => {
    return status === 'pending' && dueDate && new Date(dueDate) < new Date()
  }

  const filterOptions = [
    { value: 'all', label: 'All Requests' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center text-neutral-600 dark:text-white hover:text-neutral-900 dark:hover:text-orange-300 mb-4"
        >
          <FiArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Payment Requests</h1>
            <p className="text-neutral-600 dark:text-white mt-2">
              Manage your payment requests and invoices
            </p>
          </div>
          <Link
            href="/requests/create"
            className="flex items-center px-4 py-2 bg-orange-500 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-600 transition-colors"
          >
            <FiPlus className="w-4 h-4 mr-2" />
            Create Request
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-orange-500/10 dark:border-orange-500/30 rounded-xl border border-neutral-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <FiFilter className="w-5 h-5 text-neutral-500 dark:text-orange-200" />
          <div className="flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value as any)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filter === option.value
                    ? 'bg-orange-500 dark:bg-orange-500 text-white'
                    : 'bg-neutral-100 dark:bg-orange-500/20 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-orange-500/30'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 text-sm text-neutral-500 dark:text-orange-200">
          Showing {filteredRequests.length} of {paymentRequests.length} requests
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-orange-500/10 dark:border-orange-500/30 rounded-xl border border-neutral-200">
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-orange-500 dark:border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-neutral-500 dark:text-white">Loading payment requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-neutral-400 dark:text-orange-200 mb-4">
              <FiCode className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-neutral-700 dark:text-white mb-2">No payment requests found</h3>
            <p className="text-neutral-500 dark:text-white mb-4">
              {filter === 'all' 
                ? "You haven't created any payment requests yet" 
                : `No ${filter} payment requests found`
              }
            </p>
            <Link
              href="/requests/create"
              className="inline-flex items-center px-4 py-2 bg-orange-500 dark:bg-orange-500 text-white rounded-lg hover:bg-orange-600 dark:hover:bg-orange-600 transition-colors"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Create Your First Request
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-orange-500/20">
            {filteredRequests.map((request) => (
              <div key={request.requestId} className="p-6 hover:bg-neutral-50 dark:hover:bg-orange-500/5 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-neutral-900 dark:text-white">
                        {request.invoiceNumber}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        request.status === 'paid' 
                          ? 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30'
                          : request.status === 'pending'
                          ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30'
                          : request.status === 'cancelled'
                          ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30'
                          : 'text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-900/30'
                      }`}>
                        {request.status}
                      </span>
                      {isOverdue(request.dueDate, request.status) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30">
                          Overdue
                        </span>
                      )}
                    </div>
                    
                    <div className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                      {request.amount} {getTokenSymbol(request.tokenId)}
                    </div>
                    
                    {request.description && (
                      <p className="text-neutral-600 dark:text-neutral-300 mb-2">{request.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-neutral-500 dark:text-neutral-400">
                      <span>Created: {formatDate(request.createdAt)}</span>
                      <span>Due: {request.dueDate ? formatDate(request.dueDate) : 'No due date'}</span>
                      {request.toEmail && (
                        <span className="flex items-center">
                          <FiMail className="w-3 h-3 mr-1" />
                          {request.toEmail}
                        </span>
                      )}
                    </div>
                    
                    {request.paidAt && (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Paid on {formatDate(request.paidAt)}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleCopyLink(request.requestId)}
                          className="flex items-center px-3 py-1 bg-neutral-100 dark:bg-orange-500/20 text-neutral-700 dark:text-orange-200 rounded-lg hover:bg-neutral-200 dark:hover:bg-orange-500/30 transition-colors text-sm"
                        >
                          {copiedId === request.requestId ? (
                            <>
                              <FiCheck className="w-3 h-3 mr-1" />
                              Copied
                            </>
                          ) : (
                            <>
                              <FiCopy className="w-3 h-3 mr-1" />
                              Copy Link
                            </>
                          )}
                        </button>
                        <Link
                          href={`/pay/${request.requestId}`}
                          className="flex items-center px-3 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors text-sm"
                        >
                          <FiExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Link>
                        <button
                          onClick={() => handleCancel(request.requestId)}
                          className="flex items-center px-3 py-1 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors text-sm"
                        >
                          <FiX className="w-3 h-3 mr-1" />
                          Cancel
                        </button>
                      </>
                    )}
                    
                    {request.status === 'paid' && request.paymentTxId && (
                      <Link
                        href={`/transactions`}
                        className="flex items-center px-3 py-1 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-500/30 transition-colors text-sm"
                      >
                        <FiExternalLink className="w-3 h-3 mr-1" />
                        View Payment
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}