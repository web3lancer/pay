'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FiCheck, FiChevronRight, FiCamera, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'
import { AppShell } from '@/components/layout/AppShell'

// Mock data
const wallets = [
  {
    id: 'wallet1',
    name: 'Bitcoin Wallet',
    type: 'bitcoin',
    symbol: 'BTC',
    balance: 0.45123,
    fiatBalance: 12345.67
  },
  {
    id: 'wallet2',
    name: 'Ethereum Wallet',
    type: 'ethereum',
    symbol: 'ETH',
    balance: 3.2156,
    fiatBalance: 9876.54
  },
  {
    id: 'wallet3',
    name: 'USDC Wallet',
    type: 'ethereum',
    symbol: 'USDC',
    balance: 5000.00,
    fiatBalance: 5000.00
  }
]

// Transaction flow steps
const STEPS = {
  SELECT_WALLET: 0,
  RECIPIENT: 1,
  AMOUNT: 2,
  REVIEW: 3,
  CONFIRMATION: 4
}

export function SendClient() {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_WALLET)
  const [selectedWallet, setSelectedWallet] = useState(wallets[0])
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [fee, setFee] = useState('normal') // 'slow', 'normal', 'fast'

  // Helper to advance to next step
  const nextStep = () => {
    if (currentStep < STEPS.CONFIRMATION) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Helper to go back one step
  const prevStep = () => {
    if (currentStep > STEPS.SELECT_WALLET) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isAddressValid = recipient.length > 30 // Simple validation, replace with proper validation
  const isAmountValid = Number(amount) > 0 && Number(amount) <= selectedWallet.balance
  const totalAmount = Number(amount) || 0
  
  // Estimate fee based on fee speed selection
  const estimatedFee = fee === 'slow' ? 0.0001 : fee === 'normal' ? 0.0002 : 0.0005
  const totalWithFee = totalAmount + estimatedFee

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex flex-col space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Send {selectedWallet.symbol}</h1>
            <p className="text-sm text-neutral-500">Transfer crypto to another wallet</p>
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            {/* Progress Indicator */}
            <div className="flex justify-between mb-8">
              {['Wallet', 'Recipient', 'Amount', 'Review'].map((step, index) => (
                <div key={step} className="flex flex-col items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep 
                        ? 'bg-primary-500 text-white' 
                        : index === currentStep 
                          ? 'bg-primary-100 text-primary-500 border-2 border-primary-500' 
                          : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <FiCheck />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-xs mt-2 ${
                    index <= currentStep ? 'text-neutral-800' : 'text-neutral-400'
                  }`}>
                    {step}
                  </span>
                  {index < 3 && (
                    <div className={`w-16 h-0.5 mt-4 ${
                      index < currentStep ? 'bg-primary-500' : 'bg-neutral-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="mt-6">
              {currentStep === STEPS.SELECT_WALLET && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-neutral-800">Select wallet</h2>
                  <div className="space-y-3">
                    {wallets.map((wallet, index) => (
                      <div 
                        key={wallet.id}
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                          selectedWallet.id === wallet.id 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-neutral-200 hover:border-primary-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                              {wallet.type === 'bitcoin' && <span className="text-amber-500">₿</span>}
                              {wallet.type === 'ethereum' && 
                                (wallet.symbol === 'USDC' 
                                  ? <span className="text-blue-500">$</span> 
                                  : <span className="text-blue-500">Ξ</span>
                                )
                              }
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-neutral-900">{wallet.name}</p>
                              <p className="text-xs text-neutral-500">
                                {formatCryptoAmount(wallet.balance, wallet.symbol)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-neutral-900">
                              {formatCurrency(wallet.fiatBalance)}
                            </p>
                            <div className="w-5 h-5 rounded-full border-2 border-neutral-300 ml-auto mt-1">
                              {selectedWallet.id === wallet.id && (
                                <div className="w-3 h-3 rounded-full bg-primary-500 m-auto mt-0.5" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {currentStep === STEPS.RECIPIENT && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-neutral-800">Enter recipient address</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        {selectedWallet.symbol} Address
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          value={recipient}
                          onChange={(e) => setRecipient(e.target.value)}
                          placeholder={`Enter ${selectedWallet.symbol} address`}
                          className="w-full p-3 pr-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                        <button className="absolute right-3 top-3 text-neutral-400 hover:text-neutral-600">
                          <FiCamera size={20} />
                        </button>
                      </div>
                      
                      {recipient && (
                        <div className={`mt-2 flex items-center ${
                          isAddressValid ? 'text-accent-green' : 'text-accent-red'
                        }`}>
                          {isAddressValid ? (
                            <>
                              <FiCheck className="mr-1" />
                              <span className="text-xs">Valid {selectedWallet.symbol} address</span>
                            </>
                          ) : (
                            <>
                              <FiAlertTriangle className="mr-1" />
                              <span className="text-xs">Invalid address format</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Memo (optional)
                      </label>
                      <input 
                        type="text"
                        value={memo}
                        onChange={(e) => setMemo(e.target.value)}
                        placeholder="Add a note for this transaction"
                        className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === STEPS.AMOUNT && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-neutral-800">Enter amount</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Amount
                      </label>
                      <div className="flex">
                        <input 
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0.00"
                          className="flex-1 p-3 border border-neutral-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        />
                        <div className="bg-neutral-50 border border-l-0 border-neutral-300 rounded-r-lg px-4 flex items-center">
                          {selectedWallet.symbol}
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-neutral-500">
                          ≈ {formatCurrency(Number(amount) * (selectedWallet.fiatBalance / selectedWallet.balance) || 0)}
                        </span>
                        <button 
                          className="text-xs text-primary-500"
                          onClick={() => setAmount(selectedWallet.balance.toString())}
                        >
                          Max: {formatCryptoAmount(selectedWallet.balance, selectedWallet.symbol)}
                        </button>
                      </div>
                      
                      {amount && !isAmountValid && (
                        <div className="mt-2 flex items-center text-accent-red">
                          <FiAlertTriangle className="mr-1" />
                          <span className="text-xs">
                            {Number(amount) <= 0 
                              ? 'Amount must be greater than 0' 
                              : `Insufficient balance (max: ${selectedWallet.balance} ${selectedWallet.symbol})`
                            }
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Transaction Fee
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        <button 
                          onClick={() => setFee('slow')}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            fee === 'slow' 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-neutral-300 hover:border-primary-200'
                          }`}
                        >
                          <div className="font-medium text-neutral-900">Slow</div>
                          <div className="text-xs text-neutral-500">~60 min</div>
                          <div className="text-xs font-medium text-neutral-900 mt-1">
                            {formatCryptoAmount(0.0001, selectedWallet.symbol)}
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => setFee('normal')}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            fee === 'normal' 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-neutral-300 hover:border-primary-200'
                          }`}
                        >
                          <div className="font-medium text-neutral-900">Normal</div>
                          <div className="text-xs text-neutral-500">~20 min</div>
                          <div className="text-xs font-medium text-neutral-900 mt-1">
                            {formatCryptoAmount(0.0002, selectedWallet.symbol)}
                          </div>
                        </button>
                        
                        <button 
                          onClick={() => setFee('fast')}
                          className={`p-3 border rounded-lg text-center transition-colors ${
                            fee === 'fast' 
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-neutral-300 hover:border-primary-200'
                          }`}
                        >
                          <div className="font-medium text-neutral-900">Fast</div>
                          <div className="text-xs text-neutral-500">~5 min</div>
                          <div className="text-xs font-medium text-neutral-900 mt-1">
                            {formatCryptoAmount(0.0005, selectedWallet.symbol)}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === STEPS.REVIEW && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  <h2 className="text-lg font-medium text-neutral-800">Review transaction</h2>
                  
                  <div className="space-y-4 bg-neutral-50 p-4 rounded-lg border border-neutral-200">
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">From</span>
                      <span className="text-sm font-medium text-neutral-900">{selectedWallet.name}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">To</span>
                      <span className="text-sm font-medium text-neutral-900 max-w-[200px] truncate">
                        {recipient}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Amount</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {formatCryptoAmount(Number(amount), selectedWallet.symbol)}
                      </span>
                    </div>

                    {memo && (
                      <div className="flex justify-between">
                        <span className="text-sm text-neutral-500">Memo</span>
                        <span className="text-sm font-medium text-neutral-900 max-w-[200px] truncate">
                          {memo}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-neutral-500">Fee</span>
                      <span className="text-sm font-medium text-neutral-900">
                        {formatCryptoAmount(estimatedFee, selectedWallet.symbol)}
                      </span>
                    </div>
                    
                    <div className="border-t border-neutral-200 my-2" />
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-neutral-800">Total</span>
                      <div className="text-right">
                        <div className="text-sm font-medium text-neutral-900">
                          {formatCryptoAmount(totalWithFee, selectedWallet.symbol)}
                        </div>
                        <div className="text-xs text-neutral-500">
                          ≈ {formatCurrency(
                            totalWithFee * (selectedWallet.fiatBalance / selectedWallet.balance)
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <FiAlertTriangle className="text-amber-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-amber-700">
                          Please verify the destination address. Transactions cannot be reversed once confirmed.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {currentStep === STEPS.CONFIRMATION && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-accent-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                    <FiCheck className="text-accent-green text-3xl" />
                  </div>
                  <h2 className="text-xl font-bold mt-4 text-neutral-900">Transaction Submitted</h2>
                  <p className="text-neutral-600 mt-2">
                    Your transaction is now processing. It may take some time to be confirmed on the blockchain.
                  </p>
                  
                  <div className="mt-6 bg-neutral-50 p-4 rounded-lg text-left">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-neutral-500">Amount</span>
                      <span className="font-medium">
                        {formatCryptoAmount(Number(amount), selectedWallet.symbol)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-500">Transaction ID</span>
                      <span className="font-medium text-primary-500">
                        cf8e12...b524a9
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-8">
                    <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                      View Transaction Details
                    </button>
                    <button className="mt-3 px-6 py-3 text-neutral-800 block w-full">
                      Back to Dashboard
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Navigation Buttons */}
              {currentStep < STEPS.CONFIRMATION && (
                <div className="mt-8 flex justify-between">
                  <button
                    onClick={prevStep}
                    disabled={currentStep === STEPS.SELECT_WALLET}
                    className={`px-6 py-2 rounded-lg border ${
                      currentStep === STEPS.SELECT_WALLET
                        ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors'
                    }`}
                  >
                    Back
                  </button>
                  
                  <button
                    onClick={nextStep}
                    disabled={
                      (currentStep === STEPS.RECIPIENT && !isAddressValid) ||
                      (currentStep === STEPS.AMOUNT && !isAmountValid)
                    }
                    className={`px-6 py-2 rounded-lg flex items-center ${
                      (currentStep === STEPS.RECIPIENT && !isAddressValid) ||
                      (currentStep === STEPS.AMOUNT && !isAmountValid)
                        ? 'bg-primary-300 cursor-not-allowed'
                        : 'bg-primary-500 hover:bg-primary-600 transition-colors'
                    } text-white`}
                  >
                    {currentStep === STEPS.REVIEW ? 'Confirm & Send' : 'Continue'}
                    <FiChevronRight className="ml-2" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}