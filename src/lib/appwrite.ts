import { Client, Account, Databases, Storage, ID, Query, Avatars, AuthenticationFactor } from 'appwrite'

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
  API_KEYS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_API_KEYS!
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
export async function completeEmailVerification(userId: string, secret: string) {
  return account.updateVerification(userId, secret)
}

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

// MFA: Generate recovery codes
export async function generateMfaRecoveryCodes() {
  return account.createMfaRecoveryCodes()
}

// MFA: List enabled factors
export async function listMfaFactors() {
  return account.listMfaFactors()
}

// MFA: Enable/disable MFA
export async function setMfaEnabled(enabled: boolean) {
  return account.updateMFA(enabled)
}

// MFA: Create challenge (email, phone, totp, recoverycode)
export async function createMfaChallenge(factor: 'email' | 'phone' | 'totp' | 'recoverycode') {
  return account.createMfaChallenge(factor)
}

// MFA: Complete challenge
export async function completeMfaChallenge(challengeId: string, otp: string) {
  return account.updateMfaChallenge(challengeId, otp)
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

export default client