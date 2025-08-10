import React from 'react'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { FiPlus } from 'react-icons/fi'

interface EmptyStateProps {
  icon?: React.ReactNode | string
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="text-neutral-400 mb-4">
        {typeof icon === 'string' ? (
          <span className="text-4xl">{icon}</span>
        ) : (
          icon || <span className="text-4xl">📝</span>
        )}
      </div>
      <h3 className="text-lg font-medium text-neutral-700 mb-2">{title}</h3>
      <p className="text-neutral-500 mb-4 max-w-sm mx-auto">
        {description}
      </p>
      {action && (
        <>
          {action.href ? (
            <Link
              href={action.href}
              className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="inline-flex items-center px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors"
            >
              <FiPlus className="h-4 w-4 mr-2" />
              {action.label}
            </button>
          )}
        </>
      )}
    </div>
  )
}

export default EmptyState