/**
 * Auth debugging utilities
 * Helps diagnose auth and session issues
 */

import { account, getCurrentUserId, getCurrentUserProfile } from '@/lib/appwrite'

export const authDebug = {
  /**
   * Log current auth state
   */
  async logCurrentState() {
    try {
      console.log('=== Auth Debug Info ===')
      
      const userId = await getCurrentUserId()
      console.log('User ID:', userId)
      
      if (userId) {
        const profile = await getCurrentUserProfile()
        console.log('User Profile:', profile)
      }
      
      console.log('Cookies:', document.cookie)
      console.log('localStorage:', Object.keys(localStorage).map(k => `${k}: ${localStorage.getItem(k)}`))
      
      console.log('======================')
    } catch (error) {
      console.error('Debug error:', error)
    }
  },

  /**
   * Check Appwrite session validity
   */
  async checkSession() {
    try {
      const acc = await account.get()
      console.log('Session valid:', acc)
      return !!acc.$id
    } catch (error: any) {
      console.log('No active session:', error.message)
      return false
    }
  },

  /**
   * List all active sessions
   */
  async listSessions() {
    try {
      const sessions = await account.listSessions()
      console.log('Active sessions:', sessions)
      return sessions
    } catch (error) {
      console.error('Could not list sessions:', error)
      return []
    }
  },

  /**
   * Test auth flow
   */
  async runAuthTest() {
    console.log('Starting auth test...')
    
    const hasSession = await this.checkSession()
    console.log('Has session:', hasSession)
    
    if (hasSession) {
      const userId = await getCurrentUserId()
      console.log('User ID:', userId)
      
      const profile = await getCurrentUserProfile()
      console.log('Profile:', profile)
    }
    
    console.log('Auth test complete')
  }
}

// Make available globally in dev
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).authDebug = authDebug
}
