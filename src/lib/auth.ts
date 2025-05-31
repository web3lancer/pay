import { account, databases, storage, ID, DATABASE_ID, COLLECTION_IDS } from './appwrite'
import { OAuthProvider } from 'appwrite'

export interface AppwriteUser {
  $id: string
  $createdAt: string
  $updatedAt: string
  name: string
  registration: string
  status: boolean
  labels: string[]
  passwordUpdate: string
  email: string
  phone: string
  emailVerification: boolean
  phoneVerification: boolean
  mfa: boolean
  prefs: Record<string, any>
  targets: any[]
  accessedAt: string
}

export interface User extends AppwriteUser {
  // Additional user properties from our database
  username?: string
  displayName?: string
  profileImage?: string
  kycStatus?: string
  kycLevel?: number
  twoFactorEnabled?: boolean
  isActive?: boolean
  country?: string
  timezone?: string
  preferredCurrency?: string
}

export interface UserProfile {
  userId: string
  email: string
  username: string
  displayName: string
  profileImage?: string
  phoneNumber?: string
  kycStatus: string
  kycLevel: number
  twoFactorEnabled: boolean
  isActive: boolean
  country?: string
  timezone?: string
  preferredCurrency: string
  createdAt: string
  updatedAt: string
}

export class AuthService {
  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      return await account.get()
    } catch (error) {
      return null
    }
  }

  // Get current session
  async getCurrentSession() {
    try {
      return await account.getSession('current')
    } catch (error) {
      return null
    }
  }

  // Email/Password Authentication
  async signUp(email: string, password: string, name: string) {
    try {
      const response = await account.create(ID.unique(), email, password, name)
      
      // Send email verification
      await this.sendEmailVerification()
      
      return response
    } catch (error) {
      throw error
    }
  }

  async signIn(email: string, password: string) {
    try {
      return await account.createEmailPasswordSession(email, password)
    } catch (error) {
      throw error
    }
  }

  async signOut() {
    try {
      return await account.deleteSession('current')
    } catch (error) {
      throw error
    }
  }

  async signOutAll() {
    try {
      return await account.deleteSessions()
    } catch (error) {
      throw error
    }
  }

  // Email Verification
  async sendEmailVerification(url?: string) {
    try {
      const verificationUrl = url || `${window.location.origin}/auth/verify`
      return await account.createVerification(verificationUrl)
    } catch (error) {
      throw error
    }
  }

  async verifyEmail(userId: string, secret: string) {
    try {
      return await account.updateVerification(userId, secret)
    } catch (error) {
      throw error
    }
  }

  // Password Recovery
  async sendPasswordRecovery(email: string, url?: string) {
    try {
      const recoveryUrl = url || `${window.location.origin}/auth/recovery`
      return await account.createRecovery(email, recoveryUrl)
    } catch (error) {
      throw error
    }
  }

  async resetPassword(userId: string, secret: string, password: string) {
    try {
      return await account.updateRecovery(userId, secret, password)
    } catch (error) {
      throw error
    }
  }

  // Magic URL Authentication
  async sendMagicURL(email: string, url?: string) {
    try {
      const magicUrl = url || `${window.location.origin}/auth/magic-url`
      return await account.createMagicURLToken(ID.unique(), email, magicUrl)
    } catch (error) {
      throw error
    }
  }

  async loginWithMagicURL(userId: string, secret: string) {
    try {
      return await account.createSession(userId, secret)
    } catch (error) {
      throw error
    }
  }

  // Email OTP Authentication
  async sendEmailOTP(email: string) {
    try {
      return await account.createEmailToken(ID.unique(), email)
    } catch (error) {
      throw error
    }
  }

  async loginWithEmailOTP(userId: string, otp: string) {
    try {
      return await account.createSession(userId, otp)
    } catch (error) {
      throw error
    }
  }

  // Phone (SMS) Authentication
  async sendPhoneOTP(phone: string) {
    try {
      return await account.createPhoneToken(ID.unique(), phone)
    } catch (error) {
      throw error
    }
  }

  async loginWithPhoneOTP(userId: string, otp: string) {
    try {
      return await account.createSession(userId, otp)
    } catch (error) {
      throw error
    }
  }

  // OAuth2 Authentication
  async signInWithOAuth(provider: OAuthProvider, successUrl?: string, failureUrl?: string) {
    try {
      const success = successUrl || `${window.location.origin}/`
      const failure = failureUrl || `${window.location.origin}/auth/login`
      
      return account.createOAuth2Session(provider, success, failure)
    } catch (error) {
      throw error
    }
  }

  // Multi-Factor Authentication
  async listMFAFactors() {
    try {
      return await account.listMfaFactors()
    } catch (error) {
      throw error
    }
  }

  async createMFAChallenge(factor: string) {
    try {
      return await account.createMfaChallenge(factor)
    } catch (error) {
      throw error
    }
  }

  async completeMFAChallenge(challengeId: string, otp: string) {
    try {
      return await account.updateMfaChallenge(challengeId, otp)
    } catch (error) {
      throw error
    }
  }

  async enableMFA() {
    try {
      return await account.updateMFA(true)
    } catch (error) {
      throw error
    }
  }

  async disableMFA() {
    try {
      return await account.updateMFA(false)
    } catch (error) {
      throw error
    }
  }

  async createMFARecoveryCodes() {
    try {
      return await account.createMfaRecoveryCodes()
    } catch (error) {
      throw error
    }
  }

  // User Profile Management
  async updateName(name: string) {
    try {
      return await account.updateName(name)
    } catch (error) {
      throw error
    }
  }

  async updateEmail(email: string, password: string) {
    try {
      return await account.updateEmail(email, password)
    } catch (error) {
      throw error
    }
  }

  async updatePhone(phone: string, password: string) {
    try {
      return await account.updatePhone(phone, password)
    } catch (error) {
      throw error
    }
  }

  async updatePassword(password: string, oldPassword: string) {
    try {
      return await account.updatePassword(password, oldPassword)
    } catch (error) {
      throw error
    }
  }

  // Custom User Profile in Database
  async createUserProfile(user: User, additionalData?: Partial<UserProfile>) {
    try {
      const profileData: Partial<UserProfile> = {
        userId: user.$id,
        email: user.email,
        username: additionalData?.username || user.email.split('@')[0],
        displayName: additionalData?.displayName || user.name || user.email.split('@')[0],
        profileImage: additionalData?.profileImage,
        phoneNumber: user.phone || additionalData?.phoneNumber,
        kycStatus: 'pending',
        kycLevel: 0,
        twoFactorEnabled: false,
        isActive: true,
        country: additionalData?.country,
        timezone: additionalData?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferredCurrency: additionalData?.preferredCurrency || 'USD',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        user.$id,
        profileData
      )
    } catch (error) {
      throw error
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      return await databases.getDocument(DATABASE_ID, COLLECTION_IDS.USERS, userId) as unknown as UserProfile
    } catch (error) {
      return null
    }
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      return await databases.updateDocument(
        DATABASE_ID,
        COLLECTION_IDS.USERS,
        userId,
        updateData
      )
    } catch (error) {
      throw error
    }
  }

  // Security Logging
  async logSecurityEvent(userId: string, action: string, metadata: any = {}) {
    try {
      const logData = {
        userId,
        action,
        ipAddress: '', // You would get this from request
        userAgent: navigator.userAgent,
        location: '', // You would get this from IP geolocation
        success: true,
        riskScore: 0,
        metadata: JSON.stringify(metadata),
        createdAt: new Date().toISOString(),
      }

      return await databases.createDocument(
        DATABASE_ID,
        COLLECTION_IDS.SECURITY_LOGS,
        ID.unique(),
        logData
      )
    } catch (error) {
      // Don't throw on logging errors
      console.error('Failed to log security event:', error)
    }
  }
}

export const authService = new AuthService()