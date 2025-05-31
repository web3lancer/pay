// filepath: /home/nathfavour/Documents/code/web3lancer/pay/src/lib/storage.ts
import { storage, ID, BUCKET_IDS } from '@/lib/appwrite'
import { Permission, Role, ImageGravity } from 'appwrite'

export interface UploadedFile {
  $id: string
  $createdAt: string
  $updatedAt: string
  name: string
  signature: string
  mimeType: string
  sizeOriginal: number
  bucketId: string
  $permissions: string[]
}

export interface FileUploadOptions {
  fileName?: string
  permissions?: string[]
  onProgress?: (progress: number) => void
}

export class StorageService {
  // User Assets - Profile images, KYC documents
  static async uploadUserAsset(
    userId: string, 
    file: File, 
    path: string, 
    options?: FileUploadOptions
  ): Promise<UploadedFile> {
    try {
      const fileId = options?.fileName || ID.unique()
      const permissions = options?.permissions || [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]

      const fullPath = `users/${userId}/${path}/${fileId}`
      
      return await storage.createFile(
        BUCKET_IDS.USER_ASSETS,
        fileId,
        file,
        permissions
      )
    } catch (error) {
      console.error('Upload user asset failed:', error)
      throw error
    }
  }

  static async getUserAsset(fileId: string): Promise<string> {
    try {
      return storage.getFileView(BUCKET_IDS.USER_ASSETS, fileId).toString()
    } catch (error) {
      console.error('Get user asset failed:', error)
      throw error
    }
  }

  static async deleteUserAsset(fileId: string): Promise<void> {
    try {
      await storage.deleteFile(BUCKET_IDS.USER_ASSETS, fileId)
    } catch (error) {
      console.error('Delete user asset failed:', error)
      throw error
    }
  }

  // Profile image management
  static async uploadProfileImage(userId: string, file: File): Promise<UploadedFile> {
    return this.uploadUserAsset(userId, file, 'profile', {
      fileName: 'avatar'
    })
  }

  static async uploadKYCDocument(
    userId: string, 
    file: File, 
    documentType: 'id_front' | 'id_back' | 'proof_of_address' | 'verification_selfie'
  ): Promise<UploadedFile> {
    const path = documentType === 'verification_selfie' ? 'kyc/selfie' : 'kyc/documents'
    return this.uploadUserAsset(userId, file, path, {
      fileName: documentType
    })
  }

  // Documents - Statements, exports, compliance
  static async uploadDocument(
    userId: string,
    file: File,
    category: 'statements' | 'exports' | 'compliance',
    subcategory?: string,
    options?: FileUploadOptions
  ): Promise<UploadedFile> {
    try {
      const fileId = options?.fileName || ID.unique()
      const permissions = options?.permissions || [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]

      return await storage.createFile(
        BUCKET_IDS.DOCUMENTS,
        fileId,
        file,
        permissions
      )
    } catch (error) {
      console.error('Upload document failed:', error)
      throw error
    }
  }

  static async getDocument(fileId: string): Promise<string> {
    try {
      return storage.getFileView(BUCKET_IDS.DOCUMENTS, fileId).toString()
    } catch (error) {
      console.error('Get document failed:', error)
      throw error
    }
  }

  static async downloadDocument(fileId: string): Promise<string> {
    try {
      return storage.getFileDownload(BUCKET_IDS.DOCUMENTS, fileId).toString()
    } catch (error) {
      console.error('Download document failed:', error)
      throw error
    }
  }

  // Backup files - Wallet backups, data exports
  static async uploadBackup(
    userId: string,
    file: File,
    backupType: 'wallet_backups' | 'data_exports' | 'recovery',
    options?: FileUploadOptions
  ): Promise<UploadedFile> {
    try {
      const fileId = options?.fileName || ID.unique()
      const permissions = [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]

      return await storage.createFile(
        BUCKET_IDS.BACKUPS,
        fileId,
        file,
        permissions
      )
    } catch (error) {
      console.error('Upload backup failed:', error)
      throw error
    }
  }

  static async getBackup(fileId: string): Promise<string> {
    try {
      return storage.getFileDownload(BUCKET_IDS.BACKUPS, fileId).toString()
    } catch (error) {
      console.error('Get backup failed:', error)
      throw error
    }
  }

  // Temporary files - QR codes, receipts, processing files
  static async uploadTempFile(
    userId: string,
    file: File,
    category: 'uploads' | 'processing' | 'cache',
    options?: FileUploadOptions
  ): Promise<UploadedFile> {
    try {
      const fileId = options?.fileName || ID.unique()
      const permissions = [
        Permission.read(Role.user(userId)),
        Permission.write(Role.user(userId)),
        Permission.delete(Role.user(userId))
      ]

      return await storage.createFile(
        BUCKET_IDS.TEMP_FILES,
        fileId,
        file,
        permissions
      )
    } catch (error) {
      console.error('Upload temp file failed:', error)
      throw error
    }
  }

  static async getTempFile(fileId: string): Promise<string> {
    try {
      return storage.getFileView(BUCKET_IDS.TEMP_FILES, fileId).toString()
    } catch (error) {
      console.error('Get temp file failed:', error)
      throw error
    }
  }

  // App assets - Public token logos, UI assets
  static async getAppAsset(fileId: string): Promise<string> {
    try {
      return storage.getFileView(BUCKET_IDS.APP_ASSETS, fileId).toString()
    } catch (error) {
      console.error('Get app asset failed:', error)
      throw error
    }
  }

  static async getTokenLogo(tokenSymbol: string): Promise<string> {
    try {
      return storage.getFileView(BUCKET_IDS.APP_ASSETS, `tokens/logos/${tokenSymbol.toLowerCase()}.png`).toString()
    } catch (error) {
      // Return default token icon if specific logo not found
      return storage.getFileView(BUCKET_IDS.APP_ASSETS, 'tokens/logos/default.png').toString()
    }
  }

  static async getChainLogo(chainName: string): Promise<string> {
    try {
      return storage.getFileView(BUCKET_IDS.APP_ASSETS, `tokens/chains/${chainName.toLowerCase()}.png`).toString()
    } catch (error) {
      // Return default chain icon if specific logo not found
      return storage.getFileView(BUCKET_IDS.APP_ASSETS, 'tokens/chains/default.png').toString()
    }
  }

  // File management utilities
  static async listUserFiles(
    userId: string,
    bucketId: string,
    limit = 25,
    offset = 0
  ): Promise<{ files: UploadedFile[]; total: number }> {
    try {
      const response = await storage.listFiles(bucketId)
      
      // Filter files by user permissions
      const userFiles = response.files.filter(file => 
        file.$permissions.some(permission => 
          permission.includes(`user:${userId}`)
        )
      )

      return {
        files: userFiles.slice(offset, offset + limit),
        total: userFiles.length
      }
    } catch (error) {
      console.error('List user files failed:', error)
      throw error
    }
  }

  static async deleteFile(bucketId: string, fileId: string): Promise<void> {
    try {
      await storage.deleteFile(bucketId, fileId)
    } catch (error) {
      console.error('Delete file failed:', error)
      throw error
    }
  }

  static async getFilePreview(
    bucketId: string,
    fileId: string,
    width = 400,
    height = 400,
    gravity: ImageGravity = ImageGravity.Center,
    quality = 100
  ): Promise<string> {
    try {
      return storage.getFilePreview(
        bucketId,
        fileId,
        width,
        height,
        gravity,
        quality
      ).toString()
    } catch (error) {
      console.error('Get file preview failed:', error)
      throw error
    }
  }

  // Generate file upload progress handler
  static createProgressHandler(onProgress?: (progress: number) => void) {
    return (progress: ProgressEvent) => {
      if (progress.lengthComputable && onProgress) {
        const percentComplete = (progress.loaded / progress.total) * 100
        onProgress(Math.round(percentComplete))
      }
    }
  }

  // Validate file before upload
  static validateFile(
    file: File,
    maxSize: number,
    allowedTypes: string[]
  ): { valid: boolean; error?: string } {
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} not allowed`
      }
    }

    return { valid: true }
  }

  // Common file validation presets
  static readonly FILE_LIMITS = {
    PROFILE_IMAGE: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    },
    KYC_DOCUMENT: {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
    },
    BACKUP_FILE: {
      maxSize: 100 * 1024 * 1024, // 100MB
      allowedTypes: ['application/json', 'text/plain', 'application/octet-stream']
    },
    DOCUMENT: {
      maxSize: 25 * 1024 * 1024, // 25MB
      allowedTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/csv',
        'application/vnd-ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ]
    }
  }
}

export default StorageService