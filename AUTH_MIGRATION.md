# Authentication System Migration

## Overview

The Pay application has been migrated to use **external authentication** via `NEXT_PUBLIC_AUTH_URI`. All local authentication systems (passkeys, email OTP, Web3 wallets) have been removed.

## Key Changes

### Removed Components
- `src/components/auth/` - All auth modal components removed:
  - `UnifiedAuthModal.tsx`
  - `Web3AuthModal.tsx`
  - `ProfileCompletion.tsx`
  - `AuthGuard.tsx`
  - `OptionalAuthGuard.tsx`
  - `GuestConversion.tsx`
  - `GuestSessionButton.tsx`

- `src/components/AuthGuard.tsx` - Deprecated local auth guard

### Removed API Routes
- `src/app/api/auth/` - Auth endpoint removed
- `src/app/api/passkey/` - Passkey registration/authentication routes removed

### Removed Auth Libraries
- `src/lib/auth/helpers.ts` - Passkey, Email OTP, and Web3 authentication helpers (no longer used)
- `src/lib/simple-passkeys.ts` - Passkey implementation (no longer needed)

## Authentication Flow

### New External Auth Pattern

1. **User clicks "Connect" or "Login"**
   - Redirects to: `NEXT_PUBLIC_AUTH_URI/login?source=pay.web3lancer.website`

2. **User authenticates on external auth service**
   - Handles all authentication methods (passkeys, OAuth, Web3, etc.)
   - External service validates identity

3. **User redirected back to Pay app**
   - External auth service sets auth token/cookie
   - Pay app detects authentication status

4. **User logs out**
   - Redirects to: `NEXT_PUBLIC_AUTH_URI/logout?redirect=pay.web3lancer.website`
   - External auth service clears session
   - Returns to Pay app

## Configuration

Set the following environment variable:

```bash
NEXT_PUBLIC_AUTH_URI=https://auth.web3lancer.website
```

The app will:
- Direct users to `${NEXT_PUBLIC_AUTH_URI}/login?source=pay.web3lancer.website` for login
- Direct users to `${NEXT_PUBLIC_AUTH_URI}/logout?redirect=pay.web3lancer.website` for logout

## AuthContext API

The `useAuth()` hook provides:

```typescript
{
  isAuthenticated: boolean      // User is logged in
  loading: boolean             // Auth state is being checked
  redirectToAuth: () => void   // Redirect to login page
  logout: () => void           // Redirect to logout
  user?: UserProfile           // User profile (from external service)
  userProfile?: UserProfile    // Same as user (for compatibility)
  isLoading?: boolean          // Same as loading (for compatibility)
  signOut?: () => Promise<void> // Same as logout
  // Other stub methods for compatibility:
  completeProfile?: () => Promise<void>
  convertGuestToUser?: () => Promise<void>
  createGuestSession?: () => Promise<void>
  enableTwoFactor?: () => Promise<void>
  disableTwoFactor?: () => Promise<void>
  verifyTwoFactor?: () => Promise<void>
  createRecoveryCodes?: () => Promise<void>
  refreshProfile?: () => Promise<void>
}
```

## Integration with External Auth Service

The external auth service should:

1. **Accept login requests with source parameter**
   - URL: `${AUTH_URI}/login?source=pay.web3lancer.website`
   - Set authentication cookie/token

2. **Handle logout requests with redirect**
   - URL: `${AUTH_URI}/logout?redirect=pay.web3lancer.website`
   - Clear session and redirect back

3. **Set auth token/cookie** that this app can detect
   - Cookie name or localStorage key: `auth_token`
   - Cookie should be accessible to the Pay app domain

4. **Optionally populate user data** via cookies or localStorage
   - User profile data can be managed by external service
   - Pay app checks for `auth_token` to determine authentication status

## Migration Notes

- All route protection is handled by the `RouteGuard` component
- Protected routes redirect unauthenticated users to external auth service
- The `TopBar` component shows "Connect" button for unauthenticated users
- Home page (`/`) and pitch page (`/pitch`) don't require authentication
- All other routes require authentication via `RouteGuard`

## Testing

1. Start the app without `NEXT_PUBLIC_AUTH_URI` set - you'll see console errors
2. Set `NEXT_PUBLIC_AUTH_URI` in your `.env.local`
3. Click "Connect" or "Login" buttons - should redirect to auth service
4. After authentication, check if `auth_token` exists in localStorage/cookies
5. Protected routes should now be accessible

## Future Enhancements

- Implement user profile fetching from external auth service
- Set up proper cookie handling with external auth domain
- Implement token refresh logic
- Add error handling for auth failures
