import * as appwrite from './appwrite'
import { databases, DATABASE_ID, COLLECTION_IDS, ID } from './appwrite'

export const debugDatabaseOperations = {
  async testConnection() {
    try {
      console.log('Testing database connection...')
      console.log('DATABASE_ID:', DATABASE_ID)
      console.log('COLLECTION_IDS:', COLLECTION_IDS)
      
      // Test basic database access by trying to list documents
      try {
        await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS)
        console.log('Database connection successful - Users collection accessible')
      } catch (error) {
        console.error('Users collection not accessible:', error)
      }
      
      return true
    } catch (error) {
      console.error('Database connection test failed:', error)
      return false
    }
  },

  async testUserCreation(userId: string, email: string, name: string) {
    try {
      console.log('Testing user creation with:', { userId, email, name })
      
      const userData = {
        userId,
        email,
        username: email.split('@')[0],
        displayName: name || email.split('@')[0],
        kycStatus: 'pending' as const,
        kycLevel: 0,
        twoFactorEnabled: false,
        isActive: true,
        preferredCurrency: 'USD',
      }
      
      console.log('User data to be created:', userData)
      
      const result = await appwrite.databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        userData.userId,
        userData
      )
      console.log('User creation successful:', result)
      return result
    } catch (error) {
      console.error('User creation test failed:', error)
      throw error
    }
  },

  async checkUserExists(userId: string) {
    try {
      const user = await appwrite.getUser(userId)
      console.log('User found:', user)
      return user
    } catch (error) {
      console.log('User not found:', error)
      return null
    }
  },

  async listAllUsers() {
    try {
      const response = await databases.listDocuments(DATABASE_ID, COLLECTION_IDS.USERS)
      console.log('All users in database:', response.documents)
      return response.documents
    } catch (error) {
      console.error('Failed to list users:', error)
      return []
    }
  }
}

// Call this function in your browser console to debug
// debugDatabaseOperations.testConnection()
// debugDatabaseOperations.listAllUsers()