/**
 * Appwrite TablesDB Client Configuration
 * Supports PayDB (683a31960011608eaee5) for PayLancer Capital
 */

'use client'

import { Client, TablesDB, Account } from 'appwrite'

// Initialize Appwrite client with TablesDB
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)

export const account = new Account(client)
export const tablesdb = new TablesDB(client)

// PayDB Database ID (TablesDB)
export const PAYDB_ID = process.env.NEXT_PUBLIC_PAYDB_ID!

// Table IDs for PayDB
export const PAYDB_TABLES = {
  USERS: 'users',
  TOKENS: 'tokens',
  PAYMENT_REQUESTS: 'payment_requests',
  EXCHANGE_RATES: 'exchange_rates',
  API_KEYS: 'api_keys',
  VIRTUAL_CARDS: 'virtual_cards',
  VIRTUAL_ACCOUNTS: 'virtual_accounts',
} as const

export { client }
