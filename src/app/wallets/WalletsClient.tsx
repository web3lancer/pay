'use client'

import React, { useState } from 'react';

import Link from 'next/link';

import { AppShell } from '@/components/layout/AppShell';
import { useWallet } from '@/contexts/WalletContext';

// import { motion } from 'framer-motion'
// import { FiSend, FiDownload, FiRepeat, FiMoreVertical, FiPlus } from 'react-icons/fi'

// Simplified utility functions
const truncateString = (str: string, startChars: number = 6, endChars: number = 4): string => {
  if (str.length <= startChars + endChars) {
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const formatCryptoAmount = (amount: number, symbol: string): string => {
  let decimals = 8;
  if (symbol === 'BTC') decimals = 8;
  else if (symbol === 'ETH') decimals = 6;
  else if (symbol === 'USDC' || symbol === 'USDT') decimals = 2;
  
  const formattedAmount = amount.toFixed(decimals).replace(/\.?0+$/, '');
  return `${formattedAmount} ${symbol}`;
};



export function WalletsClient() {
  const { wallets, isLoading } = useWallet()
  const [activeWallet, setActiveWallet] = useState(wallets[0]?.walletId || '')

  const handleWalletSelect = (walletId: string) => {
    setActiveWallet(walletId)
  }

  const selectedWallet = wallets.find(wallet => wallet.walletId === activeWallet) || wallets[0]

  if (isLoading) {
    return (
      <AppShell>
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Wallets</h1>
              <p className="text-sm text-neutral-500">Manage your crypto wallets</p>
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
              <h2 className="text-lg font-medium text-neutral-800">Your Wallets</h2>
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 divide-y divide-neutral-200">
                {wallets.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-neutral-400 mb-4">
                      <span className="text-4xl">💼</span>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">No wallets found</h3>
                    <p className="text-neutral-500 mb-4">
                      You haven't created any wallets yet. Create your first wallet to get started.
                    </p>
                    <Link href="/wallets/create">
                      <button className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors">
                        <span className="mr-2">+</span>
                        Create Your First Wallet
                      </button>
                    </Link>
                  </div>
                ) : (
                  wallets.map((wallet, index) => (
                    <div
                      key={wallet.walletId}
                      className={`p-4 cursor-pointer transition-all duration-300 ${
                        activeWallet === wallet.walletId 
                          ? 'bg-cyan-50 border-l-4 border-cyan-500' 
                          : 'hover:bg-neutral-50'
                      }`}
                      onClick={() => handleWalletSelect(wallet.walletId)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                            {wallet.blockchain === 'bitcoin' && <span className="text-amber-500">₿</span>}
                            {wallet.blockchain === 'ethereum' && <span className="text-blue-500">Ξ</span>}
                            {wallet.blockchain === 'polygon' && <span className="text-purple-500">◆</span>}
                            {wallet.blockchain === 'bsc' && <span className="text-yellow-500">⬡</span>}
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-neutral-900">{wallet.walletName}</p>
                            <p className="text-xs text-neutral-500">{truncateString(wallet.walletAddress)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-neutral-900">
                            {formatCryptoAmount(wallet.balance, wallet.blockchain.toUpperCase())}
                          </p>
                          <p className="text-xs text-neutral-500 capitalize">
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
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-neutral-900">{selectedWallet.walletName}</h2>
                      <div className="flex items-center mt-1">
                        <p className="text-sm text-neutral-500">{selectedWallet.walletAddress}</p>
                        <button className="ml-2 text-cyan-500 text-sm hover:text-cyan-600">
                          Copy
                        </button>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-neutral-100 rounded-full transition-colors">
                      <span className="text-neutral-600">⋮</span>
                    </button>
                  </div>

                  {/* Balance Display */}
                  <div className="mb-8">
                    <span className="text-sm text-neutral-500">Balance</span>
                    <div className="flex items-baseline mt-1">
                      <span className="text-3xl font-bold text-neutral-900 mr-3">
                        {formatCryptoAmount(selectedWallet.balance, selectedWallet.blockchain.toUpperCase())}
                      </span>
                      <span className="text-lg text-neutral-500 capitalize">
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
                    <Link href="/receive" className="flex-1 flex items-center justify-center py-3 bg-white border border-cyan-500 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors">
                      <span className="mr-2">📥</span>
                      Receive
                    </Link>
                    <Link href="/exchange" className="flex-1 flex items-center justify-center py-3 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                      <span className="mr-2">🔄</span>
                      Swap
                    </Link>
                  </div>

                  {/* Transaction History Preview */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-medium text-neutral-800">Recent Transactions</h3>
                      <Link href="/transactions" className="text-cyan-500 text-sm hover:text-cyan-600 transition-colors">
                        View All
                      </Link>
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm text-neutral-500 py-6 text-center">
                        Transaction history will appear here
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                  <div className="text-center py-12">
                    <div className="text-neutral-400 mb-4">
                      <span className="text-4xl">💼</span>
                    </div>
                    <h3 className="text-lg font-medium text-neutral-700 mb-2">No wallet selected</h3>
                    <p className="text-neutral-500">
                      Select a wallet from the list to view its details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}