'use client'

import React, { useState, useEffect } from 'react'
import { FiX, FiArrowUp, FiLoader } from 'react-icons/fi'
import { formatCurrency, formatCryptoAmount } from '@/lib/utils'
import { useCapital } from '@/contexts/CapitalContextClient'
import { calculateHealthFactor, getHealthStatus } from '@/integrations/mezo'
import { HealthMeter } from './HealthMeter'
import toast from 'react-hot-toast'

interface WithdrawModalProps {
  isOpen: boolean
  onClose: () => void
  maxAmount: number
  currentDebt: number
  collateral: number
  btcPrice: number
}

export function WithdrawModal({
  isOpen,
  onClose,
  maxAmount,
  currentDebt,
  collateral,
  btcPrice
}: WithdrawModalProps) {
  const { withdrawCollateral, loading } = useCapital()
  const [withdrawAmount, setWithdrawAmount] = useState(0.01)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setWithdrawAmount(Math.min(0.01, maxAmount / 4))
    }
  }, [isOpen, maxAmount])

  const projectedCollateral = collateral - withdrawAmount
  const projectedHealthFactor = currentDebt > 0 ? calculateHealthFactor(projectedCollateral, currentDebt, btcPrice) : 999
  const projectedStatus = getHealthStatus(projectedHealthFactor)
  const projectedHealthPercentage = Math.max(0, Math.min(100, (projectedHealthFactor - 1.1) / 1.9 * 100))

  const isValid = withdrawAmount > 0 && withdrawAmount <= maxAmount && (currentDebt === 0 || projectedHealthFactor >= 1.1)

  const handleWithdraw = async () => {
    if (withdrawAmount <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    if (withdrawAmount > maxAmount) {
      toast.error('Withdraw amount exceeds available collateral')
      return
    }

    if (currentDebt > 0 && projectedHealthFactor < 1.1) {
      toast.error('Cannot withdraw - would put position at liquidation risk')
      return
    }

    setIsSubmitting(true)
    try {
      const success = await withdrawCollateral(withdrawAmount)
      if (success) {
        toast.success('Collateral withdrawn successfully!')
        setWithdrawAmount(0.01)
        onClose()
      }
    } catch (err) {
      console.error('Withdraw failed:', err)
      toast.error('Failed to withdraw collateral')
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
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Withdraw Collateral</h2>
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
              Withdraw Amount (BTC)
            </label>
            <input
              type="number"
              min="0"
              max={maxAmount}
              step="0.0001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(parseFloat(e.target.value) || 0)}
              disabled={isSubmitting || loading}
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
              placeholder="0"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              Available: {formatCryptoAmount(maxAmount, 'BTC')} ({formatCurrency(maxAmount * btcPrice)})
            </p>
          </div>

          {/* Quick Amounts */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '25%', value: maxAmount * 0.25 },
              { label: '50%', value: maxAmount * 0.5 },
              { label: 'Max', value: maxAmount }
            ].map(({ label, value }) => (
              <button
                key={label}
                onClick={() => setWithdrawAmount(value)}
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
              step="0.0001"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(parseFloat(e.target.value))}
              disabled={isSubmitting || loading}
              className="w-full h-2 bg-neutral-300 dark:bg-neutral-600 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
            />
            <div className="flex justify-between text-xs text-neutral-500 dark:text-neutral-400 mt-2">
              <span>0</span>
              <span>{formatCryptoAmount(maxAmount, 'BTC')}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Current Collateral</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatCryptoAmount(collateral, 'BTC')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Withdraw Amount</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white text-purple-600 dark:text-purple-400">-{formatCryptoAmount(withdrawAmount, 'BTC')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">USD Value</span>
              <span className="text-sm font-semibold text-neutral-900 dark:text-white">{formatCurrency(withdrawAmount * btcPrice)}</span>
            </div>
            <div className="border-t border-neutral-200 dark:border-neutral-600 pt-3 flex justify-between">
              <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Remaining Collateral</span>
              <span className="text-sm font-bold text-neutral-900 dark:text-white">{formatCryptoAmount(Math.max(0, collateral - withdrawAmount), 'BTC')}</span>
            </div>
          </div>

          {/* Health Factor Preview */}
          {currentDebt > 0 && (
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-white mb-3">
                Projected Health
              </label>
              <HealthMeter
                healthPercentage={projectedHealthPercentage}
                healthFactor={projectedHealthFactor}
                status={projectedStatus}
              />
            </div>
          )}

          {/* Warnings */}
          {currentDebt > 0 && projectedHealthFactor < 1.1 && (
            <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-900 dark:text-red-200">
                <strong>Risk:</strong> This withdrawal would put your position at liquidation risk. Reduce the amount or repay debt first.
              </p>
            </div>
          )}

          {currentDebt > 0 && projectedHealthFactor < 1.5 && projectedHealthFactor >= 1.1 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-900 dark:text-amber-200">
                <strong>Caution:</strong> Your position will have low health after this withdrawal. Consider reducing the amount.
              </p>
            </div>
          )}

          {/* Info */}
          <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <p>• You need minimum 110% health factor to maintain position</p>
            <p>• Current debt: {formatCurrency(currentDebt)}</p>
            <p>• No fees for withdrawing collateral</p>
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
              onClick={handleWithdraw}
              disabled={!isValid || isSubmitting || loading}
              className="flex-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || loading ? (
                <>
                  <FiLoader className="w-4 h-4 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <FiArrowUp className="w-4 h-4" />
                  Withdraw
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
