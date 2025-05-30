'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { truncateString } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FiSend, FiDownload, FiRefreshCw, FiMoreVertical } from 'react-icons/fi'
import { formatCurrency } from '@/lib/utils'

interface WalletCardProps {
  name: string
  address: string
  balance: {
    fiat: number
    crypto: number
    symbol: string
  }
  onSend: () => void
  onReceive: () => void
  onSwap?: () => void
  onDetails?: () => void
}

export function WalletCard({
  name,
  address,
  balance,
  onSend,
  onReceive,
  onSwap,
  onDetails
}: WalletCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="font-medium text-gray-900">{name}</h3>
            <button
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-gray-100"
              onClick={onDetails}
            >
              <FiMoreVertical className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Address */}
          <div className="px-4 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-500 font-mono">
                {truncateString(address, 10, 6)}
              </span>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                <svg className="h-3.5 w-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Balance */}
          <div className="p-4">
            <div className="mb-3">
              <h4 className="text-2xl font-bold">
                {formatCurrency(balance.fiat, 'USD')}
              </h4>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <span>{balance.crypto} {balance.symbol}</span>
                <button className="p-1 rounded-full hover:bg-gray-100">
                  <FiRefreshCw className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiSend />}
                onClick={onSend}
                className="flex-1"
              >
                Send
              </Button>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<FiDownload />}
                onClick={onReceive}
                className="flex-1"
              >
                Receive
              </Button>
              {onSwap && (
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<FiRefreshCw />}
                  onClick={onSwap}
                  className="flex-1"
                >
                  Swap
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}