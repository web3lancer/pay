'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/contexts/WalletContext'
import { useTransaction } from '@/contexts/TransactionContext'
import { usePaymentRequest } from '@/contexts/PaymentRequestContext'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { ExchangeRateDisplay } from '@/components/ExchangeRateDisplay'
import { AppShell } from '@/components/AppShell'
import { FiSend, FiDownload, FiPlus, FiArrowRight, FiTrendingUp, FiRefreshCw, FiCheck, FiCode, FiUser, FiGlobe } from 'react-icons/fi'
import Link from 'next/link'

export default function HomePage() {
  const { user, userProfile, isAuthenticated } = useAuth()
  const { wallets, defaultWallet, isLoading: walletsLoading } = useWallet()
  const { transactions } = useTransaction()
  const { paymentRequests, getActiveRequests, getPaidRequests } = usePaymentRequest()
  const { calculateUsdValue, formatUsdValue, getRate } = useExchangeRate()
  const [totalBalance, setTotalBalance] = useState(0)

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

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        {/* Welcome Header - Different for authenticated vs public */}
        <div className="mb-8">
          {isAuthenticated && user ? (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                Welcome back, {userProfile?.displayName || userProfile?.email?.split('@')[0] || user.name || 'User'}!
              </h1>
              <p className="text-neutral-600">
                Manage your crypto wallets and transactions
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2">
                <FiGlobe className="inline w-8 h-8 mr-3 text-cyan-600" />
                Global Crypto Payment Platform
              </h1>
              <p className="text-neutral-600">
                Send, receive, and manage cryptocurrency payments instantly. No account required for basic features.
              </p>
              <div className="mt-4 flex flex-wrap gap-4">
                <Link
                  href="/auth"
                  className="inline-flex items-center px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
                >
                  <FiUser className="w-4 h-4 mr-2" />
                  Sign In for Full Features
                </Link>
                <span className="inline-flex items-center px-4 py-2 bg-neutral-100 text-neutral-600 rounded-lg">
                  Or use payment features below without an account
                </span>
              </div>
            </>
          )}
        </div>

        {/* Balance Overview - Only for authenticated users */}
        {isAuthenticated && user && (
          <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl p-6 mb-8">
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
          </div>
        )}

        {/* Quick Actions - Available to everyone */}
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
            href={isAuthenticated ? "/wallets/create" : "/auth"}
            className="bg-gradient-to-br from-orange-500 to-red-600 text-white rounded-xl p-6 hover:from-orange-600 hover:to-red-700 transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <FiPlus className="w-8 h-8" />
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {isAuthenticated ? 'Add Wallet' : 'Create Account'}
            </h3>
            <p className="text-orange-100">
              {isAuthenticated ? 'Create or import a new wallet' : 'Full wallet management features'}
            </p>
          </Link>
        </div>

        {/* Public Features Section - Always show */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Live Exchange Rates</h3>
              <FiTrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-sm text-neutral-600 mb-4">
              Real-time cryptocurrency prices from global markets
            </div>
            <Link
              href="/rates"
              className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
            >
              View all rates
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">Global Access</h3>
              <FiGlobe className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-sm text-neutral-600 mb-4">
              Send payments worldwide without borders or restrictions
            </div>
            <p className="text-neutral-500 text-sm">Available globally</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-900">
                {isAuthenticated ? `Your Transactions` : 'Instant Payments'}
              </h3>
              <FiCheck className="w-6 h-6 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-neutral-900 mb-2">
              {isAuthenticated ? transactions.length : '24/7'}
            </div>
            {isAuthenticated ? (
              <Link
                href="/transactions"
                className="text-cyan-600 hover:text-cyan-700 text-sm font-medium"
              >
                View history
              </Link>
            ) : (
              <p className="text-neutral-500 text-sm">Always available</p>
            )}
          </div>
        </div>

        {/* Authenticated User Dashboard Section */}
        {isAuthenticated && user && (
          <>
            {/* Recent Payment Requests */}
            {getActiveRequests().length > 0 && (
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
                
                <div className="space-y-4">
                  {getActiveRequests().slice(0, 3).map((request) => (
                    <div key={request.requestId} className="flex items-center justify-between border-b border-neutral-100 pb-3">
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
              </div>
            )}

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
                
                {transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">No transactions yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((tx) => (
                      <div key={tx.transactionId} className="flex items-center justify-between border-b border-neutral-100 pb-3">
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
          </>
        )}

        {/* Public Exchange Rates Section - For non-authenticated users */}
        {!isAuthenticated && (
          <div className="mt-8">
            <ExchangeRateDisplay showRefresh={true} />
          </div>
        )}
      </div>
    </AppShell>
  )
}

