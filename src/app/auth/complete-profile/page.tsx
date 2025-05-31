'use client'

import { ProfileCompletion } from '@/components/auth/ProfileCompletion'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function CompleteProfilePage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ProfileCompletion />
      </div>
    </AuthGuard>
  )
}