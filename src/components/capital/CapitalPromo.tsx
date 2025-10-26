'use client'

import React, { useState, useEffect } from 'react'
import { FiX, FiZap } from 'react-icons/fi'
import Link from 'next/link'

interface CapitalPromoProps {
  btcBalance: number
  onDismiss?: () => void
}

export function CapitalPromo({ btcBalance, onDismiss }: CapitalPromoProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [hasShown, setHasShown] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem('capital_promo_dismissed')
    if (dismissed) {
      setIsDismissed(true)
    } else {
      setHasShown(true)
    }
  }, [])

  const handleDismiss = () => {
    localStorage.setItem('capital_promo_dismissed', 'true')
    setIsDismissed(true)
    onDismiss?.()
  }

  // Only show if BTC balance is significant and not dismissed
  if (isDismissed || !hasShown || btcBalance < 0.05) {
    return null
  }

  const estimatedCredit = Math.floor((btcBalance * 50000) * 0.5)

  return (
    <div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative overflow-hidden bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-xl p-4 mb-6 shadow-lg"
    >
      {/* Animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full -translate-y-20 translate-x-20 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <div className="flex-shrink-0 mt-0.5">
            <FiZap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-1">Your Bitcoin is Working!</h3>
            <p className="text-sm text-white/90">
              Did you know your {btcBalance.toFixed(3)} BTC could unlock a credit line of up to{' '}
              <strong>${estimatedCredit.toLocaleString()}</strong> MUSD without selling? Get instant access to
              your funds today.
            </p>
            <Link
              href="/capital"
              className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-white text-orange-600 font-semibold rounded-lg hover:bg-orange-50 transition-all"
            >
              <span>Unlock Now</span>
              <FiZap className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors text-white"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
