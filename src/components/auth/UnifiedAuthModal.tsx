/**
 * Unified Authentication Modal
 * 
 * Supports Passkey, Web3 Wallet, and OTP authentication
 * Follows ignore1/function_appwrite_passkey/USAGE.md EXACTLY
 * No interfering hooks, no selectedMethod state - just user actions
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { FiMail, FiLoader, FiKey, FiCreditCard, FiLock, FiAlertCircle } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { 
  authenticateWithPasskey,
  registerPasskey,
  continueWithPasskey,
  authenticateWithWallet,
  sendEmailOTP,
  verifyEmailOTP,
  isMetaMaskInstalled,
  getMetaMaskDownloadLink,
  supportsWebAuthn
} from '@/lib/auth/helpers'

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UnifiedAuthModal({ isOpen, onClose }: UnifiedAuthModalProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpUserId, setOtpUserId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<'passkey' | 'wallet' | 'otp' | null>(null)
  const [otpSent, setOtpSent] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const router = useRouter()

  // Check browser support on mount
  const browserSupportsPasskeys = supportsWebAuthn()

  // Show auth methods when valid email is entered and no method selected
  const showMethodSelection = email.includes('@') && !selectedMethod

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(otpCountdown - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpCountdown])

  // Auto-verify OTP when 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && otpSent && !isSubmitting) {
      handleVerifyOTP()
    }
  }, [otp, otpSent, isSubmitting])

  const handleSendOTP = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Sending code to your email...')

    try {
      const result = await sendEmailOTP({ email })
      
      if (!result.success) {
        toast.error(result.error || 'Failed to send OTP')
        setStatusMessage('')
        setIsSubmitting(false)
        return
      }

      setOtpUserId(result.userId!)
      setOtpSent(true)
      setOtpCountdown(60) // 60 second countdown
      setStatusMessage('')
      toast.success('📧 Code sent! Check your email.')
    } catch (err: any) {
      console.error('OTP send error:', err)
      toast.error(err.message || 'Failed to send code')
      setStatusMessage('')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      toast.error('Please enter the 6-digit code')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Verifying code...')

    try {
      const result = await verifyEmailOTP({ userId: otpUserId, otp })
      
      if (!result.success) {
        if (result.error?.includes('expired')) {
          setOtpSent(false)
          setOtp('')
          toast.error('Code expired. Please request a new one.')
        } else {
          toast.error(result.error || 'Invalid code')
        }
        setStatusMessage('')
        setIsSubmitting(false)
        return
      }
      
      // Success!
      toast.success('✅ Verified! Welcome to LancerPay!')
      
      // Small delay for session to propagate
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onClose()
      window.location.href = '/home'

    } catch (err: any) {
      console.error('OTP verify error:', err)
      toast.error(err.message || 'Verification failed')
      setStatusMessage('')
      setIsSubmitting(false)
    }
  }

  const handlePasskeyContinue = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    // Check browser support BEFORE attempting
    if (!browserSupportsPasskeys) {
      toast.error('❌ Your browser doesn\'t support passkeys. Please use Email Code or Wallet.', { 
        duration: 5000 
      })
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Processing passkey...')

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('🔐 Continue with passkey for:', email)
      
      const result = await continueWithPasskey({ email })

      if (!result.success) {
        setStatusMessage('')
        
        // Provide detailed, user-friendly error messages
        switch (result.code) {
          case 'cancelled':
            toast.error('Passkey cancelled. Please try again when ready.', { duration: 3000 })
            break
          case 'not_supported':
            toast.error('Your browser doesn\'t support passkeys. Try Email Code instead.', { duration: 5000 })
            break
          case 'wallet_conflict':
            toast.error('🔒 ' + result.error, { duration: 6000 })
            break
          case 'verification_failed':
            toast.error(result.error || 'Passkey failed', { duration: 4000 })
            break
          default:
            toast.error(result.error || 'Authentication failed', { duration: 4000 })
        }
        setIsSubmitting(false)
        return
      }

      // Success!
      setStatusMessage('')
      toast.success('✅ Success with passkey!', { 
        icon: '🔐',
        duration: 4000 
      })
      
      console.log('✅ Passkey flow successful!')
      
      // Small delay for session to propagate
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onClose()
      window.location.href = '/home'

    } catch (err: any) {
      console.error('❌ Passkey error:', err)
      setStatusMessage('')
      toast.error(err.message || 'Passkey failed')
      setIsSubmitting(false)
    }
  }

  const handlePasskeyRegister = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    // Check browser support BEFORE attempting
    if (!browserSupportsPasskeys) {
      toast.error('❌ Your browser doesn\'t support passkeys. Please use Email Code or Wallet.', { 
        duration: 5000 
      })
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Creating your passkey...')

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('📝 Registering passkey for:', email)
      
      const result = await registerPasskey({ email })

      if (!result.success) {
        setStatusMessage('')
        
        // Provide detailed, user-friendly error messages
        switch (result.code) {
          case 'cancelled':
            toast.error('Passkey creation cancelled. Please try again when ready.', { duration: 3000 })
            break
          case 'not_supported':
            toast.error('Your browser doesn\'t support passkeys. Try Email Code instead.', { duration: 5000 })
            break
          case 'wallet_conflict':
            toast.error('🔒 ' + result.error, { duration: 6000 })
            break
          case 'verification_failed':
            if (result.error?.includes('already exists')) {
              toast.error('A passkey already exists. Try signing in instead.', { duration: 4000 })
            } else {
              toast.error(result.error || 'Registration failed', { duration: 4000 })
            }
            break
          default:
            toast.error(result.error || 'Registration failed', { duration: 4000 })
        }
        setIsSubmitting(false)
        return
      }

      // Success!
      setStatusMessage('')
      toast.success('✅ Passkey created successfully!', { 
        icon: '🔐',
        duration: 4000 
      })
      
      console.log('✅ Passkey registration successful!')
      
      // Small delay for session to propagate
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onClose()
      window.location.href = '/home'

    } catch (err: any) {
      console.error('❌ Passkey registration error:', err)
      setStatusMessage('')
      toast.error(err.message || 'Passkey registration failed')
      setIsSubmitting(false)
    }
  }

  const handlePasskeyAuth = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    // Check browser support BEFORE attempting
    if (!browserSupportsPasskeys) {
      toast.error('❌ Your browser doesn\'t support passkeys. Please use Email Code or Wallet.', { 
        duration: 5000 
      })
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Signing in with passkey...')

    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      console.log('🔐 Authenticating passkey for:', email)
      
      const result = await authenticateWithPasskey({ email })

      if (!result.success) {
        setStatusMessage('')
        
        // Provide detailed, user-friendly error messages
        switch (result.code) {
          case 'cancelled':
            toast.error('Passkey cancelled. Please try again when ready.', { duration: 3000 })
            break
          case 'not_supported':
            toast.error('Your browser doesn\'t support passkeys. Try Email Code instead.', { duration: 5000 })
            break
          case 'no_passkey':
            toast.error('No passkey found. Please register a passkey first.', { duration: 4000 })
            break
          case 'wallet_conflict':
            toast.error('🔒 ' + result.error, { duration: 6000 })
            break
          case 'verification_failed':
            toast.error(result.error || 'Authentication failed', { duration: 4000 })
            break
          default:
            toast.error(result.error || 'Authentication failed', { duration: 4000 })
        }
        setIsSubmitting(false)
        return
      }

      // Success!
      setStatusMessage('')
      toast.success('✅ Signed in with passkey!', { 
        icon: '🔐',
        duration: 4000 
      })
      
      console.log('✅ Passkey authentication successful!')
      
      // Small delay for session to propagate
      await new Promise(resolve => setTimeout(resolve, 500))
      
      onClose()
      window.location.href = '/home'

    } catch (err: any) {
      console.error('❌ Passkey authentication error:', err)
      setStatusMessage('')
      toast.error(err.message || 'Passkey authentication failed')
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
      toast.error('MetaMask not installed. Opening download page...')
      window.open(getMetaMaskDownloadLink(), '_blank')
      return
    }

    setIsSubmitting(true)
    setStatusMessage('Connecting to MetaMask...')

    try {
      const result = await authenticateWithWallet({ email })

      if (!result.success) {
        setStatusMessage('')
        
        // Provide detailed, user-friendly error messages
        switch (result.code) {
          case 'metamask_not_installed':
            toast.error('MetaMask not installed. Opening download page...', { duration: 4000 })
            window.open(getMetaMaskDownloadLink(), '_blank')
            break
          case 'no_account':
            toast.error('No wallet selected. Please select an account in MetaMask.')
            break
          case 'signature_rejected':
            toast.error('Signature rejected. You must sign to authenticate.')
            break
          case 'passkey_conflict':
            toast.error('⚠️ This email uses passkey auth. Sign in with passkey first, then link wallet from settings.', { duration: 6000 })
            break
          case 'wallet_mismatch':
            toast.error('⚠️ This email is linked to a different wallet. Use the original wallet or different email.', { duration: 6000 })
            break
          case 'account_exists':
            toast.error('⚠️ Account exists. Sign in with Email Code or Passkey first.', { duration: 6000 })
            break
          case 'invalid_signature':
            toast.error('Invalid signature. Please try again.')
            break
          default:
            toast.error(result.error || 'Authentication failed')
        }
        setIsSubmitting(false)
        return
      }

      // Success!
      setStatusMessage('')
      toast.success('✅ Signed in successfully!', { 
        icon: '🦊',
        duration: 4000 
      })
      
      onClose()
      router.push('/home')
      router.refresh()

    } catch (err: any) {
      console.error('Wallet authentication error:', err)
      setStatusMessage('')
      toast.error(err.message || 'Authentication failed')
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
    setOtpCountdown(0)
    setStatusMessage('')
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
      description="Enter your email and choose authentication method"
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
            disabled={isSubmitting || selectedMethod !== null}
            endIcon={<FiMail className="h-5 w-5 text-neutral-400" />}
          />
          {!showMethodSelection && !selectedMethod && (
            <p className="text-xs text-gray-500 mt-2">
              Enter your email to see authentication options
            </p>
          )}
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div className="flex items-center justify-center py-2">
            <FiLoader className="h-5 w-5 animate-spin text-cyan-600 mr-2" />
            <span className="text-sm text-gray-600">{statusMessage}</span>
          </div>
        )}

        {/* Authentication Method Selection */}
        {showMethodSelection && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">
              Choose authentication method:
            </p>
            
            {/* Passkey - Single Intelligent Button (POC Pattern) */}
            <div className="space-y-2">
              {browserSupportsPasskeys ? (
                <>
                  {/* Single "Continue with Passkey" Button */}
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    onClick={handlePasskeyContinue}
                    disabled={isSubmitting || !email}
                    className="w-full justify-start relative"
                    icon={<FiKey className="h-5 w-5" />}
                  >
                    <span className="flex-1 text-left">Continue with Passkey</span>
                    <span className="text-xs text-gray-500">Secure & Passwordless</span>
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                      Recommended
                    </div>
                  </Button>
                  
                  {/* Optional: Expandable section for explicit Register/Sign In */}
                  {false && ( // Set to true to show advanced options
                    <details className="text-xs">
                      <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                        Advanced: Separate Register/Sign In
                      </summary>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePasskeyRegister}
                          disabled={isSubmitting || !email}
                          className="w-full"
                        >
                          Register
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handlePasskeyAuth}
                          disabled={isSubmitting || !email}
                          className="w-full"
                        >
                          Sign In
                        </Button>
                      </div>
                    </details>
                  )}
                </>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <FiAlertCircle className="h-4 w-4" />
                    <span>Passkeys require Chrome, Safari, or Edge</span>
                  </div>
                </div>
              )}
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
              onClick={() => setSelectedMethod('otp')}
              disabled={isSubmitting || !email}
              className="w-full justify-start"
              icon={<FiMail className="h-5 w-5" />}
            >
              <span className="flex-1 text-left">Email Code</span>
              <span className="text-xs text-gray-500">Verify via email</span>
            </Button>
          </div>
        )}

        {/* OTP Stage - Show when OTP method selected */}
        {selectedMethod === 'otp' && (
          <div className="space-y-4">
            <div className="relative">
              <Input
                id="otp-input"
                label="Verification Code"
                type="text"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6)
                  setOtp(value)
                }}
                placeholder={otpSent ? "Enter 6-digit code" : "Click 'Send Code' to receive"}
                required
                disabled={isSubmitting || !otpSent}
                maxLength={6}
                endIcon={
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isSubmitting || otpCountdown > 0}
                    className="text-sm font-medium text-cyan-600 hover:text-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {otpCountdown > 0 ? `${otpCountdown}s` : otpSent ? 'Resend' : 'Send Code'}
                  </button>
                }
              />
              <p className="text-xs text-gray-500 mt-2">
                {otpSent 
                  ? 'Code sent! Enter the 6-digit code from your email.' 
                  : 'Click "Send Code" to receive a verification code via email.'}
              </p>
              {otpSent && otp.length === 6 && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <FiLoader className="animate-spin h-3 w-3" />
                  Verifying...
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedMethod(null)
                setOtpSent(false)
                setOtp('')
                setOtpUserId('')
                setOtpCountdown(0)
              }}
              disabled={isSubmitting}
              className="text-sm text-cyan-600 hover:text-cyan-700 disabled:opacity-50 flex items-center gap-1"
            >
              ← Back to authentication methods
            </button>
          </div>
        )}

        {/* Security Note */}
        {!selectedMethod && (
          <div className="border-t border-gray-200 pt-4">
            <p className="text-xs text-gray-500 text-center">
              🔒 Your data is encrypted and secure. Industry-standard authentication.
            </p>
          </div>
        )}
      </div>
    </Modal>
  )
}
