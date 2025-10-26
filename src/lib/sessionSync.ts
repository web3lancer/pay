/**
 * Session sync service
 * Keeps the app synchronized with Appwrite session state
 */

import { account, getCurrentUserId, getCurrentUserProfile } from '@/lib/appwrite'

export interface SessionData {
  userId: string | null
  userProfile: any | null
  isAuthenticated: boolean
}

// Store listeners for session changes
let sessionListeners: Array<(session: SessionData) => void> = []

/**
 * Get current session state
 */
export async function getCurrentSession(): Promise<SessionData> {
  try {
    const userId = await getCurrentUserId()
    
    if (!userId) {
      return {
        userId: null,
        userProfile: null,
        isAuthenticated: false
      }
    }

    const userProfile = await getCurrentUserProfile().catch(() => null)

    return {
      userId,
      userProfile,
      isAuthenticated: true
    }
  } catch (error) {
    console.error('Session check error:', error)
    return {
      userId: null,
      userProfile: null,
      isAuthenticated: false
    }
  }
}

/**
 * Subscribe to session changes
 */
export function onSessionChange(listener: (session: SessionData) => void): () => void {
  sessionListeners.push(listener)
  
  // Return unsubscribe function
  return () => {
    sessionListeners = sessionListeners.filter(l => l !== listener)
  }
}

/**
 * Notify all listeners of session change
 */
export async function notifySessionChange() {
  const session = await getCurrentSession()
  sessionListeners.forEach(listener => listener(session))
}

/**
 * Initialize session monitoring
 * Watches for auth state changes and notifies listeners
 */
export function initializeSessionMonitoring() {
  // Check session on visibility change
  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      notifySessionChange()
    }
  }

  // Check session on focus
  const handleFocus = () => {
    notifySessionChange()
  }

  // Check session periodically
  const interval = setInterval(() => {
    notifySessionChange()
  }, 60000) // 1 minute

  document.addEventListener('visibilitychange', handleVisibilityChange)
  window.addEventListener('focus', handleFocus)

  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
    clearInterval(interval)
  }
}
