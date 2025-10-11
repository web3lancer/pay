/**
 * TypeScript types for TableDB schemas
 * Generated from appwrite.config.json
 */

// ===========================
// PayDB Types
// ===========================

export interface PayDBUser {
  $id: string
  userId: string
  email: string
  username: string
  displayName: string
  profileImage?: string
  phoneNumber?: string
  kycStatus?: string
  kycLevel?: number
  twoFactorEnabled?: boolean
  isActive?: boolean
  country?: string
  timezone?: string
  preferredCurrency?: string
  createdAt: string
  updatedAt: string
  // Relationships
  paymentRequests?: string | string[]
  aPIKeys?: string | string[]
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface PayDBToken {
  $id: string
  tokenId: string
  symbol: string
  name: string
  blockchain: string
  contractAddress?: string
  decimals: number
  logoUrl?: string
  isStablecoin?: boolean
  isActive?: boolean
  marketCap?: number
  currentPrice?: number
  priceChange24h?: number
  lastPriceUpdate?: string
  createdAt: string
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface PayDBPaymentRequest {
  $id: string
  requestId: string
  fromUserId: string
  toUserId?: string
  toEmail?: string
  tokenId: string
  amount: string
  description?: string
  dueDate?: string
  status?: 'pending' | 'paid' | 'cancelled' | 'expired'
  paymentTxId?: string
  invoiceNumber?: string
  metadata?: string
  createdAt: string
  paidAt?: string
  // Relationships
  users?: string | string[]
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface PayDBExchangeRate {
  $id: string
  rateId: string
  fromCurrency: string
  toCurrency: string
  rate: number
  source: string
  lastUpdated: string
  isActive?: boolean
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface PayDBAPIKey {
  $id: string
  keyId: string
  userId: string
  keyName: string
  publicKey: string
  hashedSecret: string
  permissions: string
  isActive?: boolean
  lastUsed?: string
  expiresAt?: string
  createdAt: string
  // Relationships
  users?: string | string[]
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface PayDBVirtualCard {
  $id: string
  cardId: string
  userId: string
  cardNumber: string
  expiry: string
  cvv: string
  cardType: string
  status: string
  linkedWalletId?: string
  createdAt?: string
  updatedAt?: string
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface PayDBVirtualAccount {
  $id: string
  accountId: string
  userId: string
  accountNumber: string
  currency?: string
  balance?: number
  status?: string
  linkedWalletId?: string
  createdAt?: string
  updatedAt?: string
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

// ===========================
// ProfilesDB Types
// ===========================

export interface ProfilesDBProfile {
  $id: string
  userId: string
  name: string
  email: string
  bio?: string
  skills?: string[]
  location?: string
  portfolio?: string
  socialLinks?: Record<string, string>
  avatar?: string
  coverImage?: string
  hourlyRate?: number
  availability?: 'available' | 'busy' | 'unavailable'
  languages?: string[]
  timezone?: string
  joinedAt?: string
  lastActive?: string
  verificationStatus?: 'unverified' | 'pending' | 'verified'
  rating?: number
  reviewCount?: number
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface ProfilesDBProfileVerification {
  $id: string
  profileId: string
  verificationType: string
  documentFileIds?: string[]
  status: string
  notes?: string
  submittedAt?: string
  reviewedAt?: string
  reviewedBy?: string
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

// ===========================
// CoreDB Types
// ===========================

export interface CoreDBSkill {
  $id: string
  name: string
  category?: string
  description?: string
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface CoreDBCategory {
  $id: string
  name: string
  description?: string
  parentCategory?: string
  icon?: string
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

export interface CoreDBPlatformSettings {
  $id: string
  key: string
  value: string
  description?: string
  category?: string
  isPublic?: boolean
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
}

// ===========================
// Generic Row Type
// ===========================

export interface TableDBRow {
  $id: string
  $permissions?: string[]
  $createdAt?: string
  $updatedAt?: string
  [key: string]: any
}

// ===========================
// Query Response Types
// ===========================

export interface TableDBListResponse<T> {
  total: number
  rows: T[]
}

export interface TableDBResponse<T> {
  row: T
}

// ===========================
// Transaction Types
// ===========================

export interface TableDBTransaction {
  $id: string
  status: 'pending' | 'committed' | 'rolled_back'
  ttl: number
  createdAt: string
  expiresAt: string
}

export interface TableDBOperation {
  action: 'create' | 'update' | 'delete'
  databaseId: string
  tableId: string
  rowId: string
  data?: Record<string, any>
  permissions?: string[]
}

// ===========================
// Helper Types
// ===========================

export type CreateRowData<T> = Omit<T, '$id' | '$permissions' | '$createdAt' | '$updatedAt'>
export type UpdateRowData<T> = Partial<CreateRowData<T>>
