'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FiArrowUp, FiArrowDown, FiPlus, FiSend, FiDownload } from 'react-icons/fi'
import { truncateString, formatCurrency, formatRelativeTime } from '@/lib/utils'

// Mock data for dashboard
const portfolioBalance = 12345.67
const recentTransactions = [
  {
    id: 'tx1',
    type: 'sent',
    recipient: 'John Doe',
    address: '0x1234567890abcdef1234567890abcdef12345678',
    amount: 123,
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    status: 'confirmed',
    confirmations: 12
  },
  {
    id: 'tx2',
    type: 'received',
    sender: 'Alice Smith',
    address: '0xabcdef1234567890abcdef1234567890abcdef12',
    amount: 450,
    timestamp: new Date(Date.now() - 86400000), // 1 day ago
    status: 'confirmed',
    confirmations: 64
  },
  {
    id: 'tx3',
    type: 'sent',
    recipient: 'Bob Johnson',
    address: '0x7890abcdef1234567890abcdef1234567890abcd',
    amount: 50,
    timestamp: new Date(Date.now() - 172800000), // 2 days ago
    status: 'confirmed',
    confirmations: 128
  }
]

const priceAlerts = [
  { id: 'alert1', symbol: 'BTC', changePercent: 5.2, direction: 'up' },
  { id: 'alert2', symbol: 'ETH', changePercent: 3.8, direction: 'up' },
  { id: 'alert3', symbol: 'SOL', changePercent: 2.1, direction: 'down' }
]

const activeRequests = 3

export function DashboardClient() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* AppShell would go here in a real implementation */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Portfolio Overview */}
            <motion.div 
              className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            >
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Portfolio Overview</h2>
              <div className="flex flex-col">
                <span className="text-sm text-neutral-500">Total Balance</span>
                <span className="text-3xl font-bold text-neutral-900 mt-1">
                  {formatCurrency(portfolioBalance)}
                </span>
                <div className="mt-2 flex items-center">
                  <span className="inline-flex items-center text-accent-green text-sm">
                    <FiArrowUp className="mr-1" />
                    2.4%
                  </span>
                  <span className="text-xs text-neutral-500 ml-2">past 24h</span>
                </div>
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">Recent Transactions</h2>
                <button className="text-primary-500 text-sm hover:text-primary-600 transition-colors">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {recentTransactions.map((tx, index) => (
                  <motion.div 
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-neutral-200 hover:border-primary-200 transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.25, 1, 0.5, 1],
                      delay: index * 0.1
                    }}
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'sent' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {tx.type === 'sent' ? (
                          <FiArrowUp className="text-accent-red" />
                        ) : (
                          <FiArrowDown className="text-accent-green" />
                        )}
                      </div>
                      <div className="ml-4">
                        <p className="font-medium text-neutral-900">
                          {tx.type === 'sent' ? `Sent to ${tx.recipient}` : `Received from ${tx.sender}`}
                        </p>
                        <p className="text-xs text-neutral-500">{truncateString(tx.address)}</p>
                        <p className="text-xs text-neutral-500">
                          {tx.status === 'confirmed' ? (
                            <span>Confirmed • {tx.confirmations} confirmations</span>
                          ) : (
                            <span>Pending</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        tx.type === 'sent' ? 'text-accent-red' : 'text-accent-green'
                      }`}>
                        {tx.type === 'sent' ? '-' : '+'}${tx.amount}
                      </p>
                      <p className="text-xs text-neutral-500">{formatRelativeTime(tx.timestamp)}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-8">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-3 gap-4">
                <button className="flex flex-col items-center justify-center py-4 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                    <FiSend className="text-primary-500" />
                  </div>
                  <span className="text-sm text-neutral-700">Send</span>
                </button>
                <button className="flex flex-col items-center justify-center py-4 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                    <FiDownload className="text-primary-500" />
                  </div>
                  <span className="text-sm text-neutral-700">Request</span>
                </button>
                <button className="flex flex-col items-center justify-center py-4 rounded-lg hover:bg-neutral-50 transition-colors">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mb-2">
                    <FiPlus className="text-primary-500" />
                  </div>
                  <span className="text-sm text-neutral-700">Add Wallet</span>
                </button>
              </div>
            </div>

            {/* Price Alerts */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
              <h2 className="text-xl font-semibold text-neutral-900 mb-4">Price Alerts</h2>
              <div className="space-y-4">
                {priceAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
                        <span className="font-medium text-xs">{alert.symbol}</span>
                      </div>
                      <span className="ml-3 font-medium text-neutral-800">{alert.symbol}</span>
                    </div>
                    <div className={`flex items-center ${
                      alert.direction === 'up' ? 'text-accent-green' : 'text-accent-red'
                    }`}>
                      {alert.direction === 'up' ? <FiArrowUp className="mr-1" /> : <FiArrowDown className="mr-1" />}
                      <span>{alert.changePercent}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Requests */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-neutral-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-neutral-900">Active Requests</h2>
                <span className="bg-primary-100 text-primary-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
                  {activeRequests}
                </span>
              </div>
              <button className="w-full py-2.5 px-4 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors font-medium">
                View Requests
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}