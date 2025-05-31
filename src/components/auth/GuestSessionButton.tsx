'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useState } from 'react'

interface GuestSessionButtonProps {
  className?: string
  onSuccess?: () => void
  children?: React.ReactNode
}

export function GuestSessionButton({ 
  className = '', 
  onSuccess,
  children = 'Continue as Guest'
}: GuestSessionButtonProps) {
  const { createGuestSession, isLoading: authLoading } = useAuth()
  const [isCreating, setIsCreating] = useState(false)

  const handleCreateGuestSession = async () => {
    setIsCreating(true)
    try {
      await createGuestSession()
      onSuccess?.()
    } catch (error) {
      console.error('Failed to create guest session:', error)
      alert('Failed to create guest session. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const isDisabled = isCreating || authLoading

  return (
    <button
      onClick={handleCreateGuestSession}
      disabled={isDisabled}
      className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isCreating ? 'Creating Session...' : children}
    </button>
  )
}