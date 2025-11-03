'use client'

import React from 'react'
import { Input } from '@/components/ui/Input'
import { FiCamera, FiClipboard, FiCheck, FiLoader, FiX } from 'react-icons/fi'

interface AddressInputProps {
  value: string
  onChange: (value: string) => void
  onQrScan?: () => void
  onPaste?: () => void
  networkName?: string
  validationStatus?: 'none' | 'validating' | 'valid' | 'invalid'
  validationMessage?: string
}

export function AddressInput({
  value,
  onChange,
  onQrScan,
  onPaste,
  networkName = 'cryptocurrency',
  validationStatus = 'none',
  validationMessage
}: AddressInputProps) {
  // Handle paste from clipboard
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText()
      onChange(text)
      onPaste?.()
    } catch (error) {
      console.error('Failed to read clipboard', error)
    }
  }

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        Recipient Address
      </label>
      <div className="relative">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter ${networkName} address`}
          className="pr-20"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-2">
          {onQrScan && (
            <button 
              type="button"
              onClick={onQrScan}
              className="p-1.5 rounded-full hover:bg-gray-100/80 text-gray-500 transition-colors shadow-sm hover:shadow-sm hover:shadow-gray-200/30"
            >
              <FiCamera className="h-4 w-4" />
            </button>
          )}
          
          <button 
            type="button"
            onClick={handlePaste}
            className="p-1.5 rounded-full hover:bg-gray-100/80 text-gray-500 transition-colors shadow-sm hover:shadow-sm hover:shadow-gray-200/30"
          >
            <FiClipboard className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      {/* Validation message */}
      {validationStatus !== 'none' && (
        <div className="flex items-center mt-1.5">
          {validationStatus === 'validating' && (
            <>
              <FiLoader className="animate-spin h-4 w-4 mr-1.5 text-amber-500" />
              <span className="text-xs text-amber-600">{validationMessage || 'Validating address...'}</span>
            </>
          )}
          
          {validationStatus === 'valid' && (
            <>
              <FiCheck className="h-4 w-4 mr-1.5 text-green-500" />
              <span className="text-xs text-green-600">{validationMessage || 'Valid address'}</span>
            </>
          )}
          
          {validationStatus === 'invalid' && (
            <>
              <FiX className="h-4 w-4 mr-1.5 text-red-500" />
              <span className="text-xs text-red-600">{validationMessage || 'Invalid address'}</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}