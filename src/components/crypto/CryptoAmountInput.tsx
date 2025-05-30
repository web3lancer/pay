'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import BigNumber from 'bignumber.js'
import { FiChevronDown } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { CurrencySelector, Currency } from './CurrencySelector'

interface CryptoAmountInputProps {
  currencies: Currency[]
  selectedCurrency: Currency
  onCurrencyChange: (currency: Currency) => void
  value: string
  onChange: (value: string) => void
  error?: string
  label?: string
  className?: string
  exchangeRate?: number
  fiatCurrency?: string
  disabled?: boolean
}

export function CryptoAmountInput({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  value,
  onChange,
  error,
  label = 'Amount',
  className,
  exchangeRate,
  fiatCurrency = 'USD',
  disabled = false
}: CryptoAmountInputProps) {
  const [fiatValue, setFiatValue] = useState('0.00')
  const [isFocused, setIsFocused] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  // Calculate fiat value when crypto amount or exchange rate changes
  useEffect(() => {
    if (value && exchangeRate) {
      try {
        const cryptoAmount = new BigNumber(value)
        const fiatAmount = cryptoAmount.multipliedBy(exchangeRate)
        
        // Format with proper decimal places
        setFiatValue(
          fiatAmount.isNaN() ? '0.00' : 
          fiatAmount.toFixed(2)
        )
      } catch (error) {
        setFiatValue('0.00')
      }
    } else {
      setFiatValue('0.00')
    }
  }, [value, exchangeRate])

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Only allow numeric values with a decimal point
    if (inputValue === '' || /^\d*\.?\d*$/.test(inputValue)) {
      onChange(inputValue)
    }
  }

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <div 
        className={cn(
          'relative flex items-center rounded-lg border overflow-hidden transition-all duration-150',
          isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-300',
          error ? 'border-red-500 ring-2 ring-red-500/20' : '',
          disabled ? 'opacity-60 bg-gray-50' : ''
        )}
      >
        {/* Crypto amount input */}
        <motion.input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder="0.00"
          className={cn(
            'flex-1 border-none bg-transparent py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0',
            'text-right font-mono'
          )}
        />
        
        {/* Currency selector */}
        <div className="relative border-l border-gray-300">
          <button
            type="button"
            className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            onClick={() => setDropdownOpen(true)}
            disabled={disabled}
          >
            <div className="h-5 w-5 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-xs font-bold text-indigo-600">
                {selectedCurrency.symbol.substring(0, 1)}
              </span>
            </div>
            <span>{selectedCurrency.symbol}</span>
            <FiChevronDown className="h-3.5 w-3.5 text-gray-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 z-10 mt-1 w-48">
              <CurrencySelector
                currencies={currencies}
                selectedCurrency={selectedCurrency}
                onSelect={(currency) => {
                  onCurrencyChange(currency)
                  setDropdownOpen(false)
                }}
                className="shadow-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Fiat conversion */}
      {exchangeRate && (
        <motion.div 
          className="mt-1 text-sm text-gray-500"
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: value ? 1 : 0.5,
            height: 'auto'
          }}
          transition={{ duration: 0.2 }}
        >
          ≈ {fiatCurrency === 'USD' ? '$' : ''}{fiatValue} {fiatCurrency}
        </motion.div>
      )}

      {/* Error message */}
      {error && (
        <motion.p 
          className="mt-1 text-xs text-red-600"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}