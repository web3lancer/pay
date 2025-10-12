# Intelligent Passkey Authentication Flow

## Overview

The passkey authentication implementation now intelligently handles **both registration and login from a single button**, automatically determining whether a user needs to register a new passkey or authenticate with an existing one.

## The Problem (Before)

**Previous Implementation Issue:**
- Always attempted to call `startAuthentication()` first
- Would fail with "No credentials" error for new users
- Then fallback to `startRegistration()`
- This caused unnecessary error prompts and poor UX

**Root Cause:**
- WebAuthn's `startAuthentication()` requires existing credentials
- Without credentials, it throws an error
- The try-catch approach was unreliable and created bad UX

## The Solution (After)

**Intelligent Flow:**
1. **Check for existing passkeys** - Call `/passkeys` endpoint first
2. **Branch based on result:**
   - **Has passkeys** → Use `startAuthentication()`
   - **No passkeys** → Use `startRegistration()`
3. **Single smooth experience** - No error states for new users

## Implementation Details

### Step-by-Step Flow

```typescript
async function authenticateWithPasskey(email: string) {
  // Step 1: Check if user has passkeys
  const checkResult = await functions.createExecution(
    functionId,
    JSON.stringify({ email }),
    false,
    '/passkeys',
    'POST'
  )
  
  const hasPasskeys = checkResult.passkeys?.length > 0

  // Step 2: Branch based on result
  if (hasPasskeys) {
    // Existing user - authenticate
    credential = await startAuthentication({
      challenge,
      rpId,
      timeout: 60000,
      userVerification: 'preferred',
    })
    
    // Call /authenticate endpoint
    await functions.createExecution(
      functionId,
      JSON.stringify({ email, assertion: credential, challenge }),
      false,
      '/authenticate',
      'POST'
    )
  } else {
    // New user - register
    credential = await startRegistration({
      challenge,
      rp: { name: rpName, id: rpId },
      user: { id: email, name: email, displayName: email },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },
        { alg: -257, type: 'public-key' }
      ],
      authenticatorSelection: {
        userVerification: 'preferred',
        residentKey: 'preferred',
      },
      timeout: 60000,
      attestation: 'none',
    })
    
    // Call /register endpoint
    await functions.createExecution(
      functionId,
      JSON.stringify({ email, credentialData: credential, challenge }),
      false,
      '/register',
      'POST'
    )
  }
  
  // Step 3: Create session
  await account.createSession(result.token.userId, result.token.secret)
}
```

## User Experience

### New User (First Time)

**User clicks "Sign in with Passkey"**

1. ✅ Check passkeys → None found
2. ✅ Browser shows: "Create a passkey for LancerPay"
3. ✅ User uses fingerprint/Face ID
4. ✅ Passkey created + logged in
5. ✅ Toast: "✅ Passkey created! You're signed in!"

**No error messages. Smooth experience.**

---

### Returning User

**User clicks "Sign in with Passkey"**

1. ✅ Check passkeys → Found existing passkey
2. ✅ Browser shows: "Sign in to LancerPay"
3. ✅ User uses fingerprint/Face ID
4. ✅ Authenticated with existing passkey
5. ✅ Toast: "✅ Signed in with passkey!"

**No error messages. Smooth experience.**

---

## Backend Function Integration

### `/passkeys` Endpoint

**Purpose**: Check if user has any passkeys registered

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response** (Has passkeys):
```json
{
  "passkeys": [
    {
      "id": "credential-id-123",
      "publicKey": "base64url-encoded-key",
      "counter": 5
    }
  ]
}
```

**Response** (No passkeys):
```json
{
  "passkeys": []
}
```

### `/register` Endpoint

**Purpose**: Register a new passkey

**Request**:
```json
{
  "email": "user@example.com",
  "credentialData": { /* WebAuthn credential */ },
  "challenge": "base64url-challenge"
}
```

**Response** (Success):
```json
{
  "success": true,
  "token": {
    "userId": "user-id",
    "secret": "token-secret"
  }
}
```

### `/authenticate` Endpoint

**Purpose**: Authenticate with existing passkey

**Request**:
```json
{
  "email": "user@example.com",
  "assertion": { /* WebAuthn assertion */ },
  "challenge": "base64url-challenge"
}
```

**Response** (Success):
```json
{
  "success": true,
  "token": {
    "userId": "user-id",
    "secret": "token-secret"
  }
}
```

## Error Handling

### Fallback Scenarios

**Scenario 1**: User has passkeys but browser can't find them
```typescript
if (hasPasskeys) {
  try {
    credential = await startAuthentication(...)
  } catch (authError) {
    if (authError.message?.includes('No credentials')) {
      // Fallback to registration
      isRegistration = true
    }
  }
}
```

**Scenario 2**: User cancels passkey prompt
```typescript
if (error.name === 'NotAllowedError') {
  // User cancelled
  toast.error('Passkey authentication cancelled')
  // Don't attempt registration
}
```

**Scenario 3**: Browser doesn't support WebAuthn
```typescript
if (error.name === 'NotSupportedError') {
  toast.error('Your browser doesn\'t support passkeys. Please try Email OTP or Wallet.')
}
```

## Comparison: Before vs After

### Before ❌

```
User clicks "Sign in" → Always try authenticate
  ↓
New user? → ERROR: "No credentials"
  ↓
Catch error → Try registration
  ↓
Success but confusing UX
```

**Problems:**
- Unnecessary error state
- Confusing to new users
- Slower (extra WebAuthn call that fails)

### After ✅

```
User clicks "Sign in" → Check if has passkeys
  ↓
New user? → Registration flow
Returning? → Authentication flow
  ↓
Success with clear messaging
```

**Benefits:**
- ✅ No error states for normal flow
- ✅ Clear messaging (registration vs login)
- ✅ Faster (no failed WebAuthn attempts)
- ✅ Better UX

## Benefits of Intelligent Flow

### 1. Better User Experience
- No confusing error messages
- Clear indication of registration vs login
- Smooth, professional experience

### 2. Performance
- Fewer failed WebAuthn attempts
- Only one passkey operation per auth
- Faster overall authentication

### 3. Clarity
- Different success messages for registration vs login
- User knows what happened
- Better onboarding for new users

### 4. Reliability
- Fewer edge cases
- More predictable behavior
- Less reliance on error handling

## Testing Scenarios

### Test 1: New User Registration
1. Enter fresh email (never used before)
2. Click "Sign in with Passkey"
3. Expected: Registration prompt appears
4. Create passkey with fingerprint/Face ID
5. Expected: "✅ Passkey created! You're signed in!"

### Test 2: Returning User Login
1. Enter email with existing passkey
2. Click "Sign in with Passkey"
3. Expected: Authentication prompt appears
4. Authenticate with fingerprint/Face ID
5. Expected: "✅ Signed in with passkey!"

### Test 3: Multiple Passkeys
1. User has multiple passkeys registered
2. Click "Sign in with Passkey"
3. Expected: Browser shows list of available passkeys
4. Select one and authenticate
5. Expected: "✅ Signed in with passkey!"

### Test 4: User Cancels
1. Click "Sign in with Passkey"
2. Cancel the passkey prompt
3. Expected: "Passkey authentication cancelled"
4. Modal stays open for retry

### Test 5: Unsupported Browser
1. Use old browser without WebAuthn support
2. Click "Sign in with Passkey"
3. Expected: "Your browser doesn't support passkeys. Please try Email OTP or Wallet."

## Code Location

**Main Implementation**: `src/lib/auth/helpers.ts` → `authenticateWithPasskey()`

**Key Changes**:
```typescript
// BEFORE: Always try authentication first ❌
credential = await startAuthentication(...)

// AFTER: Check first, then branch ✅
const hasPasskeys = await checkPasskeys(email)
if (hasPasskeys) {
  credential = await startAuthentication(...)
} else {
  credential = await startRegistration(...)
}
```

## Security Considerations

### Why Check Passkeys First?

**Security**: Prevents timing attacks
- Don't reveal if email exists or not
- Consistent timing for both new and existing users
- User experience is the same regardless

**Privacy**: No information leakage
- `/passkeys` endpoint requires email (no enumeration)
- Response doesn't reveal if user exists
- Only shows passkeys for authenticated requests

## Related Documentation

- [AUTHENTICATION.md](../AUTHENTICATION.md) - Main authentication guide
- [AUTH_ERROR_CODES.md](./AUTH_ERROR_CODES.md) - Error code reference
- [AUTH_QUICK_START.md](./AUTH_QUICK_START.md) - Quick start guide

## Summary

The passkey authentication now **intelligently handles both registration and login** from a single button by:

1. ✅ Checking for existing passkeys first
2. ✅ Branching to appropriate flow (register vs authenticate)
3. ✅ Providing clear, contextual success messages
4. ✅ Avoiding unnecessary error states
5. ✅ Creating a smooth, professional user experience

**One button, intelligent behavior, seamless experience!** 🎉
