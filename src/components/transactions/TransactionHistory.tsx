'use client'

import React, { useState, useEffect } from 'react'
import { FiArrowUp, FiArrowDown, FiRefreshCw, FiFilter, FiSearch, FiExternalLink } from 'react-icons/fi'
import { formatCryptoAmount, formatCurrency, formatTimeAgo, formatAddress, getTransactionStatusColor, getTransactionStatusBg } from '@/lib/utils'

interface Transaction {
  id: string
  type: 'send' | 'receive' | 'exchange'
  status: 'confirmed' | 'pending' | 'failed'
  amount: number
  currency: string
  usdValue: number
  fromAddress?: string
  toAddress?: string
  timestamp: Date
  txHash?: string
  network: string
  fee?: number
  confirmations?: number
}

interface TransactionHistoryProps {
  transactions: Transaction[]
  isLoading?: boolean
  onRefresh?: () => void
  showFilters?: boolean
}

export function TransactionHistory({ 
  transactions = [], 
  isLoading = false, 
  onRefresh,
  showFilters = true 
}: TransactionHistoryProps) {
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date')

  // Filter and sort transactions
  useEffect(() => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(tx => 
        tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.txHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(tx => tx.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(tx => tx.type === typeFilter)
    }

    // Sort
    filtered = [...filtered].sort((a, b) => {
      if (sortBy === 'date') {
        return b.timestamp.getTime() - a.timestamp.getTime()
      } else {
        return b.usdValue - a.usdValue
      }
    })

    setFilteredTransactions(filtered)
  }, [transactions, searchTerm, statusFilter, typeFilter, sortBy])

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'pending') {
      return <FiRefreshCw className="h-4 w-4 animate-spin text-yellow-600" />
    }
    
    switch (type) {
      case 'send':
        return <FiArrowUp className="h-4 w-4 text-red-600" />
      case 'receive':
        return <FiArrowDown className="h-4 w-4 text-green-600" />
      case 'exchange':
        return <FiRefreshCw className="h-4 w-4 text-blue-600" />
      default:
        return <FiRefreshCw className="h-4 w-4 text-neutral-600" />
    }
  }

  const getExplorerUrl = (txHash: string, network: string): string => {
    const explorers: { [key: string]: string } = {
      bitcoin: 'https://blockstream.info/tx/',
      ethereum: 'https://etherscan.io/tx/',
      polygon: 'https://polygonscan.com/tx/',
      bsc: 'https://bscscan.com/tx/'
    }
    
    return `${explorers[network] || ''}${txHash}`
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-neutral-200 rounded w-1/3"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-neutral-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              </div>
              <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
      {/* Header */}
      <div className="p-6 border-b border-neutral-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Transaction History</h2>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <FiRefreshCw className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="send">Sent</option>
              <option value="receive">Received</option>
              <option value="exchange">Exchange</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
              className="px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="date">Sort by Date</option>
              <option value="amount">Sort by Amount</option>
            </select>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="divide-y divide-neutral-200">
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiRefreshCw className="h-8 w-8 text-neutral-400" />
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No transactions found</h3>
            <p className="text-neutral-600">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your transactions will appear here'
              }
            </p>
          </div>
        ) : (
          filteredTransactions.map((transaction) => (
            <motion.div
              key={transaction.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 hover:bg-neutral-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Transaction Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTransactionStatusBg(transaction.status)}`}>
                    {getTransactionIcon(transaction.type, transaction.status)}
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-neutral-900 capitalize">
                        {transaction.type === 'send' ? 'Sent' : 
                         transaction.type === 'receive' ? 'Received' : 'Exchanged'}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${getTransactionStatusColor(transaction.status)} ${getTransactionStatusBg(transaction.status)}`}>
                        {transaction.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mt-1 text-sm text-neutral-600">
                      <span>{formatTimeAgo(transaction.timestamp)}</span>
                      {transaction.type === 'send' && transaction.toAddress && (
                        <span>to {formatAddress(transaction.toAddress)}</span>
                      )}
                      {transaction.type === 'receive' && transaction.fromAddress && (
                        <span>from {formatAddress(transaction.fromAddress)}</span>
                      )}
                      {transaction.confirmations !== undefined && (
                        <span>{transaction.confirmations} confirmations</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amount and Actions */}
                <div className="text-right">
                  <div className="font-medium text-neutral-900">
                    {transaction.type === 'send' ? '-' : '+'}
                    {formatCryptoAmount(transaction.amount, transaction.currency)}
                  </div>
                  <div className="text-sm text-neutral-600">
                    {formatCurrency(transaction.usdValue)}
                  </div>
                  
                  {transaction.txHash && (
                    <a
                      href={getExplorerUrl(transaction.txHash, transaction.network)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs text-primary-600 hover:text-primary-700 mt-1"
                    >
                      <FiExternalLink className="h-3 w-3 mr-1" />
                      View on Explorer
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Load More */}
      {filteredTransactions.length > 0 && (
        <div className="p-6 border-t border-neutral-200 text-center">
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            Load More Transactions
          </button>
        </div>
      )}
    </div>
  )
}