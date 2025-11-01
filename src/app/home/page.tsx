'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useTransaction } from '@/contexts/TransactionContext'
import { usePaymentRequest } from '@/contexts/PaymentRequestContext'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { ExchangeRateDisplay } from '@/components/ExchangeRateDisplay'
import { FiSend, FiDownload, FiPlus, FiArrowRight, FiTrendingUp, FiRefreshCw, FiCheck, FiCode, FiUser, FiGlobe } from 'react-icons/fi'
import Link from 'next/link'
import { useRouter } from 'next/navigation'



export default function HomePage() {
  const { account, userProfile, isAuthenticated, isLoading, refreshProfile } = useAuth()
  const { wallets, defaultWallet, isLoading: walletsLoading, error: walletsError } = useWallet()
  const { transactions, isLoading: transactionsLoading, error: transactionsError } = useTransaction()
  const { paymentRequests, getActiveRequests, getPaidRequests, isLoading: paymentRequestsLoading, error: paymentRequestsError } = usePaymentRequest()
  const { calculateUsdValue, formatUsdValue, getRate } = useExchangeRate()
  const [totalBalance, setTotalBalance] = useState(0)
  const router = useRouter()

  // Redirect unauthenticated users to landing page
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  // Refresh profile on mount (important for OAuth2 redirects)
  useEffect(() => {
    refreshProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Calculate total balance in USD (only for authenticated users)
  useEffect(() => {
    if (isAuthenticated && wallets.length > 0) {
      let totalUsd = 0
      wallets.forEach(wallet => {
        const balance = parseFloat(wallet.balance?.toString() || '0')
        if (balance > 0) {
          const usdValue = calculateUsdValue(balance, wallet.blockchain)
          totalUsd += usdValue
        }
      })
      setTotalBalance(totalUsd)
    }
  }, [wallets, calculateUsdValue, isAuthenticated])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // return null // Will redirect via useEffect
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          Welcome back, {userProfile?.displayName || userProfile?.email?.split('@')[0] || account?.name || 'User'}!
        </h1>
        <p className="text-neutral-600">
          Manage your crypto wallets and transactions
        </p>
      </div>

      {/* Balance Overview */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-6 mb-8">
        {walletsLoading ? (
          <div className="animate-pulse">
            <div className="h-5 w-48 bg-cyan-400/50 rounded mb-2"></div>
            <div className="h-10 w-64 bg-cyan-400/50 rounded"></div>
            <div className="h-5 w-32 bg-cyan-400/50 rounded mt-2"></div>
          </div>
        ) : walletsError ? (
          <div className="text-center text-white">
            <p>Error loading balance: {walletsError.message}</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-cyan-100 mb-2">Total Portfolio Balance</p>
              <h2 className="text-4xl font-bold">
                {formatUsdValue(totalBalance)}
              </h2>
              <p className="text-cyan-100 mt-2">
                {wallets.length} {wallets.length === 1 ? 'Wallet' : 'Wallets'}
              </p>
            </div>
            <div className="text-right">
              <button
                onClick={() => window.location.reload()}
                className="p-3 bg-white/20 rounded-full hover:bg-white/30 transition-colors"
              >
                <FiRefreshCw className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </div>


      {/* Quick Actions */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <Link
          href="/send"
          className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl p-6 hover:from-cyan-600 hover:to-blue-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiSend className="w-8 h-8" />
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Send Money</h3>
          <p className="text-cyan-100">Send crypto to any wallet address</p>
        </Link>

        <Link
          href="/receive"
          className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-xl p-6 hover:from-green-600 hover:to-emerald-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiDownload className="w-8 h-8" />
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Receive Money</h3>
          <p className="text-green-100">Get your wallet address and QR code</p>
        </Link>

        <Link
          href="/requests/create"
          className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-xl p-6 hover:from-purple-600 hover:to-pink-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiCode className="w-8 h-8" />
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Request Payment</h3>
          <p className="text-purple-100">Create invoices and payment requests</p>
        </Link>

        <Link
          href="/wallets/create"
          className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 hover:from-orange-600 hover:to-red-700 transition-all group"
        >
          <div className="flex items-center justify-between mb-4">
            <FiPlus className="w-8 h-8" />
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Add Wallet</h3>
          <p className="text-orange-100">Create or import a new wallet</p>
        </Link>
      </div>

      {/* Recent Payment Requests */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-neutral-900">Recent Payment Requests</h2>
          <Link
            href="/requests"
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {paymentRequestsLoading ? (
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center justify-between border-b border-neutral-100 pb-3 animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
                  <div>
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                    <div className="h-3 w-32 bg-neutral-200 rounded mt-1"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 w-20 bg-neutral-200 rounded"></div>
                  <div className="h-3 w-16 bg-neutral-200 rounded mt-1"></div>
                </div>
              </div>
            ))}
          </div>
        ) : paymentRequestsError ? (
          <div className="text-center py-8 text-red-600">
            <p>Error loading payment requests: {paymentRequestsError.message}</p>
          </div>
        ) : getActiveRequests().length === 0 ? (
          <div className="text-center py-4">
            <p className="text-neutral-500">No active payment requests.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {getActiveRequests().slice(0, 3).map((request) => (
              <div key={request.$id} className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-full bg-yellow-100">
                    <FiCode className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">
                      {request.invoiceNumber}
                    </div>
                    <div className="text-sm text-neutral-500">
                      {request.description || 'Payment request'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-neutral-900">
                    {request.amount} {request.tokenId.toUpperCase()}
                  </div>
                  <div className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                    pending
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions and Exchange Rates */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Transactions</h2>
            <Link
              href="/transactions"
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          {transactionsLoading ? (
             <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-neutral-100 pb-3 animate-pulse">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-200"></div>
                    <div>
                      <div className="h-4 w-20 bg-neutral-200 rounded"></div>
                      <div className="h-3 w-32 bg-neutral-200 rounded mt-1"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 w-24 bg-neutral-200 rounded"></div>
                    <div className="h-3 w-16 bg-neutral-200 rounded mt-1"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : transactionsError ? (
            <div className="text-center py-8 text-red-600">
              <p>Error loading transactions: {transactionsError.message}</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">No transactions yet</p>
              <Link
                href="/send"
                className="inline-flex items-center mt-4 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <FiSend className="w-4 h-4 mr-2" />
                Send Your First Payment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.$id} className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${tx.type === 'send' ? 'bg-red-100' : 'bg-green-100'}`}>
                      <FiSend className={`w-4 h-4 ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`} />
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900">
                        {tx.type === 'send' ? 'Sent' : 'Received'}
                      </div>
                      <div className="text-sm text-neutral-500">
                        {tx.description || `${tx.type} transaction`}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${tx.type === 'send' ? 'text-red-600' : 'text-green-600'}`}>
                      {tx.type === 'send' ? '-' : '+'}{tx.amount} {tx.tokenId.toUpperCase()}
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full ${
                      tx.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Exchange Rates */}
        <ExchangeRateDisplay showRefresh={true} />
      </div>
    </div>
  )
}