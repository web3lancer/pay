'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheck, FiX, FiCamera, FiAlertCircle, FiClipboard } from 'react-icons/fi'
import { cn } from '@/lib/utils'

// Types of validation states
type ValidationStatus = 'valid' | 'invalid' | 'validating' | 'none'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  onQrScan?: () => void
  onPaste?: () => void
  label?: string
  placeholder?: string
  networkName?: string
  validationStatus?: ValidationStatus
  validationMessage?: string
  className?: string
  disabled?: boolean
}

export function AddressInput({
  value,
  onChange,
  onQrScan,
  onPaste,
  label = 'Recipient Address',
  placeholder = 'Enter wallet address or ENS name',
  networkName = 'address',
  validationStatus = 'none',
  validationMessage,
  className,
  disabled = false
}: AddressInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  // Handle clipboard paste
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
      if (onPaste) onPaste()
    } catch (error) {
      console.error('Failed to read clipboard contents: ', error)
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div 
        className={cn(
          'relative flex overflow-hidden rounded-lg border bg-white transition-all duration-150',
          isFocused ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-gray-300',
          validationStatus === 'valid' ? 'border-green-500 ring-2 ring-green-500/20' : '',
          validationStatus === 'invalid' ? 'border-red-500 ring-2 ring-red-500/20' : '',
          disabled ? 'opacity-60 bg-gray-50' : ''
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className="flex-1 border-none bg-transparent py-2 px-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 font-mono"
        />

        {/* Action buttons */}
        <div className="flex items-center">
          {value && (
            <motion.button
              type="button"
              onClick={() => onChange('')}
              className="p-1 text-gray-400 hover:text-gray-600"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiX className="h-4 w-4" />
            </motion.button>
          )}

          {onPaste && (
            <motion.button
              type="button"
              onClick={handlePaste}
              className="p-2 text-gray-400 hover:text-gray-600"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <FiClipboard className="h-4 w-4" />
            </motion.button>
          )}

          {onQrScan && (
            <motion.button
              type="button"
              onClick={onQrScan}
              className="p-2 mr-1 text-gray-400 hover:text-gray-600"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
            >
              <FiCamera className="h-4 w-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Validation message */}
      <AnimatePresence>
        {validationMessage && (
          <motion.div
            className={cn(
              'flex items-center gap-1.5 mt-1',
              validationStatus === 'valid' ? 'text-green-600' : 
              validationStatus === 'invalid' ? 'text-red-600' : 
              validationStatus === 'validating' ? 'text-amber-600' : 'text-gray-500'
            )}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {validationStatus === 'valid' && <FiCheck className="h-3.5 w-3.5" />}
            {validationStatus === 'invalid' && <FiAlertCircle className="h-3.5 w-3.5" />}
            <span className="text-xs">
              {validationMessage || `Enter a valid ${networkName} address`}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}