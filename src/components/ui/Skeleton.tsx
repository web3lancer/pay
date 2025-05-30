'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'chart' | 'transaction'
  width?: number | string
  height?: number | string
  animated?: boolean
}

export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  animated = true
}: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'h-32 w-full rounded-xl',
    chart: 'h-48 w-full rounded-xl',
    transaction: 'h-16 w-full rounded-lg'
  }

  return (
    <div
      style={{
        width: width,
        height: height
      }}
      className={cn(
        'bg-gray-200 relative overflow-hidden',
        animated && 'shimmer',
        variants[variant],
        className
      )}
    >
      {animated && (
        <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
      )}
    </div>
  )
}

// Group of skeleton items
interface SkeletonGroupProps {
  count: number
  gap?: number | string
  className?: string
  children: React.ReactNode
}

export function SkeletonGroup({
  count,
  gap = 4,
  className,
  children
}: SkeletonGroupProps) {
  return (
    <div
      className={cn('flex flex-col', className)}
      style={{ gap: typeof gap === 'number' ? `${gap / 4}rem` : gap }}
    >
      {Array(count)
        .fill(null)
        .map((_, index) => (
          <React.Fragment key={index}>
            {React.isValidElement(children)
              ? React.cloneElement(children)
              : children}
          </React.Fragment>
        ))}
    </div>
  )
}

// Transaction skeleton component
export function TransactionSkeleton() {
  return (
    <div className="flex items-start gap-3 p-3">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" height={12} />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width={60} />
        <Skeleton variant="text" width={40} height={12} />
      </div>
    </div>
  )
}