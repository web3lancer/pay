'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useTransaction } from '@/contexts/TransactionContext'
import { AppShell } from '@/components/AppShell'
import { FiArrowLeft, FiArrowUp, FiArrowDown, FiRefreshCw, FiFilter, FiExternalLink } from 'react-icons/fi'
import Link from 'next/link'

export default function TransactionsPage() {
  const { user } = useAuth()
  const { transactions, isLoading, refreshTransactions } = useTransaction()
  const [filteredTransactions, setFilteredTransactions] = useState(transactions)
  const [filter, setFilter] = useState<'all' | 'send' | 'receive' | 'pending' | 'confirmed'>('all')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    filterTransactions()
  }, [transactions, filter])

  const filterTransactions = () => {
    let filtered = transactions

    switch (filter) {
      case 'send':
        filtered = transactions.filter(tx => tx.type === 'send' && tx.fromUserId === user?.$id)
        break
      case 'receive':
        filtered = transactions.filter(tx => tx.type === 'receive' || tx.toUserId === user?.$id)
        break
      case 'pending':
        filtered = transactions.filter(tx => tx.status === 'pending')
        break
      case 'confirmed':
        filtered = transactions.filter(tx => tx.status === 'confirmed')
        break
      default:
        filtered = transactions
    }

    setFilteredTransactions(filtered)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshTransactions()
    setIsRefreshing(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTransactionIcon = (tx: any) => {
    if (tx.fromUserId === user?.$id) {
      return <FiArrowUp className="w-5 h-5 text-red-500" />
    } else {
      return <FiArrowDown className="w-5 h-5 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-600 bg-green-100'
      case 'pending':
        return 'text-yellow-600 bg-yellow-100'
      case 'failed':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-neutral-600 bg-neutral-100'
    }
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

  const filterOptions = [
    { value: 'all', label: 'All Transactions' },
    { value: 'send', label: 'Sent' },
    { value: 'receive', label: 'Received' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' }
  ]

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-neutral-600 hover:text-neutral-900 mb-4"
          >
            <FiArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900">Transaction History</h1>
              <p className="text-neutral-600 mt-2">
                View all your cryptocurrency transactions
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 mb-6">
          <div className="flex items-center space-x-4">
            <FiFilter className="w-5 h-5 text-neutral-500" />
            <div className="flex flex-wrap gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    filter === option.value
                      ? 'bg-cyan-500 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-2 text-sm text-neutral-500">
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-xl border border-neutral-200">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-neutral-500">Loading transactions...</p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-neutral-400 mb-4">
                <FiArrowUp className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-neutral-700 mb-2">No transactions found</h3>
              <p className="text-neutral-500 mb-4">
                {filter === 'all' 
                  ? "You haven't made any transactions yet" 
                  : `No ${filter} transactions found`
                }
              </p>
              <Link
                href="/send"
                className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
              >
                Send Your First Transaction
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.transactionId} className="p-6 hover:bg-neutral-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getTransactionIcon(transaction)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-neutral-900">
                            {transaction.fromUserId === user?.$id ? 'Sent' : 'Received'} {getTokenSymbol(transaction.tokenId)}
                          </h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </div>
                        <div className="text-sm text-neutral-500 mt-1">
                          {transaction.description || (
                            transaction.fromUserId === user?.$id 
                              ? `To: ${transaction.toAddress}`
                              : `From: ${transaction.fromAddress}`
                          )}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          {formatDate(transaction.createdAt)}
                          {transaction.confirmedAt && transaction.confirmedAt !== transaction.createdAt && (
                            <span> • Confirmed: {formatDate(transaction.confirmedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-medium ${
                        transaction.fromUserId === user?.$id ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {transaction.fromUserId === user?.$id ? '-' : '+'}{transaction.amount} {getTokenSymbol(transaction.tokenId)}
                      </div>
                      {transaction.feeAmount && transaction.fromUserId === user?.$id && (
                        <div className="text-sm text-neutral-500">
                          Fee: {transaction.feeAmount} {getTokenSymbol(transaction.tokenId)}
                        </div>
                      )}
                      {transaction.txHash && (
                        <div className="flex items-center mt-1">
                          <a
                            href={`#`} // In real app, link to blockchain explorer
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-cyan-600 hover:text-cyan-700 flex items-center"
                          >
                            View on Explorer
                            <FiExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}