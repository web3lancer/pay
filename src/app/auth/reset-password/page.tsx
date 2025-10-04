'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { account } from '@/lib/appwrite'
import Link from 'next/link'
import { SearchParamsWrapper } from '@/components/SearchParamsWrapper'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Image from 'next/image'
import { completePasswordRecovery } from '@/lib/appwrite'

function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const [secret, setSecret] = useState('')

  useEffect(() => {
    const urlUserId = searchParams?.get('userId')
    const urlSecret = searchParams?.get('secret')

    if (urlUserId && urlSecret) {
      setUserId(urlUserId)
      setSecret(urlSecret)
    } else {
      setError('Invalid reset link')
    }
  }, [searchParams])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }

  const validateForm = (): string[] => {
    const errors: string[] = []

    if (!formData.password) {
      errors.push('Password is required')
    } else if (formData.password.length < 8) {
      errors.push('Password must be at least 8 characters long')
    }

    if (formData.password !== formData.confirmPassword) {
      errors.push('Passwords do not match')
    }

    return errors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm()
    if (validationErrors.length > 0) {
      setError(validationErrors[0])
      return
    }

    if (!userId || !secret) {
      setError('Invalid reset link')
      return
    }

    try {
      setIsSubmitting(true)
      setError('')

      await completePasswordRecovery(
        userId,
        secret,
        formData.password
      )

      router.push('/auth/login?message=password-reset-success')
    } catch (error: any) {
      setError(error.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userId || !secret) {
    return (
      <Suspense>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
          <Card className="w-full max-w-md shadow-2xl">
            <div className="flex justify-center pt-8 pb-2">
              <Image
                src="/images/logo.png"
                alt="LancerPay Logo"
                width={56}
                height={56}
                className="rounded-xl shadow-lg"
                priority
              />
            </div>
            <CardHeader className="text-center">
              <CardTitle>Invalid Reset Link</CardTitle>
              <CardDescription>
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mt-6 flex flex-col items-center">
                <Button
                  asChild
                  variant="primary"
                  className="w-full"
                >
                  <Link href="/auth/forgot-password">
                    Request New Reset Link
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Suspense>
    )
  }

  return (
    <Suspense>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <Card className="w-full max-w-md shadow-2xl">
          <div className="flex justify-center pt-8 pb-2">
            <Image
              src="/images/logo.png"
              alt="LancerPay Logo"
              width={56}
              height={56}
              className="rounded-xl shadow-lg"
              priority
            />
          </div>
          <CardHeader className="text-center">
            <CardTitle>Reset your password</CardTitle>
            <CardDescription>
              Enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-center">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 text-center">
              <div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                  placeholder="New Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
              <div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                  placeholder="Confirm New Password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5 text-neutral-400" />
                  ) : (
                    <FiEye className="h-5 w-5 text-neutral-400" />
                  )}
                </button>
              </div>
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-cyan-600 hover:underline"
              >
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Suspense>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}