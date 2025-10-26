# Appwrite Session Detection Fix

## Problem Identified

The application's TopBar was showing "Connect" button even when users were logged in. This was because the `AuthContext` was:

1. Checking for `auth_token` in localStorage (which Appwrite doesn't use)
2. Not actually checking Appwrite's session state
3. Not refreshing when users navigated back from authentication

## Solution Implemented

### 1. **AuthContext.tsx** - Complete Rewrite
- Now uses Appwrite's `account.get()` API to check session
- Implements `getCurrentUserId()` to verify active session
- Fetches user profile with `getCurrentUserProfile()`
- Integrates with session sync service for real-time updates
- Properly handles logout by clearing Appwrite session

**Key Changes:**
```typescript
// Before: Checking localStorage (WRONG)
const hasAuthToken = localStorage.getItem('auth_token')

// After: Checking Appwrite session (CORRECT)
const userId = await getCurrentUserId()
if (userId) {
  // User is authenticated
}
```

### 2. **Session Sync Service** (`/src/lib/sessionSync.ts`)
New service that monitors session state changes:
- Listens for visibility changes (browser tab focus)
- Periodically checks session (every 60 seconds)
- Notifies all listeners when session changes
- Works across all components without prop drilling

**Features:**
- `getCurrentSession()` - Returns current session data
- `onSessionChange()` - Subscribe to session changes
- `initializeSessionMonitoring()` - Start automatic monitoring

### 3. **TopBar.tsx** - User Display Improvements
- Shows user's email when logged in
- Displays loading state while checking auth
- Properly redirects after logout
- Shows full user email instead of generic "Account"

**Changes:**
```typescript
// Before
{isAuthenticated ? 'Account' : 'Account'}

// After
{isAuthenticated && user?.email ? user.email : (loading ? 'Loading...' : 'Account')}
```

### 4. **Auth Refresh Hook** (`/src/hooks/useAuthRefresh.ts`)
New hook for components to refresh auth state:
```typescript
export function useAuthRefresh() {
  // Automatically refreshes auth when component mounts
  // and when browser tab becomes visible
}

export function useAuthState() {
  // Returns isAuthenticated, loading, user, isReady, hasUser
}
```

## How It Works Now

### Session Detection Flow

```
┌─────────────────────────────────────┐
│  App Loads / User Navigates Back    │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  AuthContext Mounts                 │
│  • Calls checkAppwriteSession()      │
│  • Gets Appwrite session            │
└─────────────────┬───────────────────┘
                  │
                  ▼
┌─────────────────────────────────────┐
│  Appwrite Session Check             │
│  • getCurrentUserId()               │
│  • getCurrentUserProfile()          │
└─────────────────┬───────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
    ┌──────┐            ┌──────────┐
    │ Auth │            │ No Auth  │
    └──┬───┘            └─────┬────┘
       │                      │
       ▼                      ▼
   Set User            Clear User
   Show Dropdown       Show Connect
```

### Session Monitoring

Once authenticated, the app:

1. **Monitors visibility** - Refreshes when browser tab becomes active
2. **Checks periodically** - Every 60 seconds to catch session changes
3. **Notifies subscribers** - All components using `useAuth()` get updates
4. **Handles logout** - Clears Appwrite session and local state

## Integration Points

### Components Using Auth

All components automatically get proper auth state via `useAuth()`:

```typescript
const { isAuthenticated, user, loading, logout } = useAuth()
```

### Current Usage

- `TopBar.tsx` - Shows user info or Connect button
- `page.tsx` - Redirects to auth if not logged in
- `PaymentProfile.tsx` - Shows wallet connection
- `DashboardClient.tsx` - Displays user profile

## Environment Requirements

Must have configured:
- `NEXT_PUBLIC_APPWRITE_ENDPOINT` - Appwrite server URL
- `NEXT_PUBLIC_APPWRITE_PROJECT_ID` - Project ID
- `NEXT_PUBLIC_APPWRITE_DB_ID` - Database ID
- `NEXT_PUBLIC_APPWRITE_COLLECTION_USERS` - Users collection

## Testing Session Detection

### Manual Testing Steps

1. **Login**
   - Navigate to app
   - Click "Connect" in dropdown
   - Complete login
   - TopBar should show email (not "Connect")

2. **Refresh**
   - Page reload (F5)
   - TopBar should still show email
   - No re-login needed

3. **Navigate Away and Back**
   - Open another tab
   - Return to app tab
   - TopBar should still show email

4. **Logout**
   - Click dropdown
   - Click "Sign out"
   - Redirected to logout
   - TopBar shows "Connect" again

5. **Session Persistence**
   - Close browser
   - Reopen app
   - If session cookie exists, TopBar shows email
   - Session restored automatically

## Performance Optimizations

- **Session checking**: 60-second interval (not on every render)
- **Profile fetching**: Only once per session
- **User data**: Cached in React state
- **No localStorage**: Uses Appwrite's native cookies
- **Visibility-based**: Only checks when tab is active

## Files Modified

- `src/contexts/AuthContext.tsx` - Complete rewrite
- `src/components/layout/TopBar.tsx` - Display improvements
- `src/lib/sessionSync.ts` - NEW: Session monitoring
- `src/hooks/useAuthRefresh.ts` - NEW: Auth refresh hook

## Migration Notes

If your app was using the old `auth_token` localStorage approach:

1. **No breaking changes** - All components continue to work
2. **New auth state** - `isAuthenticated` now reflects actual session
3. **User data** - `user` object now populated with Appwrite user data
4. **Logout flow** - Now properly clears Appwrite session

## Debugging

### Enable Debug Logs

Check browser console for:
- Session check errors
- Profile fetch warnings
- Session monitoring events

### Common Issues

**"Still showing Connect after login"**
- Clear browser cookies
- Check Appwrite endpoint in env
- Verify Appwrite session cookie is being set

**"Session not persisting after refresh"**
- Check browser allows cookies
- Verify Appwrite session is valid
- Check console for CORS errors

**"User email not showing"**
- Verify Appwrite user has email field
- Check user profile was fetched
- Look for profile fetch errors in console

## Future Improvements

- [ ] Add refresh token rotation
- [ ] Implement session timeout warnings
- [ ] Add biometric auth support
- [ ] Social login integration
- [ ] Session across devices
