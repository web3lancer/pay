'use client'

import React, { useState, useEffect } from 'react'
import { FiX, FiArrowUp, FiLoader } from 'react-icons/fi'
import { formatCurrency } from '@/lib/utils'
import { useCapital } from '@/contexts/CapitalContextClient'
import toast from 'react-hot-toast'

interface RepayModalProps {
  isOpen: boolean
  onClose: () => void
  maxAmount: number
  currentDebt: number
}

export function RepayModal({
  isOpen,
  onClose,
  maxAmount,
  currentDebt
}: RepayModalProps) {
  const { repayMUSD, loading } = useCapital()
  const [repayAmount, setRepayAmount] = useState(500)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRepayAmount(Math.min(500, maxAmount / 2))
    }
  }, [isOpen, maxAmount])

  const isValid = repayAmount > 0 && repayAmount <= maxAmount
  const remainingDebt = currentDebt - repayAmount

  const handleRepay = async () => {
    if (repayAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (repayAmount > maxAmount) {
      toast.error('Repay amount exceeds current debt')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await repayMUSD(repayAmount)
      if (success) {
        toast.success('Debt repaid successfully!')
        setRepayAmount(500)
        onClose()
      }
    } catch (err) {
      console.error('Repay failed:', err)
      toast.error('Failed to repay debt')
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
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Repay MUSD</h2>
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
              Repay Amount (MUSD)
            </label>
            <input
              type="number"
              min="0"
              max={maxAmount}
              step="100"
              value={repayAmount}
              onChange={(e) => setRepayAmount(parseFloat(e.target.value) || 0)}
              disabled={isSubmitting || loading}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50"
              placeholder="0"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Current Debt: {formatCurrency(maxAmount)}
            </p>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '25%', value: maxAmount * 0.25 },
              { label: '50%', value: maxAmount * 0.5 },
              { label: '100%', value: maxAmount }
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setRepayAmount(value)}
                disabled={isSubmitting || loading}
                className="px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
              >
                {label}
              </button>
            ))}
          </div>

          {/* Slider */}
          <div>
            <input
              type="range"
              min="0"
              max={maxAmount}
              step="100"
              value={repayAmount}
              onChange={(e) => setRepayAmount(parseFloat(e.target.value))}
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
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Current Debt</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatCurrency(currentDebt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Repay Amount</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white text-green-600 dark:text-green-400">-{formatCurrency(repayAmount)}</span>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-600 pt-3 flex justify-between">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Remaining Debt</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatCurrency(Math.max(0, remainingDebt))}</span>
            </div>
          </div>

          {/* Info */}
          {remainingDebt <= 0 && (
            <div className="p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-900 dark:text-green-200">
                <strong>Great!</strong> This repayment will close your position completely.
              </p>
            </div>
          )}

          {/* Terms */}
          <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <p>• No penalty for early repayment</p>
            <p>• Repay minimum amount to maintain position</p>
            <p>• Interest accrues at 5.5% APR</p>
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
              onClick={handleRepay}
              disabled={!isValid || isSubmitting || loading}
              className="flex-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <FiArrowUp className="w-4 h-4" />
                  Repay Now
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
