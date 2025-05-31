import { Client, Account, Databases, Storage, OAuthProvider } from 'appwrite'

export const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)

// Export constants
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!

// Collections
export const COLLECTIONS = {
  USERS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_USERS!,
  WALLETS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WALLETS!,
  TOKENS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TOKENS!,
  TRANSACTIONS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_TRANSACTIONS!,
  PAYMENT_REQUESTS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PAYMENT_REQUESTS!,
  EXCHANGE_RATES: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_EXCHANGE_RATES!,
  SECURITY_LOGS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SECURITY_LOGS!,
  API_KEYS: process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_API_KEYS!,
}

// Storage buckets
export const BUCKETS = {
  USER_ASSETS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_USER_ASSETS!,
  APP_ASSETS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_APP_ASSETS!,
  DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS!,
  BACKUPS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BACKUPS!,
  SYSTEM_LOGS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_SYSTEM_LOGS!,
  TEMP_FILES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TEMP_FILES!,
}

// OAuth providers
export { OAuthProvider }