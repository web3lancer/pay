'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FiSend, FiDownload, FiRepeat, FiMoreHorizontal } from 'react-icons/fi'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

interface WalletCardProps {
  name: string
  address: string
  balance: {
    fiat: number
    crypto: number
    symbol: string
  }
  onSend?: () => void
  onReceive?: () => void
  onSwap?: () => void
  onDetails?: () => void
  className?: string
}

export function WalletCard({
  name,
  address,
  balance,
  onSend,
  onReceive,
  onSwap,
  onDetails,
  className
}: WalletCardProps) {
  // Format address for display (truncate)
  const displayAddress = `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`
  
  // Format balance with proper separators
  const formattedFiat = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(balance.fiat)
  
  return (
    <motion.div 
      className={cn(
        'relative overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm transition-all duration-300',
        'hover:shadow-lg hover:translate-y-[-2px]',
        className
      )}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1] // ease-out-expo
      }}
    >
      {/* Wallet Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-indigo-600 font-bold">{balance.symbol[0]}</span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{name}</h3>
            <p className="text-xs text-gray-500 font-mono">{displayAddress}</p>
          </div>
        </div>
        <button 
          onClick={onDetails}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
        >
          <FiMoreHorizontal className="h-4 w-4" />
        </button>
      </div>
      
      {/* Balance */}
      <div className="px-4 pt-4 pb-2">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          {formattedFiat}
        </h2>
        <p className="text-sm text-gray-600 font-mono">
          {balance.crypto} {balance.symbol}
        </p>
      </div>
      
      {/* Actions */}
      <div className="p-4 flex items-center gap-2">
        <Button 
          size="sm" 
          variant="primary" 
          leftIcon={<FiSend className="h-3.5 w-3.5" />}
          onClick={onSend}
          className="flex-1"
        >
          Send
        </Button>
        <Button 
          size="sm" 
          variant="secondary"
          leftIcon={<FiDownload className="h-3.5 w-3.5" />}
          onClick={onReceive}
          className="flex-1"
        >
          Receive
        </Button>
        <Button
          size="sm"
          variant="ghost"
          leftIcon={<FiRepeat className="h-3.5 w-3.5" />}
          onClick={onSwap}
        >
          Swap
        </Button>
      </div>
    </motion.div>
  )
}