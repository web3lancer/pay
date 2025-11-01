'use client'

import React, { useState } from 'react'

import { FiPlus, FiCopy, FiDownload, FiShare2, FiX, FiCheck } from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'

// Mock data for payment history
const paymentHistory = [
  {
    id: 'req1',
    description: 'Website design payment',
    amount: 0.05,
    symbol: 'BTC',
    fiatAmount: 2500,
    status: 'pending',
    created: new Date(Date.now() - 86400000), // 1 day ago
    expires: new Date(Date.now() + 86400000 * 6), // 6 days from now
    address: 'bc1q84x0yrztvcjg88qef4d6978zfj4lvlcwhhfj2k'
  },
  {
    id: 'req2',
    description: 'Logo design invoice',
    amount: 0.25,
    symbol: 'ETH',
    fiatAmount: 750,
    status: 'pending',
    created: new Date(Date.now() - 86400000 * 2), // 2 days ago
    expires: new Date(Date.now() + 86400000 * 5), // 5 days from now
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  },
  {
    id: 'req3',
    description: 'Monthly subscription',
    amount: 100,
    symbol: 'USDC',
    fiatAmount: 100,
    status: 'completed',
    created: new Date(Date.now() - 86400000 * 5), // 5 days ago
    expires: null,
    address: '0x8976EC7ab88b098defB751B7401B5f6d8971C765',
    completedAt: new Date(Date.now() - 86400000 * 3) // 3 days ago
  }
]

export function HistoryClient() {
  const [copySuccess, setCopySuccess] = useState('')
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopySuccess(address)
    setTimeout(() => setCopySuccess(''), 3000)
  }

  return (
    <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-neutral-900">Payment History</h1>
          <p className="text-neutral-600 mt-1">View your past payment requests and transactions</p>
        </div>

        {/* History List */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">All Requests</h2>

          <div className="space-y-4">
            {paymentHistory.map((request, index) => (
              <div 
                key={request.id}
                className={`p-4 border rounded-lg ${
                  request.status === 'completed' 
                    ? 'border-neutral-200 bg-neutral-50'
                    : 'border-cyan-200'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.3,
                  ease: [0.25, 1, 0.5, 1],
                  delay: index * 0.1
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center">
                      <h3 className="font-medium text-neutral-900">{request.description}</h3>
                      <span className={`ml-3 text-xs px-2 py-0.5 rounded-full ${
                        request.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {request.status === 'pending' ? 'Pending' : 'Completed'}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center text-sm">
                      <span className="font-medium text-neutral-800">
                        {formatCryptoAmount(request.amount, request.symbol)}
                      </span>
                      <span className="mx-1 text-neutral-400">•</span>
                      <span className="text-neutral-500">{formatCurrency(request.fiatAmount)}</span>
                    </div>
                    <div className="mt-1 text-xs text-neutral-500">
                      Created {new Date(request.created).toLocaleDateString()}
                      {request.status === 'pending' && request.expires && (
                        <>
                          <span className="mx-1 text-neutral-400">•</span>
                          Expires {new Date(request.expires).toLocaleDateString()}
                        </>
                      )}
                      {request.status === 'completed' && request.completedAt && (
                        <>
                          <span className="mx-1 text-neutral-400">•</span>
                          Completed {new Date(request.completedAt).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCopyAddress(request.address)}
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                      title="Copy Address"
                    >
                      {copySuccess === request.address ? <FiCheck className="text-green-600" /> : <FiCopy />}
                    </button>
                    <button 
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded transition-colors"
                      title="Download Receipt"
                    >
                      <FiDownload />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {paymentHistory.length === 0 && (
              <div className="text-center py-10">
                <p className="text-neutral-500">No payment history found</p>
              </div>
            )}
          </div>
        </div>
    </div>
  )
}