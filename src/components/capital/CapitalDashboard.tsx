'use client'

import React, { useState, useEffect } from 'react'
import { FiArrowRight, FiRefreshCw, FiTrendingUp, FiLock, FiUnlock } from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'
import { useMezoWallet, useMezoPosition, getBTCPrice, calculateMaxBorrowable } from '@/integrations/mezo'
import { HealthMeter } from './HealthMeter'
import { GetAdvanceModal } from './GetAdvanceModal'

interface CapitalDashboardProps {
  className?: string
}

export function CapitalDashboard({
  className = ''
}: CapitalDashboardProps) {
  const { address, connected, network } = useMezoWallet()
  const { position, loading, refresh, error: positionError } = useMezoPosition(address, network === 'mainnet' ? 'mainnet' : 'testnet')
  const [showModal, setShowModal] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [btcPrice, setBtcPrice] = useState(50000)

  // Fetch BTC price on mount
  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getBTCPrice()
      setBtcPrice(price)
    }
    fetchPrice()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await refresh()
    } finally {
      setIsRefreshing(false)
    }
  }

  const collateral = position?.collateral ? parseFloat(position.collateral) : 0
  const debt = position?.debt ? parseFloat(position.debt) : 0
  const healthStatus = position?.healthStatus || 'safe'
  const healthPercentage = position?.healthPercentage || 0
  const maxBorrowable = calculateMaxBorrowable(collateral, btcPrice)

  return (
    <>
      <div className={`bg-white rounded-2xl border border-neutral-200 overflow-hidden ${className}`}>
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200 px-6 py-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Capital Hub</h2>
              <p className="text-sm text-neutral-600 mt-1">Unlock credit with your Bitcoin</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 hover:bg-primary-200 rounded-lg transition-colors"
            >
              <FiRefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Connection Status */}
          {!connected && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-900">
                <strong>Wallet not connected.</strong> Please connect your wallet to view your capital position.
              </p>
            </div>
          )}

          {/* Error Message */}
          {positionError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">{positionError}</p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Available Collateral */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <FiLock className="w-4 h-4 text-neutral-600" />
                <span className="text-xs font-medium text-neutral-600">Collateral (BTC)</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {collateral.toFixed(4)} <span className="text-lg">BTC</span>
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                ≈ {formatCurrency(collateral * btcPrice)}
              </p>
            </div>

            {/* Currently Borrowed */}
            <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200">
              <div className="flex items-center gap-2 mb-2">
                <FiUnlock className="w-4 h-4 text-neutral-600" />
                <span className="text-xs font-medium text-neutral-600">Debt (MUSD)</span>
              </div>
              <div className="text-2xl font-bold text-neutral-900">
                {formatCurrency(debt)}
              </div>
              <p className="text-sm text-neutral-600 mt-1">
                {position ? `${((debt / maxBorrowable) * 100).toFixed(0)}% utilized` : 'No active position'}
              </p>
            </div>

            {/* Available to Borrow */}
            <div className="p-4 rounded-xl bg-primary-50 border border-primary-200">
              <div className="flex items-center gap-2 mb-2">
                <FiTrendingUp className="w-4 h-4 text-primary-600" />
                <span className="text-xs font-medium text-primary-600">Available to Borrow</span>
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {formatCurrency(Math.max(0, maxBorrowable - debt))}
              </div>
              <p className="text-sm text-primary-600 mt-1">
                of {formatCurrency(maxBorrowable)} limit
              </p>
            </div>
          </div>

          {/* Health Meter */}
          {position && (
            <HealthMeter
              healthPercentage={healthPercentage}
              healthFactor={position.healthFactor}
              status={healthStatus}
            />
          )}

          {/* Info Section */}
          {!position && connected ? (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-900">
                <strong>No active credit line yet.</strong> Click "Get Advance" to create one and unlock your Bitcoin&apos;s potential.
              </p>
            </div>
          ) : null}

          {/* CTA Button */}
          <button
            onClick={() => setShowModal(true)}
            disabled={loading || !connected}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{loading ? 'Loading...' : 'Get Advance'}</span>
            <FiArrowRight className="w-5 h-5" />
          </button>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-200">
            <div>
              <p className="text-xs text-neutral-600">Interest Rate</p>
              <p className="text-lg font-bold text-neutral-900 mt-1">5.5% APR</p>
            </div>
            <div>
              <p className="text-xs text-neutral-600">Liquidation Threshold</p>
              <p className="text-lg font-bold text-neutral-900 mt-1">150%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <GetAdvanceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => handleRefresh()}
        btcBalance={btcBalance}
      />
    </>
  )
}
