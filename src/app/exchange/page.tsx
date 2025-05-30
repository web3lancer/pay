'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { PriceChart } from '@/components/crypto/PriceChart'
import { CryptoAmountInput } from '@/components/crypto/CryptoAmountInput'
import { FiArrowDown, FiRefreshCw, FiAlertCircle, FiInfo } from 'react-icons/fi'

// Mock currencies data
const currencies = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', balance: { value: 0.45123, formatted: '0.45123 BTC' } },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', balance: { value: 3.12345, formatted: '3.12345 ETH' } },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', balance: { value: 1000, formatted: '1,000 USDC' } },
  { id: 'sol', name: 'Solana', symbol: 'SOL', balance: { value: 45.6789, formatted: '45.6789 SOL' } }
]

// Mock price chart data
const generateChartData = (days = 7) => {
  const data = []
  const today = new Date()
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    data.push({
      timestamp: date.getTime(),
      price: 1800 + Math.random() * 200 - 100 // ETH price around $1800 with fluctuation
    })
  }
  
  return data
}

// Mock exchange rates between all assets
const getExchangeRate = (from: string, to: string) => {
  const rates = {
    'btc': { 'btc': 1, 'eth': 15, 'usdc': 27000, 'sol': 300 },
    'eth': { 'btc': 0.066, 'eth': 1, 'usdc': 1800, 'sol': 20 },
    'usdc': { 'btc': 0.000037, 'eth': 0.00055, 'usdc': 1, 'sol': 0.011 },
    'sol': { 'btc': 0.0033, 'eth': 0.05, 'usdc': 90, 'sol': 1 }
  }
  
  return rates[from.toLowerCase()][to.toLowerCase()]
}

// Fee structure
const FEE_PERCENTAGE = 0.005 // 0.5%

export default function ExchangePage() {
  const [fromCurrency, setFromCurrency] = useState(currencies[1]) // ETH
  const [toCurrency, setToCurrency] = useState(currencies[0]) // BTC
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [chartData, setChartData] = useState(generateChartData())
  const [timeRange, setTimeRange] = useState('1W')
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)
  
  // Update the to amount when from amount or currencies change
  useEffect(() => {
    if (fromAmount) {
      const rate = getExchangeRate(fromCurrency.id, toCurrency.id)
      const calculatedAmount = Number(fromAmount) * rate * (1 - FEE_PERCENTAGE)
      setToAmount(calculatedAmount.toFixed(8))
    } else {
      setToAmount('')
    }
  }, [fromAmount, fromCurrency, toCurrency])
  
  // Update chart data when time range or pair changes
  useEffect(() => {
    let days = 7
    
    switch (timeRange) {
      case '1D': days = 1; break
      case '1W': days = 7; break
      case '1M': days = 30; break
      case '3M': days = 90; break
      case '1Y': days = 365; break
      default: days = 7
    }
    
    // In a real app, this would fetch data from an API
    setChartData(generateChartData(days))
  }, [timeRange, fromCurrency.id, toCurrency.id])
  
  // Swap the currencies
  const handleSwapCurrencies = () => {
    const temp = fromCurrency
    setFromCurrency(toCurrency)
    setToCurrency(temp)
    
    // Also swap the amounts if they exist
    if (fromAmount && toAmount) {
      setFromAmount(toAmount)
      // The useEffect will recalculate toAmount
    }
  }
  
  // Process the exchange
  const handleExchange = () => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setShowConfirmation(true)
    }, 2000)
  }
  
  // Reset the form after confirmation
  const handleReset = () => {
    setShowConfirmation(false)
    setFromAmount('')
    setToAmount('')
  }
  
  // Calculate the exchange fee
  const calculateFee = () => {
    if (!fromAmount) return 0
    return Number(fromAmount) * FEE_PERCENTAGE
  }
  
  // Check if exchange button should be disabled
  const isExchangeDisabled = () => {
    return !fromAmount || 
      Number(fromAmount) <= 0 ||
      Number(fromAmount) > fromCurrency.balance.value ||
      fromCurrency.id === toCurrency.id
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Exchange</h1>
          <p className="text-sm text-neutral-500">Swap between different cryptocurrencies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Exchange Card */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Swap Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {!showConfirmation ? (
                  <motion.div 
                    key="exchange-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6"
                  >
                    {/* From Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        From
                      </label>
                      <CryptoAmountInput
                        currencies={currencies}
                        selectedCurrency={fromCurrency}
                        onCurrencyChange={setFromCurrency}
                        value={fromAmount}
                        onChange={setFromAmount}
                        label=""
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">
                          Available: {fromCurrency.balance.formatted}
                        </span>
                        <button 
                          className="text-xs text-indigo-600 hover:text-indigo-800"
                          onClick={() => setFromAmount(fromCurrency.balance.value.toString())}
                        >
                          Max
                        </button>
                      </div>
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <motion.button
                        className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-indigo-600 hover:bg-indigo-50"
                        onClick={handleSwapCurrencies}
                        whileTap={{ rotate: 180 }}
                        transition={{ duration: 0.3 }}
                      >
                        <FiArrowDown className="h-5 w-5" />
                      </motion.button>
                    </div>

                    {/* To Currency */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        To
                      </label>
                      <CryptoAmountInput
                        currencies={currencies}
                        selectedCurrency={toCurrency}
                        onCurrencyChange={setToCurrency}
                        value={toAmount}
                        onChange={() => {}} // Read-only for now
                        label=""
                        disabled={true}
                      />
                    </div>

                    {/* Exchange Rate */}
                    <div className="px-4 py-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                      <div className="flex justify-between mb-1">
                        <span>Exchange Rate</span>
                        <span>
                          1 {fromCurrency.symbol} = {getExchangeRate(fromCurrency.id, toCurrency.id)} {toCurrency.symbol}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Fee</span>
                        <span>
                          {calculateFee()} {fromCurrency.symbol} ({FEE_PERCENTAGE * 100}%)
                        </span>
                      </div>
                    </div>

                    {/* Error Message */}
                    {fromCurrency.id === toCurrency.id && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg text-amber-700 text-sm">
                        <FiAlertCircle className="h-4 w-4" />
                        <span>Please select different assets for exchange</span>
                      </div>
                    )}
                    
                    {Number(fromAmount) > fromCurrency.balance.value && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                        <FiAlertCircle className="h-4 w-4" />
                        <span>Insufficient balance</span>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="confirmation"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-6"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                        <svg 
                          className="h-8 w-8 text-green-600" 
                          fill="none"
                          viewBox="0 0 24 24" 
                          stroke="currentColor"
                        >
                          <motion.path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.6 }}
                          />
                        </svg>
                      </div>
                      
                      <h3 className="text-xl font-semibold text-center mb-2">Exchange Complete</h3>
                      <p className="text-gray-600 text-center mb-6">
                        Your assets have been successfully exchanged
                      </p>
                      
                      <div className="w-full px-4 py-3 bg-gray-50 rounded-lg mb-6">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">From</span>
                          <span className="font-medium">{fromAmount} {fromCurrency.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">To</span>
                          <span className="font-medium">{toAmount} {toCurrency.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Fee</span>
                          <span className="font-medium">{calculateFee()} {fromCurrency.symbol}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-2 pt-2">
                          <span className="text-gray-600">Transaction ID</span>
                          <span className="font-mono text-sm">tx_{Math.random().toString(36).substring(2, 10)}</span>
                        </div>
                      </div>
                      
                      <Button onClick={handleReset} className="w-full">
                        New Exchange
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
            {!showConfirmation && (
              <CardFooter>
                <Button 
                  className="w-full"
                  disabled={isExchangeDisabled()}
                  loading={isLoading}
                  onClick={handleExchange}
                >
                  {fromCurrency.id === toCurrency.id ? "Select Different Assets" : "Exchange"}
                </Button>
              </CardFooter>
            )}
          </Card>

          {/* Chart Card */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>
                {fromCurrency.symbol}/{toCurrency.symbol} Rate
              </CardTitle>
              <div className="flex items-center gap-2">
                <FiRefreshCw className="h-4 w-4 text-gray-400" />
                <span className="text-xs text-gray-500">Updated just now</span>
              </div>
            </CardHeader>
            <CardContent>
              <PriceChart
                data={chartData}
                currency="USD"
                symbol={`${fromCurrency.symbol}/${toCurrency.symbol}`}
                percentChange={2.34}
                timeRanges={['1D', '1W', '1M', '3M', '1Y']}
                onTimeRangeChange={setTimeRange}
                chartHeight={300}
              />
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card>
          <CardHeader>
            <CardTitle>Exchange Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiInfo className="h-4 w-4 text-indigo-500" />
                  Fees
                </h3>
                <p className="text-gray-600 text-sm">
                  Our exchange fee is {FEE_PERCENTAGE * 100}% per transaction. 
                  This helps us maintain the platform and provide security.
                </p>
              </div>
              
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiInfo className="h-4 w-4 text-indigo-500" />
                  Processing Time
                </h3>
                <p className="text-gray-600 text-sm">
                  Most exchanges are processed instantly, but may take longer 
                  during periods of high network congestion.
                </p>
              </div>
              
              <div className="flex flex-col">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <FiInfo className="h-4 w-4 text-indigo-500" />
                  Rate Protection
                </h3>
                <p className="text-gray-600 text-sm">
                  Exchange rates are locked for 30 seconds once you confirm. 
                  After that, the current market rate will apply.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  )
}