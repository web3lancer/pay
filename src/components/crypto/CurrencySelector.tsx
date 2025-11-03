'use client'

import React, { useState } from 'react'
import { FiChevronDown } from 'react-icons/fi'
import { cn } from '@/lib/utils'

export interface Currency {
  id: string
  name: string
  symbol: string
  icon?: React.ReactNode | string
  balance?: {
    value: number
    formatted: string
  }
}

interface CurrencySelectorProps {
  currencies: Currency[]
  selectedCurrency: Currency
  onSelect: (currency: Currency) => void
  label?: string
  className?: string
  dropdownPosition?: 'top' | 'bottom'
}

export function CurrencySelector({
  currencies,
  selectedCurrency,
  onSelect,
  label,
  className,
  dropdownPosition = 'bottom'
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (currency: Currency) => {
    onSelect(currency)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm shadow-gray-200/40',
          'hover:border-indigo-300 hover:shadow-md hover:shadow-gray-200/50 transition-all duration-150',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500',
          className
        )}
        whileTap={{ scale: 0.99 }}
      >
        <div className="flex items-center gap-2">
          {selectedCurrency.icon && (
            <div className="h-6 w-6 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
              {typeof selectedCurrency.icon === 'string' ? (
                <img 
                  src={selectedCurrency.icon} 
                  alt={selectedCurrency.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                selectedCurrency.icon
              )}
            </div>
          )}
          <div className="flex flex-col items-start">
            <span className="font-medium text-sm">
              {selectedCurrency.symbol}
            </span>
          </div>
        </div>
        <FiChevronDown
          className={cn(
            "h-4 w-4 text-gray-500 transition-transform duration-200",
            isOpen && "transform rotate-180"
          )}
        />
      </button>

      <>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown */}
            <div
              className={cn(
                "absolute z-50 w-full min-w-[240px] overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg shadow-gray-300/40",
                dropdownPosition === 'top' ? 'bottom-full mb-1' : 'top-full mt-1'
              )}
              initial={{ opacity: 0, y: dropdownPosition === 'top' ? 10 : -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: dropdownPosition === 'top' ? 10 : -10 }}
              transition={{ 
                duration: 0.2,
                ease: [0.25, 1, 0.5, 1] // ease-out-quart
              }}
            >
              <div className="max-h-60 overflow-y-auto p-1">
                {currencies.map((currency) => (
                  <div
                    key={currency.id}
                    onClick={() => handleSelect(currency)}
                    className={cn(
                      'flex items-center justify-between rounded-md px-3 py-2 cursor-pointer',
                      'hover:bg-indigo-50 transition-colors duration-150',
                      selectedCurrency.id === currency.id && "bg-indigo-50"
                    )}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex items-center gap-2">
                      {currency.icon && (
                        <div className="h-6 w-6 flex-shrink-0 rounded-full bg-indigo-100 flex items-center justify-center overflow-hidden">
                          {typeof currency.icon === 'string' ? (
                            <img 
                              src={currency.icon} 
                              alt={currency.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            currency.icon
                          )}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">{currency.name}</p>
                        <p className="text-xs text-gray-500">{currency.symbol}</p>
                      </div>
                    </div>
                    {currency.balance && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{currency.balance.formatted}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </>
    </div>
  );
}