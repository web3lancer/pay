'use client'

import React from 'react'
import { cn, formatCurrency, truncateAddress, getRelativeTime } from '@/lib/utils'
import {
  FiArrowUpRight,
  FiArrowDownLeft,
  FiClock,
  FiCheck,
  FiX
} from 'react-icons/fi'

type TransactionType = 'sent' | 'received' | 'pending' | 'failed'
type TransactionStatus = 'pending' | 'confirmed' | 'failed'

interface TransactionItemProps {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number
  currency: string
  to?: string
  from?: string
  timestamp: Date
  confirmations?: number
  className?: string
}

const statusConfig = {
  pending: {
    icon: FiClock,
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    text: 'Pending'
  },
  confirmed: {
    icon: FiCheck,
    color: 'text-green-600',
    bg: 'bg-green-100',
    text: 'Confirmed'
  },
  failed: {
    icon: FiX,
    color: 'text-red-600',
    bg: 'bg-red-100',
    text: 'Failed'
  }
}

const typeConfig = {
  sent: {
    icon: FiArrowUpRight,
    color: 'text-red-600',
    prefix: '-',
    label: 'Sent to'
  },
  received: {
    icon: FiArrowDownLeft,
    color: 'text-green-600',
    prefix: '+',
    label: 'Received from'
  },
  pending: {
    icon: FiClock,
    color: 'text-orange-600',
    prefix: '',
    label: 'Pending'
  },
  failed: {
    icon: FiX,
    color: 'text-red-600',
    prefix: '',
    label: 'Failed'
  }
}

export function TransactionItem({
  id,
  type,
  status,
  amount,
  currency,
  to,
  from,
  timestamp,
  confirmations = 0,
  className
}: TransactionItemProps) {
  const typeInfo = typeConfig[type]
  const statusInfo = statusConfig[status]
  const TypeIcon = typeInfo.icon
  const StatusIcon = statusInfo.icon
  const address = type === 'sent' ? to : from

  return (
    <div className={cn(
      'flex items-center gap-4 p-4 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 transition-all duration-200',
      className
    )}>
      {/* Transaction Type Icon */}
      <div className={cn('h-10 w-10 rounded-full flex items-center justify-center', {
        'bg-red-100': type === 'sent' || type === 'failed',
        'bg-green-100': type === 'received',
        'bg-orange-100': type === 'pending',
      })}>
        <TypeIcon className={cn('h-5 w-5', typeInfo.color)} />
      </div>

      {/* Transaction Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-neutral-900 truncate">
              {typeInfo.label} {address && truncateAddress(address)}
            </p>
            <p className="text-xs text-neutral-500 font-mono truncate">
              {id}
            </p>
          </div>
          
          <div className="text-right ml-4">
            <p className={cn('text-sm font-semibold', {
              'text-red-600': type === 'sent',
              'text-green-600': type === 'received',
              'text-neutral-900': type === 'pending' || type === 'failed',
            })}>
              {typeInfo.prefix}{formatCurrency(amount, currency)}
            </p>
            <p className="text-xs text-neutral-500">
              {getRelativeTime(timestamp)}
            </p>
          </div>
        </div>

        {/* Status and Confirmations */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <div className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', statusInfo.bg, statusInfo.color)}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.text}
            </div>
            
            {status === 'confirmed' && confirmations > 0 && (
              <span className="text-xs text-neutral-500">
                {confirmations} confirmations
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}