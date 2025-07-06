import { Client, Account, Databases, Storage, ID, Query, Avatars, AuthenticationFactor, Permission, Role } from 'appwrite'

// Initialize Appwrite client
const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

// Initialize services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export const avatars = new Avatars(client)
export { ID, Query }

// Database and collection IDs from environment variables
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!

// Collection IDs from environment variables - no hardcoded values
export const COLLECTION_IDS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
  WALLETS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WALLETS!,
  TOKENS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOKENS!,
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS!,
  PAYMENT_REQUESTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENT_REQUESTS!,
  EXCHANGE_RATES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXCHANGE_RATES!,
  SECURITY_LOGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SECURITY_LOGS!,
  API_KEYS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_API_KEYS!,
  VIRTUAL_CARDS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VIRTUAL_CARDS!,
  VIRTUAL_ACCOUNTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_VIRTUAL_ACCOUNTS!
} as const

// Storage bucket IDs from environment variables - no hardcoded values
export const BUCKET_IDS = {
  USER_ASSETS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_USER_ASSETS!,
  APP_ASSETS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_APP_ASSETS!,
  DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS!,
  BACKUPS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BACKUPS!,
  SYSTEM_LOGS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_SYSTEM_LOGS!,
  TEMP_FILES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TEMP_FILES!,
}

// --- Account/Auth Flows ---

// Email/password signup (with name)
export async function signupEmailPassword(email: string, password: string, name: string, userId: string = ID.unique()) {
  return account.create(userId, email, password, name)
}

// Email/password login
export async function loginEmailPassword(email: string, password: string) {
  return account.createEmailPasswordSession(email, password)
}

// Send email verification
export async function sendEmailVerification(redirectUrl: string) {
  return account.createVerification(redirectUrl)
}

// Complete email verification
// export async function completeEmailVerification(userId: string, secret: string) {
//   return account.updateVerification(userId, secret)
// }

// Fetch current user's verification status
export async function getEmailVerificationStatus() {
  const user = await account.get()
  // Appwrite returns user.emailVerification as a boolean
  return user.emailVerification
}

// Password recovery (send email)
export async function sendPasswordRecovery(email: string, redirectUrl: string) {
  return account.createRecovery(email, redirectUrl)
}

// Complete password recovery
export async function completePasswordRecovery(userId: string, secret: string, newPassword: string) {
  return account.updateRecovery(userId, secret, newPassword)
}

// Magic URL login (send email)
export async function sendMagicUrl(email: string, redirectUrl: string, userId: string = ID.unique()) {
  return account.createMagicURLToken(userId, email, redirectUrl)
}

// Complete Magic URL login (create session)
export async function completeMagicUrlLogin(userId: string, secret: string) {
  return account.createSession(userId, secret)
}

// Email OTP (send code)
export async function sendEmailOtp(email: string, userId: string = ID.unique(), enableSecurityPhrase = false) {
  return account.createEmailToken(userId, email, enableSecurityPhrase)
}

// Complete Email OTP login
export async function completeEmailOtpLogin(userId: string, secret: string) {
  return account.createSession(userId, secret)
}

// --- MFA / 2FA Helpers ---

/**
 * Generate recovery codes for MFA (single-use passwords for account recovery).
 */
export async function generateMfaRecoveryCodes(): Promise<{ recoveryCodes: string[] }> {
  return account.createMfaRecoveryCodes()
}

/**
 * List enabled MFA factors for the current user.
 * Returns: { totp: boolean, email: boolean }
 */
export async function listMfaFactors(): Promise<{ totp: boolean; email: boolean }> {
  // Only return totp and email
  const factors = await account.listMfaFactors()
  return { totp: factors.totp, email: factors.email }
}

/**
 * Enable or disable MFA enforcement on the account.
 * User must have at least 2 factors before MFA is enforced.
 */
export async function setMfaEnabled(enabled: boolean) {
  return account.updateMFA(enabled)
}

/**
 * Add TOTP authenticator factor (returns QR code URL and secret for authenticator app).
 */
export async function addTotpFactor(): Promise<{ qrUrl: string; secret: string }> {
  // Appwrite JS SDK: createMfaAuthenticator is not yet available, so skip for now.
  // Placeholder for when SDK supports it.
  throw new Error('TOTP factor enrollment is not supported in Appwrite JS SDK yet.')
}

/**
 * Remove TOTP authenticator factor.
 */
export async function removeTotpFactor(): Promise<void> {
  // Appwrite JS SDK: deleteMfaAuthenticator is not yet available, so skip for now.
  // Placeholder for when SDK supports it.
  throw new Error('TOTP factor removal is not supported in Appwrite JS SDK yet.')
}

/**
 * Verify TOTP factor by creating and completing a challenge.
 */
export async function verifyTotpFactor(otp: string): Promise<boolean> {
  try {
    const challenge = await account.createMfaChallenge(AuthenticationFactor.Totp)
    await account.updateMfaChallenge(challenge.$id, otp)
    return true
  } catch {
    return false
  }
}

/**
 * Create MFA challenge for login flow.
 * factor: AuthenticationFactor.Totp | AuthenticationFactor.Email
 */
export async function createMfaChallenge(
  factor: AuthenticationFactor.Totp | AuthenticationFactor.Email
) {
  return account.createMfaChallenge(factor)
}

/**
 * Complete MFA challenge with code.
 */
export async function completeMfaChallenge(challengeId: string, code: string) {
  return account.updateMfaChallenge(challengeId, code)
}

/**
 * Check if user needs MFA after login.
 * Throws 'user_more_factors_required' error if MFA is needed.
 */
export async function checkMfaRequired() {
  return account.get()
}

/**
 * Add Email as an MFA factor (must be verified first).
 * If not verified, sends a verification email.
 */
export async function addEmailFactor(email: string, password?: string): Promise<{ email: string }> {
  try {
    const factors = await listMfaFactors()
    if (factors.email) return { email }
    if (password) await account.updateEmail(email, password)
    await account.createVerification(window.location.origin + "/verify-email")
    return { email }
  } catch {
    return { email }
  }
}

/**
 * Complete email verification for MFA (after user clicks link in email).
 * Call this with the userId and secret from the verification link.
 */
export async function completeEmailVerification(userId: string, secret: string): Promise<void> {
  await account.updateVerification(userId, secret)
}

// Preferences: Update
export async function updatePreferences(prefs: Record<string, any>) {
  return account.updatePrefs(prefs)
}

// Preferences: Get
export async function getPreferences() {
  return account.getPrefs()
}

// Account: Get current session/account
export async function getAccount() {
  return account.get()
}

// Account: Logout (delete session)
export async function logout(sessionId?: string) {
  if (sessionId) {
    return account.deleteSession(sessionId)
  }
  return account.deleteSessions()
}

// --- User CRUD ---
export async function getUser(userId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTION_IDS.USERS, userId)
}
export async function updateUser(userId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.USERS, userId, data)
}
export async function deleteUser(userId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.USERS, userId)
}

// --- Wallet CRUD ---
export async function createWallet(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.WALLETS, ID.unique(), data)
}
export async function getWallet(walletId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTION_IDS.WALLETS, walletId)
}
export async function listWalletsByUser(userId: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.WALLETS, [Query.equal('userId', userId)])
}
export async function updateWallet(walletId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.WALLETS, walletId, data)
}
export async function deleteWallet(walletId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.WALLETS, walletId)
}

// --- Token CRUD ---
export async function createToken(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.TOKENS, ID.unique(), data)
}
export async function getToken(tokenId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTION_IDS.TOKENS, tokenId)
}
export async function listTokens() {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.TOKENS)
}
export async function updateToken(tokenId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.TOKENS, tokenId, data)
}
export async function deleteToken(tokenId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.TOKENS, tokenId)
}

// --- Transaction CRUD ---
export async function createTransaction(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.TRANSACTIONS, ID.unique(), data)
}
export async function getTransaction(transactionId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTION_IDS.TRANSACTIONS, transactionId)
}


export async function listTransactionsByUser(userId: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.TRANSACTIONS,
    [
      Query.or([
        Query.equal('fromUserId', userId),
        Query.contains('toUserId', userId)
      ])
    ]
  )
}


export async function updateTransaction(transactionId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.TRANSACTIONS, transactionId, data)
}
export async function deleteTransaction(transactionId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.TRANSACTIONS, transactionId)
}

// --- Payment Request CRUD ---
export async function createPaymentRequest(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.PAYMENT_REQUESTS, ID.unique(), data)
}
export async function getPaymentRequest(requestId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTION_IDS.PAYMENT_REQUESTS, requestId)
}
export async function listPaymentRequestsByUser(userId: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.PAYMENT_REQUESTS, [Query.equal('fromUserId', userId)])
}
export async function updatePaymentRequest(requestId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.PAYMENT_REQUESTS, requestId, data)
}
export async function deletePaymentRequest(requestId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.PAYMENT_REQUESTS, requestId)
}

// --- Virtual Card CRUD ---
export async function createVirtualCard(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_CARDS, ID.unique(), data)
}
export async function getVirtualCard(cardId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_CARDS, cardId)
}
export async function listVirtualCardsByUser(userId: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.VIRTUAL_CARDS, [Query.equal('userId', userId)])
}
export async function updateVirtualCard(cardId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_CARDS, cardId, data)
}
export async function deleteVirtualCard(cardId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_CARDS, cardId)
}

// --- Virtual Account CRUD ---
export async function createVirtualAccount(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_ACCOUNTS, ID.unique(), data)
}
export async function getVirtualAccount(accountId: string) {
  return databases.getDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_ACCOUNTS, accountId)
}
export async function listVirtualAccountsByUser(userId: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.VIRTUAL_ACCOUNTS, [Query.equal('userId', userId)])
}
export async function updateVirtualAccount(accountId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_ACCOUNTS, accountId, data)
}
export async function deleteVirtualAccount(accountId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.VIRTUAL_ACCOUNTS, accountId)
}

// --- Security Logs CRUD ---
export async function createSecurityLog(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.SECURITY_LOGS, ID.unique(), data)
}
export async function listSecurityLogsByUser(userId: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.SECURITY_LOGS, [Query.equal('userId', userId)])
}

// --- API Keys CRUD ---
export async function createApiKey(data: any) {
  return databases.createDocument(DATABASE_ID, COLLECTION_IDS.API_KEYS, ID.unique(), data)
}
export async function listApiKeysByUser(userId: string) {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.API_KEYS, [Query.equal('userId', userId)])
}
export async function updateApiKey(keyId: string, data: Partial<any>) {
  return databases.updateDocument(DATABASE_ID, COLLECTION_IDS.API_KEYS, keyId, data)
}
export async function deleteApiKey(keyId: string) {
  return databases.deleteDocument(DATABASE_ID, COLLECTION_IDS.API_KEYS, keyId)
}

// --- Exchange Rates ---
export async function listExchangeRates() {
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.EXCHANGE_RATES)
}

// --- Utility: List documents with query ---
export async function listDocuments(collectionId: string, queries: any[] = []) {
  return databases.listDocuments(DATABASE_ID, collectionId, queries)
}

// --- Utility: Get document by ID ---
export async function getDocument(collectionId: string, documentId: string) {
  return databases.getDocument(DATABASE_ID, collectionId, documentId)
}

// --- Utility: Update document by ID ---
export async function updateDocument(collectionId: string, documentId: string, data: any) {
  return databases.updateDocument(DATABASE_ID, collectionId, documentId, data)
}

// --- Utility: Delete document by ID ---
export async function deleteDocument(collectionId: string, documentId: string) {
  return databases.deleteDocument(DATABASE_ID, collectionId, documentId)
}

// --- Payment Logic (example: mark payment request as paid, create transaction, etc.) ---
export async function markPaymentRequestPaid(requestId: string, paymentTxId: string) {
  return updatePaymentRequest(requestId, { status: 'paid', paymentTxId, paidAt: new Date().toISOString() })
}
export async function createPaymentAndTransaction(paymentRequest: any, transactionData: any) {
  // Mark payment request as paid and create transaction
  await markPaymentRequestPaid(paymentRequest.$id, transactionData.transactionId)
  return createTransaction(transactionData)
}

// --- Card Logic (example: freeze/unfreeze card) ---
export async function freezeVirtualCard(cardId: string) {
  return updateVirtualCard(cardId, { status: 'frozen' })
}
export async function unfreezeVirtualCard(cardId: string) {
  return updateVirtualCard(cardId, { status: 'active' })
}

// --- Account Logic (example: close account) ---
export async function closeVirtualAccount(accountId: string) {
  return updateVirtualAccount(accountId, { status: 'closed' })
}

// --- Session and User Helpers ---

/**
 * Check if the current session is valid (authenticated).
 * Returns true if authenticated, false otherwise.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    await account.get();
    return true;
  } catch {
    return false;
  }
}

/**
 * Refresh the current session (if supported by Appwrite).
 * For Appwrite, you may want to re-fetch the session/account.
 */
export async function refreshSession() {
  return account.get();
}

/**
 * Delete the current session (logout).
 */
export async function logoutCurrent() {
  try {
    await account.deleteSession('current');
  } catch {}
}

/**
 * Get the current user's ID (if authenticated).
 * Returns userId string or null.
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await account.get();
    // Appwrite returns $id as the user ID
    return user.$id || null;
  } catch {
    return null;
  }
}

/**
 * Check if the current user's email is verified.
 * Returns true if verified, false otherwise.
 */
export async function isEmailVerified(): Promise<boolean> {
  try {
    const user = await account.get();
    return !!user.emailVerification;
  } catch {
    return false;
  }
}

/**
 * Get the current user's MFA status (enabled, factors).
 * Returns { enabled: boolean, factors: { totp: boolean, email: boolean } }
 */
export async function getMfaStatus(): Promise<{ enabled: boolean; factors: { totp: boolean; email: boolean } }> {
  try {
    const factors = await listMfaFactors();
    let enabled = false;
    try {
      await checkMfaRequired();
      enabled = false;
    } catch (error: any) {
      if (error.type === 'user_more_factors_required') {
        enabled = true;
      }
    }
    return { enabled, factors };
  } catch {
    return { enabled: false, factors: { totp: false, email: false } };
  }
}

/**
 * List all sessions for the current user.
 */
export async function listSessions() {
  return account.listSessions();
}

/**
 * Logout all sessions except the current one.
 */
export async function logoutAllExceptCurrent() {
  const sessions = await account.listSessions();
  const current = sessions.sessions.find((s: any) => s.current);
  await Promise.all(
    sessions.sessions
      .filter((s: any) => !s.current)
      .map((s: any) => account.deleteSession(s.$id))
  );
  return current;
}

// --- ADVANCED USER OPERATIONS ---

/**
 * Find user by email.
 */
export async function findUserByEmail(email: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.USERS,
    [Query.equal('email', email)]
  );
  return res.documents[0] || null;
}

/**
 * Find user by username (public, no authentication required).
 * Returns the user document from the Users collection, or null if not found.
 */
export async function findUserByUsername(username: string) {
  try {
    // Canonize username for consistency
    const canon = canonizeUsername(username)
    if (!canon) return null
    
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      [Query.equal('username', canon)]
    );
    return res.documents[0] || null;
  } catch (error: any) {
    console.error('Error finding user by username:', error);
    // If it's an authorization error, return null instead of throwing
    if (error?.type === 'user_unauthorized' || error?.code === 401) {
      return null;
    }
    throw error;
  }
}

/**
 * Find user by userId (fallback method for public profile access)
 */
export async function findUserById(userId: string) {
  try {
    // Use Query.equal for userId since it's not an array field
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      [Query.equal('userId', userId)]
    );
    return res.documents[0] || null;
  } catch (error: any) {
    console.error('Error finding user by ID:', error);
    if (error?.type === 'user_unauthorized' || error?.code === 401) {
      return null;
    }
    throw error;
  }
}

/**
 * List all users (paginated).
 */
export async function listUsers(limit = 25, offset = 0) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.USERS,
    [Query.limit(limit), Query.offset(offset)]
  );
}

/**
 * Test function to check if we can read from Users collection
 */
export async function testUsersCollectionAccess() {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      [Query.limit(1)]
    );
    console.log('Users collection access test successful:', res);
    return true;
  } catch (error: any) {
    console.error('Users collection access test failed:', error);
    return false;
  }
}

// --- WALLET OPERATIONS ---

/**
 * Find wallet by address.
 */
export async function findWalletByAddress(walletAddress: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.WALLETS,
    [Query.equal('walletAddress', walletAddress)]
  );
  return res.documents[0] || null;
}

/**
 * List wallets by blockchain.
 */
export async function listWalletsByBlockchain(blockchain: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.WALLETS,
    [Query.equal('blockchain', blockchain)]
  );
}

// --- TOKEN OPERATIONS ---

/**
 * Find token by symbol.
 */
export async function findTokenBySymbol(symbol: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.TOKENS,
    [Query.equal('symbol', symbol)]
  );
  return res.documents[0] || null;
}

/**
 * List tokens by blockchain.
 */
export async function listTokensByBlockchain(blockchain: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.TOKENS,
    [Query.equal('blockchain', blockchain)]
  );
}

// --- TRANSACTION OPERATIONS ---

/**
 * List transactions by wallet.
 */
export async function listTransactionsByWallet(walletId: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.TRANSACTIONS,
    [Query.equal('fromWalletId', walletId)]
  );
}

/**
 * List transactions by token.
 */
export async function listTransactionsByToken(tokenId: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.TRANSACTIONS,
    [Query.equal('tokenId', tokenId)]
  );
}

/**
 * Search transactions by status/type.
 */
export async function searchTransactions({ status, type }: { status?: string; type?: string }) {
  const queries = [];
  if (status) queries.push(Query.equal('status', status));
  if (type) queries.push(Query.equal('type', type));
  return databases.listDocuments(DATABASE_ID, COLLECTION_IDS.TRANSACTIONS, queries);
}

// --- PAYMENT REQUEST OPERATIONS ---

/**
 * List payment requests by status.
 */
export async function listPaymentRequestsByStatus(status: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.PAYMENT_REQUESTS,
    [Query.equal('status', status)]
  );
}

/**
 * Find payment request by invoice number.
 */
export async function findPaymentRequestByInvoice(invoiceNumber: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.PAYMENT_REQUESTS,
    [Query.equal('invoiceNumber', invoiceNumber)]
  );
  return res.documents[0] || null;
}

// --- VIRTUAL CARD OPERATIONS ---

/**
 * Find card by card number.
 */
export async function findCardByNumber(cardNumber: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.VIRTUAL_CARDS,
    [Query.equal('cardNumber', cardNumber)]
  );
  return res.documents[0] || null;
}

/**
 * List cards by status.
 */
export async function listCardsByStatus(status: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.VIRTUAL_CARDS,
    [Query.equal('status', status)]
  );
}

// --- VIRTUAL ACCOUNT OPERATIONS ---

/**
 * Find account by account number.
 */
export async function findAccountByNumber(accountNumber: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.VIRTUAL_ACCOUNTS,
    [Query.equal('accountNumber', accountNumber)]
  );
  return res.documents[0] || null;
}

/**
 * List accounts by status.
 */
export async function listAccountsByStatus(status: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.VIRTUAL_ACCOUNTS,
    [Query.equal('status', status)]
  );
}

// --- SECURITY LOGS OPERATIONS ---

/**
 * List security logs by action.
 */
export async function listSecurityLogsByAction(action: string) {
  return databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.SECURITY_LOGS,
    [Query.equal('action', action)]
  );
}

// --- API KEYS OPERATIONS ---

/**
 * Find API key by public key.
 */
export async function findApiKeyByPublicKey(publicKey: string) {
  const res = await databases.listDocuments(
    DATABASE_ID,
    COLLECTION_IDS.API_KEYS,
    [Query.equal('publicKey', publicKey)]
  );
  return res.documents[0] || null;
}

// --- GENERAL UTILITY OPERATIONS ---

/**
 * Search any collection by field and value.
 */
export async function searchCollection(collectionId: string, field: string, value: string) {
  return databases.listDocuments(
    DATABASE_ID,
    collectionId,
    [Query.equal(field, value)]
  );
}

/**
 * Paginate any collection.
 */
export async function paginateCollection(collectionId: string, limit = 25, offset = 0) {
  return databases.listDocuments(
    DATABASE_ID,
    collectionId,
    [Query.limit(limit), Query.offset(offset)]
  );
}

/**
 * Count documents in a collection (with optional query).
 */
export async function countDocuments(collectionId: string, queries: any[] = []) {
  const res = await databases.listDocuments(DATABASE_ID, collectionId, queries);
  return res.total;
}

// --- LINKING/RELATIONSHIP OPERATIONS ---

/**
 * Link a wallet to a user (update wallet's userId).
 */
export async function linkWalletToUser(walletId: string, userId: string) {
  return updateWallet(walletId, { userId });
}

/**
 * Link a card to a wallet (update card's linkedWalletId).
 */
export async function linkCardToWallet(cardId: string, walletId: string) {
  return updateVirtualCard(cardId, { linkedWalletId: walletId });
}

/**
 * Link an account to a wallet (update account's linkedWalletId).
 */
export async function linkAccountToWallet(accountId: string, walletId: string) {
  return updateVirtualAccount(accountId, { linkedWalletId: walletId });
}

// --- ADVANCED PAYMENT LOGIC ---

/**
 * Cancel a payment request.
 */
export async function cancelPaymentRequest(requestId: string) {
  return updatePaymentRequest(requestId, { status: 'cancelled' });
}

/**
 * Expire a payment request.
 */
export async function expirePaymentRequest(requestId: string) {
  return updatePaymentRequest(requestId, { status: 'expired' });
}

/**
 * Mark a transaction as failed.
 */
export async function markTransactionFailed(transactionId: string, reason?: string) {
  return updateTransaction(transactionId, { status: 'failed', description: reason });
}

/**
 * Mark a transaction as confirmed.
 */
export async function markTransactionConfirmed(transactionId: string) {
  return updateTransaction(transactionId, { status: 'confirmed', confirmedAt: new Date().toISOString() });
}

// --- ADVANCED CARD LOGIC ---

/**
 * Delete (revoke) a virtual card.
 */
export async function revokeVirtualCard(cardId: string) {
  return updateVirtualCard(cardId, { status: 'revoked' });
}

// --- ADVANCED ACCOUNT LOGIC ---

// Assumes updateVirtualAccount, createSecurityLog, databases, DATABASE_ID, and COLLECTION_IDS are imported/defined elsewhere
// Also assumes 'client' is defined elsewhere in your codebase

/**
 * Freeze a virtual account.
 */
export async function freezeVirtualAccount(accountId: string) {
  return updateVirtualAccount(accountId, { status: 'frozen' });
}

/**
 * Reactivate a virtual account.
 */
export async function reactivateVirtualAccount(accountId: string) {
  return updateVirtualAccount(accountId, { status: 'active' });
}

/**
 * Log a security event for a user.
 */
export async function logSecurityEvent(userId: string, action: string, metadata: any = {}) {
  return createSecurityLog({
    userId,
    action,
    metadata,
    createdAt: new Date().toISOString(),
  });
}

/**
 * Get current user profile from Appwrite Users collection.
 * First try to get existing profile, else create one.
 */
export async function getCurrentUserProfile(): Promise<any | null> {
  try {
    // Get current Appwrite account
    const acc = await account.get();
    // Try to fetch existing user profile
    try {
      const profile = await databases.getDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        acc.$id
      );
      return profile;
    } catch (err) {
      // Not found, create profile
      console.log('Creating user profile for:', acc.$id);
      const newProfile = {
        userId: acc.$id,
        email: acc.email,
        displayName: acc.name || acc.email.split('@')[0],
        phoneNumber: null,
        kycStatus: 'pending',
        kycLevel: 0,
        twoFactorEnabled: false,
        isActive: true,
        country: null,
        timezone: null,
        preferredCurrency: 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const createdProfile = await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        acc.$id, // Use Appwrite account ID as document ID
        newProfile
      );
      return createdProfile;
    }
  } catch (error) {
    console.error('Failed to get/create user profile:', error);
    return null;
  }
}

/**
 * Canonize a username for URLs: lowercase, replace spaces and invalid chars with underscores.
 */
export function canonizeUsername(username?: string): string | undefined {
  if (!username || typeof username !== 'string') return undefined;
  // Replace spaces and non-alphanumeric/underscore with underscores, then lowercase
  return username.trim().replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_').toLowerCase();
}

/**
 * Get the best profile link for a user (canonized username if exists, else userId).
 * Returns: /u/{username} or /u/{userId}
 */
export function getUserProfileLink(user: { username?: string; userId?: string }) {
  const canon = canonizeUsername(user?.username);
  if (canon && canon !== '') {
    return `/u/${canon}`;
  }
  if (user?.userId && typeof user.userId === 'string' && user.userId.trim() !== '') {
    return `/u/${user.userId}`;
  }
  return '/';
}

export default client;