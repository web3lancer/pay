/**
 * Unified Authentication Modal
 * 
 * Supports Passkey, Web3 Wallet, and OTP authentication
 * All methods are available without checking user existence
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FiMail, FiLoader, FiKey, FiCreditCard, FiLock } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  authenticateWithPasskey, 
  authenticateWithWallet,
  sendEmailOTP,
  verifyEmailOTP,
  supportsWebAuthn,
  isMetaMaskInstalled,
  getMetaMaskDownloadLink
} from '@/lib/auth/helpers'

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMethod = 'passkey' | 'wallet' | 'otp'

export function UnifiedAuthModal({ isOpen, onClose }: UnifiedAuthModalProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpUserId, setOtpUserId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  // Show auth methods when valid email is entered
  const showMethodSelection = email.includes('@') && !selectedMethod

  // Reset selected method when email changes
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setSelectedMethod(null)
      setOtpSent(false)
    }
  }, [email])

  const handleOTPAuth = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      if (!otpSent) {
        // Send OTP
        const result = await sendEmailOTP({ email })
        
        if (!result.success) {
          toast.error(result.error || 'Failed to send OTP')
          return
        }

        setOtpUserId(result.userId!)
        setOtpSent(true)
        toast.success('OTP sent to your email! Check your inbox.')
      } else {
        // Verify OTP
        if (!otp || otp.length < 6) {
          toast.error('Please enter the 6-digit code from your email')
          setIsSubmitting(false)
          return
        }

        const result = await verifyEmailOTP({ userId: otpUserId, otp })
        
        if (!result.success) {
          if (result.error?.includes('expired')) {
            setOtpSent(false)
            setOtp('')
          }
          toast.error(result.error || 'Verification failed')
          return
        }
        
        // Success!
        toast.success('Verified! Welcome to LancerPay!')
        
        // Force refresh auth context to update immediately
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Close modal
        onClose()
        
        // Force a hard reload to ensure all components get the new session
        window.location.href = '/home'
      }

    } catch (err: any) {
      console.error('OTP authentication error:', err)
      toast.error(err.message || 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePasskeyAuth = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    // Check if WebAuthn is supported
    if (!supportsWebAuthn()) {
      toast.error('Passkeys are not supported on this device/browser')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await authenticateWithPasskey({ email })

      if (!result.success) {
        // Provide detailed, user-friendly error messages based on error codes
        switch (result.code) {
          case 'no_passkey':
            toast.error('No passkey found. Creating a new one...', { duration: 3000 })
            break
          case 'cancelled':
            toast.error('Passkey authentication cancelled')
            break
          case 'not_supported':
            toast.error('Your browser doesn\'t support passkeys. Please try Email OTP or Wallet authentication.')
            break
          case 'verification_failed':
            toast.error('Passkey verification failed. Please try again.')
            break
          case 'wallet_conflict':
            toast.error('🔒 ' + result.error, { duration: 6000 })
            break
          default:
            toast.error(result.error || 'Authentication failed')
        }
        return
      }

      // Success! Show appropriate message
      toast.success('✅ Signed in with passkey!', { 
        icon: '🔐',
        duration: 4000 
      })
      
      // Force refresh auth context to update immediately
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Close modal
      onClose()
      
      // Force a hard reload to ensure all components get the new session
      window.location.href = '/home'

    } catch (err: any) {
      console.error('Passkey authentication error:', err)
      toast.error(err.message || 'Passkey authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWalletAuth = async () => {
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
      toast.success('✅ Signed in successfully!', { 
        icon: '🦊',
        duration: 4000 
      })
      
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
    setOtp('')
    setOtpUserId('')
    setIsSubmitting(false)
    setSelectedMethod(null)
    setOtpSent(false)
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
      title="Connect to LancerPay"
      description="Choose your preferred authentication method"
      size="md"
      closeOnOutsideClick={!isSubmitting}
    >
      <div className="space-y-6">
        {/* Email Input */}
        <div>
          <Input
            id="email"
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            disabled={isSubmitting || otpSent}
            endIcon={<FiMail className="h-5 w-5 text-neutral-400" />}
          />
          {!showMethodSelection && !otpSent && (
            <p className="text-xs text-gray-500 mt-2">
              Enter your email to continue
            </p>
          )}
        </div>

        {/* OTP Input (shown after OTP is sent) */}
        {otpSent && selectedMethod === 'otp' && (
          <div>
            <Input
              id="otp"
              label="Verification Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              required
              disabled={isSubmitting}
              maxLength={6}
              endIcon={<FiLock className="h-5 w-5 text-neutral-400" />}
            />
            <p className="text-xs text-gray-500 mt-2">
              Check your email for the verification code
            </p>
          </div>
        )}

        {/* Authentication Method Selection */}
        {showMethodSelection && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Choose your authentication method:
            </p>
            
            {/* Passkey - Always Recommended */}
            <div className="relative">
              <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                Recommended
              </div>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={handlePasskeyAuth}
                disabled={isSubmitting || !email}
                className="w-full justify-start"
                icon={<FiKey className="h-5 w-5" />}
              >
                <span className="flex-1 text-left">Passkey</span>
                <span className="text-xs text-gray-500">Secure & Passwordless</span>
              </Button>
            </div>

            {/* Wallet */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleWalletAuth}
              disabled={isSubmitting || !email}
              className="w-full justify-start"
              icon={<FiCreditCard className="h-5 w-5" />}
            >
              <span className="flex-1 text-left">Crypto Wallet</span>
              <span className="text-xs text-gray-500">MetaMask & Web3</span>
            </Button>

            {/* OTP */}
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => {
                setSelectedMethod('otp')
                handleOTPAuth()
              }}
              disabled={isSubmitting || !email}
              className="w-full justify-start"
              icon={<FiMail className="h-5 w-5" />}
            >
              <span className="flex-1 text-left">Email Code</span>
              <span className="text-xs text-gray-500">Verify via email</span>
            </Button>
          </div>
        )}

        {/* OTP Continue Button (after code is sent) */}
        {otpSent && selectedMethod === 'otp' && (
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleOTPAuth}
            disabled={isSubmitting || !otp || otp.length < 6}
            className="w-full"
            icon={isSubmitting ? <FiLoader className="animate-spin h-5 w-5" /> : undefined}
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
          </Button>
        )}

        {/* Loading State */}
        {isSubmitting && !otpSent && (
          <div className="flex items-center justify-center py-4">
            <FiLoader className="h-6 w-6 animate-spin text-cyan-600" />
            <span className="ml-2 text-sm text-gray-600">Authenticating...</span>
          </div>
        )}

        {/* Security Note */}
        <div className="border-t border-gray-200 pt-4">
          <p className="text-xs text-gray-500 text-center">
            🔒 Your data is encrypted and secure. We use industry-standard authentication.
          </p>
        </div>
      </div>
    </Modal>
  )
}
