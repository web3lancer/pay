'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

export interface CreditLinePosition {
  id: string
  collateralAmount: number
  collateralCurrency: string
  borrowedAmount: number
  borrowedCurrency: string
  collateralizationRatio: number
  maxBorrowable: number
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'pending' | 'closed'
}

export interface CapitalContextType {
  // Position state
  position: CreditLinePosition | null
  loading: boolean
  error: string | null

  // Actions
  initializePosition: (collateralBTC: number) => Promise<void>
  borrowMUSD: (amount: number) => Promise<void>
  repayMUSD: (amount: number) => Promise<void>
  withdrawCollateral: (amount: number) => Promise<void>
  refreshPosition: () => Promise<void>

  // Helpers
  getHealthStatus: () => 'safe' | 'caution' | 'risk'
  getHealthPercentage: () => number
  getAvailableToBorrow: () => number
}

const CapitalContextClient = createContext<CapitalContextType | undefined>(undefined)

export function CapitalProvider({ children }: { children: ReactNode }) {
  const [position, setPosition] = useState<CreditLinePosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const initializePosition = useCallback(async (collateralBTC: number) => {
    setLoading(true)
    setError(null)
    try {
      // TODO: Call Mezo API to initialize position
      // For now, mock the response
      const mockPosition: CreditLinePosition = {
        id: 'pos_' + Date.now(),
        collateralAmount: collateralBTC,
        collateralCurrency: 'BTC',
        borrowedAmount: 0,
        borrowedCurrency: 'MUSD',
        collateralizationRatio: 300,
        maxBorrowable: collateralBTC * 0.5 * 50000, // Assuming 50k BTC, 50% LTV
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      }
      setPosition(mockPosition)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize position')
    } finally {
      setLoading(false)
    }
  }, [])

  const borrowMUSD = useCallback(async (amount: number) => {
    if (!position) throw new Error('No active position')
    setLoading(true)
    setError(null)
    try {
      // TODO: Call Mezo API to borrow
      const updatedPosition: CreditLinePosition = {
        ...position,
        borrowedAmount: position.borrowedAmount + amount,
        collateralizationRatio: Math.max(
          150,
          (position.collateralAmount * 50000) / (position.borrowedAmount + amount)
        ),
        updatedAt: new Date()
      }
      setPosition(updatedPosition)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to borrow')
    } finally {
      setLoading(false)
    }
  }, [position])

  const repayMUSD = useCallback(async (amount: number) => {
    if (!position) throw new Error('No active position')
    setLoading(true)
    setError(null)
    try {
      // TODO: Call Mezo API to repay
      const updatedPosition: CreditLinePosition = {
        ...position,
        borrowedAmount: Math.max(0, position.borrowedAmount - amount),
        collateralizationRatio: position.collateralAmount > 0
          ? (position.collateralAmount * 50000) / Math.max(1, position.borrowedAmount - amount)
          : 300,
        updatedAt: new Date()
      }
      setPosition(updatedPosition)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to repay')
    } finally {
      setLoading(false)
    }
  }, [position])

  const withdrawCollateral = useCallback(async (amount: number) => {
    if (!position) throw new Error('No active position')
    setLoading(true)
    setError(null)
    try {
      // TODO: Call Mezo API to withdraw
      const newCollateral = position.collateralAmount - amount
      const updatedPosition: CreditLinePosition = {
        ...position,
        collateralAmount: newCollateral,
        collateralizationRatio: newCollateral > 0
          ? (newCollateral * 50000) / Math.max(1, position.borrowedAmount)
          : 300,
        maxBorrowable: newCollateral * 0.5 * 50000,
        updatedAt: new Date()
      }
      setPosition(updatedPosition)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw')
    } finally {
      setLoading(false)
    }
  }, [position])

  const refreshPosition = useCallback(async () => {
    setLoading(true)
    try {
      // TODO: Fetch latest position from Mezo
      // For now, just update timestamp
      if (position) {
        setPosition({ ...position, updatedAt: new Date() })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh')
    } finally {
      setLoading(false)
    }
  }, [position])

  const getHealthStatus = useCallback((): 'safe' | 'caution' | 'risk' => {
    if (!position) return 'safe'
    const ratio = position.collateralizationRatio
    if (ratio >= 200) return 'safe'
    if (ratio >= 150) return 'caution'
    return 'risk'
  }, [position])

  const getHealthPercentage = useCallback((): number => {
    if (!position) return 100
    // Map 150-300 ratio to 0-100 percentage
    const ratio = position.collateralizationRatio
    const minRatio = 150
    const maxRatio = 300
    return Math.max(0, Math.min(100, ((ratio - minRatio) / (maxRatio - minRatio)) * 100))
  }, [position])

  const getAvailableToBorrow = useCallback((): number => {
    if (!position) return 0
    return Math.max(0, position.maxBorrowable - position.borrowedAmount)
  }, [position])

  const value: CapitalContextType = {
    position,
    loading,
    error,
    initializePosition,
    borrowMUSD,
    repayMUSD,
    withdrawCollateral,
    refreshPosition,
    getHealthStatus,
    getHealthPercentage,
    getAvailableToBorrow
  }

  return (
    <CapitalContextClient.Provider value={value}>
      {children}
    </CapitalContextClient.Provider>
  )
}

export function useCapital() {
  const context = useContext(CapitalContextClient)
  if (!context) {
    throw new Error('useCapital must be used within CapitalProvider')
  }
  return context
}
