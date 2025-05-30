'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { 
  FiArrowUpRight, 
  FiArrowDownLeft, 
  FiClock, 
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi'
import { cn } from '@/lib/utils'

type TransactionStatus = 'pending' | 'confirmed' | 'failed'
type TransactionType = 'sent' | 'received' | 'swapped'

interface TransactionItemProps {
  type: TransactionType
  status: TransactionStatus
  amount: {
    value: number
    currency: string
  }
  fiatValue: number
  recipient: {
    name?: string
    address: string
  }
  timestamp: Date
  confirmations?: number
  onClick?: () => void
  className?: string
}

export function TransactionItem({
  type,
  status,
  amount,
  fiatValue,
  recipient,
  timestamp,
  confirmations = 0,
  onClick,
  className
}: TransactionItemProps) {
  // Determine the time display (either relative or exact)
  const timeDisplay = getTimeDisplay(timestamp)
  
  // Format the address for display
  const displayAddress = `${recipient.address.substring(0, 6)}...${recipient.address.substring(
    recipient.address.length - 4
  )}`
  
  // Format the amount with proper sign
  const amountPrefix = type === 'received' ? '+' : type === 'sent' ? '-' : ''
  
  return (
    <motion.div 
      className={cn(
        'rounded-lg p-3 cursor-pointer transition-colors',
        'hover:bg-gray-50',
        className
      )}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1] // ease-out-quart
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            'h-8 w-8 rounded-full flex items-center justify-center',
            type === 'sent' ? 'bg-red-100 text-red-600' : 
            type === 'received' ? 'bg-green-100 text-green-600' : 
            'bg-blue-100 text-blue-600'
          )}>
            {type === 'sent' ? (
              <FiArrowUpRight className="h-4 w-4" />
            ) : type === 'received' ? (
              <FiArrowDownLeft className="h-4 w-4" />
            ) : (
              <FiClock className="h-4 w-4" />
            )}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {type === 'sent' ? 'Sent to ' : type === 'received' ? 'Received from ' : 'Swapped '}
              {recipient.name || displayAddress}
            </p>
            <p className="text-xs text-gray-500 font-mono">{displayAddress}</p>
          </div>
        </div>
        <div className="text-right">
          <p className={cn(
            'font-semibold',
            type === 'sent' ? 'text-red-600' : 
            type === 'received' ? 'text-green-600' : 
            'text-blue-600'
          )}>
            {amountPrefix}{amount.value} {amount.currency}
          </p>
          <p className="text-xs text-gray-500">
            ${Math.abs(fiatValue).toFixed(2)} USD
          </p>
        </div>
      </div>
      
      {/* Status Line */}
      <div className="flex items-center gap-1 mt-2">
        {status === 'pending' ? (
          <>
            <FiClock className="h-3 w-3 text-amber-500" />
            <span className="text-xs text-amber-500">Pending</span>
          </>
        ) : status === 'confirmed' ? (
          <>
            <FiCheckCircle className="h-3 w-3 text-green-500" />
            <span className="text-xs text-green-500">
              Confirmed {confirmations > 0 && `• ${confirmations} confirmation${confirmations !== 1 ? 's' : ''}`}
            </span>
          </>
        ) : (
          <>
            <FiXCircle className="h-3 w-3 text-red-500" />
            <span className="text-xs text-red-500">Failed</span>
          </>
        )}
        <span className="text-xs text-gray-400 ml-auto">{timeDisplay}</span>
      </div>
    </motion.div>
  )
}

// Helper function to display relative time
function getTimeDisplay(timestamp: Date): string {
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `${diffInHours}h ago`
  
  if (diffInHours < 48) return 'Yesterday'
  
  return format(timestamp, 'MMM d, yyyy')
}