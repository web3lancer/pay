'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

interface TransactionData {
  id: string
  type: 'send' | 'receive' | 'payment'
  amount: number
  currency: string
  recipient?: string
  sender?: string
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
}

interface PortfolioData {
  totalBalance: number
  monthlyChange: number
  transactions: TransactionData[]
  assets: { symbol: string; name: string; balance: number; value: number; change: number }[]
}

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
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null)
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')

  // Simulate real-time data updates
  useEffect(() => {
    const generateMockData = (): PortfolioData => {
      const baseBalance = 12547.83
      const variation = (Math.random() - 0.5) * 1000
      
      return {
        totalBalance: baseBalance + variation,
        monthlyChange: Math.random() * 20 - 10,
        transactions: [
          {
            id: '1',
            type: 'receive',
            amount: 2500,
            currency: 'USD',
            sender: 'john.doe@example.com',
            timestamp: new Date(Date.now() - Math.random() * 86400000),
            status: 'completed'
          },
          {
            id: '2',
            type: 'send',
            amount: 750,
            currency: 'USD',
            recipient: 'alice.smith@example.com',
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 2),
            status: 'completed'
          },
          {
            id: '3',
            type: 'payment',
            amount: 1200,
            currency: 'USD',
            recipient: 'Freelance Project #4',
            timestamp: new Date(Date.now() - Math.random() * 86400000 * 3),
            status: 'pending'
          }
        ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
        assets: [
          { symbol: 'USD', name: 'US Dollar', balance: 8500 + Math.random() * 1000, value: 8500, change: Math.random() * 4 - 2 },
          { symbol: 'EUR', name: 'Euro', balance: 2200 + Math.random() * 500, value: 2400, change: Math.random() * 4 - 2 },
          { symbol: 'GBP', name: 'British Pound', balance: 1800 + Math.random() * 300, value: 2200, change: Math.random() * 4 - 2 }
        ]
      }
    }

    setPortfolioData(generateMockData())

    // Update data every 30 seconds
    const interval = setInterval(() => {
      setPortfolioData(generateMockData())
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    setPortfolioData(prev => prev ? { ...prev, totalBalance: prev.totalBalance + (Math.random() - 0.5) * 100 } : null)
    setIsRefreshing(false)
  }

  if (!portfolioData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex items-center justify-center h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's your financial overview.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <motion.div
                animate={isRefreshing ? { rotate: 360 } : {}}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: "linear" }}
              >
                <FiRefreshCw className="h-4 w-4" />
              </motion.div>
              Refresh
            </motion.button>
            
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link href="/send" className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                <FiSend className="h-4 w-4" />
                Send Money
              </Link>
            </motion.div>
          </div>
        </motion.div>

        {/* Portfolio Overview */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-purple-500/5" />
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
              <motion.div
                key={isBalanceVisible ? 'visible' : 'hidden'}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {isBalanceVisible ? formatCurrency(portfolioData.totalBalance) : '••••••'}
                </div>
              </motion.div>
            </AnimatePresence>
            
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ 
                  color: portfolioData.monthlyChange >= 0 ? '#10B981' : '#EF4444',
                }}
                className="flex items-center gap-1 text-sm font-medium"
              >
                {portfolioData.monthlyChange >= 0 ? (
                  <FiTrendingUp className="h-4 w-4" />
                ) : (
                  <FiTrendingDown className="h-4 w-4" />
                )}
                {Math.abs(portfolioData.monthlyChange).toFixed(2)}% this month
              </motion.div>
              <span className="text-gray-500 text-sm">vs last month</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
        >
          {[
            { icon: FiSend, label: 'Send', href: '/send', color: 'bg-blue-500' },
            { icon: FiDownload, label: 'Request', href: '/request', color: 'bg-green-500' },
            { icon: FiCreditCard, label: 'Cards', href: '/cards', color: 'bg-purple-500' },
            { icon: FiUsers, label: 'Contacts', href: '/contacts', color: 'bg-orange-500' }
          ].map((action, index) => (
            <motion.div
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
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Recent Transactions</h3>
                <Link href="/transactions" className="text-primary-500 hover:text-primary-600 text-sm font-medium">
                  View all
                </Link>
              </div>
              
              <div className="space-y-4">
                <AnimatePresence>
                  {portfolioData.transactions.slice(0, 5).map((transaction, index) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'receive' ? 'bg-green-100 text-green-600' :
                          transaction.type === 'send' ? 'bg-red-100 text-red-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          {transaction.type === 'receive' ? <FiArrowDownRight className="h-4 w-4" /> :
                           transaction.type === 'send' ? <FiArrowUpRight className="h-4 w-4" /> :
                           <FiCreditCard className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {transaction.type === 'receive' ? 'Received from' :
                             transaction.type === 'send' ? 'Sent to' :
                             'Payment to'} {transaction.recipient || transaction.sender}
                          </p>
                          <p className="text-sm text-gray-500">{formatRelativeTime(transaction.timestamp)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'receive' ? 'text-green-600' : 'text-gray-900'
                        }`}>
                          {transaction.type === 'receive' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {transaction.status}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Assets & Stats */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Currency Breakdown */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Currency Breakdown</h3>
              <div className="space-y-4">
                {portfolioData.assets.map((asset, index) => (
                  <motion.div
                    key={asset.symbol}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-gray-700">{asset.symbol}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{asset.name}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(asset.balance)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{formatCurrency(asset.value)}</p>
                      <p className={`text-sm ${asset.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}%
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FiZap className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-gray-900">Active</span>
                  </div>
                  <span className="text-blue-600 font-semibold">24/7</span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-green-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FiShield className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-gray-900">Security</span>
                  </div>
                  <span className="text-green-600 font-semibold">Protected</span>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FiGlobe className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-gray-900">Global</span>
                  </div>
                  <span className="text-purple-600 font-semibold">Available</span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}