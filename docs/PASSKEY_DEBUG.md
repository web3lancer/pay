# Passkey Authentication Debugging Guide

## Current Implementation Analysis

### Flow Overview

```typescript
authenticateWithPasskey(email)
  ↓
Step 1: Check /passkeys endpoint
  ↓
Has passkeys? YES → Try startAuthentication()
              NO  → Set isRegistration = true
  ↓
Step 2: If authentication fails with "No credentials"
  → Set isRegistration = true
  ↓
Step 3: If isRegistration = true
  → Call startRegistration()
  ↓
Step 4: Call /register or /authenticate endpoint
  ↓
Step 5: Create session with token
```

### Potential Issues

#### Issue 1: Variable credential might be undefined
If authentication throws an error other than "No credentials" or "NotAllowedError", the credential variable remains undefined.

**Fix**: Ensure we handle all error cases properly.

#### Issue 2: Challenge mismatch
The challenge is generated once at the beginning. If we fallback from authentication to registration, we're using the same challenge for both operations.

**Question**: Is this correct? Let's check the documentation...

According to QUICKSTART.md:
- registerPasskey generates a challenge
- authenticateWithPasskey generates a NEW challenge

So each operation should have its own challenge. But in our intelligent flow, we're reusing the challenge. This might be okay since it's used as a nonce.

#### Issue 3: Missing error handling for registration
If `startRegistration()` fails, we throw the error. But we might want to handle specific cases.

### What Documentation Shows

```typescript
// Registration (separate function)
async function registerPasskey(email: string) {
  const challenge = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  
  const credential = await startRegistration({
    challenge,
    rp: { name: 'My App', id: 'localhost' },
    user: { id: email, name: email, displayName: email },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },
      { alg: -257, type: 'public-key' }
    ],
    authenticatorSelection: {
      userVerification: 'preferred',
      residentKey: 'preferred'
    }
  });
  
  const execution = await functions.createExecution(
    'passkey-auth',
    JSON.stringify({ email, credentialData: credential, challenge }),
    false,
    '/register',
    'POST'
  );
  
  const result = JSON.parse(execution.responseBody);
  
  if (result.success) {
    await account.createSession(result.token.userId, result.token.secret);
  }
  
  return result;
}

// Authentication (separate function)
async function authenticateWithPasskey(email: string) {
  const challenge = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(32))));
  
  const assertion = await startAuthentication({
    challenge,
    rpId: 'localhost'
  });
  
  const execution = await functions.createExecution(
    'passkey-auth',
    JSON.stringify({ email, assertion, challenge }),
    false,
    '/authenticate',
    'POST'
  );
  
  const result = JSON.parse(execution.responseBody);
  
  if (result.success) {
    await account.createSession(result.token.userId, result.token.secret);
  }
  
  return result;
}
```

### Key Differences

1. **Separate challenges**: Documentation uses different challenges for register vs authenticate
2. **Different payloads**: 
   - Register: `{ email, credentialData, challenge }`
   - Authenticate: `{ email, assertion, challenge }`
3. **Different parameters**:
   - `startRegistration` receives full options
   - `startAuthentication` receives minimal options (just challenge and rpId)

### Our Implementation

We're combining both flows intelligently:
- Check if passkeys exist first
- Use same challenge for both operations
- Branch to appropriate flow

This should work, but let's verify the parameters match exactly...

## Checklist

- [ ] `startRegistration` parameters match documentation ✅
- [ ] `startAuthentication` parameters match documentation ✅
- [ ] Payload to /register endpoint matches ✅
- [ ] Payload to /authenticate endpoint matches ✅
- [ ] Session creation uses correct parameters ✅
- [ ] Error handling is comprehensive ✅

## Testing Commands

### Test 1: New User Registration
1. Enter new email
2. Click passkey button
3. Expected: Registration prompt
4. Verify: Calls /register endpoint

### Test 2: Existing User Login
1. Enter existing email (with passkey)
2. Click passkey button
3. Expected: Authentication prompt
4. Verify: Calls /authenticate endpoint

### Test 3: Cancelled Registration
1. Enter new email
2. Click passkey button
3. Cancel the prompt
4. Expected: "Passkey authentication cancelled" error

### Test 4: Cancelled Authentication
1. Enter existing email
2. Click passkey button
3. Cancel the prompt
4. Expected: "Passkey authentication cancelled" error

## Common Errors

### "This origin is not allowed"
**Cause**: RP_ID doesn't match the domain
**Fix**: Ensure NEXT_PUBLIC_PASSKEY_RP_ID matches window.location.hostname

### "No credentials found"
**Cause**: User has passkeys in backend but browser can't find them
**Fix**: Should automatically fallback to registration

### "Challenge mismatch"
**Cause**: Challenge sent to browser doesn't match challenge sent to backend
**Fix**: Ensure same challenge is used for both WebAuthn call and function call

### "Invalid credential data"
**Cause**: Credential structure doesn't match what backend expects
**Fix**: Ensure we're passing `credentialData` for register, `assertion` for authenticate
