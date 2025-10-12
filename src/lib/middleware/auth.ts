// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/lib/middleware/auth.ts
import type { NextRequest } from 'next/server';

/**
 * Checks if the user is authenticated by looking for Appwrite session cookies.
 * @param request The NextRequest object.
 * @returns True if the user is authenticated, false otherwise.
 */
export function isAuthenticated(request: NextRequest): boolean {
  // Check for Appwrite session cookie
  // Appwrite uses the format: a_session_{projectId}
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
  if (!projectId) {
    console.error('NEXT_PUBLIC_APPWRITE_PROJECT_ID is not set');
    return false;
  }

  const sessionCookie = request.cookies.get(`a_session_${projectId}`)?.value;
  return !!sessionCookie;
}

/**
 * Fetches the user's roles.
 * For now, returns basic user role. Can be extended to fetch from Appwrite.
 * @param request The NextRequest object.
 * @returns A promise that resolves to an array of user roles (strings).
 */
export async function getUserRoles(request: NextRequest): Promise<string[]> {
  // For now, return basic user role if authenticated
  if (isAuthenticated(request)) {
    return ['user'];
  }
  return [];
}
