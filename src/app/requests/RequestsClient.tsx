'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  FiCopy, FiCheck, FiShare2, FiDollarSign, FiUser, 
  FiQrCode, FiLink, FiRefreshCw, FiDownload, FiEye,
  FiEyeOff, FiPlus, FiCreditCard
} from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'
import QRCode from 'react-qr-code'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/contexts/AuthContext'

interface PaymentRequest {
  requestId: string
  fromUserId: string
  toUserId?: string
  toEmail?: string
  tokenId: string
  amount: string
  description?: string
  dueDate?: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  paymentTxId?: string
  invoiceNumber?: string
  metadata?: string
  createdAt: string
  paidAt?: string
}

interface UserWallet {
  walletId: string
  userId: string
  walletName: string
  walletType: 'hot' | 'cold' | 'hardware' | 'imported'
  blockchain: string
  walletAddress: string
  isDefault: boolean
  isActive: boolean
  balance: number
}

const BASE_URI = process.env.NEXT_PUBLIC_BASE_URL || 'https://pay.web3lancer.com'

export function RequestsClient() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'receive' | 'requests'>('receive')
  const [showQRModal, setShowQRModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAmountQR, setShowAmountQR] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<UserWallet | null>(null)
  const [requestAmount, setRequestAmount] = useState('')
  const [requestDescription, setRequestDescription] = useState('')
  const [requestExpiry, setRequestExpiry] = useState('7')
  const [copySuccess, setCopySuccess] = useState('')
  const [qrData, setQrData] = useState('')
  const [balanceVisible, setBalanceVisible] = useState(true)
  
  // Mock data - in real app, fetch from database
  const [userWallets] = useState<UserWallet[]>([
    {
      walletId: 'wallet1',
      userId: user?.id || 'user1',
      walletName: 'Main Bitcoin Wallet',
      walletType: 'hot',
      blockchain: 'bitcoin',
      walletAddress: 'bc1q84x0yrztvcjg88qef4d6978zfj4lvlcwhhfj2k',
      isDefault: true,
      isActive: true,
      balance: 0.2845
    },
    {
      walletId: 'wallet2',
      userId: user?.id || 'user1',
      walletName: 'Ethereum Wallet',
      walletType: 'hot',
      blockchain: 'ethereum',
      walletAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
      isDefault: false,
      isActive: true,
      balance: 2.156
    }
  ])

  const [activeRequests] = useState<PaymentRequest[]>([
    {
      requestId: 'req_001',
      fromUserId: user?.id || 'user1',
      tokenId: 'btc',
      amount: '0.05',
      description: 'Website design payment',
      status: 'pending',
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ])

  const defaultWallet = userWallets.find(w => w.isDefault) || userWallets[0]
  const username = user?.name?.toLowerCase().replace(' ', '.') || 'user'

  useEffect(() => {
    if (selectedWallet) {
      setSelectedWallet(selectedWallet)
    } else {
      setSelectedWallet(defaultWallet)
    }
  }, [])

  const generateDefaultQR = () => {
    const defaultPaymentURI = `${BASE_URI}/pay/${username}`
    setQrData(defaultPaymentURI)
    setShowQRModal(true)
  }

  const generateAmountQR = () => {
    if (!requestAmount || !selectedWallet) return
    
    const paymentURI = `${BASE_URI}/pay/${username}?amount=${requestAmount}&wallet=${selectedWallet.walletAddress}&token=${selectedWallet.blockchain}&description=${encodeURIComponent(requestDescription || '')}`
    setQrData(paymentURI)
    setShowAmountQR(true)
  }

  const createPaymentRequest = () => {
    if (!requestAmount || !selectedWallet) return
    
    // In real app, create request in database
    const requestId = `req_${Date.now()}`
    const requestURI = `${BASE_URI}/request/${username}/${requestId}`
    
    setQrData(requestURI)
    setShowCreateModal(false)
    setShowQRModal(true)
    
    // Reset form
    setRequestAmount('')
    setRequestDescription('')
    setRequestExpiry('7')
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopySuccess(text)
    setTimeout(() => setCopySuccess(''), 3000)
  }

  const getBlockchainSymbol = (blockchain: string) => {
    const symbols: Record<string, string> = {
      bitcoin: 'BTC',
      ethereum: 'ETH',
      polygon: 'MATIC',
      bsc: 'BNB'
    }
    return symbols[blockchain] || blockchain.toUpperCase()
  }

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Payment Requests</h1>
          <p className="text-neutral-600 mt-2">
            Create instant payment links, generate QR codes, and receive crypto payments seamlessly
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl border border-neutral-200 p-1 mb-6 inline-flex">
          <button
            onClick={() => setActiveTab('receive')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'receive'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FiQrCode className="inline w-4 h-4 mr-2" />
            Receive Payments
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'requests'
                ? 'bg-cyan-500 text-white shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FiLink className="inline w-4 h-4 mr-2" />
            My Requests
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'receive' && (
            <motion.div
              key="receive"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Default Payment QR */}
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold text-neutral-900">Your Default Payment QR</h2>
                    <p className="text-sm text-neutral-600 mt-1">
                      Universal QR code for receiving any amount from anyone
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={generateDefaultQR}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FiQrCode className="w-4 h-4" />
                    Show QR
                  </motion.button>
                </div>

                <div className="bg-white rounded-lg p-4 border border-cyan-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-neutral-600">Your Payment Link</p>
                      <p className="font-mono text-sm text-neutral-900 break-all">
                        {BASE_URI}/pay/{username}
                      </p>
                    </div>
                    <button
                      onClick={() => handleCopy(`${BASE_URI}/pay/${username}`)}
                      className="p-2 text-neutral-500 hover:text-cyan-600 transition-colors"
                    >
                      {copySuccess === `${BASE_URI}/pay/${username}` ? (
                        <FiCheck className="w-4 h-4 text-green-600" />
                      ) : (
                        <FiCopy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Wallet Selection */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Select Receiving Wallet</h3>
                <div className="grid gap-3">
                  {userWallets.filter(w => w.isActive).map((wallet) => (
                    <motion.div
                      key={wallet.walletId}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedWallet(wallet)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${
                        selectedWallet?.walletId === wallet.walletId
                          ? 'border-cyan-500 bg-cyan-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {getBlockchainSymbol(wallet.blockchain).charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-medium text-neutral-900">{wallet.walletName}</h4>
                            <p className="text-sm text-neutral-600">
                              {getBlockchainSymbol(wallet.blockchain)} • {wallet.walletAddress.slice(0, 8)}...{wallet.walletAddress.slice(-6)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            {balanceVisible ? (
                              <p className="font-medium text-neutral-900">
                                {formatCryptoAmount(wallet.balance, getBlockchainSymbol(wallet.blockchain))}
                              </p>
                            ) : (
                              <p className="font-medium text-neutral-900">••••••</p>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setBalanceVisible(!balanceVisible)
                              }}
                              className="text-neutral-400 hover:text-neutral-600"
                            >
                              {balanceVisible ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                            </button>
                          </div>
                          {wallet.isDefault && (
                            <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Amount-Specific QR */}
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Request Specific Amount</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Amount ({selectedWallet ? getBlockchainSymbol(selectedWallet.blockchain) : 'TOKEN'})
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={requestAmount}
                      onChange={(e) => setRequestAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Description (Optional)
                    </label>
                    <input
                      type="text"
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      placeholder="What's this payment for?"
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={generateAmountQR}
                    disabled={!requestAmount || !selectedWallet}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-neutral-300 text-white py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <FiQrCode className="w-4 h-4" />
                    Generate Payment QR
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowCreateModal(true)}
                    disabled={!requestAmount || !selectedWallet}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-neutral-300 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    Create Request
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'requests' && (
            <motion.div
              key="requests"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-neutral-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-neutral-900">Active Payment Requests</h2>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <FiPlus className="w-4 h-4" />
                    New Request
                  </button>
                </div>

                <div className="space-y-4">
                  {activeRequests.length > 0 ? (
                    activeRequests.map((request, index) => (
                      <motion.div
                        key={request.requestId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 border border-neutral-200 rounded-lg hover:border-cyan-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-neutral-900">
                              {request.description || 'Payment Request'}
                            </h4>
                            <p className="text-sm text-neutral-600 mt-1">
                              {formatCryptoAmount(parseFloat(request.amount), getBlockchainSymbol(selectedWallet?.blockchain || 'btc'))}
                            </p>
                            <p className="text-xs text-neutral-500 mt-1">
                              Created {new Date(request.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              request.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                              request.status === 'paid' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {request.status}
                            </span>
                            <button
                              onClick={() => handleCopy(`${BASE_URI}/request/${username}/${request.requestId}`)}
                              className="p-2 text-neutral-500 hover:text-cyan-600 transition-colors"
                            >
                              <FiShare2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FiLink className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-neutral-900 mb-2">No active requests</h3>
                      <p className="text-neutral-600 mb-4">Create your first payment request to get started</p>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Create Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* QR Code Modal */}
        <AnimatePresence>
          {(showQRModal || showAmountQR) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => {
                setShowQRModal(false)
                setShowAmountQR(false)
              }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-center">
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">Payment QR Code</h3>
                  <p className="text-neutral-600 mb-6">
                    {showAmountQR ? 
                      `Scan to pay ${requestAmount} ${selectedWallet ? getBlockchainSymbol(selectedWallet.blockchain) : 'TOKEN'}` :
                      'Scan to send any amount'
                    }
                  </p>

                  <div className="bg-white p-4 rounded-lg border border-neutral-200 mb-6">
                    <QRCode value={qrData} size={200} className="mx-auto" />
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-neutral-50 rounded-lg">
                      <p className="text-xs text-neutral-600 mb-1">Payment Link:</p>
                      <p className="font-mono text-sm text-neutral-900 break-all">{qrData}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleCopy(qrData)}
                        className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
                      >
                        {copySuccess === qrData ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                        {copySuccess === qrData ? 'Copied!' : 'Copy Link'}
                      </button>
                      <button
                        onClick={() => {
                          setShowQRModal(false)
                          setShowAmountQR(false)
                        }}
                        className="bg-cyan-500 hover:bg-cyan-600 text-white py-2 px-6 rounded-lg transition-colors"
                      >
                        Done
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Create Request Modal */}
        <AnimatePresence>
          {showCreateModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-neutral-900 mb-4">Create Payment Request</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Expiration</label>
                    <select
                      value={requestExpiry}
                      onChange={(e) => setRequestExpiry(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                    >
                      <option value="1">1 Day</option>
                      <option value="3">3 Days</option>
                      <option value="7">7 Days</option>
                      <option value="14">14 Days</option>
                      <option value="30">30 Days</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createPaymentRequest}
                    disabled={!requestAmount || !selectedWallet}
                    className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:bg-neutral-300 text-white py-3 rounded-lg transition-colors"
                  >
                    Create Request
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}
}