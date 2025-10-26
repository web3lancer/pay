/**
 * Appwrite Authentication Helpers
 * Handles session management and user profile retrieval
 */

'use client'

import { account } from './client'

/**
 * Get current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const user = await account.get()
    return user.$id || null
  } catch (error) {
    console.warn('Failed to get current user ID:', error)
    return null
  }
}

/**
 * Get current user account details
 */
export async function getCurrentUser() {
  try {
    const user = await account.get()
    return user
  } catch (error) {
    console.warn('Failed to get current user:', error)
    return null
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const userId = await getCurrentUserId()
  return userId !== null
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  try {
    await account.deleteSessions()
  } catch (error) {
    console.error('Logout failed:', error)
    throw error
  }
}

/**
 * Create an email/password session
 */
export async function createEmailPasswordSession(
  email: string,
  password: string
) {
  try {
    return await account.createEmailPasswordSession(email, password)
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

/**
 * Create anonymous session
 */
export async function createAnonymousSession() {
  try {
    return await account.createAnonymousSession()
  } catch (error) {
    console.error('Anonymous session creation failed:', error)
    throw error
  }
}

export default {
  getCurrentUserId,
  getCurrentUser,
  isAuthenticated,
  logout,
  createEmailPasswordSession,
  createAnonymousSession,
}
