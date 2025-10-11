/**
 * Storage Bucket Operations
 * Handles file uploads, downloads, and management across all buckets
 */

import { storage, BUCKET_IDS, ID, Permission, Role } from '../client'

// ===========================
// Upload File
// ===========================

export async function uploadFile(
  bucketId: string,
  file: File,
  fileId: string = ID.unique(),
  permissions?: string[]
) {
  return storage.createFile(bucketId, fileId, file, permissions)
}

// Upload to specific buckets
export async function uploadUserAsset(file: File, userId: string, fileId?: string) {
  return uploadFile(
    BUCKET_IDS.PAY_USER_ASSETS,
    file,
    fileId,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  )
}

export async function uploadAppAsset(file: File, fileId?: string) {
  return uploadFile(BUCKET_IDS.PAY_APP_ASSETS, file, fileId, [Permission.read(Role.any())])
}

export async function uploadDocument(file: File, userId: string, fileId?: string) {
  return uploadFile(
    BUCKET_IDS.PAY_DOCUMENTS,
    file,
    fileId,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  )
}

export async function uploadProfileAvatar(file: File, userId: string, fileId?: string) {
  return uploadFile(
    BUCKET_IDS.PROFILE_AVATARS,
    file,
    fileId,
    [Permission.read(Role.any()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
  )
}

export async function uploadCoverImage(file: File, userId: string, fileId?: string) {
  return uploadFile(
    BUCKET_IDS.COVER_IMAGES,
    file,
    fileId,
    [Permission.read(Role.any()), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
  )
}

export async function uploadVerificationDocument(file: File, userId: string, fileId?: string) {
  return uploadFile(
    BUCKET_IDS.VERIFICATION_DOCUMENTS,
    file,
    fileId,
    [Permission.read(Role.user(userId)), Permission.update(Role.user(userId)), Permission.delete(Role.user(userId))]
  )
}

export async function uploadTempFile(file: File, userId: string, fileId?: string) {
  return uploadFile(
    BUCKET_IDS.PAY_TEMP_FILES,
    file,
    fileId,
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ]
  )
}

// ===========================
// Get File
// ===========================

export async function getFile(bucketId: string, fileId: string) {
  return storage.getFile(bucketId, fileId)
}

export async function getFileView(bucketId: string, fileId: string) {
  return storage.getFileView(bucketId, fileId)
}

export async function getFileDownload(bucketId: string, fileId: string) {
  return storage.getFileDownload(bucketId, fileId)
}

export async function getFilePreview(
  bucketId: string,
  fileId: string,
  width?: number,
  height?: number,
  quality?: number
) {
  return storage.getFilePreview(bucketId, fileId, width, height, undefined, undefined, undefined, undefined, quality)
}

// ===========================
// Update File
// ===========================

export async function updateFile(bucketId: string, fileId: string, name?: string, permissions?: string[]) {
  return storage.updateFile(bucketId, fileId, name, permissions)
}

// ===========================
// Delete File
// ===========================

export async function deleteFile(bucketId: string, fileId: string) {
  return storage.deleteFile(bucketId, fileId)
}

// ===========================
// List Files
// ===========================

export async function listFiles(bucketId: string, queries?: string[]) {
  return storage.listFiles(bucketId, queries)
}

export async function listUserAssets(userId: string) {
  return listFiles(BUCKET_IDS.PAY_USER_ASSETS)
}

export async function listUserDocuments(userId: string) {
  return listFiles(BUCKET_IDS.PAY_DOCUMENTS)
}

// ===========================
// Helper Functions
// ===========================

export function getFileUrl(bucketId: string, fileId: string): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/view?project=${projectId}`
}

export function getFileDownloadUrl(bucketId: string, fileId: string): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  return `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/download?project=${projectId}`
}

export function getFilePreviewUrl(
  bucketId: string,
  fileId: string,
  width?: number,
  height?: number,
  quality?: number
): string {
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!
  let url = `${endpoint}/storage/buckets/${bucketId}/files/${fileId}/preview?project=${projectId}`
  if (width) url += `&width=${width}`
  if (height) url += `&height=${height}`
  if (quality) url += `&quality=${quality}`
  return url
}

// ===========================
// Batch Operations
// ===========================

export async function deleteFiles(bucketId: string, fileIds: string[]) {
  return Promise.all(fileIds.map(fileId => deleteFile(bucketId, fileId)))
}

// ===========================
// Validation
// ===========================

export function validateFileSize(file: File, maxSizeInMB: number): boolean {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024
  return file.size <= maxSizeInBytes
}

export function validateFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type)
}

export function validateImageFile(file: File, maxSizeInMB: number = 5): boolean {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validateFileType(file, allowedTypes) && validateFileSize(file, maxSizeInMB)
}

export function validateDocumentFile(file: File, maxSizeInMB: number = 10): boolean {
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
  return validateFileType(file, allowedTypes) && validateFileSize(file, maxSizeInMB)
}
