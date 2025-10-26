'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { FiX, FiArrowDown, FiLoader } from 'react-icons/fi'
import { formatCurrency } from '@/lib/utils'
import { useMezoBorrow, calculateMaxBorrowable, calculateHealthFactor, getHealthStatus, getHealthPercentage, getBTCPrice } from '@/integrations/mezo'
import { HealthMeter } from './HealthMeter'
import toast from 'react-hot-toast'

interface GetAdvanceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
  collateral?: number
}

export function GetAdvanceModal({
  isOpen,
  onClose,
  onSuccess,
  collateral = 0
}: GetAdvanceModalProps) {
  const { openPosition, loading, error, txHash } = useMezoBorrow()
  const [borrowAmount, setBorrowAmount] = useState(1000)
  const [btcPrice, setBtcPrice] = useState(50000)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchPrice = async () => {
      const price = await getBTCPrice()
      setBtcPrice(price)
    }
    fetchPrice()
  }, [])

  const maxBorrowable = useMemo(() => {
    return calculateMaxBorrowable(collateral, btcPrice)
  }, [collateral, btcPrice])

  const projectedDebt = borrowAmount
  const projectedHealthFactor = useMemo(() => {
    return calculateHealthFactor(collateral, projectedDebt, btcPrice)
  }, [collateral, projectedDebt, btcPrice])

  const projectedStatus = getHealthStatus(projectedHealthFactor)
  const projectedHealthPercentage = getHealthPercentage(projectedHealthFactor)

  const handleBorrow = async () => {
    if (borrowAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (borrowAmount > maxBorrowable) {
      toast.error('Borrow amount exceeds maximum')
      return
    }

    setIsSubmitting(true)
    try {
      const result = await openPosition(collateral.toString(), borrowAmount.toString())
      if (result.success) {
        toast.success('Position opened successfully!')
        onSuccess?.()
        setBorrowAmount(1000)
        onClose()
      } else {
        toast.error(result.error?.message || 'Transaction failed')
      }
    } catch (err) {
      console.error('Borrow failed:', err)
      toast.error('Failed to open position')
    } finally {
      setIsSubmitting(false)
    }
  }

  const isValid = borrowAmount > 0 && borrowAmount <= maxBorrowable && projectedHealthFactor >= 1.1

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900">Get Advance</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting || loading}
            className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-900">{error}</p>
            </div>
          )}

          {txHash && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-900">
                <strong>Success!</strong> Transaction: {txHash.slice(0, 10)}...
              </p>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>How it works:</strong> Use your Bitcoin as collateral to unlock a credit line in MUSD (Mezo USD). No selling required.
            </p>
          </div>

          {/* Available Collateral */}
          <div>
            <label className="text-sm font-medium text-neutral-600">Collateral (BTC)</label>
            <div className="mt-2 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
              <div className="flex justify-between items-center">
                <span className="text-neutral-600">Bitcoin</span>
                <span className="text-lg font-bold text-neutral-900">{collateral.toFixed(4)} BTC</span>
              </div>
              <div className="text-sm text-neutral-600 mt-1">
                ≈ {formatCurrency(collateral * btcPrice)} USD value
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
                max={maxBorrowable}
                step="100"
                value={borrowAmount}
                onChange={(e) => setBorrowAmount(Math.min(maxBorrowable, Math.max(0, Number(e.target.value))))}
                disabled={isSubmitting || loading}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 bg-white text-lg font-semibold"
                placeholder="Enter amount"
              />
              <span className="absolute right-4 top-3 text-neutral-600">MUSD</span>
            </div>
            <div className="mt-2 text-sm text-neutral-600">
              Max available: <strong>{formatCurrency(maxBorrowable)}</strong>
            </div>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min="100"
              max={maxBorrowable}
              step="100"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(Number(e.target.value))}
              disabled={isSubmitting || loading}
              className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-neutral-600 mt-2">
              <span>Min: $100</span>
              <span>Max: {formatCurrency(maxBorrowable)}</span>
            </div>
          </div>

          {/* Impact Preview */}
          <div className="border-t border-neutral-200 pt-6">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">Impact Preview</h3>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">New Debt</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(borrowAmount)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <FiArrowDown className="w-4 h-4 text-neutral-400" />
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-neutral-600">Your Collateral</span>
                <span className="font-medium text-neutral-900">{collateral.toFixed(4)} BTC</span>
              </div>
              <div className="bg-neutral-100 h-px my-2" />
              <div className="flex justify-between">
                <span className="text-sm font-medium text-neutral-900">Health Factor</span>
                <span className="text-lg font-bold text-neutral-900">
                  {(projectedHealthFactor * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Projected Health */}
            <HealthMeter
              healthPercentage={projectedHealthPercentage}
              healthFactor={projectedHealthFactor}
              status={projectedStatus}
              className="mb-6"
            />
          </div>

          {/* Validation Messages */}
          {!isValid && borrowAmount > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                {borrowAmount > maxBorrowable
                  ? 'Borrow amount exceeds available limit'
                  : projectedHealthFactor < 1.1
                  ? 'Position would be at risk of liquidation'
                  : 'Enter a valid borrow amount'}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleBorrow}
            disabled={!isValid || isSubmitting || loading}
            className={`w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
              isValid && !isSubmitting && !loading
                ? 'bg-primary-600 hover:bg-primary-700 text-white cursor-pointer'
                : 'bg-neutral-200 text-neutral-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting || loading ? (
              <>
                <FiLoader className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm Advance'
            )}
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
