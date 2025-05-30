'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiPlus, FiCopy, FiDownload, FiShare2, FiX, FiCheck } from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'
import QRCode from 'react-qr-code'
import { AppShell } from '@/components/layout/AppShell'

// Mock data
const wallets = [
  {
    id: 'wallet1',
    name: 'Bitcoin Wallet',
    type: 'bitcoin',
    symbol: 'BTC',
    address: 'bc1q84x0yrztvcjg88qef4d6978zfj4lvlcwhhfj2k'
  },
  {
    id: 'wallet2',
    name: 'Ethereum Wallet',
    type: 'ethereum',
    symbol: 'ETH',
    address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  },
  {
    id: 'wallet3',
    name: 'USDC Wallet',
    type: 'ethereum',
    symbol: 'USDC',
    address: '0x8976EC7ab88b098defB751B7401B5f6d8971C765'
  }
]

const activeRequests = [
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
    expires: null, // Already completed
    address: '0x8976EC7ab88b098defB751B7401B5f6d8971C765',
    completedAt: new Date(Date.now() - 86400000 * 3) // 3 days ago
  }
]

export function RequestsClient() {
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState(wallets[0])
  const [requestAmount, setRequestAmount] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [requestExpiry, setRequestExpiry] = useState('7') // days
  const [showQRModal, setShowQRModal] = useState(false)
  const [activeRequest, setActiveRequest] = useState<typeof activeRequests[0] | null>(null)
  const [copySuccess, setCopySuccess] = useState('')
  
  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, this would send a request to the backend
    // For demo, we'll just close the modal
    setShowNewRequestModal(false)
    
    // Reset form
    setRequestAmount('')
    setRequestDescription('')
    setRequestExpiry('7')
  }
  
  const handleShowQR = (request: typeof activeRequests[0]) => {
    setActiveRequest(request)
    setShowQRModal(true)
  }
  
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopySuccess(address)
    setTimeout(() => setCopySuccess(''), 3000)
  }

  return (
        <AppShell>
    
    <div className="min-h-screen bg-neutral-50">
      {/* AppShell would go here in a real implementation */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Payment Requests</h1>
            <p className="text-sm text-neutral-500">Create and manage payment requests</p>
          </div>
          <button 
            onClick={() => setShowNewRequestModal(true)}
            className="flex items-center px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <FiPlus className="mr-2" />
            New Request
          </button>
        </div>

        {/* Requests List */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4">Active Requests</h2>

          <div className="space-y-4">
            {activeRequests.map((request, index) => (
              <motion.div 
                key={request.id}
                className={`p-4 border rounded-lg ${
                  request.status === 'completed' 
                    ? 'border-neutral-200 bg-neutral-50'
                    : 'border-primary-200'
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

                  {request.status === 'pending' && (
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleShowQR(request)}
                        className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                        title="Show QR Code"
                      >
                        <FiShare2 />
                      </button>
                      <button 
                        onClick={() => handleCopyAddress(request.address)}
                        className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                        title="Copy Address"
                      >
                        <FiCopy />
                      </button>
                      <button 
                        className="p-2 text-neutral-500 hover:text-red-500 hover:bg-neutral-100 rounded"
                        title="Cancel Request"
                      >
                        <FiX />
                      </button>
                    </div>
                  )}

                  {request.status === 'completed' && (
                    <button 
                      className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded"
                      title="Download Receipt"
                    >
                      <FiDownload />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}

            {activeRequests.length === 0 && (
              <div className="text-center py-10">
                <p className="text-neutral-500">No payment requests found</p>
                <button
                  onClick={() => setShowNewRequestModal(true)}
                  className="mt-4 px-4 py-2 text-primary-500 border border-primary-500 rounded-lg hover:bg-primary-50 transition-colors"
                >
                  Create your first request
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Create Payment Request</h2>
              <button 
                onClick={() => setShowNewRequestModal(false)} 
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <FiX />
              </button>
            </div>
            
            <form onSubmit={handleCreateRequest}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Select Wallet
                  </label>
                  <select 
                    value={selectedWallet.id}
                    onChange={(e) => {
                      const wallet = wallets.find(w => w.id === e.target.value);
                      if (wallet) setSelectedWallet(wallet);
                    }}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {wallets.map(wallet => (
                      <option key={wallet.id} value={wallet.id}>
                        {wallet.name} ({wallet.symbol})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Amount
                  </label>
                  <div className="flex">
                    <input 
                      type="number"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="0.00"
                      required
                      className="flex-1 p-3 border border-neutral-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="bg-neutral-50 border border-l-0 border-neutral-300 rounded-r-lg px-4 flex items-center">
                      {selectedWallet.symbol}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Description
                  </label>
                  <input 
                    type="text"
                    value={requestDescription}
                    onChange={(e) => setRequestDescription(e.target.value)}
                    placeholder="What is this payment for?"
                    required
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Expiration
                  </label>
                  <select 
                    value={requestExpiry}
                    onChange={(e) => setRequestExpiry(e.target.value)}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowNewRequestModal(false)}
                  className="px-4 py-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                >
                  Create Request
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && activeRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-neutral-900">Payment QR Code</h2>
              <button 
                onClick={() => setShowQRModal(false)} 
                className="p-2 hover:bg-neutral-100 rounded-full"
              >
                <FiX />
              </button>
            </div>
            
            <div className="text-center">
              <h3 className="font-medium text-neutral-800 mb-2">{activeRequest.description}</h3>
              <p className="text-xl font-bold text-neutral-900">
                {formatCryptoAmount(activeRequest.amount, activeRequest.symbol)}
              </p>
              <p className="text-neutral-500">{formatCurrency(activeRequest.fiatAmount)}</p>
              
              <div className="my-6 bg-white p-4 mx-auto w-fit">
                <QRCode 
                  value={`${activeRequest.symbol.toLowerCase()}:${activeRequest.address}?amount=${activeRequest.amount}`}
                  size={200}
                  className="mx-auto"
                />
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-neutral-700 mb-2">Send exactly:</p>
                <p className="text-lg font-medium text-neutral-900 mb-4">
                  {formatCryptoAmount(activeRequest.amount, activeRequest.symbol)}
                </p>
                
                <p className="text-sm text-neutral-700 mb-2">To this address:</p>
                <div className="relative">
                  <input
                    type="text"
                    value={activeRequest.address}
                    readOnly
                    className="w-full p-3 pr-12 bg-neutral-50 border border-neutral-300 rounded-lg text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopyAddress(activeRequest.address)}
                    className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600"
                  >
                    {copySuccess === activeRequest.address ? <FiCheck /> : <FiCopy />}
                  </button>
                </div>
                
                <div className="mt-6 flex justify-center">
                  <button
                    onClick={() => setShowQRModal(false)}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
    </AppShell>
  )
}