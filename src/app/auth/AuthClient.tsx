'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiLoader, FiShield, FiSmartphone, FiGithub } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface AuthClientProps {
  mode: 'login' | 'signup'
}

type AuthMethod = 'email_password' | 'magic_url' | 'email_otp' | 'phone_otp'

function AuthClientContent({ mode }: AuthClientProps) {
  const searchParams = useSearchParams()
  const { 
    signIn, 
    signUp, 
    sendMagicURL, 
    sendEmailOTP, 
    sendPhoneOTP,
    loginWithEmailOTP,
    loginWithMagicURL,
    loginWithPhoneOTP,
    signInWithGoogle, 
    signInWithGithub,
    isLoading 
  } = useAuth()

  // Form state
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email_password')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [userId, setUserId] = useState('')

  // Handle magic URL callback
  useEffect(() => {
    const urlUserId = searchParams?.get('userId')
    const secret = searchParams?.get('secret')
    
    if (urlUserId && secret) {
      handleMagicURLCallback(urlUserId, secret)
    }
  }, [searchParams])

  const handleMagicURLCallback = async (urlUserId: string, secret: string) => {
    try {
      setIsSubmitting(true)
      await loginWithMagicURL(urlUserId, secret)
      // Don't redirect - let AuthGuard handle it
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to authenticate with magic link'
      setErrors([errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([]) // Clear errors when user types
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (authMethod === 'email_password' || authMethod === 'magic_url' || authMethod === 'email_otp') {
      if (!formData.email) {
        newErrors.push('Email is required')
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.push('Please enter a valid email address')
      }
    }

    if (authMethod === 'phone_otp') {
      if (!formData.phone) {
        newErrors.push('Phone number is required')
      }
    }

    if (authMethod === 'email_password') {
      if (!formData.password) {
        newErrors.push('Password is required')
      } else if (formData.password.length < 8) {
        newErrors.push('Password must be at least 8 characters long')
      }

      if (mode === 'signup') {
        if (!formData.name) {
          newErrors.push('Full name is required')
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.push('Passwords do not match')
        }
      }
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setErrors([])

      if (authMethod === 'email_password') {
        if (mode === 'signup') {
          await signUp(formData.email, formData.password, formData.name)
        } else {
          await signIn(formData.email, formData.password)
        }
        // Don't redirect here - let AuthGuard handle it based on profile completion status
      } else if (authMethod === 'magic_url') {
        await sendMagicURL(formData.email)
        setMagicLinkSent(true)
      } else if (authMethod === 'email_otp') {
        if (otpSent && formData.otp) {
          await loginWithEmailOTP(userId, formData.otp)
          // Don't redirect - let AuthGuard handle it
        } else {
          const response = await sendEmailOTP(formData.email)
          setUserId(response.userId)
          setOtpSent(true)
        }
      } else if (authMethod === 'phone_otp') {
        if (otpSent && formData.otp) {
          await loginWithPhoneOTP(userId, formData.otp)
          // Don't redirect - let AuthGuard handle it
        } else {
          const response = await sendPhoneOTP(formData.phone)
          setUserId(response.userId)
          setOtpSent(true)
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during authentication'
      setErrors([errorMessage])
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithGithub()
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to sign in with ${provider}`
      setErrors([errorMessage])
    }
  }

  const resetForm = () => {
    setOtpSent(false)
    setMagicLinkSent(false)
    setUserId('')
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: ''
    })
  }

  const switchAuthMethod = (method: AuthMethod) => {
    setAuthMethod(method)
    resetForm()
    setErrors([])
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">
              {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              {mode === 'login' ? (
                <>
                  Or{' '}
                  <Link href="/auth/signup" className="font-medium text-primary-600 hover:text-primary-500">
                    create a new account
                  </Link>
                </>
              ) : (
                <>
                  Or{' '}
                  <Link href="/auth/login" className="font-medium text-primary-600 hover:text-primary-500">
                    sign in to your existing account
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-6 shadow-sm rounded-lg border border-neutral-200">
            {/* Auth Method Selector */}
            <div className="mb-6">
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => switchAuthMethod('email_password')}
                  className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md transition-colors ${
                    authMethod === 'email_password'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <FiLock className="mr-2 h-4 w-4" />
                  Password
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMethod('magic_url')}
                  className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md transition-colors ${
                    authMethod === 'magic_url'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <FiMail className="mr-2 h-4 w-4" />
                  Magic Link
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchAuthMethod('email_otp')}
                  className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md transition-colors ${
                    authMethod === 'email_otp'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <FiShield className="mr-2 h-4 w-4" />
                  Email OTP
                </button>
                <button
                  type="button"
                  onClick={() => switchAuthMethod('phone_otp')}
                  className={`flex items-center justify-center px-3 py-2 text-sm border rounded-md transition-colors ${
                    authMethod === 'phone_otp'
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50'
                  }`}
                >
                  <FiSmartphone className="mr-2 h-4 w-4" />
                  SMS OTP
                </button>
              </div>
            </div>

            {/* Error Display */}
            {errors.length > 0 && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <ul className="text-sm text-red-600 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Success Messages */}
            {magicLinkSent && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-600">
                  Magic link sent! Check your email and click the link to sign in.
                </p>
              </div>
            )}

            {otpSent && authMethod === 'email_otp' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  OTP sent to your email! Enter the 6-digit code below.
                </p>
              </div>
            )}

            {otpSent && authMethod === 'phone_otp' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-600">
                  OTP sent to your phone! Enter the 6-digit code below.
                </p>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name field for signup with email/password only */}
              {mode === 'signup' && authMethod === 'email_password' && (
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiUser className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              {(authMethod === 'email_password' || authMethod === 'magic_url' || authMethod === 'email_otp') && !otpSent && (
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiMail className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              )}

              {/* Phone field */}
              {authMethod === 'phone_otp' && !otpSent && (
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSmartphone className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              )}

              {/* Password field */}
              {authMethod === 'email_password' && (
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <FiEyeOff className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Confirm Password field for signup */}
              {mode === 'signup' && authMethod === 'email_password' && (
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLock className="h-5 w-5 text-neutral-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Confirm your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showConfirmPassword ? (
                        <FiEyeOff className="h-5 w-5 text-neutral-400" />
                      ) : (
                        <FiEye className="h-5 w-5 text-neutral-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* OTP field */}
              {(otpSent && (authMethod === 'email_otp' || authMethod === 'phone_otp')) && (
                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-neutral-700 mb-1">
                    Enter OTP Code
                  </label>
                  <input
                    id="otp"
                    type="text"
                    value={formData.otp}
                    onChange={(e) => handleInputChange('otp', e.target.value)}
                    className="block w-full px-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-center text-lg tracking-widest"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              )}

              {/* Submit Button */}
              {!magicLinkSent && (
                <button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting || isLoading ? (
                    <FiLoader className="animate-spin h-5 w-5" />
                  ) : (
                    <>
                      {authMethod === 'email_password' && (mode === 'login' ? 'Sign In' : 'Sign Up')}
                      {authMethod === 'magic_url' && 'Send Magic Link'}
                      {authMethod === 'email_otp' && (otpSent ? 'Verify OTP' : 'Send OTP')}
                      {authMethod === 'phone_otp' && (otpSent ? 'Verify OTP' : 'Send SMS')}
                    </>
                  )}
                </button>
              )}
            </form>

            {/* OAuth Buttons */}
            {!otpSent && !magicLinkSent && (
              <>
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-neutral-300" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-neutral-500">Or continue with</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    <FcGoogle className="h-5 w-5" />
                    <span className="ml-2">Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('github')}
                    className="w-full inline-flex justify-center py-2 px-4 border border-neutral-300 rounded-md shadow-sm bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50 transition-colors"
                  >
                    <FiGithub className="h-5 w-5" />
                    <span className="ml-2">GitHub</span>
                  </button>
                </div>
              </>
            )}

            {/* Additional Links */}
            {mode === 'login' && authMethod === 'email_password' && !otpSent && (
              <div className="mt-6 text-center">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-500"
                >
                  Forgot your password?
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export function AuthClient({ mode }: AuthClientProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AuthClientContent mode={mode} />
    </Suspense>
  )
}