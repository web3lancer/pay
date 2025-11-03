'use client'

import React, { useState } from 'react'
import { cn } from '@/lib/utils'

export interface TabsProps {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
  ...props
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue)
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue
  
  const handleValueChange = (newValue: string) => {
    setUncontrolledValue(newValue)
    onValueChange?.(newValue)
  }

  return (
    <div
      className={cn('flex flex-col gap-2', className)}
      {...props}
      data-value={value}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            value,
            onValueChange: handleValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string
  onValueChange?: (value: string) => void
}

export function TabsList({
  value,
  onValueChange,
  children,
  className,
  ...props
}: TabsListProps) {
  return (
    <div 
      role="tablist" 
      className={cn(
        'flex items-center w-max p-1 bg-neutral-100 rounded-lg shadow-sm shadow-neutral-200/40',
        className
      )}
      {...props}
    >
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement, {
            value,
            onValueChange,
          })
        }
        return child
      })}
    </div>
  )
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
  parentValue?: string
  onValueChange?: (value: string) => void
}

export function TabsTrigger({
  value,
  parentValue,
  onValueChange,
  children,
  className,
  ...props
}: TabsTriggerProps) {
  const isActive = parentValue === value
  
  const handleClick = () => {
    onValueChange?.(value)
  }

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(
        'inline-flex items-center justify-center px-3.5 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-all',
        isActive
          ? 'bg-white text-neutral-900 shadow-sm shadow-neutral-200/50'
          : 'text-neutral-600 hover:text-neutral-900',
        className
      )}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  )
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  parentValue?: string
}

export function TabsContent({
  value,
  parentValue,
  children,
  className,
  ...props
}: TabsContentProps) {
  const isActive = parentValue === value

  if (!isActive) return null

  return (
    <div
      role="tabpanel"
      data-state={isActive ? 'active' : 'inactive'}
      className={cn(className)}
      {...props}
    >
      {children}
    </div>
  )
}