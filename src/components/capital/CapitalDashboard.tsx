'use client'

import React, { useState, useEffect } from 'react'
import { FiArrowRight, FiRefreshCw, FiTrendingUp, FiLock, FiUnlock, FiPlus, FiMinus } from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'
import { useCapital } from '@/contexts/CapitalContextClient'
import { HealthMeter } from './HealthMeter'
import { BorrowModal } from './BorrowModal'
import { RepayModal } from './RepayModal'
import { WithdrawModal } from './WithdrawModal'
import toast from 'react-hot-toast'

interface CapitalDashboardProps {
  className?: string
}

export function CapitalDashboard({
  className = ''
}: CapitalDashboardProps) {
  const { 
    position, 
    loading, 
    error, 
    connected, 
    address,
    btcPrice,
    connectWallet,
    refreshPosition,
    getAvailableToBorrow
  } = useCapital()

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showBorrowModal, setShowBorrowModal] = useState(false)
  const [showRepayModal, setShowRepayModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refreshPosition()
      toast.success('Position refreshed')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleConnect = async () => {
    try {
      await connectWallet()
    } catch (err) {
      toast.error('Failed to connect wallet')
    }
  }

  if (!connected || !address) {
    return (
      <div className={`bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-lg ${className}`}>
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-orange-950 dark:to-orange-900 border-b border-primary-200 dark:border-orange-800 px-6 py-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Capital Hub</h2>
          <p className="text-sm text-neutral-600 dark:text-orange-200 mt-1">Unlock credit with your Bitcoin</p>
        </div>
        
        <div className="p-6">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Connect your wallet</strong> to access the Capital Hub and manage your Bitcoin credit line.
            </p>
          </div>
          <button
            onClick={handleConnect}
            className="w-full bg-orange-500 dark:bg-orange-500 hover:bg-orange-600 dark:hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Connect Wallet</span>
            <FiArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    )
  }

  const collateral = position?.collateralAmount || 0
  const debt = position?.borrowedAmount || 0
  const availableToBorrow = getAvailableToBorrow()
  const maxBorrow = position?.maxBorrowable || 0
  const healthFactor = position?.healthFactor || 0

  return (
    <>
      <div className={`bg-white dark:bg-neutral-800 rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-lg shadow-neutral-300/40 dark:shadow-neutral-950/40 ${className}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-orange-950 dark:to-orange-900 border-b border-primary-200 dark:border-orange-800 px-6 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Capital Hub</h2>
              <p className="text-sm text-neutral-600 dark:text-orange-200 mt-1">Unlock credit with your Bitcoin</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || loading}
              className="p-2 hover:bg-primary-200 dark:hover:bg-orange-800 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {address && (
            <p className="text-xs text-neutral-500 dark:text-orange-300">
              {address.slice(0, 6)}...{address.slice(-4)}
            </p>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Collateral */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FiLock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Collateral (BTC)</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {collateral.toFixed(4)} <span className="text-lg">BTC</span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                ≈ {formatCurrency(collateral * btcPrice)}
              </p>
            </div>

            {/* Currently Borrowed */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-700/50 border border-neutral-200 dark:border-neutral-600 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FiUnlock className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">Debt (MUSD)</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900 dark:text-white">
                {formatCurrency(debt)}
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {maxBorrow > 0 ? `${((debt / maxBorrow) * 100).toFixed(0)}% utilized` : 'No position'}
              </p>
            </div>

            {/* Available to Borrow */}
            <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="w-4 h-4 text-orange-600 dark:text-orange-300" />
                <span className="text-xs font-medium text-orange-600 dark:text-orange-300">Available to Borrow</span>
              </div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-200">
                {formatCurrency(availableToBorrow)}
              </div>
              <p className="text-sm text-orange-600 dark:text-orange-300 mt-1">
                of {formatCurrency(maxBorrow)} limit
              </p>
            </div>
          </div>

          {/* Health Meter */}
          {position && healthFactor > 0 && (
            <HealthMeter
              healthPercentage={Math.max(0, Math.min(100, (healthFactor - 1.1) / 1.9 * 100))}
              healthFactor={healthFactor}
              status={healthFactor >= 2.0 ? 'safe' : healthFactor >= 1.1 ? 'caution' : 'risk'}
            />
          )}

          {/* Info Box */}
          {!position && connected ? (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>No active credit line yet.</strong> You need to deposit Bitcoin collateral to create a position and borrow MUSD.
              </p>
            </div>
          ) : null}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {position ? (
              <>
                <button
                  onClick={() => setShowBorrowModal(true)}
                  disabled={loading || availableToBorrow <= 0}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus className="w-5 h-5" />
                  <span>Borrow</span>
                </button>

                <button
                  onClick={() => setShowRepayModal(true)}
                  disabled={loading || debt <= 0}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMinus className="w-5 h-5" />
                  <span>Repay</span>
                </button>

                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={loading || collateral <= 0}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 hover:from-purple-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiMinus className="w-5 h-5" />
                  <span>Withdraw</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={loading || isRefreshing}
                  className="w-full bg-gradient-to-r from-neutral-500 to-neutral-600 dark:from-neutral-600 dark:to-neutral-700 hover:from-neutral-600 hover:to-neutral-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </>
            ) : (
              <div className="col-span-2 p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg text-center">
                <p className="text-sm text-amber-900 dark:text-amber-200">
                  Create a position to start borrowing
                </p>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Interest Rate</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">5.5% APR</p>
            </div>
            <div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">Liquidation Threshold</p>
              <p className="text-lg font-bold text-neutral-900 dark:text-white mt-1">110%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <BorrowModal
        isOpen={showBorrowModal}
        onClose={() => setShowBorrowModal(false)}
        maxAmount={availableToBorrow}
        currentDebt={debt}
        collateral={collateral}
        btcPrice={btcPrice}
      />

      <RepayModal
        isOpen={showRepayModal}
        onClose={() => setShowRepayModal(false)}
        maxAmount={debt}
        currentDebt={debt}
      />

      <WithdrawModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        maxAmount={collateral}
        currentDebt={debt}
        collateral={collateral}
        btcPrice={btcPrice}
      />
    </>
  )
}
