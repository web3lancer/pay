'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

type InputVariant = 'default' | 'crypto' | 'address' | 'search' | 'otp'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant
  label?: string
  error?: string
  success?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  suffix?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant = 'default',
    label,
    error,
    success,
    leftIcon,
    rightIcon,
    suffix,
    type = 'text',
    ...props 
  }, ref) => {
    const [focused, setFocused] = useState(false)
    const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue)
    
    const baseClasses = 'w-full px-3 py-2 text-sm border rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const variantClasses = {
      default: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20',
      crypto: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 font-mono',
      address: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 font-mono text-xs',
      search: 'border-gray-300 focus:border-gray-400 focus:ring-gray-400/20 pl-10',
      otp: 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/20 text-center font-mono text-lg'
    }
    
    const errorClasses = error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''
    const successClasses = success ? 'border-green-500 focus:border-green-500 focus:ring-green-500/20' : ''
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(!!e.target.value)
      props.onChange?.(e)
    }
    
    return (
      <div className="relative">
        {label && (
          <label 
            className={cn(
              'absolute left-3 transition-all duration-150 pointer-events-none text-gray-500',
              focused || hasValue 
                ? 'top-0 -translate-y-1/2 text-xs bg-white px-1 text-indigo-600' 
                : 'top-1/2 -translate-y-1/2 text-sm'
            )}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            type={type}
            className={cn(
              baseClasses,
              variantClasses[variant],
              errorClasses,
              successClasses,
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              suffix && 'pr-16',
              label && 'pt-6 pb-2',
              className
            )}
            onFocus={(e) => {
              setFocused(true)
              props.onFocus?.(e)
            }}
            onBlur={(e) => {
              setFocused(false)
              props.onBlur?.(e)
            }}
            onChange={handleChange}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
          
          {suffix && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium">
              {suffix}
            </div>
          )}
        </div>
        
        {error && (
          <p className="mt-1 text-xs text-red-600 animate-slideUp">
            {error}
          </p>
        )}
        
        {success && !error && (
          <p className="mt-1 text-xs text-green-600 animate-slideUp">
            {success}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }