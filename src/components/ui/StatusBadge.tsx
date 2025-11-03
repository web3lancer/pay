import React from 'react'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'overdue'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({ status, size = 'md', className }: StatusBadgeProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5'
  }

  const statusClasses = {
    pending: 'bg-yellow-100/80 text-yellow-800 shadow-sm shadow-yellow-200/40 border border-yellow-200/50',
    completed: 'bg-green-100/80 text-green-800 shadow-sm shadow-green-200/40 border border-green-200/50',
    failed: 'bg-red-100/80 text-red-800 shadow-sm shadow-red-200/40 border border-red-200/50',
    cancelled: 'bg-gray-100/80 text-gray-800 shadow-sm shadow-gray-200/40 border border-gray-200/50',
    overdue: 'bg-red-100/80 text-red-800 shadow-sm shadow-red-200/40 border border-red-200/50'
  }

  const statusLabels = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
    overdue: 'Overdue'
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        statusClasses[status],
        className
      )}
    >
      {statusLabels[status]}
    </span>
  )
}

export default StatusBadge