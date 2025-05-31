import { Client, Account, Databases, Storage, ID, Query } from 'appwrite'

// Initialize Appwrite client
const client = new Client()

client
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

// Initialize services
export const account = new Account(client)
export const databases = new Databases(client)
export const storage = new Storage(client)
export { ID, Query }

// Database and collection IDs
export const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID!

// Ensure COLLECTION_IDS includes all required collections
export const COLLECTION_IDS = {
  USERS: 'users',
  WALLETS: 'wallets', 
  TOKENS: 'tokens',
  TRANSACTIONS: 'transactions',
  PAYMENT_REQUESTS: 'payment_requests',
  EXCHANGE_RATES: 'exchange_rates',
  SECURITY_LOGS: 'security_logs',
  API_KEYS: 'api_keys'
} as const

export const BUCKET_IDS = {
  USER_ASSETS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_USER_ASSETS!,
  APP_ASSETS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_APP_ASSETS!,
  DOCUMENTS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_DOCUMENTS!,
  BACKUPS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_BACKUPS!,
  SYSTEM_LOGS: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_SYSTEM_LOGS!,
  TEMP_FILES: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_TEMP_FILES!,
}

export default client