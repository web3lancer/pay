import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  success?: boolean
  icon?: React.ReactNode
  endIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, success, icon, endIcon, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false)
    const [hasValue, setHasValue] = React.useState(false)

    const handleFocus = () => setFocused(true)
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      setHasValue(e.target.value !== '')
      props.onBlur?.(e)
    }

    const inputClasses = cn(
      'flex h-12 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)]',
      'file:border-0 file:bg-transparent file:text-sm file:font-medium',
      'placeholder:text-neutral-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
      {
        'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/10 focus:scale-[1.01]': !error && !success,
        'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/10': error,
        'border-green-500 focus:border-green-500 focus:ring-2 focus:ring-green-500/10': success,
        'pl-10': icon,
        'pr-10': endIcon,
      },
      className
    )

    const labelClasses = cn(
      'absolute left-3 transition-all duration-[150ms] ease-[cubic-bezier(0.4,0,0.2,1)] pointer-events-none',
      {
        'top-3 text-sm text-neutral-400': !focused && !hasValue,
        'top-1 text-xs text-primary-500 font-medium': focused || hasValue,
      }
    )

    return (
      <div className="relative">
        {label && (
          <label className={labelClasses}>
            {label}
          </label>
        )}
        {icon && (
          <div className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={inputClasses}
          ref={ref}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        {endIcon && (
          <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400">
            {endIcon}
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-500 animate-in slide-in-from-top-1 duration-200">
            {error}
          </p>
        )}
        {success && (
          <div className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }