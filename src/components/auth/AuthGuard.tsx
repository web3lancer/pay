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
  const { isLoading, isAuthenticated, isGuest, needsProfileCompletion } = useAuth();
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

    // Condition 1: Not authenticated and not a guest -> redirect to login
    if (!isAuthenticated && !isGuest) {
      router.push(redirectTo);
      return;
    }

    // Condition 2: Authenticated (not guest) but needs profile completion
    if (isAuthenticated && !isGuest && needsProfileCompletion) {
      if (pathname !== '/auth/complete-profile') {
        router.push('/auth/complete-profile');
        return;
      }
    }

    // Condition 3: Authenticated (not guest), profile complete, but on /auth/complete-profile page
    if (isAuthenticated && !isGuest && !needsProfileCompletion && pathname === '/auth/complete-profile') {
      router.push('/'); // Redirect to homepage (or a specific dashboard route if preferred)
      return;
    }
  }, [isLoading, isAuthenticated, isGuest, needsProfileCompletion, pathname, router, requireAuth, redirectTo]);

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

  // Priority 3: Conditions for rendering children on a protected route.
  // Render children if:
  // 1. User is a guest (guests bypass profile completion for this guard's purpose).
  // 2. User is authenticated, not a guest, and profile is complete.
  // 3. User is authenticated, not a guest, needs profile completion, BUT IS ALREADY ON THE PROFILE COMPLETION PAGE.
  if (isGuest || 
      (isAuthenticated && !isGuest && !needsProfileCompletion) || 
      (isAuthenticated && !isGuest && needsProfileCompletion && pathname === '/auth/complete-profile')) {
    return <>{children}</>;
  }

  // Fallback for protected routes: If none of the above conditions to render children are met,
  // it implies a redirect is or should be happening via useEffect.
  // Show a loading spinner while the redirect takes effect.
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}