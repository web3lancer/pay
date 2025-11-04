'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react'
import { useMezoWallet, useMezoPosition, useMezoBorrow, getBTCPrice, calculateMaxBorrowable, calculateHealthFactor, getHealthStatus, getHealthPercentage } from '@/integrations/mezo'
import { useUserWallet } from './WalletPrefsContext'
import toast from 'react-hot-toast'

export interface CreditLinePosition {
  id: string
  address: string
  collateralAmount: number
  collateralCurrency: string
  borrowedAmount: number
  borrowedCurrency: string
  healthFactor: number
  maxBorrowable: number
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'pending' | 'closed'
  txHash?: string
}

export interface CapitalContextType {
  // State
  position: CreditLinePosition | null
  loading: boolean
  error: string | null
  connected: boolean
  address: string | null
  userWallet: string | null
  isWalletMismatch: boolean
  network: string | null
  btcPrice: number

  // Actions
  borrowMUSD: (amount: number) => Promise<boolean>
  repayMUSD: (amount: number) => Promise<boolean>
  withdrawCollateral: (amount: number) => Promise<boolean>
  refreshPosition: () => Promise<void>
  connectWallet: () => Promise<void>
  openWalletManager: () => void

  // Helpers
  getAvailableToBorrow: () => number
}

const CapitalContextClient = createContext<CapitalContextType | undefined>(undefined)

export function CapitalProvider({ children }: { children: ReactNode }) {
  const { address, connected, network, connect } = useMezoWallet()
  
  // Try to use wallet context, but handle case where it's not available
  let userWallet: string | null = null
  let openWalletManager = () => {}
  
  try {
    const walletContext = useUserWallet()
    userWallet = walletContext.userWallet
    openWalletManager = walletContext.openWalletManager
  } catch {
    // WalletProvider not available, continue without wallet prefs
  }
  
  const { position: mezoPosition, loading: posLoading, refresh: refreshMezo, error: mezoError } = useMezoPosition(address, network === 'mainnet' ? 'mainnet' : 'testnet')
  const { openPosition, repay, withdraw, loading: txLoading, error: txError } = useMezoBorrow(network === 'mainnet' ? 'mainnet' : 'testnet')

  const [position, setPosition] = useState<CreditLinePosition | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [btcPrice, setBtcPrice] = useState(50000)

  // Check if connected wallet matches user's stored wallet
  const isWalletMismatch = connected && address && userWallet && address.toLowerCase() !== userWallet.toLowerCase()

  // Fetch BTC price on mount and when network changes
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await getBTCPrice()
        setBtcPrice(price)
      } catch (err) {
        console.error('Failed to fetch BTC price:', err)
      }
    }
    fetchPrice()
    const interval = setInterval(fetchPrice, 60000) // Refresh every 60 seconds
    return () => clearInterval(interval)
  }, [])

  // Sync Mezo position with context position
  useEffect(() => {
    if (mezoPosition && address) {
      const maxBorrow = calculateMaxBorrowable(parseFloat(mezoPosition.collateral), btcPrice)
      const healthFactor = calculateHealthFactor(parseFloat(mezoPosition.collateral), parseFloat(mezoPosition.debt), btcPrice)
      const healthStatus = getHealthStatus(healthFactor)

      const newPosition: CreditLinePosition = {
        id: `pos_${address}`,
        address,
        collateralAmount: parseFloat(mezoPosition.collateral),
        collateralCurrency: 'BTC',
        borrowedAmount: parseFloat(mezoPosition.debt),
        borrowedCurrency: 'MUSD',
        healthFactor,
        maxBorrowable,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      }
      setPosition(newPosition)
      setError(null)
    } else if (!mezoPosition && address && connected) {
      setPosition(null)
    }
  }, [mezoPosition, address, connected, btcPrice])

  // Sync errors
  useEffect(() => {
    if (mezoError) setError(mezoError)
    if (txError) setError(txError)
  }, [mezoError, txError])

  const connectWallet = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      await connect()
      toast.success('Wallet connected')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to connect wallet'
      setError(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [connect])

  const borrowMUSD = useCallback(async (amount: number) => {
    if (!connected || !address || !position) {
      const msg = 'Wallet not connected'
      setError(msg)
      toast.error(msg)
      return false
    }

    if (amount <= 0) {
      const msg = 'Invalid borrow amount'
      setError(msg)
      toast.error(msg)
      return false
    }

    const maxBorrow = position.maxBorrowable - position.borrowedAmount
    if (amount > maxBorrow) {
      const msg = `Cannot borrow more than ${maxBorrow.toFixed(2)} MUSD`
      setError(msg)
      toast.error(msg)
      return false
    }

    const projectedDebt = position.borrowedAmount + amount
    const projectedHealth = calculateHealthFactor(position.collateralAmount, projectedDebt, btcPrice)
    if (projectedHealth < 1.1) {
      const msg = 'Borrow would put position at liquidation risk (health < 1.1)'
      setError(msg)
      toast.error(msg)
      return false
    }

    setLoading(true)
    setError(null)
    try {
      const result = await openPosition(position.collateralAmount.toString(), amount.toString())
      if (result.success) {
        toast.success(`Borrowed ${amount.toFixed(2)} MUSD successfully`)
        await refreshMezo()
        return true
      } else {
        const errMsg = result.error?.message || 'Failed to borrow'
        setError(errMsg)
        toast.error(errMsg)
        return false
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Borrow transaction failed'
      setError(msg)
      toast.error(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [connected, address, position, openPosition, refreshMezo, btcPrice])

  const repayMUSD = useCallback(async (amount: number) => {
    if (!connected || !position) {
      const msg = 'Wallet not connected or no active position'
      setError(msg)
      toast.error(msg)
      return false
    }

    if (amount <= 0 || amount > position.borrowedAmount) {
      const msg = 'Invalid repay amount'
      setError(msg)
      toast.error(msg)
      return false
    }

    setLoading(true)
    setError(null)
    try {
      const result = await repay(amount.toString())
      if (result.success) {
        toast.success(`Repaid ${amount.toFixed(2)} MUSD successfully`)
        await refreshMezo()
        return true
      } else {
        const errMsg = result.error?.message || 'Failed to repay'
        setError(errMsg)
        toast.error(errMsg)
        return false
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Repay transaction failed'
      setError(msg)
      toast.error(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [connected, position, repay, refreshMezo])

  const withdrawCollateral = useCallback(async (amount: number) => {
    if (!connected || !position) {
      const msg = 'Wallet not connected or no active position'
      setError(msg)
      toast.error(msg)
      return false
    }

    if (amount <= 0 || amount > position.collateralAmount) {
      const msg = 'Invalid withdrawal amount'
      setError(msg)
      toast.error(msg)
      return false
    }

    const projectedCollateral = position.collateralAmount - amount
    const projectedHealth = calculateHealthFactor(projectedCollateral, position.borrowedAmount, btcPrice)
    if (projectedHealth < 1.1) {
      const msg = 'Cannot withdraw - would put position at liquidation risk'
      setError(msg)
      toast.error(msg)
      return false
    }

    setLoading(true)
    setError(null)
    try {
      const result = await withdraw(amount.toString())
      if (result.success) {
        toast.success(`Withdrew ${amount.toFixed(4)} BTC successfully`)
        await refreshMezo()
        return true
      } else {
        const errMsg = result.error?.message || 'Failed to withdraw'
        setError(errMsg)
        toast.error(errMsg)
        return false
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Withdrawal transaction failed'
      setError(msg)
      toast.error(msg)
      return false
    } finally {
      setLoading(false)
    }
  }, [connected, position, withdraw, refreshMezo, btcPrice])

  const refreshPosition = useCallback(async () => {
    try {
      setError(null)
      await refreshMezo()
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to refresh position'
      setError(msg)
      toast.error(msg)
    }
  }, [refreshMezo])

  const getAvailableToBorrow = useCallback((): number => {
    if (!position) return 0
    return Math.max(0, position.maxBorrowable - position.borrowedAmount)
  }, [position])

  const value: CapitalContextType = {
    position,
    loading: loading || posLoading || txLoading,
    error,
    connected,
    address,
    userWallet,
    isWalletMismatch,
    network,
    btcPrice,
    borrowMUSD,
    repayMUSD,
    withdrawCollateral,
    refreshPosition,
    connectWallet,
    openWalletManager,
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
