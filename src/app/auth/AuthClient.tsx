'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiLoader, FiShield, FiGithub } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useAuth } from '@/contexts/AuthContext'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/Card'

interface AuthClientProps {
  mode: 'login' | 'signup'
}

type AuthMethod = 'email_password' | 'magic_url' | 'email_otp'

function AuthClientContent({ mode }: AuthClientProps) {
const searchParams = useSearchParams()
const { 
    login, 
    register, 
    sendMagicURL, 
    sendEmailOTP, 
    loginWithEmailOTP,
    loginWithMagicURL,
    
    signInWithGoogle, 
    signInWithGithub,
    isLoading 
  } = useAuth()
// Removed unused router and legacy signIn/signUp variables

  // Form state
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email_password')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
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
    } catch (error: any) {
      setErrors([error.message || 'Failed to authenticate with magic link'])
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
            await register(formData.email, formData.password, formData.name)
          } else {
            await login(formData.email, formData.password)
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
      }

    } catch (error: any) {
      setErrors([error.message || 'An error occurred during authentication'])
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
    } catch (error: any) {
      setErrors([error.message || `Failed to sign in with ${provider}`])
    }
  }

  const resetForm = () => {
    setOtpSent(false)
    setMagicLinkSent(false)
    setUserId('')
      setFormData({
        name: '',
        email: '',
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
    <Card className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <CardHeader className="text-center">
          <CardTitle>
            {mode === 'login' ? 'Sign in to your account' : 'Create your account'}
          </CardTitle>
          <CardDescription>
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Auth Method Selector */}
          <div className="mb-6">
            <div className="grid grid-cols-2 gap-2 mb-4">
              <Button
                type="button"
                variant={authMethod === 'email_password' ? 'primary' : 'outline'}
                onClick={() => switchAuthMethod('email_password')}
                icon={<FiLock className="h-4 w-4" />}
                size="sm"
              >
                Password
              </Button>
              <Button
                type="button"
                variant={authMethod === 'magic_url' ? 'primary' : 'outline'}
                onClick={() => switchAuthMethod('magic_url')}
                icon={<FiMail className="h-4 w-4" />}
                size="sm"
              >
                Magic Link
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={authMethod === 'email_otp' ? 'primary' : 'outline'}
                onClick={() => switchAuthMethod('email_otp')}
                icon={<FiShield className="h-4 w-4" />}
                size="sm"
              >
                Email OTP
              </Button>
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

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name field for signup with email/password only */}
            {mode === 'signup' && authMethod === 'email_password' && (
              <Input
                id="name"
                label="Full Name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
              />
            )}

            {/* Email field */}
            {(authMethod === 'email_password' || authMethod === 'magic_url' || authMethod === 'email_otp') && !otpSent && (
              <Input
                id="email"
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email"
                endIcon={<FiMail className="h-5 w-5 text-neutral-400" />}
              />
            )}

            {/* Password field */}
            {authMethod === 'email_password' && (
              <Input
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Enter your password"
                endIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FiEyeOff className="h-5 w-5 text-neutral-400" /> : <FiEye className="h-5 w-5 text-neutral-400" />}
                  </button>
                }
              />
            )}

            {/* Confirm Password field for signup */}
            {mode === 'signup' && authMethod === 'email_password' && (
              <Input
                id="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                endIcon={
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FiEyeOff className="h-5 w-5 text-neutral-400" /> : <FiEye className="h-5 w-5 text-neutral-400" />}
                  </button>
                }
              />
            )}

            {/* OTP field */}
            {(otpSent && authMethod === 'email_otp') && (
              <Input
                id="otp"
                label="Enter OTP Code"
                type="text"
                value={formData.otp}
                onChange={(e) => handleInputChange('otp', e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="text-center text-lg tracking-widest"
              />
            )}

            {/* Submit Button */}
            {!magicLinkSent && (
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={isSubmitting || isLoading}
                className="w-full"
                icon={isSubmitting || isLoading ? <FiLoader className="animate-spin h-5 w-5" /> : undefined}
              >
                {authMethod === 'email_password' && (mode === 'login' ? 'Sign In' : 'Sign Up')}
                {authMethod === 'magic_url' && 'Send Magic Link'}
                {authMethod === 'email_otp' && (otpSent ? 'Verify OTP' : 'Send OTP')}
              </Button>
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
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('google')}
                  icon={<FcGoogle className="h-5 w-5" />}
                >
                  Google
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => handleOAuthSignIn('github')}
                  icon={<FiGithub className="h-5 w-5" />}
                >
                  GitHub
                </Button>
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
        </CardContent>
      </motion.div>
    </Card>
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