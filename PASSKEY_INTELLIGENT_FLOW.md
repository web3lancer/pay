# Passkey Intelligent Flow - Implementation Details

## The Problem You Identified

The initial implementation blindly tried to authenticate every time, which would fail when the user had no passkeys registered. This created a poor user experience.

## The Solution

Added an intelligent check BEFORE attempting authentication or registration.

## Implementation

### 1. Check Endpoint (`/api/passkey/check`)
```typescript
POST /api/passkey/check
Body: { email: "user@example.com" }
Response: { hasPasskeys: true, count: 1 }
```

This endpoint:
- Queries Appwrite Users API
- Checks `user.prefs.passkey_credentials`
- Returns boolean indicating if passkeys exist
- Never fails (returns false on error)

### 2. Unified Method (`authenticateOrRegister()`)

```typescript
async authenticateOrRegister(email: string) {
  // Step 1: Check if user has passkeys
  const check = await fetch('/api/passkey/check', { 
    body: JSON.stringify({ email }) 
  });
  const { hasPasskeys } = await check.json();
  
  // Step 2: Route to correct flow
  if (hasPasskeys) {
    return await this.authenticate(email); // Existing user
  } else {
    return await this.register(email); // New user
  }
}
```

### 3. Helper Function (`authenticateWithPasskey()`)

```typescript
export async function authenticateWithPasskey({ email }) {
  const passkeyAuth = new SimplePasskeyAuth();
  const result = await passkeyAuth.authenticateOrRegister(email);
  
  if (result.success) {
    console.log(result.isRegistration ? 'Registered!' : 'Authenticated!');
  }
  
  return result;
}
```

## Flow Diagram

```
User clicks "Continue with Passkey"
           ↓
    Check /api/passkey/check
           ↓
    ┌──────┴──────┐
    ↓             ↓
Has Passkeys   No Passkeys
    ↓             ↓
authenticate()  register()
    ↓             ↓
"Sign in"      "Create"
 prompt         prompt
    ↓             ↓
Verify sig.    Store cred.
    ↓             ↓
  Login ✓      Login ✓
```

## Key Benefits

1. **No Failed Prompts**: User never sees browser errors about missing credentials
2. **Seamless UX**: Single button that "just works" for both new and returning users
3. **Server-Side Decision**: Passkey existence determined by server, not guesswork
4. **Clear Feedback**: Application knows if it's registering or authenticating

## API Endpoints Summary

| Endpoint | Purpose | When Called |
|----------|---------|-------------|
| `/api/passkey/check` | Check if user has passkeys | First, before any flow |
| `/api/passkey/register` | Register new passkey | If check returns false |
| `/api/passkey/auth` | Authenticate with passkey | If check returns true |

## Error Handling

- **Check fails**: Assumes no passkeys, tries registration
- **Registration fails**: Returns error to user
- **Authentication fails**: Returns error to user (wrong passkey, timeout, cancelled)
- **Browser not supported**: Returns error before any API calls

## Testing the Flow

### New User (No Passkeys)
1. Enter email
2. Click button
3. See "Create a passkey for [app name]"
4. Approve with Touch ID
5. Logged in ✓

### Returning User (Has Passkeys)
1. Enter email
2. Click button
3. See "Sign in with passkey"
4. Approve with Touch ID
5. Logged in ✓

Both flows look identical from the user's perspective - just one button!

## Comparison to Original POC

The POC (`ignore1/appwrite-passkey`) has two separate buttons:
- "Sign In with Passkey"
- "Register New Passkey"

Our implementation improves on this with:
- **Single button** that intelligently decides
- **Better UX** - no need to choose
- **Check endpoint** to determine state server-side
- **Automatic routing** to correct flow

This is more user-friendly while maintaining the same robust architecture.
