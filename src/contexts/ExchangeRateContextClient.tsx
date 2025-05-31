'use client';

import React, { createContext, useContext, useEffect, useState } from 'react'
import { ExchangeRateService, ExchangeRate } from '@/lib/exchangeRates'

interface ExchangeRateContextType {
  rates: Record<string, ExchangeRate>
  isLoading: boolean
  lastUpdated: Date | null
  refreshRates: (tokenIds?: string[]) => Promise<void>
  getRate: (tokenId: string) => ExchangeRate | null
  calculateUsdValue: (amount: string | number, tokenId: string) => number
  formatUsdValue: (usdValue: number) => string
  formatPriceChange: (change: number) => { text: string; color: string }
}

const ExchangeRateContext = createContext<ExchangeRateContextType | undefined>(undefined)

export function ExchangeRateProvider({ children }: { children: React.ReactNode }) {
  const [rates, setRates] = useState<Record<string, ExchangeRate>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  // Default tokens to fetch rates for
  const defaultTokens = ['btc', 'eth', 'matic', 'bnb', 'usdt', 'usdc']

  const refreshRates = async (tokenIds: string[] = defaultTokens) => {
    setIsLoading(true)
    try {
      const exchangeRates = await ExchangeRateService.getMultipleExchangeRates(tokenIds)
      const ratesMap: Record<string, ExchangeRate> = {}
      
      exchangeRates.forEach(rate => {
        ratesMap[rate.tokenId] = rate
      })
      
      setRates(prev => ({ ...prev, ...ratesMap }))
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to refresh exchange rates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRate = (tokenId: string): ExchangeRate | null => {
    return rates[tokenId.toLowerCase()] || null
  }

  const calculateUsdValue = (amount: string | number, tokenId: string): number => {
    const rate = getRate(tokenId)
    return ExchangeRateService.calculateUsdValue(amount, tokenId, rate || undefined)
  }

  const formatUsdValue = (usdValue: number): string => {
    return ExchangeRateService.formatUsdValue(usdValue)
  }

  const formatPriceChange = (change: number) => {
    return ExchangeRateService.formatPriceChange(change)
  }

  // Initial load and periodic refresh
  useEffect(() => {
    refreshRates()
    
    // Refresh rates every 5 minutes
    const interval = setInterval(() => {
      refreshRates()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  // Refresh when window becomes visible (user returns to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && lastUpdated) {
        const timeSinceUpdate = Date.now() - lastUpdated.getTime()
        // Refresh if more than 2 minutes since last update
        if (timeSinceUpdate > 2 * 60 * 1000) {
          refreshRates()
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [lastUpdated])

  return (
    <ExchangeRateContext.Provider value={{
      rates,
      isLoading,
      lastUpdated,
      refreshRates,
      getRate,
      calculateUsdValue,
      formatUsdValue,
      formatPriceChange
    }}>
      {children}
    </ExchangeRateContext.Provider>
  )
}

export function useExchangeRate() {
  const context = useContext(ExchangeRateContext)
  if (context === undefined) {
    throw new Error('useExchangeRate must be used within an ExchangeRateProvider')
  }
  return context
}