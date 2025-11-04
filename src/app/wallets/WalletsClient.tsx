'use client'

import React, { useState } from 'react';

import Link from 'next/link';


import { useWallet } from '@/contexts/WalletContext';
import { formatCurrency, formatCryptoAmount, shortenAddress } from '@/lib/utils';
import EmptyState from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';

// import { FiSend, FiDownload, FiRepeat, FiMoreVertical, FiPlus } from 'react-icons/fi'





export function WalletsClient() {
  const { wallets, isLoading } = useWallet()
  const [activeWallet, setActiveWallet] = useState(wallets[0]?.walletId || '')

  const handleWalletSelect = (walletId: string) => {
    setActiveWallet(walletId)
  }

  const selectedWallet = wallets.find(wallet => wallet.walletId === activeWallet) || wallets[0]

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto">
          <div className="flex flex-col space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-blue-100">Wallets</h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your crypto wallets</p>
              </div>
              <Link href="/wallets/create">
                <button className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                  <span className="mr-2">+</span>
                  Add Wallet
                </button>
              </Link>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <h2 className="text-lg font-medium text-neutral-800 dark:text-blue-100 mb-4">Your Wallets</h2>
                <div className="space-y-4">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="h-6 bg-gray-200 dark:bg-neutral-600 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-200 dark:bg-neutral-600 rounded w-2/3"></div>
                    <div className="h-8 bg-gray-200 dark:bg-neutral-600 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
        <div className="flex flex-col space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-blue-100">Wallets</h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Manage your crypto wallets</p>
            </div>
            <Link href="/wallets/create">
              <button className="flex items-center px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                <span className="mr-2">+</span>
                Add Wallet
              </button>
            </Link>
          </div>

          {/* Wallet Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Wallet List */}
            <div className="lg:col-span-4 space-y-4">
              <h2 className="text-lg font-medium text-neutral-800 dark:text-blue-100">Your Wallets</h2>
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-200 dark:divide-neutral-700">
                {wallets.length === 0 ? (
                  <EmptyState
                    icon="💼"
                    title="No wallets found"
                    description="You haven't created any wallets yet. Create your first wallet to get started."
                    action={{
                      label: "Create Your First Wallet",
                      href: "/wallets/create"
                    }}
                  />
                ) : (
                  wallets.map((wallet, index) => (
                    <div
                      key={wallet.walletId}
                      className={`p-4 cursor-pointer transition-all duration-300 ${
                        activeWallet === wallet.walletId 
                          ? 'bg-cyan-50 dark:bg-blue-900/50 border-l-4 border-cyan-500' 
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                      }`}
                      onClick={() => handleWalletSelect(wallet.walletId)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 flex items-center justify-center">
                            {wallet.blockchain === 'bitcoin' && <span className="text-amber-500">₿</span>}
                            {wallet.blockchain === 'ethereum' && <span className="text-blue-500">Ξ</span>}
                            {wallet.blockchain === 'polygon' && <span className="text-purple-500">◆</span>}
                            {wallet.blockchain === 'bsc' && <span className="text-yellow-500">⬡</span>}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-neutral-900 dark:text-blue-100">{wallet.walletName}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{shortenAddress(wallet.walletAddress)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-neutral-900 dark:text-blue-100">
                            {formatCryptoAmount(wallet.balance, wallet.blockchain.toUpperCase())}
                          </p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">
                            {wallet.blockchain}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
            </div>
            
            {/* Selected Wallet Details */}
            <div className="lg:col-span-8">
              {selectedWallet ? (
                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900 dark:text-blue-100">{selectedWallet.walletName}</h2>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">{selectedWallet.walletAddress}</p>
                        <button className="ml-2 text-cyan-500 dark:text-cyan-400 text-sm hover:text-cyan-600 dark:hover:text-cyan-300">
                          Copy
                        </button>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors">
                      <span className="text-neutral-600 dark:text-neutral-400">⋮</span>
                    </button>
                  </div>

                  {/* Balance Display */}
                  <div className="mb-8">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Balance</span>
                    <div className="flex items-baseline mt-1">
                      <span className="text-3xl font-bold text-neutral-900 dark:text-blue-100 mr-3">
                        {formatCryptoAmount(selectedWallet.balance, selectedWallet.blockchain.toUpperCase())}
                      </span>
                      <span className="text-lg text-neutral-500 dark:text-neutral-400 capitalize">
                        {selectedWallet.blockchain}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mb-8">
                    <Link href="/send" className="flex-1 flex items-center justify-center py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                      <span className="mr-2">📤</span>
                      Send
                    </Link>
                    <Link href="/receive" className="flex-1 flex items-center justify-center py-3 bg-white dark:bg-neutral-700 border border-cyan-500 dark:border-cyan-400 text-cyan-500 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-neutral-600 rounded-lg transition-colors">
                      <span className="mr-2">📥</span>
                      Receive
                    </Link>
                    <Link href="/exchange" className="flex-1 flex items-center justify-center py-3 bg-white dark:bg-neutral-700 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-600 rounded-lg transition-colors">
                      <span className="mr-2">🔄</span>
                      Swap
                    </Link>
                  </div>

                  {/* Transaction History Preview */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-neutral-800 dark:text-blue-100">Recent Transactions</h3>
                      <Link href="/transactions" className="text-cyan-500 dark:text-cyan-400 text-sm hover:text-cyan-600 dark:hover:text-cyan-300 transition-colors">
                        View All
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 py-6 text-center">
                        Transaction history will appear here
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon="💼"
                  title="No wallet selected"
                  description="Select a wallet from the list to view its details"
                />
              )}
            </div>
          </div>
        </div>
    </div>
  )
}