'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { 
  FiArrowLeft, FiSearch, FiUser, FiCamera, FiCopy, FiCheck, 
  FiAlertCircle, FiDollarSign, FiZap, FiClock, FiTrendingUp,
  FiWifi, FiWifiOff
} from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount, isValidBitcoinAddress, isValidEthereumAddress } from '@/lib/utils'
import { AppShell } from '@/components/layout/AppShell'

interface Contact {
  id: string
  name: string
  username: string
  avatar?: string
  lastSeen: Date
  isOnline: boolean
}

interface WalletOption {
  id: string
  name: string
  symbol: string
  balance: number
  usdValue: number
  network: string
  icon: string
}

interface NetworkFee {
  network: string
  slow: { fee: number, time: string }
  standard: { fee: number, time: string }
  fast: { fee: number, time: string }
}

export function SendClient() {
  const { user } = useAuth()
  const [step, setStep] = useState<'recipient' | 'amount' | 'confirm' | 'success'>('recipient')
  const [recipient, setRecipient] = useState('')
  const [recipientType, setRecipientType] = useState<'address' | 'username' | 'contact'>('username')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [amount, setAmount] = useState('')
  const [selectedWallet, setSelectedWallet] = useState<WalletOption | null>(null)
  const [message, setMessage] = useState('')
  const [selectedFee, setSelectedFee] = useState<'slow' | 'standard' | 'fast'>('standard')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [copied, setCopied] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})

  const [contacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Alice Johnson',
      username: 'alice.crypto',
      avatar: '👩‍💼',
      lastSeen: new Date(Date.now() - 1000 * 60 * 5),
      isOnline: true
    },
    {
      id: '2',
      name: 'Bob Smith',
      username: 'bob.btc',
      avatar: '👨‍💻',
      lastSeen: new Date(Date.now() - 1000 * 60 * 30),
      isOnline: false
    },
    {
      id: '3',
      name: 'Carol Williams',
      username: 'carol.eth',
      avatar: '👩‍🎨',
      lastSeen: new Date(Date.now() - 1000 * 60 * 2),
      isOnline: true
    }
  ])

  const [wallets] = useState<WalletOption[]>([
    {
      id: '1',
      name: 'Bitcoin',
      symbol: 'BTC',
      balance: 0.2845,
      usdValue: 8234.50,
      network: 'bitcoin',
      icon: '₿'
    },
    {
      id: '2',
      name: 'Ethereum',
      symbol: 'ETH',
      balance: 2.156,
      usdValue: 3456.78,
      network: 'ethereum',
      icon: 'Ξ'
    },
    {
      id: '3',
      name: 'USD Coin',
      symbol: 'USDC',
      balance: 1156.04,
      usdValue: 1156.04,
      network: 'ethereum',
      icon: '$'
    }
  ])

  const [networkFees] = useState<NetworkFee[]>([
    {
      network: 'bitcoin',
      slow: { fee: 0.0001, time: '~60 min' },
      standard: { fee: 0.0003, time: '~30 min' },
      fast: { fee: 0.0008, time: '~10 min' }
    },
    {
      network: 'ethereum',
      slow: { fee: 0.002, time: '~5 min' },
      standard: { fee: 0.004, time: '~2 min' },
      fast: { fee: 0.008, time: '~30 sec' }
    }
  ])

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const validateRecipient = (value: string) => {
    if (!value) return 'Recipient is required'
    
    if (recipientType === 'address') {
      if (!isValidBitcoinAddress(value) && !isValidEthereumAddress(value)) {
        return 'Invalid wallet address'
      }
    } else if (recipientType === 'username') {
      if (value.length < 3) {
        return 'Username must be at least 3 characters'
      }
    }
    
    return ''
  }

  const validateAmount = (value: string) => {
    if (!value) return 'Amount is required'
    
    const numAmount = parseFloat(value)
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Please enter a valid amount'
    }
    
    if (selectedWallet && numAmount > selectedWallet.balance) {
      return 'Insufficient balance'
    }
    
    return ''
  }

  const handleNext = () => {
    const newErrors: {[key: string]: string} = {}
    
    if (step === 'recipient') {
      const recipientError = validateRecipient(recipient)
      if (recipientError) {
        newErrors.recipient = recipientError
      }
      
      if (Object.keys(newErrors).length === 0) {
        setStep('amount')
      }
    } else if (step === 'amount') {
      const amountError = validateAmount(amount)
      if (amountError) {
        newErrors.amount = amountError
      }
      
      if (!selectedWallet) {
        newErrors.wallet = 'Please select a wallet'
      }
      
      if (Object.keys(newErrors).length === 0) {
        setStep('confirm')
      }
    }
    
    setErrors(newErrors)
  }

  const handleSend = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    setStep('success')
  }

  const currentFee = networkFees.find(f => f.network === selectedWallet?.network)?.[selectedFee]
  const totalAmount = selectedWallet && amount ? 
    parseFloat(amount) + (currentFee?.fee || 0) : 0

  return (
    <AppShell>
      <div className="max-w-md mx-auto space-y-6 pb-20 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => window.history.back()}
            className="p-2 bg-white hover:bg-neutral-100 rounded-full transition-colors shadow-sm border border-neutral-200"
          >
            <FiArrowLeft className="h-5 w-5 text-neutral-800" />
          </motion.button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Send Crypto</h1>
            <p className="text-sm text-neutral-600">Send to anyone, anywhere</p>
          </div>
        </motion.div>

        {/* Progress Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-8"
        >
          {['recipient', 'amount', 'confirm', 'success'].map((stepName, index) => {
            const isActive = step === stepName
            const isCompleted = ['recipient', 'amount', 'confirm', 'success'].indexOf(step) > index
            
            return (
              <div key={stepName} className="flex items-center">
                <motion.div
                  animate={{
                    scale: isActive ? 1.2 : 1,
                    backgroundColor: isCompleted || isActive ? '#0ea5e9' : '#e5e7eb' // cyan-500 instead of primary
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    isCompleted || isActive ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  {index + 1}
                </motion.div>
                {index < 3 && (
                  <div className={`w-12 h-0.5 mx-2 ${
                    isCompleted ? 'bg-cyan-500' : 'bg-neutral-200'
                  }`} />
                )}
              </div>
            )
          })}
        </motion.div>

        <AnimatePresence mode="wait">
          {/* Step 1: Recipient */}
          {step === 'recipient' && (
            <motion.div
              key="recipient"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Recipient Type Selector */}
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <h3 className="font-semibold text-neutral-900 mb-4">Send to</h3>
                
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { key: 'username', label: 'Username', icon: FiUser },
                    { key: 'address', label: 'Address', icon: FiDollarSign },
                    { key: 'contact', label: 'Contact', icon: FiUser }
                  ].map(({ key, label, icon: Icon }) => (
                    <motion.button
                      key={key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setRecipientType(key as any)}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        recipientType === key
                          ? 'border-cyan-500 bg-cyan-50 text-cyan-700'
                          : 'border-neutral-200 hover:border-neutral-300 text-neutral-700'
                      }`}
                    >
                      <Icon className={`h-5 w-5 mx-auto mb-1 ${
                        recipientType === key ? 'text-cyan-600' : 'text-neutral-600'
                      }`} />
                      <span className={`text-xs font-medium ${
                        recipientType === key ? 'text-cyan-700' : 'text-neutral-700'
                      }`}>{label}</span>
                    </motion.button>
                  ))}
                </div>

                {recipientType === 'contact' ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        placeholder="Search contacts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredContacts.map((contact) => (
                        <motion.button
                          key={contact.id}
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            setSelectedContact(contact)
                            setRecipient(contact.username)
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                            selectedContact?.id === contact.id
                              ? 'bg-cyan-50 border border-cyan-200'
                              : 'hover:bg-neutral-50 border border-transparent'
                          }`}
                        >
                          <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center text-white text-lg">
                              {contact.avatar || contact.name.charAt(0)}
                            </div>
                            {contact.isOnline && (
                              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                                <FiWifi className="h-2 w-2 text-white m-0.5" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-neutral-900">{contact.name}</h4>
                            <p className="text-sm text-neutral-600">@{contact.username}</p>
                          </div>
                          <div className="text-right">
                            <div className={`text-xs ${contact.isOnline ? 'text-green-600' : 'text-neutral-500'}`}>
                              {contact.isOnline ? 'Online' : 'Offline'}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={
                          recipientType === 'username' 
                            ? 'Enter username (e.g., alice.crypto)' 
                            : 'Enter wallet address'
                        }
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors ${
                          errors.recipient ? 'border-red-400 focus:border-red-400' : 'border-neutral-300'
                        }`}
                      />
                      
                      {recipientType === 'address' && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setShowQRScanner(true)}
                          className="absolute right-3 top-3 p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                          <FiCamera className="h-5 w-5" />
                        </motion.button>
                      )}
                    </div>
                    
                    {errors.recipient && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-red-600 text-sm"
                      >
                        <FiAlertCircle className="h-4 w-4" />
                        {errors.recipient}
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNext}
                disabled={!recipient}
                className="w-full bg-cyan-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-cyan-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors shadow-md"
              >
                Continue to Next Step
              </motion.button>
            </motion.div>
          )}

          {/* Step 2: Amount */}
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <h3 className="font-semibold text-neutral-900 mb-4">Select Wallet & Amount</h3>

                {/* Wallet selector */}
                <div className="mb-6 space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    From Wallet
                  </label>
                  <div className="space-y-2">
                    {wallets.map(wallet => (
                      <div
                        key={wallet.id}
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedWallet?.id === wallet.id
                            ? 'border-cyan-500 bg-cyan-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-xl">
                              {wallet.icon}
                            </div>
                            <div>
                              <p className="font-medium text-neutral-900">{wallet.name}</p>
                              <p className="text-xs text-neutral-600">
                                {formatCryptoAmount(wallet.balance, wallet.symbol)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-neutral-900">
                              {formatCurrency(wallet.usdValue)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {errors.wallet && (
                    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <FiAlertCircle className="h-4 w-4" />
                      <span>{errors.wallet}</span>
                    </div>
                  )}
                </div>

                {/* Amount input */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Amount
                  </label>
                  <div className={`flex rounded-lg border overflow-hidden ${
                    errors.amount ? 'border-red-400' : 'border-neutral-300'
                  }`}>
                    <input
                      type="text"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="flex-1 px-4 py-3 bg-white text-neutral-900 focus:outline-none"
                    />
                    <div className="bg-neutral-100 flex items-center px-3 font-medium text-neutral-700">
                      {selectedWallet?.symbol || 'CRYPTO'}
                    </div>
                  </div>
                  
                  {selectedWallet && (
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-neutral-600">
                        Available: {formatCryptoAmount(selectedWallet.balance, selectedWallet.symbol)}
                      </span>
                      <button 
                        className="text-cyan-600 font-medium"
                        onClick={() => setAmount(selectedWallet.balance.toString())}
                      >
                        MAX
                      </button>
                    </div>
                  )}
                  
                  {errors.amount && (
                    <div className="flex items-center gap-1 text-red-600 text-sm mt-1">
                      <FiAlertCircle className="h-4 w-4" />
                      <span>{errors.amount}</span>
                    </div>
                  )}
                </div>

                {/* Optional Message */}
                <div className="mt-4 space-y-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    placeholder="Add a note to the recipient..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-white text-neutral-900 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('recipient')}
                  className="bg-white border border-neutral-300 text-neutral-700 py-3 px-5 rounded-lg font-medium hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  Back
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  disabled={!amount || !selectedWallet}
                  className="flex-1 bg-cyan-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-cyan-700 disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  Continue to Confirm
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
                <h3 className="font-semibold text-neutral-900 mb-4">Confirm Transaction</h3>
                
                {/* Transaction Summary */}
                <div className="space-y-4">
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">From</span>
                    <span className="font-medium text-neutral-900">
                      {selectedWallet?.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">To</span>
                    <span className="font-medium text-neutral-900">
                      {recipientType === 'contact' && selectedContact
                        ? selectedContact.name
                        : recipient}
                    </span>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Amount</span>
                    <div className="text-right">
                      <div className="font-medium text-neutral-900">
                        {amount} {selectedWallet?.symbol}
                      </div>
                      <div className="text-sm text-neutral-600">
                        ≈ {formatCurrency(parseFloat(amount) * (selectedWallet?.usdValue || 0) / (selectedWallet?.balance || 1))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-2 border-b border-neutral-100">
                    <span className="text-neutral-600">Network Fee</span>
                    <div className="flex flex-col items-end">
                      <select
                        value={selectedFee}
                        onChange={(e) => setSelectedFee(e.target.value as any)}
                        className="bg-transparent text-right font-medium text-cyan-600 focus:outline-none cursor-pointer text-sm appearance-none"
                      >
                        <option value="slow">Slow</option>
                        <option value="standard">Standard</option>
                        <option value="fast">Fast</option>
                      </select>
                      <div className="text-xs text-neutral-600 mt-1">
                        {selectedWallet && currentFee ? (
                          <>
                            {formatCryptoAmount(currentFee.fee, selectedWallet.symbol)} 
                            {' '}• {currentFee.time}
                          </>
                        ) : (
                          'Calculating...'
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between py-2">
                    <span className="text-neutral-700 font-medium">Total Amount</span>
                    <div className="text-right">
                      <div className="font-semibold text-neutral-900">
                        {totalAmount} {selectedWallet?.symbol}
                      </div>
                      <div className="text-sm text-neutral-600">
                        Including network fee
                      </div>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className="mt-4 p-3 bg-neutral-50 rounded-lg">
                    <div className="text-sm text-neutral-600">Message</div>
                    <div className="text-neutral-900">{message}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('amount')}
                  className="bg-white border border-neutral-300 text-neutral-700 py-3 px-5 rounded-lg font-medium hover:bg-neutral-50 transition-colors shadow-sm"
                >
                  Back
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSend}
                  disabled={isLoading}
                  className="flex-1 bg-cyan-600 text-white py-3 rounded-lg font-semibold text-base hover:bg-cyan-700 disabled:opacity-80 disabled:cursor-not-allowed transition-colors shadow-md"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Confirm & Send'
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 text-center"
            >
              <div className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center mb-4"
                >
                  <FiCheck className="h-10 w-10 text-green-600" />
                </motion.div>
                
                <h3 className="text-xl font-bold text-neutral-900 mb-2">
                  Transaction Successful
                </h3>
                <p className="text-neutral-600">
                  You've successfully sent {amount} {selectedWallet?.symbol} to {recipient}
                </p>

                <div className="border border-neutral-200 rounded-lg p-4 mt-6 mb-4 bg-neutral-50">
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div>
                      <p className="text-sm text-neutral-600">Amount Sent</p>
                      <p className="font-medium text-neutral-900">
                        {amount} {selectedWallet?.symbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Value</p>
                      <p className="font-medium text-neutral-900">
                        {formatCurrency(parseFloat(amount) * (selectedWallet?.usdValue || 0) / (selectedWallet?.balance || 1))}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Recipient</p>
                      <p className="font-medium text-neutral-900 truncate">
                        {recipient}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-neutral-600">Time</p>
                      <p className="font-medium text-neutral-900">
                        {new Date().toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setRecipient('');
                      setSelectedContact(null);
                      setAmount('');
                      setSelectedWallet(null);
                      setMessage('');
                      setStep('recipient');
                    }}
                    className="flex-1 bg-white border border-cyan-500 text-cyan-600 py-3 rounded-lg font-medium hover:bg-cyan-50 transition-colors"
                  >
                    Send Another
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => window.location.href = '/'}
                    className="flex-1 bg-cyan-600 text-white py-3 rounded-lg font-semibold hover:bg-cyan-700 transition-colors shadow-md"
                  >
                    Go to Dashboard
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}