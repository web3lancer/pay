/**
 * Appwrite Library - Main Export
 * Provides all Appwrite/PayDB operations for PayLancer Capital
 */

// Core client
export { account, tablesdb, client, PAYDB_ID, PAYDB_TABLES } from './client'

// Auth
export {
  getCurrentUserId,
  getCurrentUser,
  isAuthenticated,
  logout,
  createEmailPasswordSession,
  createAnonymousSession,
} from './auth'

// Users
export {
  getUser,
  upsertUser,
  updateUserProfile,
  getUserByEmail,
  getUserByUsername,
  listActiveUsers,
  deleteUser,
} from './users'

// Tokens
export {
  getToken,
  listTokens,
  getTokenBySymbol,
  getTokensByBlockchain,
  getStablecoins,
} from './tokens'

// Payment Requests
export {
  getPaymentRequest,
  listUserPaymentRequests,
  listReceivedPaymentRequests,
  createPaymentRequest,
  updatePaymentRequestStatus,
  deletePaymentRequest,
} from './paymentRequests'

// Exchange Rates
export {
  getExchangeRate,
  listExchangeRates,
  getExchangeRatesFor,
  upsertExchangeRate,
} from './exchangeRates'

// API Keys
export {
  getApiKey,
  listUserApiKeys,
  createApiKey,
  verifyApiKey,
  updateApiKeyLastUsed,
  revokeApiKey,
  deleteApiKey,
} from './apiKeys'

// Legacy exports for backwards compatibility
export { default as Appwrite } from './client'
