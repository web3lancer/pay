/**
 * Example Usage of TableDB CRUD Operations
 * 
 * This file demonstrates how to use the TableDB module in your application
 */

import { PayDB, ProfilesDB, Storage, account, ID, Query } from '@/lib/tabledb'
import type { PayDBUser, PayDBPaymentRequest, ProfilesDBProfile } from '@/lib/tabledb/types'

// ===========================
// User Management Examples
// ===========================

export async function createNewUser(email: string, username: string, displayName: string) {
  // Create user in PayDB
  const user = await PayDB.createUser({
    userId: account.$id,
    email,
    username,
    displayName,
    preferredCurrency: 'USD',
    isActive: true,
  })
  
  return user
}

export async function getUserProfile(username: string) {
  // Get user by username
  const user = await PayDB.getUserByUsername(username)
  if (!user) {
    throw new Error('User not found')
  }
  
  return user
}

export async function updateUserSettings(userId: string, settings: {
  displayName?: string
  phoneNumber?: string
  country?: string
  timezone?: string
  preferredCurrency?: string
}) {
  return await PayDB.updateUserProfile(userId, settings)
}

// ===========================
// Payment Request Examples
// ===========================

export async function createInvoice(
  fromUserId: string,
  toEmail: string,
  amount: string,
  tokenId: string,
  description: string,
  dueInDays: number = 7
) {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + dueInDays)
  
  const request = await PayDB.createPaymentRequest({
    fromUserId,
    toEmail,
    tokenId,
    amount,
    description,
    dueDate: dueDate.toISOString(),
    status: 'pending',
    invoiceNumber: `INV-${Date.now()}`,
  })
  
  return request
}

export async function getMyPaymentRequests(userId: string) {
  // Get all payment requests for user (sent and received)
  const { rows: requests, total } = await PayDB.listPaymentRequestsByUser(userId, 50, 0)
  return { requests, total }
}

export async function getPendingInvoices(userId: string) {
  // Get only pending requests created by user
  const sent = await PayDB.listPaymentRequestsCreatedByUser(userId, 25, 0)
  const pendingRequests = sent.rows.filter(r => r.status === 'pending')
  return pendingRequests
}

export async function payInvoice(requestId: string, transactionHash: string) {
  // Mark payment request as paid
  await PayDB.markPaymentRequestAsPaid(requestId, transactionHash)
}

// ===========================
// Token Management Examples
// ===========================

export async function getTokenInfo(symbol: string) {
  const token = await PayDB.getTokenBySymbol(symbol)
  if (!token) {
    throw new Error(`Token ${symbol} not found`)
  }
  return token
}

export async function getAllActiveTokens() {
  const { rows: tokens } = await PayDB.listActiveTokens(100, 0)
  return tokens
}

export async function updateCryptoPrices(prices: Array<{ symbol: string; price: number; change24h: number }>) {
  // Bulk update token prices
  const promises = prices.map(p => 
    PayDB.updateTokenPrice(p.symbol, p.price, p.change24h)
  )
  await Promise.all(promises)
}

// ===========================
// Exchange Rate Examples
// ===========================

export async function convertCurrency(amount: number, from: string, to: string) {
  if (from === to) return amount
  
  const converted = await PayDB.convertAmount(amount, from, to)
  return converted
}

export async function updateExchangeRates(rates: Array<{
  from: string
  to: string
  rate: number
}>) {
  await PayDB.bulkUpdateExchangeRates(
    rates.map(r => ({
      fromCurrency: r.from,
      toCurrency: r.to,
      rate: r.rate,
      source: 'api',
    }))
  )
}

// ===========================
// Profile Examples (ProfilesDB)
// ===========================

export async function createUserProfile(userId: string, email: string, name: string) {
  const profile = await ProfilesDB.createProfile({
    userId,
    email,
    name,
    bio: '',
    availability: 'available',
  })
  return profile
}

export async function updateProfileInfo(userId: string, data: {
  bio?: string
  skills?: string[]
  hourlyRate?: number
  location?: string
  availability?: 'available' | 'busy' | 'unavailable'
}) {
  return await ProfilesDB.updateProfileByUserId(userId, data)
}

export async function findFreelancersBySkill(skill: string) {
  const { rows: profiles } = await ProfilesDB.listProfilesBySkill(skill, 25, 0)
  return profiles.filter(p => p.availability === 'available')
}

// ===========================
// File Upload Examples
// ===========================

export async function uploadUserAvatar(file: File, userId: string) {
  // Validate file
  if (!Storage.validateImageFile(file, 5)) {
    throw new Error('Invalid image file. Must be JPG, PNG, or GIF and under 5MB')
  }
  
  // Upload to storage
  const uploaded = await Storage.uploadProfileAvatar(file, userId)
  
  // Get URL
  const avatarUrl = Storage.getFileUrl(uploaded.bucketId, uploaded.$id)
  
  // Update user profile
  await PayDB.setUserProfileImage(userId, avatarUrl)
  
  return avatarUrl
}

export async function uploadDocument(file: File, userId: string) {
  // Validate document
  if (!Storage.validateDocumentFile(file, 10)) {
    throw new Error('Invalid document. Must be PDF, DOC, or TXT and under 10MB')
  }
  
  const uploaded = await Storage.uploadDocument(file, userId)
  return Storage.getFileUrl(uploaded.bucketId, uploaded.$id)
}

// ===========================
// Virtual Card Examples
// ===========================

export async function createVirtualCard(userId: string, cardType: string) {
  // Generate card details (in production, use secure service)
  const cardNumber = `4242${Math.random().toString().slice(2, 14)}`
  const cvv = Math.floor(Math.random() * 900 + 100).toString()
  const expiry = '12/25'
  
  const card = await PayDB.createVirtualCard({
    userId,
    cardNumber,
    expiry,
    cvv,
    cardType,
    status: 'active',
  })
  
  return card
}

export async function getUserCards(userId: string) {
  const { rows: cards } = await PayDB.listActiveVirtualCardsByUser(userId)
  return cards
}

// ===========================
// Virtual Account Examples
// ===========================

export async function createVirtualAccount(userId: string, currency: string = 'USD') {
  // Generate account number (in production, use secure service)
  const accountNumber = `VA${Date.now()}${Math.floor(Math.random() * 10000)}`
  
  const account = await PayDB.createVirtualAccount({
    userId,
    accountNumber,
    currency,
    balance: 0,
    status: 'active',
  })
  
  return account
}

export async function addFundsToAccount(accountId: string, amount: number) {
  await PayDB.incrementAccountBalance(accountId, amount)
}

export async function withdrawFromAccount(accountId: string, amount: number) {
  try {
    await PayDB.decrementAccountBalance(accountId, amount)
  } catch (error) {
    throw new Error('Insufficient balance')
  }
}

// ===========================
// API Key Management Examples
// ===========================

export async function createAPIKey(userId: string, keyName: string, permissions: string) {
  // Generate keys (in production, use crypto library)
  const publicKey = `pk_${Date.now()}_${Math.random().toString(36).slice(2)}`
  const secret = `sk_${Date.now()}_${Math.random().toString(36).slice(2)}`
  
  // Hash the secret (in production, use bcrypt or similar)
  const hashedSecret = Buffer.from(secret).toString('base64')
  
  const apiKey = await PayDB.createAPIKey({
    userId,
    keyName,
    publicKey,
    hashedSecret,
    permissions,
  })
  
  // Return both keys (secret should only be shown once)
  return {
    publicKey: apiKey.publicKey,
    secret, // Only show this once!
    keyId: apiKey.keyId,
  }
}

export async function validateAPIKey(publicKey: string): Promise<boolean> {
  return await PayDB.validateAPIKey(publicKey)
}

// ===========================
// Statistics Examples
// ===========================

export async function getUserStatistics(userId: string) {
  const [
    totalRequests,
    amountRequested,
    amountReceived,
  ] = await Promise.all([
    PayDB.getTotalPaymentRequestsByUser(userId),
    PayDB.getTotalAmountRequestedByUser(userId),
    PayDB.getTotalAmountPaidToUser(userId),
  ])
  
  return {
    totalRequests,
    amountRequested,
    amountReceived,
  }
}

// ===========================
// Search Examples
// ===========================

export async function searchUsers(searchTerm: string) {
  // Search by username (you'd need to implement this in users.ts)
  // For now, list users and filter client-side
  const { rows: users } = await PayDB.listUsers([], 100, 0)
  return users.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  )
}

export async function searchPaymentRequests(userId: string, searchTerm: string) {
  const { rows: requests } = await PayDB.searchPaymentRequestsByDescription(searchTerm)
  // Filter to only user's requests
  return requests.filter(r => 
    r.fromUserId === userId || r.toUserId === userId
  )
}

// ===========================
// Complex Query Examples
// ===========================

export async function getRecentActivity(userId: string, days: number = 7) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  // Get recent payment requests
  const { rows: requests } = await PayDB.listPaymentRequestsByUser(userId, 50, 0)
  
  const recentRequests = requests.filter(r => 
    new Date(r.createdAt) > cutoffDate
  )
  
  return recentRequests.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
}

export async function getDashboardData(userId: string) {
  // Fetch multiple data points in parallel
  const [
    user,
    profile,
    requests,
    cards,
    accounts,
    stats,
  ] = await Promise.all([
    PayDB.getUserByUserId(userId),
    ProfilesDB.getProfileByUserId(userId),
    PayDB.listPaymentRequestsByUser(userId, 10, 0),
    PayDB.listVirtualCardsByUser(userId, 5, 0),
    PayDB.listVirtualAccountsByUser(userId, 5, 0),
    getUserStatistics(userId),
  ])
  
  return {
    user,
    profile,
    recentRequests: requests.rows,
    cards: cards.rows,
    accounts: accounts.rows,
    stats,
  }
}
