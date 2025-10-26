'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FiArrowUp, FiArrowDown, FiTrendingUp, FiTrendingDown, FiEye, FiEyeOff, 
  FiPlus, FiSend, FiCamera, FiRefreshCw, FiCreditCard, FiDollarSign,
  FiBarChart3, FiZap, FiGift, FiStar, FiBell
} from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount, formatPercentage } from '@/lib/utils'
import { AppShell } from '@/components/layout/AppShell'
import { TransactionHistory } from '@/components/transactions/TransactionHistory'
import { QRCodeGenerator } from '@/components/profile/QRCodeGenerator'
import { CapitalPromo } from '@/components/capital/CapitalPromo'

interface Portfolio {
  totalBalance: number
  totalBalanceChange24h: number
  portfolioChange24h: number
  wallets: WalletBalance[]
}

interface WalletBalance {
  id: string
  name: string
  symbol: string
  balance: number
  usdValue: number
  change24h: number
  price: number
  icon?: string
}

interface MarketData {
  symbol: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  sparkline: number[]
}

interface RecentActivity {
  id: string
  type: 'send' | 'receive' | 'swap' | 'buy'
  amount: number
  currency: string
  usdValue: number
  timestamp: Date
  status: 'completed' | 'pending' | 'failed'
  counterparty?: string
}

export function DashboardClient() {
  const { user } = useAuth()
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showQRGenerator, setShowQRGenerator] = useState(false)

  // Simulate real-time data updates
  useEffect(() => {
    const fetchPortfolioData = () => {
      // Simulate API data
      const mockPortfolio: Portfolio = {
        totalBalance: 12847.32,
        totalBalanceChange24h: 847.32,
        portfolioChange24h: 7.2,
        wallets: [
          {
            id: '1',
            name: 'Bitcoin',
            symbol: 'BTC',
            balance: 0.2845,
            usdValue: 8234.50,
            change24h: 4.2,
            price: 28945.67,
            icon: '₿'
          },
          {
            id: '2',
            name: 'Ethereum',
            symbol: 'ETH',
            balance: 2.156,
            usdValue: 3456.78,
            change24h: -2.1,
            price: 1603.45,
            icon: 'Ξ'
          },
          {
            id: '3',
            name: 'USD Coin',
            symbol: 'USDC',
            balance: 1156.04,
            usdValue: 1156.04,
            change24h: 0.0,
            price: 1.00,
            icon: '$'
          }
        ]
      }

      const mockMarketData: MarketData[] = [
        {
          symbol: 'BTC',
          price: 28945.67,
          change24h: 4.2,
          volume24h: 24567890123,
          marketCap: 567890123456,
          sparkline: [28456, 28567, 28789, 28945, 29123, 28945]
        },
        {
          symbol: 'ETH',
          price: 1603.45,
          change24h: -2.1,
          volume24h: 12345678901,
          marketCap: 192345678901,
          sparkline: [1645, 1623, 1612, 1598, 1587, 1603]
        }
      ]

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'receive',
          amount: 0.0045,
          currency: 'BTC',
          usdValue: 130.25,
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          status: 'completed',
          counterparty: 'john.web3'
        },
        {
          id: '2',
          type: 'send',
          amount: 250,
          currency: 'USDC',
          usdValue: 250.00,
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          status: 'completed',
          counterparty: 'alice.crypto'
        },
        {
          id: '3',
          type: 'swap',
          amount: 0.5,
          currency: 'ETH',
          usdValue: 801.73,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
          status: 'pending'
        }
      ]

      setPortfolio(mockPortfolio)
      setMarketData(mockMarketData)
      setRecentActivity(mockActivity)
    }

    fetchPortfolioData()

    // Real-time updates every 30 seconds
    const interval = setInterval(() => {
      fetchPortfolioData()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsRefreshing(false)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'send': return <FiArrowUp className="h-4 w-4 text-red-500" />
      case 'receive': return <FiArrowDown className="h-4 w-4 text-green-500" />
      case 'swap': return <FiRefreshCw className="h-4 w-4 text-blue-500" />
      case 'buy': return <FiPlus className="h-4 w-4 text-purple-500" />
      default: return <FiDollarSign className="h-4 w-4 text-neutral-500" />
    }
  }

  if (!portfolio) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full"
          />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-6">
        {/* Welcome Header */}
        <div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start"
        >
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
            </h1>
            <p className="text-neutral-600 mt-1">Here's what's happening with your crypto today</p>
          </div>
          
          <div className="flex gap-2">
            <button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <FiRefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <FiBell className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Capital Promo - Only shows for users with BTC balance */}
        {portfolio && portfolio.wallets.find(w => w.symbol === 'BTC') && (
          <CapitalPromo 
            btcBalance={portfolio.wallets.find(w => w.symbol === 'BTC')?.balance || 0}
          />
        )}

        {/* Portfolio Overview */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 text-white relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
          </div>

          <div className="relative">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-primary-100 text-sm">Total Portfolio Value</p>
                <div className="flex items-center gap-3">
                  {balanceVisible ? (
                    <h2 className="text-3xl font-bold">{formatCurrency(portfolio.totalBalance)}</h2>
                  ) : (
                    <h2 className="text-3xl font-bold">••••••</h2>
                  )}
                  <button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setBalanceVisible(!balanceVisible)}
                    className="text-primary-100 hover:text-white transition-colors"
                  >
                    {balanceVisible ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className={`flex items-center gap-1 px-3 py-1 rounded-full ${
                  portfolio.portfolioChange24h >= 0 
                    ? 'bg-green-500/20 text-green-100' 
                    : 'bg-red-500/20 text-red-100'
                }`}
              >
                {portfolio.portfolioChange24h >= 0 ? (
                  <FiTrendingUp className="h-4 w-4" />
                ) : (
                  <FiTrendingDown className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {formatPercentage(portfolio.portfolioChange24h)}
                </span>
              </div>
            </div>

            {balanceVisible && (
              <div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 text-primary-100"
              >
                <span className="text-sm">24h change:</span>
                <span className={`text-sm font-medium ${
                  portfolio.totalBalanceChange24h >= 0 ? 'text-green-200' : 'text-red-200'
                }`}>
                  {portfolio.totalBalanceChange24h >= 0 ? '+' : ''}
                  {formatCurrency(portfolio.totalBalanceChange24h)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/send'}
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-200 transition-colors">
              <FiSend className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">Send</h3>
            <p className="text-sm text-neutral-600">Transfer crypto</p>
          </button>

          <button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/scan'}
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-green-200 transition-colors">
              <FiCamera className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">Scan</h3>
            <p className="text-sm text-neutral-600">QR payments</p>
          </button>

          <button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowQRGenerator(true)}
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-200 transition-colors">
              <FiZap className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">Receive</h3>
            <p className="text-sm text-neutral-600">Show QR code</p>
          </button>

          <button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.href = '/exchange'}
            className="bg-white rounded-xl p-4 border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
              <FiRefreshCw className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold text-neutral-900">Swap</h3>
            <p className="text-sm text-neutral-600">Exchange crypto</p>
          </button>
        </div>

        {/* Wallet Balances */}
        <div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-neutral-200 p-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neutral-900">Your Assets</h2>
            <button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.href = '/wallets'}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1"
            >
              <FiCreditCard className="h-4 w-4" />
              Manage Wallets
            </button>
          </div>

          <div className="space-y-4">
            {portfolio.wallets.map((wallet, index) => (
              <div
                key={wallet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-neutral-50 transition-colors cursor-pointer group"
                onClick={() => window.location.href = `/wallet/${wallet.id}`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {wallet.icon || wallet.symbol.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{wallet.name}</h3>
                    <p className="text-sm text-neutral-600">
                      {formatCryptoAmount(wallet.balance, wallet.symbol)}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-neutral-900">
                    {balanceVisible ? formatCurrency(wallet.usdValue) : '••••'}
                  </p>
                  <div className={`flex items-center gap-1 text-sm ${
                    wallet.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {wallet.change24h >= 0 ? (
                      <FiTrendingUp className="h-3 w-3" />
                    ) : (
                      <FiTrendingDown className="h-3 w-3" />
                    )}
                    <span>{formatPercentage(wallet.change24h)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Overview & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Market Overview */}
          <div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-neutral-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Market</h2>
              <div className="flex gap-2">
                {['24h', '7d', '30d'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setSelectedTimeframe(period)}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      selectedTimeframe === period
                        ? 'bg-primary-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {marketData.map((coin, index) => (
                <div
                  key={coin.symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {coin.symbol.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900">{coin.symbol}</h4>
                      <p className="text-sm text-neutral-600">{formatCurrency(coin.price)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Mini Sparkline */}
                    <div className="w-16 h-8">
                      <svg viewBox="0 0 64 32" className="w-full h-full">
                        <polyline
                          points={coin.sparkline.map((value, i) => 
                            `${(i / (coin.sparkline.length - 1)) * 64},${32 - ((value - Math.min(...coin.sparkline)) / (Math.max(...coin.sparkline) - Math.min(...coin.sparkline))) * 32}`
                          ).join(' ')}
                          fill="none"
                          stroke={coin.change24h >= 0 ? '#10b981' : '#ef4444'}
                          strokeWidth="2"
                        />
                      </svg>
                    </div>

                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      coin.change24h >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {coin.change24h >= 0 ? (
                        <FiTrendingUp className="h-3 w-3" />
                      ) : (
                        <FiTrendingDown className="h-3 w-3" />
                      )}
                      <span>{formatPercentage(coin.change24h)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl border border-neutral-200 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-neutral-900">Recent Activity</h2>
              <button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/transactions'}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View All
              </button>
            </div>

            <div className="space-y-4">
              {recentActivity.slice(0, 5).map((activity, index) => (
                <div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h4 className="font-medium text-neutral-900 capitalize">
                        {activity.type} {activity.currency}
                      </h4>
                      <p className="text-sm text-neutral-600">
                        {activity.counterparty || `${activity.timestamp.toLocaleTimeString()}`}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className={`font-medium ${
                      activity.type === 'send' ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {activity.type === 'send' ? '-' : '+'}
                      {formatCryptoAmount(activity.amount, activity.currency)}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {formatCurrency(activity.usdValue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* QR Generator Modal */}
        <>
          {showQRGenerator && user && (
            <div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowQRGenerator(false)}
            >
              <div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <QRCodeGenerator
                  username={user.name || 'user'}
                  displayName={user.name || 'User'}
                  type="profile"
                />
                <div className="mt-4 text-center">
                  <button
                    onClick={() => setShowQRGenerator(false)}
                    className="px-6 py-2 bg-neutral-200 text-neutral-800 rounded-lg hover:bg-neutral-300 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      </div>
    </AppShell>
  )
}