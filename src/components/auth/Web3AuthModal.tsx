'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { account, functions } from '@/lib/appwrite'
import { FiMail, FiLoader } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface Web3AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'signup'
}

export function Web3AuthModal({ isOpen, onClose, mode }: Web3AuthModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // Check if MetaMask is installed
      if (!window.ethereum) {
        toast.error('MetaMask not installed. Please install MetaMask to continue.')
        window.open('https://metamask.io/download/', '_blank')
        return
      }

      // Connect wallet
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (!accounts || accounts.length === 0) {
        toast.error('No wallet account selected')
        return
      }

      const address = accounts[0]

      // Generate authentication message
      const timestamp = Date.now()
      const message = `auth-${timestamp}`
      const fullMessage = `Sign this message to authenticate: ${message}`

      // Request signature from wallet
      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [fullMessage, address]
      })

      // Check if function ID is configured
      const functionId = process.env.NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID
      if (!functionId) {
        toast.error('Web3 authentication is not configured. Please contact support.')
        console.error('NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID is not set')
        return
      }

      // Call Appwrite Function
      const execution = await functions.createExecution(
        functionId,
        JSON.stringify({ email, address, signature, message }),
        false
      )

      const response = JSON.parse(execution.responseBody)

      if (execution.responseStatusCode !== 200) {
        throw new Error(response.error || 'Authentication failed')
      }

      // Create Appwrite session
      await account.createSession(response.userId, response.secret)

      // Success!
      toast.success(mode === 'login' ? 'Signed in successfully!' : 'Account created successfully!')
      
      // Close modal and refresh
      onClose()
      router.push('/home')
      router.refresh()

    } catch (err: any) {
      console.error('Web3 authentication error:', err)
      
      // Handle specific error cases
      if (err.code === 4001) {
        toast.error('You rejected the signature request')
      } else if (err.message?.includes('MetaMask')) {
        toast.error(err.message)
      } else {
        toast.error(err.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setEmail('')
    setIsSubmitting(false)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'login' ? 'Sign In with Web3' : 'Sign Up with Web3'}
      description="Connect your wallet and verify your email"
      size="md"
      closeOnOutsideClick={!isSubmitting}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            {mode === 'login' 
              ? 'Enter your email and sign with your wallet to authenticate'
              : 'Create your account by entering your email and connecting your wallet'
            }
          </p>
        </div>

        <Input
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          disabled={isSubmitting}
          endIcon={<FiMail className="h-5 w-5 text-neutral-400" />}
        />

        <div className="space-y-3">
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isSubmitting || !email}
            className="w-full"
            icon={isSubmitting ? <FiLoader className="animate-spin h-5 w-5" /> : undefined}
          >
            {isSubmitting ? 'Connecting...' : 'Connect Wallet & Sign'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By continuing, you agree to sign a message with your wallet to verify ownership
          </p>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <p className="text-sm text-gray-600 text-center">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    handleClose()
                    // Parent component will handle switching modes
                  }}
                  className="text-cyan-600 hover:text-cyan-700 font-medium"
                  disabled={isSubmitting}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    handleClose()
                    // Parent component will handle switching modes
                  }}
                  className="text-cyan-600 hover:text-cyan-700 font-medium"
                  disabled={isSubmitting}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </form>
    </Modal>
  )
}
