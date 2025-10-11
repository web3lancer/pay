/**
 * Unified Authentication Modal
 * 
 * Supports Passkey, Web3 Wallet, and OTP authentication
 * Intelligently detects which methods to show based on user's email and preferences
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { account, functions } from '@/lib/appwrite'
import { FiMail, FiLoader, FiKey, FiCreditCard, FiLock } from 'react-icons/fi'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { startRegistration, startAuthentication } from '@simplewebauthn/browser'

interface UnifiedAuthModalProps {
  isOpen: boolean
  onClose: () => void
}

type AuthMethod = 'passkey' | 'wallet' | 'otp'

interface AuthMethodsResponse {
  exists: boolean
  methods: AuthMethod[]
  recommendedMethod?: AuthMethod
}

export function UnifiedAuthModal({ isOpen, onClose }: UnifiedAuthModalProps) {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpUserId, setOtpUserId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [availableMethods, setAvailableMethods] = useState<AuthMethod[]>([])
  const [recommendedMethod, setRecommendedMethod] = useState<AuthMethod | null>(null)
  const [selectedMethod, setSelectedMethod] = useState<AuthMethod | null>(null)
  const [userExists, setUserExists] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const router = useRouter()

  // Debounced email check
  useEffect(() => {
    if (!email || !email.includes('@')) {
      setAvailableMethods([])
      setSelectedMethod(null)
      setRecommendedMethod(null)
      setOtpSent(false)
      return
    }

    const timer = setTimeout(() => {
      checkEmailAuthMethods(email)
    }, 800) // 800ms debounce

    return () => clearTimeout(timer)
  }, [email, checkEmailAuthMethods])

  const checkEmailAuthMethods = useCallback(async (emailToCheck: string) => {
    if (!emailToCheck || !emailToCheck.includes('@')) return

    setIsCheckingEmail(true)
    try {
      const response = await fetch(`/api/auth/methods?email=${encodeURIComponent(emailToCheck)}`)
      
      if (!response.ok) {
        throw new Error('Failed to check authentication methods')
      }

      const data: AuthMethodsResponse = await response.json()
      
      setUserExists(data.exists)
      setAvailableMethods(data.methods)
      setRecommendedMethod(data.recommendedMethod || null)
      
      // If only one method available and it's OTP, auto-select it
      if (data.methods.length === 1 && data.methods[0] === 'otp') {
        setSelectedMethod('otp')
      }
      
    } catch (error) {
      console.error('Error checking email:', error)
      // Fallback to OTP on error
      setAvailableMethods(['otp'])
      setUserExists(false)
    } finally {
      setIsCheckingEmail(false)
    }
  }, [])

  const handleOTPAuth = async () => {
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setIsSubmitting(true)

    try {
      if (!otpSent) {
        // Send OTP
        const token = await account.createEmailToken(email, email)
        setOtpUserId(token.userId)
        setOtpSent(true)
        toast.success('OTP sent to your email! Check your inbox.')
      } else {
        // Verify OTP
        if (!otp || otp.length < 6) {
          toast.error('Please enter the 6-digit code from your email')
          setIsSubmitting(false)
          return
        }

        await account.createSession(otpUserId, otp)
        
        // Success!
        toast.success('Verified! Welcome to LancerPay!')
        
        // Close modal and redirect
        onClose()
        router.push('/home')
        router.refresh()
      }

    } catch (err: any) {
      console.error('OTP authentication error:', err)
      
      if (err.message?.includes('Invalid')) {
        toast.error('Invalid code. Please check and try again.')
      } else {
        toast.error(err.message || 'Authentication failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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

      // Try authentication first if user exists
      if (userExists) {
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
      } else {
        // New user - register directly
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
    setOtp('')
    setOtpUserId('')
    setIsSubmitting(false)
    setAvailableMethods([])
    setSelectedMethod(null)
    setRecommendedMethod(null)
    setOtpSent(false)
    setUserExists(false)
  }

  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onClose()
    }
  }

  const showMethodSelection = availableMethods.length > 0 && !selectedMethod && !isCheckingEmail

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={userExists ? "Welcome Back!" : "Get Started"}
      description={userExists ? "Sign in to your account" : "Create your secure account"}
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
            endIcon={
              isCheckingEmail ? (
                <FiLoader className="h-5 w-5 text-neutral-400 animate-spin" />
              ) : (
                <FiMail className="h-5 w-5 text-neutral-400" />
              )
            }
          />
          {!showMethodSelection && !otpSent && (
            <p className="text-xs text-gray-500 mt-2">
              {isCheckingEmail ? 'Checking authentication methods...' : 'We\'ll detect your authentication method automatically'}
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
              {userExists ? 'Continue with:' : 'Get started with:'}
            </p>
            
            {availableMethods.includes('passkey') && (
              <div className="relative">
                {recommendedMethod === 'passkey' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                    Recommended
                  </div>
                )}
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

            {availableMethods.includes('otp') && (
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
                <span className="text-xs text-gray-500">
                  {userExists ? 'Verify via email' : 'Start with email'}
                </span>
              </Button>
            )}
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
