'use client'

import React, { useState, useEffect } from 'react'
import { FiX, FiArrowDown, FiLoader } from 'react-icons/fi'
import { formatCurrency } from '@/lib/utils'
import { useCapital } from '@/contexts/CapitalContextClient'
import { calculateHealthFactor, getHealthStatus, getHealthPercentage } from '@/integrations/mezo'
import { HealthMeter } from './HealthMeter'
import toast from 'react-hot-toast'

interface BorrowModalProps {
  isOpen: boolean
  onClose: () => void
  maxAmount: number
  currentDebt: number
  collateral: number
  btcPrice: number
}

export function BorrowModal({
  isOpen,
  onClose,
  maxAmount,
  currentDebt,
  collateral,
  btcPrice
}: BorrowModalProps) {
  const { borrowMUSD, loading } = useCapital()
  const [borrowAmount, setBorrowAmount] = useState(1000)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setBorrowAmount(Math.min(1000, maxAmount / 2))
    }
  }, [isOpen, maxAmount])

  const projectedDebt = currentDebt + borrowAmount
  const projectedHealthFactor = calculateHealthFactor(collateral, projectedDebt, btcPrice)
  const projectedStatus = getHealthStatus(projectedHealthFactor)
  const projectedHealthPercentage = getHealthPercentage(projectedHealthFactor)

  const isValid = borrowAmount > 0 && borrowAmount <= maxAmount && projectedHealthFactor >= 1.1

  const handleBorrow = async () => {
    if (borrowAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (borrowAmount > maxAmount) {
      toast.error('Borrow amount exceeds maximum')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await borrowMUSD(borrowAmount)
      if (success) {
        toast.success('Position opened successfully!')
        setBorrowAmount(1000)
        onClose()
      }
    } catch (err) {
      console.error('Borrow failed:', err)
      toast.error('Failed to open position')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-neutral-200 dark:border-neutral-700">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Borrow MUSD</h2>
          <button
            onClick={onClose}
            disabled={isSubmitting || loading}
            className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5 text-neutral-900 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-2">
              Borrow Amount (MUSD)
            </label>
            <input
              type="number"
              min="0"
              max={maxAmount}
              step="100"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(parseFloat(e.target.value) || 0)}
              disabled={isSubmitting || loading}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
              placeholder="0"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Maximum: {formatCurrency(maxAmount)}
            </p>
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min="0"
              max={maxAmount}
              step="100"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(parseFloat(e.target.value))}
              disabled={isSubmitting || loading}
              className="w-full h-2 bg-neutral-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              <span>0</span>
              <span>{formatCurrency(maxAmount)}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Borrow Amount</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatCurrency(borrowAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Current Debt</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatCurrency(currentDebt)}</span>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-600 pt-3 flex justify-between">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Projected Debt</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatCurrency(projectedDebt)}</span>
            </div>
          </div>

          {/* Health Factor Preview */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-3">
              Projected Health
            </label>
            <HealthMeter
              healthPercentage={Math.max(0, Math.min(100, (projectedHealthFactor - 1.1) / 1.9 * 100))}
              healthFactor={projectedHealthFactor}
              status={projectedStatus}
            />
          </div>

          {/* Warnings */}
          {projectedHealthFactor < 1.1 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-200">
                <strong>Risk:</strong> This amount would put your position at liquidation risk. Reduce the borrow amount or add more collateral.
              </p>
            </div>
          )}

          {projectedHealthFactor < 1.5 && projectedHealthFactor >= 1.1 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Caution:</strong> Your position will have low health. Consider borrowing less or adding more collateral.
              </p>
            </div>
          )}

          {/* Terms */}
          <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <p>• Liquidation occurs when health factor drops below 110%</p>
            <p>• Interest rate: 5.5% APR</p>
            <p>• No fees for borrowing</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <button
              onClick={onClose}
              disabled={isSubmitting || loading}
              className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleBorrow}
              disabled={!isValid || isSubmitting || loading}
              className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <FiArrowDown className="w-4 h-4" />
                  Borrow Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
