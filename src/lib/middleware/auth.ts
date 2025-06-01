// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/lib/middleware/auth.ts
import type { NextRequest } from 'next/server';

/**
 * Checks if the user is authenticated.
 * !!! YOU MUST IMPLEMENT THIS FUNCTION based on your auth system !!!
 * @param request The NextRequest object.
 * @returns True if the user is authenticated, false otherwise.
 */
export function isAuthenticated(request: NextRequest): boolean {
  // Replace this with your actual authentication logic.
  // Example: Check for a session cookie or validate a token.
  // Consider using a library like `jose` for JWT verification if applicable.
  const authToken = request.cookies.get('auth-token')?.value;
  if (authToken) {
    // Here you might want to verify the token (e.g., check expiration, signature)
    // For simplicity, we're just checking for presence.
    return true;
  }
  return false;
}

/**
 * Fetches the user's roles.
 * !!! YOU MUST IMPLEMENT THIS FUNCTION if using role-based access !!!
 * @param request The NextRequest object.
 * @returns A promise that resolves to an array of user roles (strings).
 */
export async function getUserRoles(request: NextRequest): Promise<string[]> {
  // Replace this with your actual role-fetching logic.
  // Example: Decode roles from a JWT, fetch from a database, or call an auth service.
  const authToken = request.cookies.get('auth-token')?.value;
  if (authToken) {
    // Example: If roles are part of a JWT payload (this is highly simplified)
    try {
      // const decodedToken = await verifyJwt(authToken); // Using a hypothetical verifyJwt function
      // return decodedToken.roles || [];
      return ['user']; // Placeholder
    } catch (error) {
      console.error("[Auth] Error decoding token for roles:", error);
      return [];
    }
  }
  return [];
}
