'use client'

import React, { useState, useMemo } from 'react'
import { useCapital } from '@/contexts/CapitalContext'
import { FiX, FiArrowDown } from 'react-icons/fi'
import { formatCurrency } from '@/lib/utils'
import { HealthMeter } from './HealthMeter'

interface GetAdvanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  btcBalance: number
}

export function GetAdvanceModal({
  isOpen,
  onClose,
  onSuccess,
  btcBalance
}: GetAdvanceModalProps) {
  const { position, borrowMUSD, loading, error } = useCapital()
  const [borrowAmount, setBorrowAmount] = useState(1000)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const availableToBorrow = useMemo(() => {
    if (!position) return 0
    return Math.floor((btcBalance * 50000) * 0.5) // 50% LTV at $50k BTC
  }, [position, btcBalance])

  const projectedRatio = useMemo(() => {
    if (!position || !btcBalance) return 300
    const collateralValue = btcBalance * 50000
    const totalBorrowed = (position.borrowedAmount || 0) + borrowAmount
    return (collateralValue / totalBorrowed) * 100
  }, [position, btcBalance, borrowAmount])

  const projectedHealth = useMemo(() => {
    const minRatio = 150
    const maxRatio = 300
    return Math.max(0, Math.min(100, ((projectedRatio - minRatio) / (maxRatio - minRatio)) * 100))
  }, [projectedRatio])

  const getProjectedStatus = () => {
    if (projectedRatio >= 200) return 'safe'
    if (projectedRatio >= 150) return 'caution'
    return 'risk'
  }

  const handleBorrow = async () => {
    if (!position) return
    setIsSubmitting(true)
    try {
      await borrowMUSD(borrowAmount)
      onSuccess?.()
      setBorrowAmount(1000)
      onClose()
    } catch (err) {
      console.error('Borrow failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = borrowAmount > 0 && borrowAmount <= availableToBorrow

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900">Get Advance</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>How it works:</strong> Use your Bitcoin as collateral to unlock a credit line in MUSD (Mezo USD). No selling required.
            </p>
          </div>

          {/* Available Collateral */}
          <div>
            <label className="text-sm font-medium text-neutral-600">Available Collateral</label>
            <div className="mt-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Bitcoin Available</span>
                <span className="text-lg font-bold text-neutral-900">{btcBalance.toFixed(4)} BTC</span>
              </div>
              <div className="text-sm text-neutral-600 mt-1">
                ≈ {formatCurrency(btcBalance * 50000)} USD value
              </div>
            </div>
          </div>

          {/* Borrow Amount Input */}
          <div>
            <label className="text-sm font-medium text-neutral-600">MUSD to Borrow</label>
            <div className="mt-2 relative">
              <input
                type="number"
                min="100"
                max={availableToBorrow}
                step="100"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(Math.min(availableToBorrow, Math.max(0, Number(e.target.value))))}
                disabled={isSubmitting}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white text-lg font-semibold"
                placeholder="Enter amount"
              />
              <span className="absolute right-4 top-3 text-neutral-600">MUSD</span>
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              Available to borrow: <strong>{formatCurrency(availableToBorrow)}</strong>
            </div>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min="100"
              max={availableToBorrow}
              step="100"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(Number(e.target.value))}
              disabled={isSubmitting}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-neutral-600 mt-2">
              <span>Min: $100</span>
              <span>Max: {formatCurrency(availableToBorrow)}</span>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Impact Preview</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Current Borrowed</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(position?.borrowedAmount || 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <FiArrowDown className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">New Borrow</span>
                <span className="font-medium text-neutral-900">+ {formatCurrency(borrowAmount)}</span>
              </div>
              <div className="bg-neutral-100 h-px my-2" />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-900">Total to Repay</span>
                <span className="text-lg font-bold text-neutral-900">
                  {formatCurrency((position?.borrowedAmount || 0) + borrowAmount)}
                </span>
              </div>
            </div>

            {/* Projected Health */}
            <HealthMeter
              healthPercentage={projectedHealth}
              collateralizationRatio={projectedRatio}
              status={getProjectedStatus()}
              className="mb-6"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Validation Messages */}
          {!isValid && borrowAmount > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {borrowAmount > availableToBorrow
                  ? 'Borrow amount exceeds available limit'
                  : 'Enter a valid borrow amount'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleBorrow}
            disabled={!isValid || isSubmitting || loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all ${
              isValid && !isSubmitting && !loading
                ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting || loading ? 'Processing...' : 'Confirm Advance'}
          </button>

          {/* Disclaimer */}
          <p className="text-xs text-neutral-600 text-center">
            By confirming, you agree to the terms of service and understand the risks of collateralized borrowing.
          </p>
        </div>
      </div>
    </div>
  )
}
