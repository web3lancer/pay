'use client'

import React, { useState } from 'react'
import { FiX, FiAlertTriangle } from 'react-icons/fi'

interface WalletMismatchModalProps {
  isOpen: boolean
  onClose: () => void
  userWallet: string | null
  connectedWallet: string | null
  onConfirm: () => void
}

export function WalletMismatchModal({
  isOpen,
  onClose,
  userWallet,
  connectedWallet,
  onConfirm
}: WalletMismatchModalProps) {
  const [isConfirming, setIsConfirming] = useState(false)

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsConfirming(true)
    try {
      onConfirm()
    } finally {
      setIsConfirming(false)
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border-b border-amber-200 dark:border-orange-800 px-6 py-4 flex items-start gap-4">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-bold text-amber-900 dark:text-white">Wallet Mismatch</h2>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-1">
              Your connected wallet differs from your account wallet
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="p-1 hover:bg-amber-100 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50"
          >
            <FiX className="w-5 h-5 text-amber-900 dark:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="p-3 bg-neutral-50 dark:bg-neutral-700/50 rounded-lg">
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-1">Account Wallet (Stored)</p>
              <p className="font-mono text-sm text-neutral-900 dark:text-white break-all">
                {userWallet?.slice(0, 6)}...{userWallet?.slice(-4)}
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-1">Connected Wallet (Current)</p>
              <p className="font-mono text-sm text-blue-900 dark:text-blue-200 break-all">
                {connectedWallet?.slice(0, 6)}...{connectedWallet?.slice(-4)}
              </p>
            </div>
          </div>

          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-900 dark:text-amber-200">
              <strong>Note:</strong> You can proceed with this wallet, but your transactions will be recorded with the connected wallet instead of your account wallet.
            </p>
          </div>

          <div className="space-y-2 text-xs text-neutral-500 dark:text-neutral-400">
            <p>• Update your account wallet in Settings to match</p>
            <p>• Or switch to your account wallet in your Web3 provider</p>
            <p>• Transactions will proceed with the connected wallet</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 px-4 py-2 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirming}
            className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConfirming ? 'Proceeding...' : 'Proceed Anyway'}
          </button>
        </div>
      </div>
    </div>
  )
}
