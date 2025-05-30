'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiArrowRight, FiRefreshCw, FiChevronDown, FiAlertTriangle, FiCheck } from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { AppShell } from '@/components/layout/AppShell'

// Define types
interface Wallet {
  id: string;
  name: string;
  type: string;
  symbol: string;
  balance: number;
  fiatBalance: number;
}

interface PriceDataPoint {
  date: string;
  price: number;
}

interface ExchangeRates {
  [key: string]: number;
}

// Mock data for wallets
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
  },
  {
    id: 'wallet4',
    name: 'Solana Wallet',
    type: 'solana',
    symbol: 'SOL',
    balance: 25.5,
    fiatBalance: 2500.00
  }
]

// Mock price data
const generatePriceData = (days = 7, basePrice = 100, volatility = 0.05) => {
  const data = []
  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - (days - i - 1))
    
    const randomFactor = 1 + (Math.random() * volatility * 2 - volatility)
    const price = basePrice * randomFactor
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: price
    })
  }
  return data
}

// Exchange rates between currencies (very simplified)
const exchangeRates: ExchangeRates = {
  'BTC/ETH': 15.5,
  'BTC/USDC': 27500,
  'BTC/SOL': 1100,
  'ETH/BTC': 0.0645,
  'ETH/USDC': 1775,
  'ETH/SOL': 71,
  'USDC/BTC': 0.0000363,
  'USDC/ETH': 0.000564,
  'USDC/SOL': 0.04,
  'SOL/BTC': 0.000909,
  'SOL/ETH': 0.0141,
  'SOL/USDC': 25
}

export function ExchangeClient() {
  const [fromWallet, setFromWallet] = useState<Wallet>(wallets[0])
  const [toWallet, setToWallet] = useState<Wallet>(wallets[1])
  const [fromAmount, setFromAmount] = useState('')
  const [toAmount, setToAmount] = useState('')
  const [priceData, setPriceData] = useState<PriceDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [swapComplete, setSwapComplete] = useState(false)
  
  // Update price data when currencies change
  useEffect(() => {
    const pair = `${fromWallet.symbol}/${toWallet.symbol}`
    const rate = exchangeRates[pair] || 1
    const basePrice = rate * 100 // just for visualization scaling
    
    setPriceData(generatePriceData(7, basePrice, 0.1))
  }, [fromWallet, toWallet])
  
  // Calculate exchange rate and to amount
  const pair = `${fromWallet.symbol}/${toWallet.symbol}`
  const rate = exchangeRates[pair] || 1
  
  // Handle amount changes
  const handleFromAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFromAmount(value)
    setToAmount((parseFloat(value || '0') * rate).toFixed(8))
  }
  
  const handleToAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setToAmount(value)
    setFromAmount((parseFloat(value || '0') / rate).toFixed(8))
  }
  
  // Swap wallets
  const handleSwapWallets = () => {
    const temp = fromWallet
    setFromWallet(toWallet)
    setToWallet(temp)
    
    // Reset amounts
    setFromAmount('')
    setToAmount('')
  }
  
  // Handle exchange
  const handleExchange = () => {
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setSwapComplete(true)
      
      // Reset after a bit
      setTimeout(() => {
        setSwapComplete(false)
        setFromAmount('')
        setToAmount('')
      }, 5000)
    }, 2000)
  }
  
  // Check if exchange is valid
  const isExchangeValid = 
    parseFloat(fromAmount) > 0 && 
    parseFloat(fromAmount) <= fromWallet.balance &&
    fromWallet.id !== toWallet.id

  return (
        <AppShell>
    
    <div className="min-h-screen bg-neutral-50">
      {/* AppShell would go here in a real implementation */}
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Exchange</h1>
            <p className="text-sm text-neutral-500">Swap between your crypto assets</p>
          </div>

          {/* Exchange Content */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Exchange Form */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
                {swapComplete ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-center py-6"
                  >
                    <div className="w-16 h-16 bg-accent-green bg-opacity-10 rounded-full flex items-center justify-center mx-auto">
                      <FiCheck className="text-accent-green text-3xl" />
                    </div>
                    <h2 className="text-xl font-bold mt-4 text-neutral-900">Exchange Complete</h2>
                    <p className="text-neutral-600 mt-2">
                      You've successfully exchanged {fromAmount} {fromWallet.symbol} to {toAmount} {toWallet.symbol}
                    </p>
                    
                    <div className="mt-6">
                      <button className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                        View Transaction Details
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-lg font-medium text-neutral-800 mb-4">Swap Tokens</h2>
                    
                    {/* From Currency */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">From</label>
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-1">
                          <input 
                            type="number"
                            value={fromAmount}
                            onChange={handleFromAmountChange}
                            placeholder="0.00"
                            className="w-full p-3 pr-24 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-sm text-neutral-500">{fromWallet.symbol}</span>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <button className="flex items-center space-x-2 p-3 border border-neutral-300 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center">
                              <span className="text-xs">{fromWallet.symbol}</span>
                            </div>
                            <span className="font-medium text-neutral-800">{fromWallet.name}</span>
                            <FiChevronDown className="text-neutral-400" />
                          </button>
                          {/* Dropdown would go here */}
                        </div>
                      </div>
                      
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">
                          Balance: {formatCryptoAmount(fromWallet.balance, fromWallet.symbol)}
                        </span>
                        <button 
                          onClick={() => setFromAmount(fromWallet.balance.toString())}
                          className="text-primary-500 hover:text-primary-600"
                        >
                          Max
                        </button>
                      </div>
                    </div>
                    
                    {/* Swap Button */}
                    <div className="flex justify-center my-4">
                      <button 
                        onClick={handleSwapWallets}
                        className="p-2 bg-primary-100 hover:bg-primary-200 rounded-full transition-colors"
                      >
                        <FiArrowRight className="transform rotate-90 text-primary-600" />
                      </button>
                    </div>
                    
                    {/* To Currency */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-neutral-700">To</label>
                      <div className="flex items-center space-x-3">
                        <div className="relative flex-1">
                          <input 
                            type="number"
                            value={toAmount}
                            onChange={handleToAmountChange}
                            placeholder="0.00"
                            className="w-full p-3 pr-24 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          />
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-sm text-neutral-500">{toWallet.symbol}</span>
                          </div>
                        </div>
                        
                        <div className="relative">
                          <button className="flex items-center space-x-2 p-3 border border-neutral-300 rounded-lg">
                            <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center">
                              <span className="text-xs">{toWallet.symbol}</span>
                            </div>
                            <span className="font-medium text-neutral-800">{toWallet.name}</span>
                            <FiChevronDown className="text-neutral-400" />
                          </button>
                          {/* Dropdown would go here */}
                        </div>
                      </div>
                      
                      <div className="text-xs">
                        <span className="text-neutral-500">
                          Balance: {formatCryptoAmount(toWallet.balance, toWallet.symbol)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Exchange Rate */}
                    <div className="flex items-center justify-between mt-6 p-3 bg-neutral-50 rounded-lg">
                      <div className="text-sm">
                        <span className="text-neutral-500">Exchange Rate</span>
                        <div className="font-medium text-neutral-800">
                          1 {fromWallet.symbol} ≈ {rate} {toWallet.symbol}
                        </div>
                      </div>
                      <button className="text-primary-500 p-1 hover:bg-primary-50 rounded">
                        <FiRefreshCw size={16} />
                      </button>
                    </div>
                    
                    {/* Warning for same currency */}
                    {fromWallet.id === toWallet.id && (
                      <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-lg flex items-start">
                        <FiAlertTriangle className="mr-2 mt-0.5 flex-shrink-0" />
                        <p className="text-sm">
                          You've selected the same currency for both sides. Please select different currencies to swap.
                        </p>
                      </div>
                    )}
                    
                    {/* Exchange Button */}
                    <div className="mt-6">
                      <button 
                        onClick={handleExchange}
                        disabled={!isExchangeValid || isLoading}
                        className={`w-full py-3 rounded-lg flex justify-center items-center ${
                          isExchangeValid && !isLoading
                            ? 'bg-primary-500 hover:bg-primary-600 text-white' 
                            : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                        } transition-colors`}
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          'Swap Tokens'
                        )}
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Exchange Chart */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 h-full">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-medium text-neutral-800">
                    {fromWallet.symbol}/{toWallet.symbol} Exchange Rate
                  </h2>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 text-sm bg-primary-50 text-primary-700 rounded-full">
                      1D
                    </button>
                    <button className="px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100 rounded-full">
                      1W
                    </button>
                    <button className="px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100 rounded-full">
                      1M
                    </button>
                    <button className="px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-100 rounded-full">
                      1Y
                    </button>
                  </div>
                </div>
                
                <div className="h-[300px]">
                  {priceData.length > 0 && (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={priceData}
                        margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#9CA3AF' }}
                        />
                        <YAxis 
                          domain={['dataMin', 'dataMax']} 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 12, fill: '#9CA3AF' }}
                          width={60}
                        />
                        <Tooltip 
                          formatter={(value: number) => [`${value.toFixed(8)} ${toWallet.symbol}`, `Price`]}
                          labelFormatter={(label: string) => `Date: ${label}`}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#6366F1" 
                          fillOpacity={1}
                          fill="url(#colorPrice)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-neutral-200">
                  <div>
                    <p className="text-sm text-neutral-500">24h Change</p>
                    <p className="font-medium text-accent-green">+2.45%</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">24h Volume</p>
                    <p className="font-medium text-neutral-900">$45.3M</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-500">Liquidity</p>
                    <p className="font-medium text-neutral-900">$120.2M</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Exchanges */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-medium text-neutral-800 mb-4">Recent Exchanges</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead>
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      From
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      To
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Exchange Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {/* No exchanges yet message */}
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-sm text-center text-neutral-500">
                      No exchange history yet. Your recent exchanges will appear here.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
    </AppShell>
  )
}