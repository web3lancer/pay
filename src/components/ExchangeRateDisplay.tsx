import React from 'react'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'
import { FiTrendingUp, FiTrendingDown, FiRefreshCw } from 'react-icons/fi'

interface ExchangeRateDisplayProps {
  className?: string
  showRefresh?: boolean
}

export function ExchangeRateDisplay({ className = '', showRefresh = false }: ExchangeRateDisplayProps) {
  const { rates, isLoading, lastUpdated, refreshRates, formatPriceChange } = useExchangeRate()

  const handleRefresh = () => {
    refreshRates()
  }

  const formatLastUpdated = () => {
    if (!lastUpdated) return 'Never'
    const now = new Date()
    const diff = now.getTime() - lastUpdated.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return lastUpdated.toLocaleDateString()
  }

  return (
    <div className={`bg-white rounded-xl border border-neutral-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">Live Prices</h3>
        <div className="flex items-center space-x-2">
          <span className="text-xs text-neutral-500">
            Updated {formatLastUpdated()}
          </span>
          {showRefresh && (
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="p-1 text-neutral-400 hover:text-neutral-600 disabled:animate-spin"
            >
              <FiRefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {Object.values(rates).slice(0, 6).map((rate) => {
          if (!rate?.price_usd) return null
          const priceChange = formatPriceChange(rate.price_change_24h)
          const isPositive = rate.price_change_24h >= 0

          return (
            <div key={rate.tokenId} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                  {rate.symbol.slice(0, 2)}
                </div>
                <div>
                  <div className="font-medium text-neutral-900">{rate.symbol}</div>
                  <div className="text-sm text-neutral-500">{rate.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-neutral-900">
                  ${rate.price_usd.toLocaleString(undefined, { 
                    minimumFractionDigits: rate.price_usd < 1 ? 4 : 2,
                    maximumFractionDigits: rate.price_usd < 1 ? 6 : 2 
                  })}
                </div>
                <div className={`text-sm flex items-center ${priceChange.color}`}>
                  {isPositive ? (
                    <FiTrendingUp className="w-3 h-3 mr-1" />
                  ) : (
                    <FiTrendingDown className="w-3 h-3 mr-1" />
                  )}
                  {priceChange.text}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {isLoading && (
        <div className="mt-4 text-center text-sm text-neutral-500">
          <div className="inline-flex items-center">
            <FiRefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Updating prices...
          </div>
        </div>
      )}
    </div>
  )
}

interface TokenSelectProps {
  selectedToken: string
  onTokenSelect: (tokenId: string) => void
  className?: string
  label?: string
}

export function TokenSelect({ selectedToken, onTokenSelect, className = '', label }: TokenSelectProps) {
  const { rates, getRate, formatUsdValue } = useExchangeRate()

  const availableTokens = Object.keys(rates)

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
        </label>
      )}
      <select
        value={selectedToken}
        onChange={(e) => onTokenSelect(e.target.value)}
        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
      >
        <option value="">Select a token</option>
        {availableTokens.map((tokenId) => {
          const rate = getRate(tokenId)
          return (
            <option key={tokenId} value={tokenId}>
              {rate?.symbol} - {rate?.name} ({formatUsdValue(rate?.price_usd || 0)})
            </option>
          )
        })}
      </select>
    </div>
  )
}