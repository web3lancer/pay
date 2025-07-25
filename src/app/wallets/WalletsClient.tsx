'use client'

import React, { useState } from 'react';

import Link from 'next/link';

import { AppShell } from '@/components/layout/AppShell';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import {
  AptosIntegrationProvider,
} from '@/integrations/aptos/components/AptosIntegrationProvider';
import { WalletSelector } from '@/integrations/aptos/components/WalletSelector';
import { ENABLE_APTOS } from '@/integrations/aptos/constants';

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

// Mock data for wallets
const wallets = [
  {
    id: 'wallet1',
    name: 'Bitcoin Wallet',
    type: 'bitcoin',
    address: 'bc1q84x0yrztvcjg88qef4d6978zfj4lvlcwhhfj2k',
    balance: {
      crypto: 0.45123,
      symbol: 'BTC',
      fiat: 12345.67
    }
  },
  {
    id: 'wallet2',
    name: 'Ethereum Wallet',
    type: 'ethereum',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    balance: {
      crypto: 3.2156,
      symbol: 'ETH',
      fiat: 9876.54
    }
  },
  {
    id: 'wallet3',
    name: 'USDC Wallet',
    type: 'ethereum',
    address: '0x8976EC7ab88b098defB751B7401B5f6d8971C765',
    balance: {
      crypto: 5000.00,
      symbol: 'USDC',
      fiat: 5000.00
    }
  }
]

export function WalletsClient() {
  useExchangeRate()
  const [activeWallet, setActiveWallet] = useState(wallets[0].id)

  const handleWalletSelect = (walletId: string) => {
    setActiveWallet(walletId)
  }

  const selectedWallet = wallets.find(wallet => wallet.id === activeWallet) || wallets[0]

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
                {wallets.map((wallet, index) => (
                  <div
                    key={wallet.id}
                    className={`p-4 cursor-pointer transition-all duration-300 ${
                      activeWallet === wallet.id 
                        ? 'bg-cyan-50 border-l-4 border-cyan-500' 
                        : 'hover:bg-neutral-50'
                    }`}
                    onClick={() => handleWalletSelect(wallet.id)}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                          {wallet.type === 'bitcoin' && <span className="text-amber-500">₿</span>}
                          {wallet.type === 'ethereum' && <span className="text-blue-500">Ξ</span>}
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-neutral-900">{wallet.name}</p>
                          <p className="text-xs text-neutral-500">{truncateString(wallet.address)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-neutral-900">
                          {formatCurrency(wallet.balance.fiat)}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {formatCryptoAmount(
                            wallet.balance.crypto, 
                            wallet.balance.symbol
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {ENABLE_APTOS && (
                <AptosIntegrationProvider>
                  <div className="mt-4">
                    <WalletSelector wallets={[]} onConnect={function (wallet: any): void {
                      throw new Error('Function not implemented.');
                    } } onDisconnect={function (): void {
                      throw new Error('Function not implemented.');
                    } } />
                  </div>
                </AptosIntegrationProvider>
              )}
            </div>
            
            {/* Selected Wallet Details */}
            <div className="lg:col-span-8">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">{selectedWallet.name}</h2>
                    <div className="flex items-center mt-1">
                      <p className="text-sm text-neutral-500">{selectedWallet.address}</p>
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
                      {formatCurrency(selectedWallet.balance.fiat)}
                    </span>
                    <span className="text-lg text-neutral-500">
                      {formatCryptoAmount(
                        selectedWallet.balance.crypto, 
                        selectedWallet.balance.symbol
                      )}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 mb-8">
                  <button className="flex-1 flex items-center justify-center py-3 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors">
                    <span className="mr-2">📤</span>
                    Send
                  </button>
                  <button className="flex-1 flex items-center justify-center py-3 bg-white border border-cyan-500 text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors">
                    <span className="mr-2">📥</span>
                    Receive
                  </button>
                  <button className="flex-1 flex items-center justify-center py-3 bg-white border border-neutral-300 text-neutral-700 hover:bg-neutral-50 rounded-lg transition-colors">
                    <span className="mr-2">🔄</span>
                    Swap
                  </button>
                </div>

                {/* Transaction History Preview */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium text-neutral-800">Recent Transactions</h3>
                    <button className="text-cyan-500 text-sm hover:text-cyan-600 transition-colors">
                      View All
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-neutral-500 py-6 text-center">
                      Transaction history will appear here
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}