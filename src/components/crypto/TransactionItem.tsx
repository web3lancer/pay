'use client'

import React from 'react'
import { cn, formatCurrency, truncateAddress, formatTimeAgo } from '@/lib/utils'
import { 
  FaArrowUp, 
  FaArrowDown, 
  FaCheck, 
  FaClock, 
  FaTimes,
  FaExchangeAlt
} from 'react-icons/fa'

export type TransactionType = 'send' | 'receive' | 'swap' | 'stake'
export type TransactionStatus = 'pending' | 'confirmed' | 'failed'

interface Transaction {
  id: string
  type: TransactionType
  amount: number
  currency: string
  usdValue: number
  to?: string
  from?: string
  status: TransactionStatus
  timestamp: Date
  confirmations?: number
  hash: string
  recipient?: {
    name?: string
    address: string
  }
  sender?: {
    name?: string
    address: string
  }
}

interface TransactionItemProps {
  transaction: Transaction
  className?: string
  onClick?: () => void
}

const getTransactionIcon = (type: TransactionType, status: TransactionStatus) => {
  if (status === 'pending') {
    return <FaClock className="text-yellow-500" />
  }
  
  if (status === 'failed') {
    return <FaTimes className="text-red-500" />
  }
  
  const iconMap = {
    send: <FaArrowUp className="text-red-500" />,
    receive: <FaArrowDown className="text-green-500" />,
    swap: <FaExchangeAlt className="text-blue-500" />,
    stake: <FaCheck className="text-purple-500" />,
  }
  
  return iconMap[type]
}

const getTransactionTitle = (transaction: Transaction) => {
  const { type, recipient, sender } = transaction
  
  switch (type) {
    case 'send':
      return recipient?.name ? `Sent to ${recipient.name}` : 'Sent'
    case 'receive':
      return sender?.name ? `Received from ${sender.name}` : 'Received'
    case 'swap':
      return 'Swapped'
    case 'stake':
      return 'Staked'
    default:
      return 'Transaction'
  }
}

const getStatusBadge = (status: TransactionStatus, confirmations?: number) => {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <div className="w-2 h-2 bg-yellow-400 rounded-full mr-1 animate-pulse"></div>
          Pending
        </span>
      )
    case 'confirmed':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <FaCheck className="w-2 h-2 mr-1" />
          Confirmed {confirmations && `• ${confirmations} confirmations`}
        </span>
      )
    case 'failed':
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <FaTimes className="w-2 h-2 mr-1" />
          Failed
        </span>
      )
  }
}

export const TransactionItem: React.FC<TransactionItemProps> = ({
  transaction,
  className,
  onClick,
}) => {
  const { type, amount, currency, usdValue, status, timestamp, hash, recipient, sender } = transaction
  
  const isNegative = type === 'send'
  const displayAddress = type === 'send' ? recipient?.address : sender?.address
  
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer border-b border-gray-100 last:border-b-0',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getTransactionIcon(type, status)}
        </div>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getTransactionTitle(transaction)}
            </p>
            {getStatusBadge(status, transaction.confirmations)}
          </div>
          
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            {displayAddress && (
              <span className="font-mono">
                {truncateAddress(displayAddress)}
              </span>
            )}
            <span>•</span>
            <span>{formatTimeAgo(timestamp)}</span>
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className={cn(
          'text-sm font-medium',
          isNegative ? 'text-red-600' : 'text-green-600'
        )}>
          {isNegative ? '-' : '+'}{amount} {currency}
        </div>
        <div className="text-xs text-gray-500">
          {formatCurrency(usdValue)}
        </div>
      </div>
    </div>
  )
}