'use client'

import React from 'react'
import { AppShell } from '@/components/layout/AppShell'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-neutral-900">Welcome back!</h1>
          <p className="text-neutral-700 mt-1">Your crypto dashboard is ready.</p>
        </div>

        {/* Quick Action Widgets */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/send" className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:border-cyan-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-full bg-cyan-100 flex items-center justify-center mb-4 group-hover:bg-cyan-200 transition-colors">
              <span className="text-2xl">📤</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Send</h3>
            <p className="mt-1 text-sm text-neutral-600">Send crypto to anyone, anywhere.</p>
          </Link>

          <Link href="/requests" className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:border-cyan-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <span className="text-2xl">📥</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Receive</h3>
            <p className="mt-1 text-sm text-neutral-600">Request and receive payments.</p>
          </Link>

          <Link href="/exchange" className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:border-cyan-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <span className="text-2xl">🔄</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Exchange</h3>
            <p className="mt-1 text-sm text-neutral-600">Swap between cryptocurrencies.</p>
          </Link>

          <Link href="/scan" className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200 hover:border-cyan-500 hover:shadow-md transition-all group">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <span className="text-2xl">📷</span>
            </div>
            <h3 className="text-lg font-medium text-neutral-900">Scan</h3>
            <p className="mt-1 text-sm text-neutral-600">Scan QR codes to pay quickly.</p>
          </Link>
        </div>

        {/* Balance Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Your Balances</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Balance</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">$12,345.67</p>
              <div className="flex items-center mt-1 text-green-600">
                <span className="text-sm font-medium">↑ 3.2%</span>
                <span className="text-xs text-neutral-500 ml-2">past 24h</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Link 
                href="/wallets" 
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
              >
                View Wallets
              </Link>
            </div>
          </div>
          
          {/* Quick wallet summary */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600">₿</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-neutral-900">Bitcoin</p>
                  <p className="text-xs text-neutral-500">0.45 BTC</p>
                </div>
              </div>
              <p className="font-medium text-neutral-900">$10,245.00</p>
            </div>
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-blue-600">Ξ</span>
                </div>
                <div className="ml-3">
                  <p className="font-medium text-neutral-900">Ethereum</p>
                  <p className="text-xs text-neutral-500">1.23 ETH</p>
                </div>
              </div>
              <p className="font-medium text-neutral-900">$2,100.67</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-neutral-900">Recent Transactions</h2>
            <Link href="/history" className="text-cyan-500 hover:text-cyan-600 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {/* Empty state */}
            <div className="py-12 text-center">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">No transactions yet</h3>
              <p className="text-neutral-600 max-w-sm mx-auto">
                When you make your first transaction, it will appear here for quick access.
              </p>
              <div className="mt-6">
                <Link 
                  href="/send" 
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors"
                >
                  Make Your First Transaction
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}