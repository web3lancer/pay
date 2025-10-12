'use client'

import React, { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FiMail, FiLoader } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  authenticateWithWallet, 
  isMetaMaskInstalled, 
  getMetaMaskDownloadLink 
} from '@/lib/auth/helpers'

interface Web3AuthModalProps {
  isOpen: boolean
  onClose: () => void
  mode: 'login' | 'signup'
  onSwitchMode?: (mode: 'login' | 'signup') => void
}

export function Web3AuthModal({ isOpen, onClose, mode, onSwitchMode }: Web3AuthModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    // Check if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      toast.error('MetaMask not installed. Please install MetaMask to continue.')
      window.open(getMetaMaskDownloadLink(), '_blank')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await authenticateWithWallet({ email })

      if (!result.success) {
        // Provide detailed, user-friendly error messages based on error codes
        switch (result.code) {
          case 'metamask_not_installed':
            toast.error('MetaMask not installed. Opening download page...', { duration: 4000 })
            break
          case 'no_account':
            toast.error('No wallet account selected. Please select an account in MetaMask.')
            break
          case 'signature_rejected':
            toast.error('Signature rejected. You must sign the message to authenticate.')
            break
          case 'passkey_conflict':
            toast.error('⚠️ This email is linked to a passkey account. Please sign in with your passkey first, then link your wallet from settings.', { duration: 6000 })
            break
          case 'wallet_mismatch':
            toast.error('⚠️ This email is already linked to a different wallet address. Please use the original wallet or a different email.', { duration: 6000 })
            break
          case 'account_exists':
            toast.error('⚠️ This email already has an account. Please sign in with Email OTP or Passkey first.', { duration: 6000 })
            break
          case 'invalid_signature':
            toast.error('Invalid signature. Please try again.')
            break
          default:
            toast.error(result.error || 'Authentication failed')
        }
        return
      }

      // Success!
      toast.success(
        mode === 'login' ? '✅ Signed in successfully!' : '✅ Account created successfully!',
        { icon: '🦊', duration: 4000 }
      )
      
      // Close modal and refresh
      onClose()
      router.push('/home')
      router.refresh()

    } catch (err: any) {
      console.error('Web3 authentication error:', err)
      toast.error(err.message || 'Authentication failed. Please try again.')
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
                    if (onSwitchMode) {
                      onSwitchMode('signup')
                    }
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
                    if (onSwitchMode) {
                      onSwitchMode('login')
                    }
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
