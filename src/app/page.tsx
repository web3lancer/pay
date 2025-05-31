import { HomeClient } from './HomeClient'
import { AuthGuard } from '@/components/auth/AuthGuard'

export default function HomePage() {
  return (
    <AuthGuard requireAuth={false}>
      <HomeClient />
    </AuthGuard>
  )
}