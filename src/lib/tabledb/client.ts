/**
 * TableDB Client Configuration
 * 
 * Initializes Appwrite client for TablesDB operations
 * Switched from deprecated Collections API to TablesDB
 */

import { Client, Account, TablesDB, Storage, ID, Query, Functions, Permission, Role } from 'appwrite'

// Initialize Appwrite client
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

// Initialize services
export const account = new Account(client)
export const tablesDB = new TablesDB(client)
export const storage = new Storage(client)
export const functions = new Functions(client)

// Export utilities
export { ID, Query, Permission, Role, client }

// Database IDs from appwrite.config.json
export const DATABASE_IDS = {
  PAY_DB: '683a31960011608eaee5',
  CORE_DB: '682481e00032b7373ad0',
  PROFILES_DB: '67b885280000d2cb5411',
  JOBS_DB: '67af3ffe0011106c4575',
  SOCIAL_DB: '6824814b0017b0ca6488',
  FINANCE_DB: '6824815a000876ad3405',
  CONTENT_DB: '6824819600054bbe2cf1',
  GOVERNANCE_DB: '682481ab003a73ef7b32',
  ACTIVITY_DB: '682481bd002efe19bb70',
} as const

// PayDB Table IDs
export const PAYDB_TABLES = {
  USERS: 'users',
  TOKENS: 'tokens',
  PAYMENT_REQUESTS: 'payment_requests',
  EXCHANGE_RATES: 'exchange_rates',
  API_KEYS: 'api_keys',
  VIRTUAL_CARDS: 'virtual_cards',
  VIRTUAL_ACCOUNTS: 'virtual_accounts',
} as const

// CoreDB Table IDs
export const COREDB_TABLES = {
  SKILLS: '6826479f003269b642ce',
  CATEGORIES: '682648670015e61c88ed',
  PLATFORM_SETTINGS: '682648ee0004d166c9f5',
} as const

// ProfilesDB Table IDs
export const PROFILESDB_TABLES = {
  PROFILES: '67b8853c003c55c82ff6',
  PROFILE_VERIFICATIONS: '68249904002937ae4ecf',
} as const

// Storage Bucket IDs
export const BUCKET_IDS = {
  // Pay App specific buckets
  PAY_USER_ASSETS: 'pay_user_assets',
  PAY_APP_ASSETS: 'pay_app_assets',
  PAY_DOCUMENTS: 'pay_documents',
  PAY_BACKUPS: 'pay_backups',
  PAY_SYSTEM_LOGS: 'pay_system_logs',
  PAY_TEMP_FILES: 'pay_temp_files',
  
  // Shared ecosystem buckets
  PROFILE_AVATARS: '68271a49000952f46753',
  COVER_IMAGES: '68271a5f000426c52bbe',
  VERIFICATION_DOCUMENTS: '68271a72002d4f3121f9',
  PROFILE_PICTURES: '67b889200019e3d3519d',
  JOB_ATTACHMENTS: '67b889440032a2ff90d3',
  PROJECT_DOCUMENTS: '67b8896b001c03586d6c',
  PROJECT_MEDIA: '67b88992001f1185cf8e',
  MESSAGE_ATTACHMENTS: '67b889b6000f7e9fa47c',
  MISCELLANEOUS: '67b889d200014904243b',
} as const

// Function IDs (from existing env vars)
export const FUNCTION_IDS = {
  WEB3_AUTH: process.env.NEXT_PUBLIC_WEB3_AUTH_FUNCTION_ID || '',
  CREATE_WALLET: process.env.NEXT_PUBLIC_APPWRITE_FUNCTION_ID_CREATEWALLET || '',
} as const

// Helper types
export type DatabaseId = typeof DATABASE_IDS[keyof typeof DATABASE_IDS]
export type PayDBTableId = typeof PAYDB_TABLES[keyof typeof PAYDB_TABLES]
export type CoreDBTableId = typeof COREDB_TABLES[keyof typeof COREDB_TABLES]
export type ProfilesDBTableId = typeof PROFILESDB_TABLES[keyof typeof PROFILESDB_TABLES]
export type BucketId = typeof BUCKET_IDS[keyof typeof BUCKET_IDS]
