'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { account } from '@/lib/appwrite'
import Link from 'next/link'

export default function ResetPasswordPage() {
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

      await account.updateRecovery(
        userId,
        secret,
        formData.password,
        formData.confirmPassword
      )

      // Redirect to login with success message
      router.push('/auth/login?message=password-reset-success')
    } catch (error: any) {
      setError(error.message || 'Failed to reset password')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!userId || !secret) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">
              Invalid Reset Link
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              This password reset link is invalid or has expired.
            </p>
            <div className="mt-6">
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Request New Reset Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
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
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Enter your new password below.
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-6 shadow-sm rounded-lg border border-neutral-200">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
                  New Password
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
                    placeholder="Enter your new password"
                    required
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

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
                  Confirm New Password
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
                    placeholder="Confirm your new password"
                    required
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

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}