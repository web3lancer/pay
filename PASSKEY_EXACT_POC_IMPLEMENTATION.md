# PASSKEY IMPLEMENTATION - EXACT POC COPY

## What I Did Wrong Initially

1. **Tried to be "smart" with unified method** - Added `authenticateOrRegister()` method that wasn't in the POC
2. **Added unnecessary check endpoint** - `/api/passkey/check` doesn't exist in POC
3. **Wrong Appwrite SDK version** - Used v18 instead of v20
4. **Misunderstood the session creation** - Thought it should be two params, but v20 uses an object

## What I Fixed

### 1. Copied EXACT POC Files
- `lib/passkey-server.ts` - Exact copy from POC
- `lib/simple-passkeys.ts` - Exact copy from POC  
- `lib/appwrite-client.ts` - Exact copy from POC (was appwrite.ts)

### 2. Upgraded Appwrite SDK
```bash
npm install appwrite@^20.1.0
```

Now matches POC exactly (v20.1.0)

### 3. Two Separate Methods (POC Pattern)
```typescript
// In helpers.ts
export async function registerPasskey({ email })
export async function authenticateWithPasskey({ email })
```

NO unified method. User/UI must choose which to call.

### 4. Session Creation (Correct Syntax for v20)
```typescript
await account.createSession({
  userId: result.token.userId,
  secret: result.token.secret
});
```

Uses object with `userId` and `secret` properties (Appwrite SDK v20).

## How POC Works

### Registration Flow
1. User enters email
2. Clicks "Register Passkey" button
3. `SimplePasskeyAuth.register(email)` called
4. Generates registration options client-side
5. Browser shows "Create passkey" prompt
6. User approves (Touch ID, etc.)
7. Credential sent to `/api/passkey/register`
8. Server:
   - Calls `PasskeyServer.registerPasskey()`
   - Creates/finds user with `prepareUser()`
   - Verifies credential with `@simplewebauthn/server`
   - Stores in `user.prefs.passkey_credentials` (JSON string)
   - Stores counter in `user.prefs.passkey_counter` (JSON string)
   - Creates token with `users.createToken()`
   - Returns `{ success: true, token: { userId, secret } }`
9. Client:
   - Receives token
   - Calls `account.createSession({ userId, secret })`
   - User is now logged in ✓

### Authentication Flow
1. User enters email
2. Clicks "Sign In with Passkey" button
3. `SimplePasskeyAuth.authenticate(email)` called
4. Generates authentication options client-side
5. Browser shows "Sign in with passkey" prompt
6. User approves (Touch ID, etc.)
7. Assertion sent to `/api/passkey/auth`
8. Server:
   - Calls `PasskeyServer.authenticatePasskey()`
   - Gets user with `prepareUser()`
   - Retrieves stored credentials from `user.prefs.passkey_credentials`
   - Verifies assertion with `@simplewebauthn/server`
   - Updates counter in `user.prefs.passkey_counter`
   - Creates token with `users.createToken()`
   - Returns `{ success: true, token: { userId, secret } }`
9. Client:
   - Receives token
   - Calls `account.createSession({ userId, secret })`
   - User is now logged in ✓

## Key Points About POC

### User Preferences Storage
Passkeys are stored in Appwrite Users preferences:
```json
{
  "passkey_credentials": "{\"credId1\":\"publicKey1\",\"credId2\":\"publicKey2\"}",
  "passkey_counter": "{\"credId1\":0,\"credId2\":0}"
}
```

- `passkey_credentials` - Maps credential IDs to public keys (JSON string)
- `passkey_counter` - Maps credential IDs to counters (JSON string)
- Stored via `users.updatePrefs()` (node-appwrite SDK)

### prepareUser() Method
```typescript
async prepareUser(email: string) {
  // Find existing by email
  const usersList = await users.list([Query.equal('email', email), Query.limit(1)]);
  if ((usersList as any).users?.length > 0) {
    return (usersList as any).users[0];
  }
  // Create with Appwrite unique ID
  return await users.create(ID.unique(), email);
}
```

This method:
- Searches for user by email
- If found, returns existing user
- If not found, creates new user with email
- Uses Appwrite Users API (server-side)
- Requires APPWRITE_API_KEY with users.read and users.write permissions

### Session Creation
```typescript
await account.createSession({
  userId: token.userId,
  secret: token.secret
});
```

- Creates Appwrite session from custom token
- Token generated server-side with `users.createToken()`
- Session created client-side with `account.createSession()`
- Once session is created, user is authenticated
- Can then call `account.get()` to get user info

## Files Structure

```
src/
├── lib/
│   ├── appwrite-client.ts (NEW - client-side Appwrite setup)
│   ├── passkey-server.ts (server-side passkey logic)
│   └── simple-passkeys.ts (client-side passkey logic)
├── app/api/passkey/
│   ├── register/route.ts
│   └── auth/route.ts
└── lib/auth/
    └── helpers.ts (wrapper functions)
```

## Environment Variables

```bash
# Appwrite Config
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id

# Server-side API Key (users.read + users.write)
APPWRITE_API_KEY=your-api-key

# Passkey Config
NEXT_PUBLIC_RP_ID=localhost
NEXT_PUBLIC_RP_NAME=Web3 Pay
NEXT_PUBLIC_ORIGIN=http://localhost:3000
```

## Usage in UI

The POC has TWO BUTTONS:

```tsx
<button onClick={() => passkeyAuth.register(email)}>
  Register Passkey
</button>

<button onClick={() => passkeyAuth.authenticate(email)}>
  Sign In with Passkey
</button>
```

If you want ONE BUTTON that intelligently decides, you need to:
1. Check if user has passkeys (call server to check `user.prefs.passkey_credentials`)
2. If has passkeys → call `authenticate()`
3. If no passkeys → call `register()`

But this is NOT in the POC - the POC explicitly has two separate buttons.

## Testing

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Enter email
4. Click "Register Passkey"
5. Browser prompts "Create passkey"
6. Approve with Touch ID / Face ID
7. Check console - should see success
8. Check Appwrite Console → Users → Click user → Preferences tab
9. Should see `passkey_credentials` and `passkey_counter`
10. Try "Sign In with Passkey" with same email
11. Should work!

## What's Different from My Initial Implementation

| Initial (Wrong) | Corrected (POC) |
|-----------------|-----------------|
| One `authenticateOrRegister()` method | Two separate methods |
| Added `/api/passkey/check` endpoint | No check endpoint |
| Appwrite SDK v18 | Appwrite SDK v20 |
| Tried to be smart | Exact POC copy |
| Created own client setup | Used POC's appwrite.ts |
| Wrong session creation syntax | Correct object syntax |

## Summary

I've now replaced the implementation with the EXACT POC code:
- ✅ Copied all lib files exactly
- ✅ Upgraded to Appwrite v20
- ✅ Removed custom check endpoint
- ✅ Removed unified method
- ✅ Fixed session creation syntax
- ✅ Two separate methods (register/authenticate)
- ✅ Exact same file structure

The implementation now matches the POC exactly. It will:
- Store passkeys in user.prefs
- Create sessions properly
- Work exactly like the POC
