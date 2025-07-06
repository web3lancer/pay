import { databases, DATABASE_ID, COLLECTION_IDS, ID, Query } from '@/lib/appwrite'
import { Models } from 'appwrite'

// Types based on database schema
export interface UserProfile {
  userId: string
  email: string
  username: string
  displayName: string
  profileImage?: string
  phoneNumber?: string
  kycStatus: 'pending' | 'verified' | 'rejected'
  kycLevel: number
  twoFactorEnabled: boolean
  isActive: boolean
  country?: string
  timezone?: string
  preferredCurrency: string
  createdAt: string
  updatedAt: string
}

export interface Wallet {
  walletId: string
  userId: string
  name: string // Using 'name' for consistency with UI components
  walletName: string // Database field name
  walletType: 'hot' | 'cold' | 'hardware' | 'imported'
  blockchain: string
  publicKey: string
  encryptedPrivateKey?: string
  address: string // Using 'address' for consistency with UI
  walletAddress: string // Database field name
  derivationPath?: string
  isDefault: boolean
  isActive: boolean
  balance: number
  lastSyncAt?: string
  createdAt: string
}

export interface Token {
  tokenId: string
  symbol: string
  name: string
  blockchain: string
  contractAddress?: string
  decimals: number
  logoUrl?: string
  isStablecoin: boolean
  isActive: boolean
  marketCap: number
  currentPrice: number
  priceChange24h: number
  lastPriceUpdate?: string
  createdAt: string
}

export interface Transaction {
  transactionId: string
  txHash?: string
  fromUserId: string
  toUserId?: string
  fromWalletId: string
  toWalletId?: string
  fromAddress: string
  toAddress: string
  tokenId: string
  amount: string
  feeAmount: string
  gasPrice?: string
  gasUsed?: string
  status: 'pending' | 'confirmed' | 'failed' | 'cancelled'
  type: 'send' | 'receive' | 'swap' | 'stake'
  description?: string
  metadata?: string
  blockNumber?: number
  confirmations: number
  createdAt: string
  confirmedAt?: string
  timestamp?: string // For backwards compatibility
}

export interface PaymentRequest {
  requestId: string
  fromUserId: string
  toUserId?: string
  toEmail?: string
  tokenId: string
  amount: string
  description?: string
  dueDate?: string
  status: 'pending' | 'paid' | 'expired' | 'cancelled'
  paymentTxId?: string
  invoiceNumber?: string
  metadata?: string
  createdAt: string
  paidAt?: string
}

export interface ExchangeRate {
  rateId: string
  fromCurrency: string
  toCurrency: string
  rate: number
  source: string
  lastUpdated: string
  isActive: boolean
}

export interface SecurityLog {
  logId: string
  userId: string
  action: string
  ipAddress: string
  userAgent?: string
  location?: string
  success: boolean
  riskScore: number
  metadata?: string
  createdAt: string
}

export interface APIKey {
  keyId: string
  userId: string
  keyName: string
  publicKey: string
  hashedSecret: string
  permissions: string
  isActive: boolean
  lastUsed?: string
  expiresAt?: string
  createdAt: string
}

// Database service functions
export class DatabaseService {
  // User operations
  static async createUser(userData: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<UserProfile> {
    const now = new Date().toISOString()
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      userData.userId,
      {
        ...userData,
        createdAt: now,
        updatedAt: now,
      }
    )
    return document as unknown as UserProfile
  }

  static async getUser(userId: string): Promise<UserProfile> {
    return await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      userId
    ) as unknown as UserProfile
  }

  static async updateUser(userId: string, updates: Partial<UserProfile>) {
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_IDS.USERS,
      userId,
      {
        ...updates,
        updatedAt: new Date().toISOString(),
      }
    )
  }

  static async getUserByEmail(email: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        [Query.equal('email', email)]
      )
      return response.documents[0] as unknown as UserProfile || null
    } catch {
      return null
    }
  }

  static async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        [Query.equal('username', username)]
      )
      return response.documents[0] as unknown as UserProfile || null
    } catch {
      return null
    }
  }

  // Wallet operations
  static async createWallet(walletData: Omit<Wallet, 'walletId' | 'createdAt'>): Promise<Wallet> {
    const walletId = ID.unique()
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_IDS.WALLETS,
      walletId,
      {
        ...walletData,
        walletName: walletData.name, // Map name to walletName for database
        walletAddress: walletData.address, // Map address to walletAddress for database
        walletId,
        createdAt: new Date().toISOString(),
      }
    )
    const wallet = document as unknown as Wallet
    // Map database fields back to interface fields
    wallet.name = wallet.walletName
    wallet.address = wallet.walletAddress
    return wallet
  }

  static async getUserWallets(userId: string): Promise<Wallet[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.WALLETS,
      [
        Query.equal('userId', userId),
        Query.equal('isActive', true),
        Query.orderDesc('createdAt')
      ]
    )
    const wallets = response.documents as unknown as Wallet[]
    // Map database fields to interface fields
    return wallets.map(wallet => ({
      ...wallet,
      name: wallet.walletName || wallet.name,
      address: wallet.walletAddress || wallet.address
    }))
  }

  static async getWallet(walletId: string): Promise<Wallet> {
    return await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.WALLETS,
      walletId
    ) as unknown as Wallet
  }

  static async updateWallet(walletId: string, updates: Partial<Wallet>) {
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_IDS.WALLETS,
      walletId,
      updates
    )
  }

  static async setDefaultWallet(userId: string, walletId: string) {
    // First, remove default status from all user wallets
    const userWallets = await this.getUserWallets(userId)
    await Promise.all(
      userWallets.map(wallet => 
        this.updateWallet(wallet.walletId, { isDefault: false })
      )
    )
    
    // Then set the new default
    return await this.updateWallet(walletId, { isDefault: true })
  }

  // Token operations
  static async getTokens(limit = 100): Promise<Token[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.TOKENS,
      [
        Query.equal('isActive', true),
        Query.orderAsc('name'),
        Query.limit(limit)
      ]
    )
    return response.documents as unknown as Token[]
  }

  static async getToken(tokenId: string): Promise<Token> {
    return await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.TOKENS,
      tokenId
    ) as unknown as Token
  }

  static async getTokenBySymbol(symbol: string): Promise<Token | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.TOKENS,
        [Query.equal('symbol', symbol)]
      )
      return response.documents[0] as unknown as Token || null
    } catch {
      return null
    }
  }

  // Transaction operations
  static async createTransaction(txData: Omit<Transaction, 'transactionId' | 'createdAt'>): Promise<Transaction> {
    const transactionId = ID.unique()
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_IDS.TRANSACTIONS,
      transactionId,
      {
        ...txData,
        transactionId,
        createdAt: new Date().toISOString(),
      }
    )
    return document as unknown as Transaction
  }

  static async getUserTransactions(userId: string, limit = 50): Promise<Transaction[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.TRANSACTIONS,
      [
        Query.or([
          Query.equal('fromUserId', userId),
          Query.contains('toUserId', userId)


        ]),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    )
    return response.documents as unknown as Transaction[]
  }

  static async getTransaction(transactionId: string): Promise<Transaction> {
    return await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.TRANSACTIONS,
      transactionId
    ) as unknown as Transaction
  }

  static async updateTransaction(transactionId: string, updates: Partial<Transaction>) {
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_IDS.TRANSACTIONS,
      transactionId,
      updates
    )
  }

  // Payment Request operations
  static async createPaymentRequest(requestData: Omit<PaymentRequest, 'requestId' | 'createdAt'>): Promise<PaymentRequest> {
    const requestId = ID.unique()
    const document = await databases.createDocument(
      DATABASE_ID,
      COLLECTION_IDS.PAYMENT_REQUESTS,
      requestId,
      {
        ...requestData,
        requestId,
        createdAt: new Date().toISOString(),
      }
    )
    return document as unknown as PaymentRequest
  }

  static async getUserPaymentRequests(userId: string, type: 'sent' | 'received' = 'sent'): Promise<PaymentRequest[]> {
    const field = type === 'sent' ? 'fromUserId' : 'toUserId'
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PAYMENT_REQUESTS,
      [
        Query.equal(field, userId),
        Query.orderDesc('createdAt')
      ]
    )
    return response.documents as unknown as PaymentRequest[]
  }

  static async getPaymentRequest(requestId: string): Promise<PaymentRequest> {
    const document = await databases.getDocument(
      DATABASE_ID,
      COLLECTION_IDS.PAYMENT_REQUESTS,
      requestId
    )
    return document as unknown as PaymentRequest
  }

  static async updatePaymentRequest(requestId: string, updates: Partial<PaymentRequest>): Promise<void> {
    await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_IDS.PAYMENT_REQUESTS,
      requestId,
      updates
    )
  }

  static async getPaymentRequestByInvoice(invoiceNumber: string): Promise<PaymentRequest> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.PAYMENT_REQUESTS,
      [Query.equal('invoiceNumber', invoiceNumber)]
    )
    if (response.documents.length === 0) {
      throw new Error('Payment request not found')
    }
    return response.documents[0] as unknown as PaymentRequest
  }

  // Exchange Rate operations
  static async getExchangeRates(): Promise<ExchangeRate[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.EXCHANGE_RATES,
      [
        Query.equal('isActive', true),
        Query.orderDesc('lastUpdated')
      ]
    )
    return response.documents as unknown as ExchangeRate[]
  }

  static async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<ExchangeRate | null> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        COLLECTION_IDS.EXCHANGE_RATES,
        [
          Query.equal('fromCurrency', fromCurrency),
          Query.equal('toCurrency', toCurrency),
          Query.equal('isActive', true)
        ]
      )
      return response.documents[0] as unknown as ExchangeRate || null
    } catch {
      return null
    }
  }

  // Security Log operations
  static async createSecurityLog(logData: Omit<SecurityLog, 'logId' | 'createdAt'>) {
    const logId = ID.unique()
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTION_IDS.SECURITY_LOGS,
      logId,
      {
        ...logData,
        logId,
        createdAt: new Date().toISOString(),
      }
    )
  }

  static async getUserSecurityLogs(userId: string, limit = 50): Promise<SecurityLog[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.SECURITY_LOGS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt'),
        Query.limit(limit)
      ]
    )
    return response.documents as unknown as SecurityLog[]
  }

  // API Key operations
  static async createAPIKey(keyData: Omit<APIKey, 'keyId' | 'createdAt'>) {
    const keyId = ID.unique()
    return await databases.createDocument(
      DATABASE_ID,
      COLLECTION_IDS.API_KEYS,
      keyId,
      {
        ...keyData,
        keyId,
        createdAt: new Date().toISOString(),
      }
    )
  }

  static async getUserAPIKeys(userId: string): Promise<APIKey[]> {
    const response = await databases.listDocuments(
      DATABASE_ID,
      COLLECTION_IDS.API_KEYS,
      [
        Query.equal('userId', userId),
        Query.orderDesc('createdAt')
      ]
    )
    return response.documents as unknown as APIKey[]
  }

  static async updateAPIKey(keyId: string, updates: Partial<APIKey>) {
    return await databases.updateDocument(
      DATABASE_ID,
      COLLECTION_IDS.API_KEYS,
      keyId,
      updates
    )
  }

  static async deactivateAPIKey(keyId: string) {
    return await this.updateAPIKey(keyId, { isActive: false })
  }
}