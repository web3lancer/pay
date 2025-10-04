'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiSend, 
  FiDownload, 
  FiCreditCard, 
  FiActivity,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiPlus,
  FiExternalLink,
  FiFilter,
  FiSearch
} from 'react-icons/fi'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

// Mock data for demo - in real app this would come from APIs
const generateMockTransactions = () => [
  {
    id: '1',
    type: 'received',
    amount: 2.5,
    currency: 'ETH',
    from: '0x742d...5678',
    to: '0x123a...9012',
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    status: 'completed',
    gasUsed: 21000
  },
  {
    id: '2',
    type: 'sent',
    amount: 100,
    currency: 'USDC',
    from: '0x123a...9012',
    to: '0x890b...3456',
    timestamp: new Date(Date.now() - 1000 * 60 * 30),
    status: 'pending',
    gasUsed: 45000
  },
  {
    id: '3',
    type: 'received',
    amount: 0.15,
    currency: 'BTC',
    from: 'bc1q...xyz123',
    to: 'bc1q...abc456',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
    status: 'completed',
    gasUsed: null
  }
]

const generateMockPrices = () => ({
  ETH: { price: 2345.67, change: 5.2, trending: 'up' },
  BTC: { price: 43210.89, change: -2.1, trending: 'down' },
  USDC: { price: 1.00, change: 0.1, trending: 'up' },
  MATIC: { price: 0.89, change: 12.5, trending: 'up' }
})

export function DynamicDashboard() {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState(generateMockTransactions())
  const [prices, setPrices] = useState(generateMockPrices())
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock portfolio data
  const [portfolio] = useState({
    totalValue: 12485.32,
    change24h: 342.18,
    changePercent: 2.82,
    assets: [
      { symbol: 'ETH', amount: 3.24, value: 7599.57, allocation: 60.9 },
      { symbol: 'BTC', amount: 0.087, value: 3759.35, allocation: 30.1 },
      { symbol: 'USDC', amount: 1000, value: 1000, allocation: 8.0 },
      { symbol: 'MATIC', amount: 150, value: 133.5, allocation: 1.0 }
    ]
  })

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => {
        const updated = { ...prev }
        Object.keys(updated).forEach(symbol => {
          if (symbol !== 'USDC') {
            const change = (Math.random() - 0.5) * 0.02
            updated[symbol].price *= (1 + change)
            updated[symbol].change = change * 100
            updated[symbol].trending = change > 0 ? 'up' : 'down'
          }
        })
        return updated
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setTransactions(generateMockTransactions())
    setIsRefreshing(false)
  }

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter
    const matchesSearch = searchTerm === '' || 
      tx.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.currency.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-4"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Welcome back, {user?.name || 'User'}
            </motion.h1>
            <motion.p 
              className="text-xl text-gray-600 max-w-2xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Your crypto dashboard is ready. Manage, trade, and track your digital assets with ease.
            </motion.p>
          </div>

          {/* Portfolio Overview */}
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 mb-8 border border-gray-100"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Portfolio Overview</h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {balanceVisible ? <FiEye className="mr-2" /> : <FiEyeOff className="mr-2" />}
                    {balanceVisible ? 'Hide' : 'Show'} Balance
                  </button>
                  <button
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                    className="flex items-center text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                  >
                    <FiRefreshCw className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="text-center md:text-left"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <p className="text-gray-500 text-sm mb-1">Total Balance</p>
                <p className="text-3xl font-bold text-gray-900">
                  {balanceVisible ? formatCurrency(portfolio.totalValue) : '••••••'}
                </p>
                <div className="flex items-center justify-center md:justify-start mt-2">
                  {portfolio.changePercent >= 0 ? (
                    <FiTrendingUp className="text-green-500 mr-1" />
                  ) : (
                    <FiTrendingDown className="text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    portfolio.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {portfolio.changePercent >= 0 ? '+' : ''}{portfolio.changePercent.toFixed(2)}% 
                    ({portfolio.changePercent >= 0 ? '+' : ''}{formatCurrency(portfolio.change24h)})
                  </span>
                </div>
              </motion.div>

              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  {portfolio.assets.slice(0, 4).map((asset, index) => (
                    <motion.div
                      key={asset.symbol}
                      className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium text-gray-900">{asset.symbol}</span>
                        <span className="text-xs text-gray-500">{asset.allocation}%</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">{asset.amount} {asset.symbol}</p>
                      <p className="font-semibold text-gray-900">
                        {balanceVisible ? formatCurrency(asset.value) : '••••'}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { icon: FiSend, label: 'Send', color: 'blue', href: '/send' },
              { icon: FiDownload, label: 'Receive', color: 'green', href: '/receive' },
              { icon: FiCreditCard, label: 'Buy', color: 'purple', href: '/buy' },
              { icon: FiActivity, label: 'Trade', color: 'orange', href: '/trade' }
            ].map((action, index) => (
              <motion.a
                key={action.label}
                href={action.href}
                className={`group bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 text-center hover:bg-${action.color}-50`}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <action.icon className={`h-8 w-8 mx-auto mb-3 text-${action.color}-600 group-hover:text-${action.color}-700 transition-colors`} />
                <p className="font-medium text-gray-900">{action.label}</p>
              </motion.a>
            ))}
          </motion.div>

          {/* Market Prices */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Market Prices</h3>
                <FiExternalLink className="text-gray-400 hover:text-gray-600 cursor-pointer" />
              </div>
              <div className="space-y-4">
                {Object.entries(prices).map(([symbol, data], index) => (
                  <motion.div
                    key={symbol}
                    className="flex justify-between items-center p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-200 rounded-full mr-3 flex items-center justify-center">
                        <span className="text-xs font-bold">{symbol}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{symbol}</p>
                        <p className="text-sm text-gray-500">{formatCurrency(data.price)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center ${
                        data.trending === 'up' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {data.trending === 'up' ? (
                          <FiTrendingUp className="mr-1" />
                        ) : (
                          <FiTrendingDown className="mr-1" />
                        )}
                        <span className="font-medium">
                          {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-900">Recent Activity</h3>
                <div className="flex gap-2">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All</option>
                    <option value="sent">Sent</option>
                    <option value="received">Received</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredTransactions.map((tx, index) => (
                    <motion.div
                      key={tx.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group"
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center ${
                          tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {tx.type === 'sent' ? (
                            <FiArrowUpRight className={`h-5 w-5 ${
                              tx.type === 'sent' ? 'text-red-600' : 'text-green-600'
                            }`} />
                          ) : (
                            <FiArrowDownLeft className="h-5 w-5 text-green-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {tx.type === 'sent' ? 'Sent' : 'Received'} {tx.amount} {tx.currency}
                          </p>
                          <p className="text-sm text-gray-500">
                            {tx.type === 'sent' ? `To ${tx.to}` : `From ${tx.from}`}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatRelativeTime(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'completed' 
                            ? 'bg-green-100 text-green-800'
                            : tx.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {tx.status}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              
              {filteredTransactions.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No transactions found
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  )
}