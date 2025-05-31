import React from 'react'
import { useExchangeRate } from '@/contexts/ExchangeRateContext'

interface PriceDisplayProps {
  amount: string | number
  tokenId: string
  showChange?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function PriceDisplay({ 
  amount, 
  tokenId, 
  showChange = false, 
  className = '',
  size = 'md'
}: PriceDisplayProps) {
  const { calculateUsdValue, formatUsdValue, getRate, formatPriceChange } = useExchangeRate()
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const usdValue = calculateUsdValue(numAmount, tokenId)
  const rate = getRate(tokenId)
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  }

  const tokenSymbol = tokenId.toUpperCase()

  return (
    <div className={`${className}`}>
      <div className={`font-medium text-neutral-900 ${sizeClasses[size]}`}>
        {numAmount.toFixed(6)} {tokenSymbol}
      </div>
      <div className={`text-neutral-500 ${size === 'lg' ? 'text-base' : 'text-sm'}`}>
        {formatUsdValue(usdValue)}
        {showChange && rate && (
          <span className={`ml-2 ${formatPriceChange(rate.price_change_24h).color}`}>
            {formatPriceChange(rate.price_change_24h).text}
          </span>
        )}
      </div>
    </div>
  )
}

interface TokenPriceProps {
  tokenId: string
  showChange?: boolean
  className?: string
}

export function TokenPrice({ tokenId, showChange = true, className = '' }: TokenPriceProps) {
  const { getRate, formatUsdValue, formatPriceChange } = useExchangeRate()
  
  const rate = getRate(tokenId)
  
  if (!rate) {
    return (
      <div className={className}>
        <div className="text-neutral-400">Price loading...</div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="font-medium text-neutral-900">
        {formatUsdValue(rate.price_usd)}
      </div>
      {showChange && (
        <div className={`text-sm ${formatPriceChange(rate.price_change_24h).color}`}>
          {formatPriceChange(rate.price_change_24h).text}
        </div>
      )}
    </div>
  )
}