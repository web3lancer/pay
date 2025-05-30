'use client'

import React from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WalletCard } from '@/components/crypto/WalletCard'
import { FiPlusCircle, FiDownload, FiDatabase } from 'react-icons/fi'

// These would typically come from an API or state
const wallets = [
  {
    id: '1',
    name: 'Bitcoin Wallet',
    address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
    balance: {
      fiat: 12345.67,
      crypto: 0.45123,
      symbol: 'BTC'
    }
  },
  {
    id: '2',
    name: 'Ethereum Wallet',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    balance: {
      fiat: 4567.89,
      crypto: 3.12345,
      symbol: 'ETH'
    }
  },
  {
    id: '3',
    name: 'USDC Wallet',
    address: '0x8894E0a0c962CB723c1976a4421c95949bE2D4E3',
    balance: {
      fiat: 1000.00,
      crypto: 1000.00,
      symbol: 'USDC'
    }
  }
]

export function WalletsClient() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Wallets</h1>
            <p className="text-sm text-neutral-500">Manage your crypto wallets</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              leftIcon={<FiDownload />}
              size="sm"
            >
              Import Wallet
            </Button>
            <Button 
              leftIcon={<FiPlusCircle />}
              size="sm"
            >
              Create Wallet
            </Button>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card>
          <CardHeader>
            <CardTitle>Total Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div>
                <p className="text-sm text-neutral-500">All Wallets</p>
                <h2 className="text-3xl font-bold">$17,913.56</h2>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">+3.2%</span>
                  <span className="text-xs text-neutral-500">Last 24h</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 md:ml-auto">
                <Button
                  variant="ghost"
                  leftIcon={<FiDatabase />}
                  size="sm"
                >
                  Backup All Wallets
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wallets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet) => (
            <WalletCard
              key={wallet.id}
              name={wallet.name}
              address={wallet.address}
              balance={wallet.balance}
              onSend={() => console.log('Send from', wallet.id)}
              onReceive={() => console.log('Receive to', wallet.id)}
              onSwap={() => console.log('Swap with', wallet.id)}
              onDetails={() => console.log('View details', wallet.id)}
            />
          ))}
          
          {/* Add Wallet Card */}
          <Card className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all cursor-pointer">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
              <FiPlusCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Add New Wallet</h3>
            <p className="text-sm text-gray-500 text-center">Create a new wallet or import an existing one</p>
          </Card>
        </div>
      </div>
    </AppShell>
  )
}