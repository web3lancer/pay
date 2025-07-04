'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { FiCheck, FiX, FiLoader } from 'react-icons/fi'
import Link from 'next/link'
import { SearchParamsWrapper } from '@/components/SearchParamsWrapper'
import { completeEmailVerification } from '@/lib/appwrite'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [error, setError] = useState('')

  useEffect(() => {
    const userId = searchParams?.get('userId')
    const secret = searchParams?.get('secret')

    if (userId && secret) {
      handleVerification(userId, secret)
    } else {
      setStatus('error')
      setError('Invalid verification link')
    }
  }, [searchParams])

  const handleVerification = async (userId: string, secret: string) => {
    try {
      await completeEmailVerification(userId, secret)
      setStatus('success')
      setTimeout(() => {
        router.push('/')
      }, 3000)
    } catch (error: any) {
      setStatus('error')
      setError(error.message || 'Email verification failed')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-neutral-200">
            {status === 'verifying' && (
              <>
                <FiLoader className="mx-auto h-12 w-12 text-primary-600 animate-spin" />
                <h2 className="mt-4 text-2xl font-bold text-neutral-900">
                  Verifying your email...
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Please wait while we verify your email address.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="mx-auto h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <FiCheck className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-neutral-900">
                  Email verified successfully!
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Your email has been verified. You'll be redirected to your dashboard shortly.
                </p>
                <div className="mt-6">
                  <Link
                    href="/"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiX className="h-6 w-6 text-red-600" />
                </div>
                <h2 className="mt-4 text-2xl font-bold text-neutral-900">
                  Verification failed
                </h2>
                <p className="mt-2 text-sm text-neutral-600">
                  {error}
                </p>
                <div className="mt-6 space-y-3">
                  <Link
                    href="/auth/login"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back to Login
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="w-full inline-flex justify-center items-center px-4 py-2 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Create New Account
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <SearchParamsWrapper>
      <VerifyEmailContent />
    </SearchParamsWrapper>
  )
}