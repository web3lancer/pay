'use client'

import React, { useState, useEffect } from 'react'
import { 
  FiDollarSign, 
  FiTrendingUp, 
  FiTrendingDown,
  FiArrowUpRight,
  FiArrowDownRight,
  FiCreditCard,
  FiUsers,
  FiGlobe,
  FiZap,
  FiShield,
  FiRefreshCw,
  FiPlus,
  FiSend,
  FiDownload,
  FiEye,
  FiEyeOff
} from 'react-icons/fi'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useTransaction } from '@/contexts/TransactionContext'
import { usePaymentRequest } from '@/contexts/PaymentRequestContext'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'

const formatCurrency = (amount: number, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

const formatRelativeTime = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  return `${Math.floor(diffInSeconds / 86400)}d ago`
}

export function Dashboard() {
  const { user, userProfile } = useAuth()
  const { wallets, isLoading: walletsLoading } = useWallet()
  const { transactions, isLoading: transactionsLoading } = useTransaction()
  const { paymentRequests, getActiveRequests } = usePaymentRequest()
  const { calculateUsdValue, formatUsdValue } = useExchangeRate()
  
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [totalBalance, setTotalBalance] = useState(0)

  // Calculate total balance from real wallet data
  useEffect(() => {
    if (wallets.length > 0) {
      let total = 0
      wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance?.toString() || '0')
        if (balance > 0) {
          const usdValue = calculateUsdValue(balance, wallet.blockchain)
          total += usdValue
        }
      })
      setTotalBalance(total)
    }
  }, [wallets, calculateUsdValue])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const isLoading = walletsLoading || transactionsLoading

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center h-96">
          <div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Welcome back, {userProfile?.displayName || user?.name || 'User'}!
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <FiRefreshCw className="h-4 w-4" />
              </div>
              Refresh
            </button>
            
            <div whileHover={{ scale: 1.02 }}>
              <Link href="/send" className="flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                <FiSend className="h-4 w-4" />
                Send Money
              </Link>
            </div>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Total Balance</h2>
              <button
                onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {isBalanceVisible ? <FiEye className="h-5 w-5" /> : <FiEyeOff className="h-5 w-5" />}
              </button>
            </div>
            
            <AnimatePresence mode="wait">
              <div
                key={isBalanceVisible ? 'visible' : 'hidden'}
                className="text-4xl font-bold text-gray-900 mb-2"
              >
                {isBalanceVisible ? formatUsdValue(totalBalance) : '••••••'}
              </div>
            </AnimatePresence>
            
            <div className="flex items-center gap-2">
              <span className="text-gray-500 text-sm">
                Across {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: FiSend, label: 'Send', href: '/send', color: 'bg-blue-500' },
            { icon: FiDownload, label: 'Receive', href: '/receive', color: 'bg-green-500' },
            { icon: FiCreditCard, label: 'Cards', href: '/cards', color: 'bg-purple-500' },
            { icon: FiUsers, label: 'Wallets', href: '/wallets', color: 'bg-orange-500' }
          ].map((action, index) => (
            <div
              key={action.label}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <Link
                href={action.href}
                className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100"
              >
                <div className={`p-3 rounded-full ${action.color} text-white mb-2`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <span className="text-sm font-medium text-gray-900">{action.label}</span>
              </Link>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                <Link href="/transactions" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium">
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <FiCreditCard className="h-12 w-12 mx-auto" />
                    </div>
                    <p className="text-gray-500 mb-4">No transactions yet</p>
                    <Link
                      href="/send"
                      className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      <FiSend className="h-4 w-4 mr-2" />
                      Send Your First Payment
                    </Link>
                  </div>
                ) : (
                  transactions.slice(0, 5).map((transaction, index) => (
                    <div
                      key={transaction.transactionId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'receive' ? 'bg-green-100 text-green-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'receive' ? 
                            <FiArrowDownRight className="h-4 w-4" /> :
                            <FiArrowUpRight className="h-4 w-4" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.type === 'receive' ? 'Received' : 'Sent'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {transaction.description || `${transaction.type} transaction`}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'receive' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}{transaction.amount} {transaction.tokenId.toUpperCase()}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Wallets & Payment Requests */}
          <div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Wallets Overview */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Wallets</h3>
                <Link href="/wallets" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium">
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {wallets.length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-3">No wallets created</p>
                    <Link
                      href="/wallets/create"
                      className="inline-flex items-center px-3 py-2 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      <FiPlus className="h-4 w-4 mr-1" />
                      Create Wallet
                    </Link>
                  </div>
                ) : (
                  wallets.slice(0, 3).map((wallet) => (
                    <div key={wallet.walletId} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-gray-600">
                            {wallet.blockchain.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{wallet.walletName}</p>
                          <p className="text-xs text-gray-500 capitalize">{wallet.blockchain}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {wallet.balance} {wallet.blockchain.toUpperCase()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Payment Requests */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">Payment Requests</h3>
                <Link href="/requests" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {getActiveRequests().length === 0 ? (
                  <div className="text-center py-4">
                    <p className="text-gray-500 text-sm mb-3">No active requests</p>
                    <Link
                      href="/requests/create"
                      className="inline-flex items-center px-3 py-2 bg-cyan-500 text-white text-sm rounded-lg hover:bg-cyan-600 transition-colors"
                    >
                      <FiPlus className="h-4 w-4 mr-1" />
                      Create Request
                    </Link>
                  </div>
                ) : (
                  getActiveRequests().slice(0, 3).map((request) => (
                    <div key={request.requestId} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.invoiceNumber}</p>
                        <p className="text-xs text-gray-500">{request.description || 'Payment request'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {request.amount} {request.tokenId.toUpperCase()}
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          pending
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}