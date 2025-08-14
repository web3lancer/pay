'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  redirectTo = '/auth/login'
}: AuthGuardProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Effect for handling redirects ONLY on protected routes
  useEffect(() => {
    // If authentication is NOT required for this route, DO NOTHING.
    if (!requireAuth) {
      return;
    }

    // For protected routes (requireAuth = true):
    if (isLoading) {
      return; // Wait for auth state to resolve before making redirect decisions
    }

    // Condition 1: Not authenticated -> redirect to login
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }
  }, [isLoading, isAuthenticated, pathname, router, requireAuth, redirectTo]);

  // --- Rendering Logic ---

  // Priority 1: If authentication is NOT required, render children immediately.
  if (!requireAuth) {
    return <>{children}</>;
  }

  // From this point, requireAuth IS TRUE.

  // Priority 2: If loading auth state for a protected route, show a loading spinner.
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Priority 3: Render children if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Fallback for protected routes: Show loading while redirect takes effect
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}