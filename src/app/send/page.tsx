'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AddressInput } from '@/components/crypto/AddressInput'
import { CryptoAmountInput } from '@/components/crypto/CryptoAmountInput'
import { FiArrowRight, FiClock, FiAlertCircle } from 'react-icons/fi'

// Currency data (would come from an API or state)
const currencies = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', 
    balance: { value: 0.45123, formatted: '0.45123 BTC' } },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH',
    balance: { value: 3.12345, formatted: '3.12345 ETH' } },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC',
    balance: { value: 1000, formatted: '1,000 USDC' } }
]

// Mock exchange rates (would come from an API)
const exchangeRates = {
  'btc': 27000,
  'eth': 1800,
  'usdc': 1
}

// Steps for send flow
const STEPS = {
  SELECT_ASSET: 0,
  ENTER_DETAILS: 1,
  CONFIRM: 2,
  PROCESSING: 3,
  COMPLETE: 4,
}

export default function SendPage() {
  const [currentStep, setCurrentStep] = useState(STEPS.SELECT_ASSET)
  const [selectedCurrency, setSelectedCurrency] = useState(currencies[0])
  const [amount, setAmount] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [validationStatus, setValidationStatus] = useState('none')

  // Step transitions
  const goToNextStep = () => {
    if (currentStep < STEPS.COMPLETE) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > STEPS.SELECT_ASSET) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Simulate address validation
  const validateAddress = (addr: string) => {
    if (addr.length < 8) return
    
    setValidationStatus('validating')
    setTimeout(() => {
      if (addr.startsWith('bc1') || addr.startsWith('0x')) {
        setValidationStatus('valid')
      } else {
        setValidationStatus('invalid')
      }
    }, 500)
  }

  // Handler for address changes
  const handleAddressChange = (value: string) => {
    setAddress(value)
    validateAddress(value)
  }

  // Get current exchange rate
  const getExchangeRate = () => exchangeRates[selectedCurrency.id]

  // Calculate max amount
  const getMaxAmount = () => selectedCurrency.balance.value.toString()

  // Content based on current step
  const renderStepContent = () => {
    switch (currentStep) {
      case STEPS.SELECT_ASSET:
        return (
          <div className="space-y-4">
            <p className="text-gray-600">Select which asset you want to send:</p>
            
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {currencies.map(currency => (
                <motion.button
                  key={currency.id}
                  className={`flex items-center justify-between w-full p-4 rounded-lg border transition-all duration-150 ${
                    selectedCurrency.id === currency.id 
                      ? 'border-indigo-500 bg-indigo-50' 
                      : 'border-gray-200 hover:border-indigo-200'
                  }`}
                  onClick={() => setSelectedCurrency(currency)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                      <span className="font-bold text-indigo-600">{currency.symbol.substring(0, 1)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{currency.name}</p>
                      <p className="text-sm text-gray-500">{currency.symbol}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{currency.balance.formatted}</p>
                    <p className="text-sm text-gray-500">
                      ${(currency.balance.value * exchangeRates[currency.id]).toLocaleString()}
                    </p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        )
      
      case STEPS.ENTER_DETAILS:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 rounded-lg">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="font-bold text-indigo-600">{selectedCurrency.symbol.substring(0, 1)}</span>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">From: {selectedCurrency.name}</p>
                <p className="text-sm text-gray-500">Balance: {selectedCurrency.balance.formatted}</p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentStep(STEPS.SELECT_ASSET)}
              >
                Change
              </Button>
            </div>

            <AddressInput
              value={address}
              onChange={handleAddressChange}
              onQrScan={() => console.log('QR scan')}
              onPaste={() => console.log('Paste')}
              networkName={selectedCurrency.name}
              validationStatus={validationStatus}
              validationMessage={
                validationStatus === 'valid' 
                  ? `Valid ${selectedCurrency.name} address` 
                  : validationStatus === 'invalid'
                  ? `Invalid ${selectedCurrency.name} address`
                  : validationStatus === 'validating'
                  ? 'Validating address...'
                  : ''
              }
            />

            <CryptoAmountInput
              currencies={[selectedCurrency]}
              selectedCurrency={selectedCurrency}
              onCurrencyChange={(currency) => setSelectedCurrency(currency)}
              value={amount}
              onChange={setAmount}
              exchangeRate={getExchangeRate()}
            />

            <div className="flex justify-end">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setAmount(getMaxAmount())}
              >
                Send Max
              </Button>
            </div>

            <Input
              label="Note (optional)"
              placeholder="What's this payment for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )
      
      case STEPS.CONFIRM:
        return (
          <div className="space-y-6">
            <div className="flex flex-col items-center py-8">
              <p className="text-gray-600 mb-2">You are sending</p>
              <h2 className="text-3xl font-bold text-gray-900">{amount} {selectedCurrency.symbol}</h2>
              <p className="text-gray-500 mt-1">
                ≈ ${(Number(amount) * getExchangeRate()).toLocaleString()}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">To</p>
                <p className="text-sm font-mono text-gray-900">{address}</p>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">From</p>
                <p className="text-sm font-medium text-gray-900">{selectedCurrency.name} Wallet</p>
              </div>
              <div className="flex justify-between py-3 border-b border-gray-100">
                <p className="text-sm text-gray-600">Network Fee</p>
                <p className="text-sm font-medium text-gray-900">0.0005 {selectedCurrency.symbol}</p>
              </div>
              {note && (
                <div className="flex justify-between py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-600">Note</p>
                  <p className="text-sm font-medium text-gray-900">{note}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 p-4 rounded-lg bg-amber-50 border border-amber-100">
              <FiClock className="h-5 w-5 text-amber-500" />
              <p className="text-sm text-amber-700">
                This transaction may take 10-30 minutes to be confirmed on the network.
              </p>
            </div>
          </div>
        )
      
      case STEPS.PROCESSING:
        return (
          <div className="flex flex-col items-center py-12">
            <motion.div 
              className="h-16 w-16 mb-8"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <div className="h-full w-full rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            </motion.div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Transaction</h2>
            <p className="text-gray-600 text-center">
              Your transaction is being processed. This may take a few moments.
            </p>
            
            <div className="w-full mt-8 space-y-2">
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 5 }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Initiating</span>
                <span>Signing</span>
                <span>Broadcasting</span>
              </div>
            </div>
          </div>
        )
      
      case STEPS.COMPLETE:
        return (
          <div className="flex flex-col items-center py-12">
            <motion.div 
              className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
            >
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </motion.div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Transaction Sent!</h2>
            <p className="text-gray-600 text-center mb-4">
              Your transaction has been successfully sent and is awaiting confirmation.
            </p>
            
            <div className="bg-gray-50 w-full rounded-lg p-4 mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-sm font-medium">{amount} {selectedCurrency.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Transaction ID</span>
                <span className="text-sm font-mono text-gray-900">txid_123...abc</span>
              </div>
            </div>
            
            <div className="flex gap-4">
              <Button variant="secondary" onClick={() => setCurrentStep(STEPS.SELECT_ASSET)}>
                Send More
              </Button>
              <Button onClick={() => window.location.href = "/"}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  // Card footer actions based on current step
  const renderActions = () => {
    switch (currentStep) {
      case STEPS.SELECT_ASSET:
        return (
          <Button 
            onClick={goToNextStep} 
            className="w-full"
          >
            Continue
          </Button>
        )
      
      case STEPS.ENTER_DETAILS:
        return (
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={goToPreviousStep}
              className="flex-1"
            >
              Back
            </Button>
            <Button 
              onClick={goToNextStep}
              className="flex-1"
              disabled={!address || !amount || validationStatus !== 'valid'}
            >
              Continue
            </Button>
          </div>
        )
      
      case STEPS.CONFIRM:
        return (
          <div className="flex gap-3">
            <Button 
              variant="ghost" 
              onClick={goToPreviousStep}
              className="flex-1"
            >
              Edit Transaction
            </Button>
            <Button 
              onClick={goToNextStep}
              className="flex-1"
            >
              Confirm & Send
            </Button>
          </div>
        )
      
      case STEPS.PROCESSING:
        // No actions during processing
        return null
      
      case STEPS.COMPLETE:
        // Actions are inside the content
        return null
      
      default:
        return null
    }
  }

  // Get the title based on current step
  const getStepTitle = () => {
    switch (currentStep) {
      case STEPS.SELECT_ASSET:
        return 'Select Asset'
      case STEPS.ENTER_DETAILS:
        return 'Enter Details'
      case STEPS.CONFIRM:
        return 'Confirm Transaction'
      case STEPS.PROCESSING:
        return 'Processing'
      case STEPS.COMPLETE:
        return 'Transaction Complete'
      default:
        return 'Send'
    }
  }

  return (
    <AppShell>
      <div className="max-w-lg mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          {renderActions() && (
            <CardFooter>
              {renderActions()}
            </CardFooter>
          )}
        </Card>
      </div>
    </AppShell>
  )
}