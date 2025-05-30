'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function Tabs({ value, onValueChange, children, className }: TabsProps) {
  // Create a context to share the active tab value
  const TabContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
  }>({
    value,
    onValueChange
  })

  return (
    <TabContext.Provider value={{ value, onValueChange }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabContext.Provider>
  )
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

export function TabsList({ children, className }: TabsListProps) {
  return (
    <div 
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1',
        className
      )}
    >
      {children}
    </div>
  )
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  // Get the active tab value from context
  const TabContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
  }>({
    value: '',
    onValueChange: () => {}
  })

  const { value: activeValue, onValueChange } = React.useContext(TabContext)
  const isActive = activeValue === value

  return (
    <button
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all',
        isActive
          ? 'text-gray-900'
          : 'text-gray-500 hover:text-gray-900',
        className
      )}
      onClick={() => onValueChange(value)}
    >
      {isActive && (
        <motion.span
          layoutId="activeTab"
          className="absolute inset-0 z-10 bg-white rounded-md shadow-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30
          }}
        />
      )}
      <span className="relative z-20">{children}</span>
    </button>
  )
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function TabsContent({ value, children, className }: TabsContentProps) {
  // Get the active tab value from context
  const TabContext = React.createContext<{
    value: string
    onValueChange: (value: string) => void
  }>({
    value: '',
    onValueChange: () => {}
  })

  const { value: activeValue } = React.useContext(TabContext)
  const isActive = activeValue === value

  // Define animation variants for entering and exiting
  const variants = {
    enter: {
      opacity: 1,
      y: 0,
      display: 'block',
      transition: {
        duration: 0.3,
        ease: [0.25, 1, 0.5, 1] // ease-out-quart
      }
    },
    exit: {
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.2
      },
      transitionEnd: {
        display: 'none'
      }
    }
  }

  // Fix context issues in this example by manually checking if active
  return (
    <motion.div
      className={cn('mt-2', className)}
      variants={variants}
      animate={isActive ? 'enter' : 'exit'}
      initial="exit"
    >
      {children}
    </motion.div>
  )
}