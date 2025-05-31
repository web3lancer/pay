import { Suspense } from 'react'
import { AuthClient } from '../AuthClient'

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    }>
      <AuthClient mode="signup" />
    </Suspense>
  )
}