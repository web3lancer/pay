# Passkey Authentication Debugging Guide

## Current Status

Added comprehensive console logging to trace the entire passkey authentication flow.

## How to Debug

### Step 1: Open Browser Console

1. Open the app in your browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Clear console

### Step 2: Test Passkey Flow

1. Enter an email address
2. Click the "Passkey" button
3. Watch the console output

### Expected Console Output

#### For New User (Registration)

```
🔐 Button clicked! Email: newuser@example.com Submitting: false
🔐 Passkey auth button clicked, email: newuser@example.com
🔐 Starting passkey authentication...
🔐 Calling authenticateWithPasskey...
🔐 [authenticateWithPasskey] Starting for email: newuser@example.com
🔐 [authenticateWithPasskey] Challenge generated: dGhpc2lzYXJhbmRvbW...
🔐 [authenticateWithPasskey] Config: { rpId: 'yourdomain.com', rpName: 'LancerPay', functionId: '68e96634000b32505837' }
🔐 [authenticateWithPasskey] Checking for existing passkeys...
🔐 [authenticateWithPasskey] Has passkeys: false Count: 0
🔐 [authenticateWithPasskey] isRegistration: true
🔐 [authenticateWithPasskey] Calling startRegistration...
[Browser shows passkey registration prompt]
🔐 [authenticateWithPasskey] startRegistration successful
🔐 [authenticateWithPasskey] Calling function: /register with payload keys: ['email', 'credentialData', 'challenge']
🔐 [authenticateWithPasskey] Function response status: 200
🔐 [authenticateWithPasskey] Function result: { success: true, token: { userId: '...', secret: '...' } }
🔐 [authenticateWithPasskey] Creating session with token...
🔐 [authenticateWithPasskey] Session created successfully!
🔐 Passkey result: { success: true, token: { userId: '...', secret: '...' } }
```

#### For Existing User (Authentication)

```
🔐 Button clicked! Email: existing@example.com Submitting: false
🔐 Passkey auth button clicked, email: existing@example.com
🔐 Starting passkey authentication...
🔐 Calling authenticateWithPasskey...
🔐 [authenticateWithPasskey] Starting for email: existing@example.com
🔐 [authenticateWithPasskey] Challenge generated: YW5vdGhlcnJhbmRvb...
🔐 [authenticateWithPasskey] Config: { rpId: 'yourdomain.com', rpName: 'LancerPay', functionId: '68e96634000b32505837' }
🔐 [authenticateWithPasskey] Checking for existing passkeys...
🔐 [authenticateWithPasskey] Has passkeys: true Count: 1
🔐 [authenticateWithPasskey] isRegistration: false
🔐 [authenticateWithPasskey] User has passkeys, calling startAuthentication...
[Browser shows passkey authentication prompt]
🔐 [authenticateWithPasskey] startAuthentication successful
🔐 [authenticateWithPasskey] Calling function: /authenticate with payload keys: ['email', 'assertion', 'challenge']
🔐 [authenticateWithPasskey] Function response status: 200
🔐 [authenticateWithPasskey] Function result: { success: true, token: { userId: '...', secret: '...' } }
🔐 [authenticateWithPasskey] Creating session with token...
🔐 [authenticateWithPasskey] Session created successfully!
🔐 Passkey result: { success: true, token: { userId: '...', secret: '...' } }
```

## What to Look For

### If You See NO Console Output

**Problem**: Button click is not firing
**Possible Causes**:
1. Button is disabled (check `disabled={isSubmitting || !email}`)
2. Email is empty
3. JavaScript error preventing execution
4. Button component issue

**Solutions**:
1. Verify email has '@' character
2. Check browser console for JavaScript errors
3. Verify button is not disabled (should not be grayed out)

### If You See "Button clicked!" But Nothing After

**Problem**: Early return in `handlePasskeyAuth`
**Possible Causes**:
1. Email validation fails
2. `supportsWebAuthn()` returns false
3. Error thrown before `authenticateWithPasskey` is called

**Solutions**:
1. Verify email is valid
2. Check if browser supports WebAuthn (modern browsers only)
3. Look for toast error messages

### If You See "[authenticateWithPasskey] No function ID configured!"

**Problem**: Environment variable not set
**Solution**: Verify `.env` has `NEXT_PUBLIC_PASSKEY_FUNCTION_ID=68e96634000b32505837`

### If Stops at "Checking for existing passkeys..."

**Problem**: `/passkeys` endpoint call failing
**Possible Causes**:
1. Function ID is wrong
2. Function not deployed
3. Network error

**Solutions**:
1. Verify function ID in .env
2. Check Appwrite Console → Functions → Passkey Auth → Deployments
3. Check network tab for failed requests

### If Stops at "Calling startRegistration..." or "Calling startAuthentication..."

**Problem**: WebAuthn browser API failing
**Possible Causes**:
1. Not using HTTPS (required except for localhost)
2. RP_ID doesn't match domain
3. Browser doesn't support WebAuthn
4. User cancelled immediately

**Solutions**:
1. Use HTTPS or localhost
2. Verify `NEXT_PUBLIC_PASSKEY_RP_ID` matches your domain
3. Try different browser
4. Watch for browser passkey prompt

### If "startRegistration error:" or "startAuthentication error:"

**Problem**: WebAuthn failed
**Check Error Name**:
- `NotAllowedError`: User cancelled
- `NotSupportedError`: Browser doesn't support WebAuthn
- `SecurityError`: RP_ID or origin mismatch
- `InvalidStateError`: Credential already exists
- Other: See error message

### If "Function response status: 400/401/403/500"

**Problem**: Backend function error
**Check Function Result**:
- Look at the error message in the result
- Check Appwrite Function logs in console

### If Stops at "Creating session with token..."

**Problem**: Session creation failing
**Possible Causes**:
1. Invalid token
2. Token expired
3. Network error

**Solutions**:
1. Check token values in console
2. Try again immediately (tokens are short-lived)
3. Check network tab

## Common Issues and Solutions

### Issue 1: "Button does nothing, no console output"

**Debug Steps**:
1. Check if button is visible (should see "Passkey" button)
2. Check if button is enabled (should not be grayed out)
3. Enter valid email with '@' character
4. Open console BEFORE clicking
5. Click button and watch console

**Most Likely Cause**: Email field is empty or invalid

### Issue 2: "Browser passkey prompt doesn't appear"

**Debug Steps**:
1. Check console for WebAuthn errors
2. Verify you're on HTTPS or localhost
3. Check RP_ID matches domain
4. Try different browser

**Most Likely Cause**: HTTPS required or RP_ID mismatch

### Issue 3: "Registration works but authentication doesn't"

**Debug Steps**:
1. Check if passkeys are actually stored (Console → check `/passkeys` result)
2. Verify browser can find the credential
3. Check if RP_ID changed between registration and authentication

**Most Likely Cause**: RP_ID mismatch or browser data cleared

### Issue 4: "Function returns error"

**Debug Steps**:
1. Check Appwrite Console → Functions → Passkey Auth → Logs
2. Look for specific error message
3. Verify function environment variables are set
4. Check API key has correct permissions

**Most Likely Cause**: Function configuration or API key issue

## Quick Verification Checklist

- [ ] Email field has valid email with '@'
- [ ] Browser supports WebAuthn (modern browser)
- [ ] Using HTTPS or localhost
- [ ] `NEXT_PUBLIC_PASSKEY_FUNCTION_ID` is set in .env
- [ ] `NEXT_PUBLIC_PASSKEY_RP_ID` matches your domain  
- [ ] Function is deployed in Appwrite Console
- [ ] Function has correct environment variables
- [ ] No JavaScript errors in console

## Environment Variables Check

Run this in browser console to verify configuration:

```javascript
console.log('Function ID:', process.env.NEXT_PUBLIC_PASSKEY_FUNCTION_ID)
console.log('RP ID:', process.env.NEXT_PUBLIC_PASSKEY_RP_ID)
console.log('RP Name:', process.env.NEXT_PUBLIC_PASSKEY_RP_NAME)
console.log('Hostname:', window.location.hostname)
console.log('Has WebAuthn:', typeof window.PublicKeyCredential !== 'undefined')
```

## Next Steps

1. Test with the comprehensive logging
2. Share console output if issues persist
3. Check Appwrite Function logs
4. Verify environment variables

The logging will show EXACTLY where the flow breaks!
