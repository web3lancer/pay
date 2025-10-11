/**
 * ProfilesDB Profiles Table CRUD Operations
 */

import { tablesDB, DATABASE_IDS, PROFILESDB_TABLES, ID, Query, Permission, Role } from '../client'
import type { ProfilesDBProfile, CreateRowData, UpdateRowData, TableDBListResponse } from '../types'

const DB_ID = DATABASE_IDS.PROFILES_DB
const TABLE_ID = PROFILESDB_TABLES.PROFILES

// ===========================
// Create Profile
// ===========================

export async function createProfile(
  data: CreateRowData<ProfilesDBProfile>,
  rowId: string = ID.unique()
) {
  return tablesDB.createRow<ProfilesDBProfile>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data: {
      userId: data.userId,
      name: data.name,
      email: data.email,
      bio: data.bio,
      skills: data.skills,
      location: data.location,
      portfolio: data.portfolio,
      socialLinks: data.socialLinks,
      avatar: data.avatar,
      coverImage: data.coverImage,
      hourlyRate: data.hourlyRate,
      availability: data.availability || 'available',
      languages: data.languages,
      timezone: data.timezone,
      joinedAt: data.joinedAt || new Date().toISOString(),
      lastActive: data.lastActive || new Date().toISOString(),
      verificationStatus: data.verificationStatus || 'unverified',
      rating: data.rating || 0,
      reviewCount: data.reviewCount || 0,
    },
    permissions: [
      Permission.read(Role.any()),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ],
  })
}

// ===========================
// Get Profile
// ===========================

export async function getProfile(rowId: string) {
  return tablesDB.getRow<ProfilesDBProfile>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function getProfileByUserId(userId: string) {
  const response = await tablesDB.listRows<ProfilesDBProfile>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('userId', userId), Query.limit(1)],
  })
  return response.rows[0] || null
}

export async function getProfileByEmail(email: string) {
  const response = await tablesDB.listRows<ProfilesDBProfile>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [Query.equal('email', email), Query.limit(1)],
  })
  return response.rows[0] || null
}

// ===========================
// Update Profile
// ===========================

export async function updateProfile(rowId: string, data: UpdateRowData<ProfilesDBProfile>) {
  return tablesDB.updateRow<ProfilesDBProfile>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
    data,
  })
}

export async function updateProfileByUserId(userId: string, data: UpdateRowData<ProfilesDBProfile>) {
  const profile = await getProfileByUserId(userId)
  if (!profile) {
    throw new Error('Profile not found')
  }
  return updateProfile(profile.$id, data)
}

// ===========================
// Delete Profile
// ===========================

export async function deleteProfile(rowId: string) {
  return tablesDB.deleteRow({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    rowId,
  })
}

export async function deleteProfileByUserId(userId: string) {
  const profile = await getProfileByUserId(userId)
  if (!profile) {
    throw new Error('Profile not found')
  }
  return deleteProfile(profile.$id)
}

// ===========================
// List Profiles
// ===========================

export async function listProfiles(
  queries: string[] = [],
  limit: number = 25,
  offset: number = 0
): Promise<TableDBListResponse<ProfilesDBProfile>> {
  return tablesDB.listRows<ProfilesDBProfile>({
    databaseId: DB_ID,
    tableId: TABLE_ID,
    queries: [...queries, Query.limit(limit), Query.offset(offset)],
  })
}

export async function listVerifiedProfiles(limit: number = 25, offset: number = 0) {
  return listProfiles([Query.equal('verificationStatus', 'verified')], limit, offset)
}

export async function listProfilesBySkill(skill: string, limit: number = 25, offset: number = 0) {
  return listProfiles([Query.search('skills', skill)], limit, offset)
}

export async function listProfilesByLocation(location: string, limit: number = 25, offset: number = 0) {
  return listProfiles([Query.search('location', location)], limit, offset)
}

// ===========================
// Profile Content Operations
// ===========================

export async function updateProfileBio(userId: string, bio: string) {
  return updateProfileByUserId(userId, { bio })
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  return updateProfileByUserId(userId, { avatar: avatarUrl })
}

export async function updateProfileCoverImage(userId: string, coverImageUrl: string) {
  return updateProfileByUserId(userId, { coverImage: coverImageUrl })
}

export async function updateProfileSkills(userId: string, skills: string[]) {
  return updateProfileByUserId(userId, { skills })
}

export async function updateProfileSocialLinks(userId: string, socialLinks: Record<string, string>) {
  return updateProfileByUserId(userId, { socialLinks })
}

export async function updateProfileHourlyRate(userId: string, hourlyRate: number) {
  return updateProfileByUserId(userId, { hourlyRate })
}

export async function updateProfileAvailability(
  userId: string,
  availability: 'available' | 'busy' | 'unavailable'
) {
  return updateProfileByUserId(userId, { availability })
}

// ===========================
// Activity Operations
// ===========================

export async function updateLastActive(userId: string) {
  return updateProfileByUserId(userId, {
    lastActive: new Date().toISOString(),
  })
}

// ===========================
// Rating Operations
// ===========================

export async function updateProfileRating(userId: string, rating: number, reviewCount: number) {
  return updateProfileByUserId(userId, { rating, reviewCount })
}

// ===========================
// Verification Operations
// ===========================

export async function updateVerificationStatus(
  userId: string,
  status: 'unverified' | 'pending' | 'verified'
) {
  return updateProfileByUserId(userId, { verificationStatus: status })
}

// ===========================
// Search Operations
// ===========================

export async function searchProfilesByName(searchTerm: string, limit: number = 25, offset: number = 0) {
  return listProfiles([Query.search('name', searchTerm)], limit, offset)
}
