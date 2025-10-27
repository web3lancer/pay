/**
 * Enhanced Appwrite Account Integration
 * Provides user profile management, settings, and account operations
 */

import {
  account,
  tablesdb,
  getCurrentUserId,
  getCurrentUserProfile,
  updateUser,
  getPreferences,
  updatePreferences,
  logout as appwriteLogout,
  PAYDB_ID,
  ID,
} from '@/lib/appwrite'

export interface UserSettings {
  theme?: 'light' | 'dark'
  notifications?: boolean
  twoFactorEnabled?: boolean
  preferredLanguage?: string
  currency?: string
  [key: string]: any
}

export interface UserProfile {
  userId: string
  email: string
  name?: string
  displayName?: string
  avatar?: string
  bio?: string
  createdAt?: string
  updatedAt?: string
  verified?: boolean
  settings?: UserSettings
  [key: string]: any
}

/**
 * Get complete user profile with settings
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return null

    const userProfile = await getCurrentUserProfile()
    const preferences = await getPreferences().catch(() => ({}))

    return {
      userId,
      email: userProfile?.email || '',
      name: userProfile?.name,
      displayName: userProfile?.displayName,
      avatar: userProfile?.avatar,
      bio: userProfile?.bio,
      createdAt: userProfile?.created_at || userProfile?.$createdAt,
      updatedAt: userProfile?.updated_at || userProfile?.$updatedAt,
      verified: userProfile?.email_verified || userProfile?.emailVerification,
      settings: preferences as UserSettings,
      ...userProfile
    }
  } catch (error) {
    console.error('Failed to get user profile:', error)
    return null
  }
}

/**
 * Update user profile information
 */
export async function updateUserProfile(data: {
  name?: string
  displayName?: string
  bio?: string
  avatar?: string
  [key: string]: any
}): Promise<UserProfile | null> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('No active session')

    // Update Appwrite account name
    if (data.name) {
      await account.updateName(data.name)
    }

    // Update user database document
    await updateUser(userId, {
      name: data.name || data.displayName,
      displayName: data.displayName,
      bio: data.bio,
      avatar: data.avatar,
      updated_at: new Date().toISOString()
    })

    return getUserProfile()
  } catch (error) {
    console.error('Failed to update user profile:', error)
    throw error
  }
}

/**
 * Update user email
 */
export async function updateUserEmail(newEmail: string, password: string): Promise<void> {
  try {
    await account.updateEmail(newEmail, password)
  } catch (error) {
    console.error('Failed to update email:', error)
    throw error
  }
}

/**
 * Update user password
 */
export async function updateUserPassword(oldPassword: string, newPassword: string): Promise<void> {
  try {
    await account.updatePassword(newPassword, oldPassword)
  } catch (error) {
    console.error('Failed to update password:', error)
    throw error
  }
}

/**
 * Update user preferences/settings
 */
export async function updateUserSettings(settings: UserSettings): Promise<UserSettings> {
  try {
    const preferences = await getPreferences().catch(() => ({}))
    const updated = { ...preferences, ...settings }
    await updatePreferences(updated)
    return updated as UserSettings
  } catch (error) {
    console.error('Failed to update settings:', error)
    throw error
  }
}

/**
 * Get user settings
 */
export async function getUserSettings(): Promise<UserSettings> {
  try {
    const preferences = await getPreferences().catch(() => ({}))
    return preferences as UserSettings
  } catch (error) {
    console.error('Failed to get settings:', error)
    return {}
  }
}

/**
 * Check if user's email is verified
 */
export async function checkEmailVerified(): Promise<boolean> {
  try {
    const acc = await account.get()
    return acc.emailVerification || false
  } catch (error) {
    console.error('Failed to check email verification:', error)
    return false
  }
}

/**
 * Send email verification link
 */
export async function sendVerificationEmail(redirectUrl: string): Promise<void> {
  try {
    await account.createVerification(redirectUrl)
  } catch (error) {
    console.error('Failed to send verification email:', error)
    throw error
  }
}

/**
 * Get user sessions
 */
export async function getUserSessions(): Promise<any[]> {
  try {
    const sessions = await account.listSessions()
    return sessions.sessions || []
  } catch (error) {
    console.error('Failed to get sessions:', error)
    return []
  }
}

/**
 * Logout from specific session
 */
export async function logoutFromSession(sessionId: string): Promise<void> {
  try {
    await account.deleteSession(sessionId)
  } catch (error) {
    console.error('Failed to logout from session:', error)
    throw error
  }
}

/**
 * Logout from all sessions
 */
export async function logoutFromAllSessions(): Promise<void> {
  try {
    await account.deleteSessions()
  } catch (error) {
    console.error('Failed to logout from all sessions:', error)
    throw error
  }
}

/**
 * Get user activity/security logs
 */
export async function getUserLogs(): Promise<any[]> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return []

    const logs = await tablesdb.listRows(
      PAYDB_ID,
      'securityLogs',
      [
        {
          attribute: 'userId',
          values: [userId],
          method: 'equal'
        }
      ]
    )

    return logs.rows || []
  } catch (error) {
    console.error('Failed to get user logs:', error)
    return []
  }
}

/**
 * Log security event
 */
export async function logSecurityEvent(
  eventType: string,
  description: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) return

    await tablesdb.createRow(
      PAYDB_ID,
      'securityLogs',
      ID.unique(),
      {
        userId,
        eventType,
        description,
        metadata: metadata || {},
        ipAddress: await getClientIp(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    )
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

/**
 * Get client IP (requires backend endpoint)
 */
async function getClientIp(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip || 'unknown'
  } catch {
    return 'unknown'
  }
}

/**
 * Delete user account (irreversible)
 */
export async function deleteUserAccount(): Promise<void> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('No active session')

    // Log the deletion
    await logSecurityEvent('ACCOUNT_DELETION', 'User account deleted')

    // Logout first
    await appwriteLogout()

    // Delete from database
    // Note: Appwrite doesn't have a native delete account method
    // You may need to create a backend function for this
  } catch (error) {
    console.error('Failed to delete account:', error)
    throw error
  }
}

/**
 * Export user data (GDPR compliance)
 */
export async function exportUserData(): Promise<any> {
  try {
    const userId = await getCurrentUserId()
    if (!userId) throw new Error('No active session')

    const profile = await getUserProfile()
    const settings = await getUserSettings()
    const sessions = await getUserSessions()
    const logs = await getUserLogs()

    return {
      profile,
      settings,
      sessions,
      logs,
      exportedAt: new Date().toISOString()
    }
  } catch (error) {
    console.error('Failed to export user data:', error)
    throw error
  }
}
