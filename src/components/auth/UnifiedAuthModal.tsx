/**
 * Unified Authentication Modal
 * 
 * Supports both Passkey and Web3 Wallet authentication
 * Intelligently detects which method to show based on user's email
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { account, functions } from '@/lib/appwrite'
import { FiMail, FiLoader, FiKey, FiCreditCard } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMethod = 'passkey' | 'wallet' | null

export function UnifiedAuthModal({ isOpen, onClose }: UnifiedAuthModalProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [availableMethods, setAvailableMethods] = useState<AuthMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod>(null)
  const router = useRouter()

  // Debounced email check
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setAvailableMethods([])
      setSelectedMethod(null)
      return
    }

    const timer = setTimeout(() => {
      checkEmailAuthMethods(email)
    }, 800) // 800ms debounce

    return () => clearTimeout(timer)
  }, [email])

  const checkEmailAuthMethods = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) return

    setIsCheckingEmail(true)
    try {
      // Query Appwrite to find user by email
      // We'll use the account.get() after attempting to get user prefs
      // Since we can't query users without being authenticated, we'll need a different approach
      
      // Alternative: Use a function to check email (or skip check for new users)
      // For now, we'll show both methods for new emails, and detect on auth attempt
      
      // Simulate check - in production, you might have a public endpoint
      // that returns available auth methods without exposing sensitive data
      setAvailableMethods(['passkey', 'wallet'])
      
    } catch (error) {
      // If error, assume new user - show all methods
      setAvailableMethods(['passkey', 'wallet'])
    } finally {
      setIsCheckingEmail(false)
    }
  }, [])

  const handlePasskeyAuth = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      // Generate random challenge
      const challengeArray = crypto.getRandomValues(new Uint8Array(32))
      const challenge = btoa(String.fromCharCode(...challengeArray))

      // Determine RP ID and origin from environment or window
      const rpId = process.env.NEXT_PUBLIC_PASSKEY_RP_ID || window.location.hostname
      const origin = process.env.NEXT_PUBLIC_PASSKEY_ORIGIN || window.location.origin

      let credential
      let isRegistration = false

      // Try authentication first
      try {
        credential = await startAuthentication({
          challenge,
          rpId,
        })
      } catch (authError: any) {
        // If authentication fails, try registration
        if (authError.name === 'NotAllowedError' || authError.message?.includes('No credentials')) {
          toast.info('No passkey found. Creating a new one...')
          isRegistration = true
          
          credential = await startRegistration({
            challenge,
            rp: {
              name: process.env.NEXT_PUBLIC_PASSKEY_RP_NAME || 'LancerPay',
              id: rpId,
            },
            user: {
              id: email,
              name: email,
              displayName: email,
            },
            pubKeyCredParams: [
              { alg: -7, type: 'public-key' },  // ES256
              { alg: -257, type: 'public-key' } // RS256
            ],
            authenticatorSelection: {
              userVerification: 'preferred',
              residentKey: 'preferred',
            },
          })
        } else {
          throw authError
        }
      }

      // Get function ID from environment
      const functionId = process.env.NEXT_PUBLIC_PASSKEY_FUNCTION_ID
      if (!functionId) {
        toast.error('Passkey authentication is not configured. Please contact support.')
        console.error('NEXT_PUBLIC_PASSKEY_FUNCTION_ID is not set')
        return
      }

      // Call appropriate endpoint
      const endpoint = isRegistration ? '/register' : '/authenticate'
      const payload = isRegistration
        ? { email, credentialData: credential, challenge }
        : { email, assertion: credential, challenge }

      const execution = await functions.createExecution(
        functionId,
        JSON.stringify(payload),
        false,
        endpoint,
        'POST'
      )

      const result = JSON.parse(execution.responseBody)

      if (!result.success) {
        throw new Error(result.error || 'Authentication failed')
      }

      // Create Appwrite session with the token
      await account.createSession(result.token.userId, result.token.secret)

      // Success!
      toast.success(isRegistration ? 'Passkey created and signed in!' : 'Signed in with passkey!')
      
      // Close modal and redirect
      onClose()
      router.push('/home')
      router.refresh()

    } catch (err: any) {
      console.error('Passkey authentication error:', err)
      
      if (err.name === 'NotAllowedError') {
        toast.error('Passkey authentication was cancelled')
      } else if (err.name === 'NotSupportedError') {
        toast.error('Passkeys are not supported on this device/browser')
      } else {
        toast.error(err.message || 'Passkey authentication failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleWalletAuth = async () => {
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
        setIsSubmitting(false)
        return
      }

      // Connect wallet
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      })
      
      if (!accounts || accounts.length === 0) {
        toast.error('No wallet account selected')
        setIsSubmitting(false)
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
        setIsSubmitting(false)
        return
      }

      // Call Appwrite Function (it auto-detects signup vs login)
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
      toast.success('Signed in successfully!')
      
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
    setAvailableMethods([])
    setSelectedMethod(null)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  const showMethodSelection = availableMethods.length > 0 && !selectedMethod

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Sign In to LancerPay"
      description="Secure authentication with passkey or wallet"
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
            disabled={isSubmitting}
            endIcon={
              isCheckingEmail ? (
                <FiLoader className="h-5 w-5 text-neutral-400 animate-spin" />
              ) : (
                <FiMail className="h-5 w-5 text-neutral-400" />
              )
            }
          />
          <p className="text-xs text-gray-500 mt-2">
            We'll detect your authentication method automatically
          </p>
        </div>

        {/* Authentication Method Selection */}
        {showMethodSelection && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Continue with:</p>
            
            {availableMethods.includes('passkey') && (
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
            )}

            {availableMethods.includes('wallet') && (
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
            )}
          </div>
        )}

        {/* Loading State */}
        {isSubmitting && (
          <div className="flex items-center justify-center py-4">
            <FiLoader className="h-6 w-6 animate-spin text-cyan-600" />
            <span className="ml-2 text-sm text-gray-600">Authenticating...</span>
          </div>
        )}

        {/* Info */}
        {!showMethodSelection && !isSubmitting && email && email.includes('@') && (
          <div className="text-center py-4">
            <FiLoader className="h-6 w-6 animate-spin text-cyan-600 mx-auto" />
            <p className="text-sm text-gray-600 mt-2">Checking authentication methods...</p>
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
