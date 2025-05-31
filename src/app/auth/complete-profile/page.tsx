'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FiUser, FiMail, FiAtSign, FiLoader, FiCheck } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { account } from '@/lib/appwrite'

export default function CompleteProfilePage() {
  const router = useRouter()
  const { user, isLoading, updateProfile } = useAuth()
  
  const [formData, setFormData] = useState({
    username: '',
    displayName: '',
    email: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [appwriteUser, setAppwriteUser] = useState<any>(null)

  // Get Appwrite user data on mount
  useEffect(() => {
    const getAppwriteUserData = async () => {
      try {
        const currentUser = await account.get()
        setAppwriteUser(currentUser)
        
        // Pre-fill form with available data
        setFormData({
          username: currentUser.name?.split(' ')[0]?.toLowerCase() || 
                   currentUser.email?.split('@')[0] || '',
          displayName: currentUser.name || '',
          email: currentUser.email || ''
        })
      } catch (error) {
        console.error('Failed to get Appwrite user:', error)
        // If no user session, redirect to login
        router.push('/auth/login')
      }
    }

    if (!isLoading) {
      getAppwriteUserData()
    }
  }, [isLoading, router])

  // If user already has a complete profile, redirect to dashboard
  useEffect(() => {
    if (user && user.profile && Object.keys(user.profile).length > 0) {
      router.push('/')
    }
  }, [user, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setErrors([]) // Clear errors when user types
  }

  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.username) {
      newErrors.push('Username is required')
    } else if (!/^[a-zA-Z0-9_]{3,20}$/.test(formData.username)) {
      newErrors.push('Username must be 3-20 characters long and contain only letters, numbers, and underscores')
    }

    if (!formData.displayName) {
      newErrors.push('Display name is required')
    } else if (formData.displayName.length < 2) {
      newErrors.push('Display name must be at least 2 characters long')
    }

    if (!formData.email) {
      newErrors.push('Email is required')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.push('Please enter a valid email address')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !appwriteUser) return

    try {
      setIsSubmitting(true)
      setErrors([])

      // Create the user profile in our database using the Appwrite user ID
      await updateProfile({
        displayName: formData.displayName,
        // We'll handle the full profile creation in the AuthContext
      })

      // Redirect to dashboard
      router.push('/')
    } catch (error: any) {
      setErrors([error.message || 'Failed to complete profile'])
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !appwriteUser) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
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
            <div className="mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center mb-4">
              <FiUser className="h-6 w-6 text-primary-600" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-neutral-900">
              Complete Your Profile
            </h2>
            <p className="mt-2 text-sm text-neutral-600">
              Just a few more details to get you started
            </p>
          </div>

          <div className="mt-8 bg-white py-8 px-6 shadow-sm rounded-lg border border-neutral-200">
            {/* Show current Appwrite user info */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-700">
                <strong>Logged in as:</strong> {appwriteUser.email}
              </p>
              {appwriteUser.name && (
                <p className="text-sm text-blue-700">
                  <strong>Name:</strong> {appwriteUser.name}
                </p>
              )}
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

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiAtSign className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value.toLowerCase())}
                    className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="johndoe"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  3-20 characters, letters, numbers and underscores only
                </p>
              </div>

              {/* Display Name field */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-1">
                  Display Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiUser className="h-5 w-5 text-neutral-400" />
                  </div>
                  <input
                    id="displayName"
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => handleInputChange('displayName', e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="John Doe"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  This is how your name will appear to others
                </p>
              </div>

              {/* Email field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
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
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <FiLoader className="animate-spin h-5 w-5" />
                ) : (
                  <>
                    <FiCheck className="mr-2 h-5 w-5" />
                    Complete Profile
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  )
}