'use client'

import React, { useState } from 'react'
import { FiChevronDown, FiPlus, FiCheck } from 'react-icons/fi'

interface WalletSelectorProps {
  userWallet: string | null
  connectedWallet: string | null
  onAddWallet: () => void
  onWalletManager: () => void
}

export function WalletSelector({
  userWallet,
  connectedWallet,
  onAddWallet,
  onWalletManager
}: WalletSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const displayWallet = (address: string | null) => {
    if (!address) return 'Not connected'
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-700 text-neutral-700 dark:text-white rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-600 transition-colors text-sm"
      >
        <span className="truncate max-w-[150px]">{displayWallet(connectedWallet)}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-10">
          {/* Account Wallet */}
          {userWallet && (
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Account Wallet</p>
              <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/30 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-blue-900 dark:text-blue-200 truncate">
                    {displayWallet(userWallet)}
                  </p>
                </div>
                {connectedWallet?.toLowerCase() === userWallet.toLowerCase() && (
                  <FiCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Current Connection */}
          {connectedWallet && (
            <div className="p-3 border-b border-neutral-200 dark:border-neutral-700">
              <p className="text-xs font-medium text-neutral-600 dark:text-neutral-400 mb-2">Connected</p>
              <div className="flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-700 rounded border border-neutral-200 dark:border-neutral-600">
                <div className="flex-1 min-w-0">
                  <p className="font-mono text-xs text-neutral-900 dark:text-white truncate">
                    {displayWallet(connectedWallet)}
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                onWalletManager()
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded transition-colors"
            >
              Manage Wallets
            </button>
            <button
              onClick={() => {
                onAddWallet()
                setIsOpen(false)
              }}
              className="w-full px-3 py-2 text-left text-sm text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors flex items-center gap-2"
            >
              <FiPlus className="w-4 h-4" />
              Add/Connect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
