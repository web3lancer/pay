# Passkey Fix: Base64URL Encoding Issue

## Problem Identified

The passkey authentication was failing with the error:
```
Failed to execute 'atob' on 'Window': The string to be decoded is not correctly encoded.
```

## Root Cause

The challenge was being generated using **standard base64** encoding:
```javascript
const challenge = btoa(String.fromCharCode(...challengeArray))
```

However, WebAuthn and the example client code require **base64url** encoding (RFC 4648), which is a URL-safe variant of base64 that:
- Replaces `+` with `-`
- Replaces `/` with `_`  
- Removes padding `=` characters

When the server tried to decode the standard base64 challenge, it failed because it might contain `+` or `/` characters that get mangled during HTTP transport or cause decoding issues.

## Solution

Changed the challenge generation to use base64url encoding:

```javascript
// Generate random challenge (base64url encoded per WebAuthn spec)
const challengeArray = crypto.getRandomValues(new Uint8Array(32))
const challenge = btoa(String.fromCharCode(...challengeArray))
  .replace(/\+/g, '-')   // Replace + with -
  .replace(/\//g, '_')   // Replace / with _
  .replace(/=+$/, '')    // Remove padding =
```

This matches the `generateChallenge()` function in the official `example-client.ts` (lines 30-37).

## Why This Matters

1. **HTTP Safety**: Base64url encoding is safe for URLs and HTTP headers
2. **WebAuthn Standard**: WebAuthn spec uses base64url for binary data
3. **Consistency**: Matches the example implementation that works in other apps
4. **No Double-Encoding**: Prevents encoding issues during transport

## Files Modified

- ✅ `src/lib/auth/helpers.ts` - Updated `authenticateWithPasskey()` function

## Verification

After this fix:
1. Challenge will be properly base64url encoded
2. Server will successfully decode the challenge
3. Passkey registration and authentication will work correctly
4. The implementation now matches the working example-client.ts

## Reference

- **Example Client**: `ignore1/function_appwrite_passkey/example-client.ts` (lines 30-37)
- **WebAuthn Spec**: Uses base64url for all binary data encoding
- **RFC 4648**: Base64url encoding specification

## Next Steps

Test passkey authentication again - it should now work correctly! 🎉
