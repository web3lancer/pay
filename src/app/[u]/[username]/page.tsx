'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { findUserByUsername, findUserById, canonizeUsername } from '@/lib/appwrite'
import type { Users } from '@/types/appwrite.d'
import QRCode from 'react-qr-code'
import { FiCopy, FiCheck, FiMessageCircle } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

export default function UserProfilePage() {
  const params = useParams()
  const username = Array.isArray(params?.username) ? params.username[0] : params?.username
  const [user, setUser] = useState<Users | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)
  const { userProfile } = useAuth()

  // Canonize username for link
  const canonUsername = canonizeUsername(username)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const profileLink = `${baseUrl}/u/${canonUsername}`
  const messageLink = `https://www.web3lancer.website/u/${canonUsername}`

  // Determine if the logged-in user is viewing their own profile
  const isOwnProfile =
    userProfile &&
    user &&
    (userProfile.userId === user.userId ||
      canonizeUsername(userProfile.username) === canonUsername)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setNotFound(false)
    
    // First try to find by username
    findUserByUsername(username)
      .then((u) => {
        if (u) {
          setUser(u as Users)
          setNotFound(false)
        } else {
          // If not found by username, try by userId (fallback)
          return findUserById(username)
        }
        return null
      })
      .then((u) => {
        if (u) {
          setUser(u as Users)
          setNotFound(false)
        } else if (!user) {
          // Only set not found if we haven't found a user yet
          setNotFound(true)
        }
      })
      .catch((error) => {
        console.error('Error loading user profile:', error)
        setNotFound(true)
      })
      .finally(() => setLoading(false))
  }, [username])

  const handleCopy = () => {
    if (!profileLink) return
    navigator.clipboard.writeText(profileLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>
  }

  if (notFound) {
    return <div className="p-8 text-center text-red-600">User not found</div>
  }

  // Always show the profile if found in the Users collection, even if not logged in
  if (!user) {
    return <div className="p-8 text-center text-neutral-500">Profile unavailable.</div>
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <div className="bg-white rounded-3xl shadow-xl border border-neutral-200 p-8 flex flex-col items-center gap-8">
        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center gap-3">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.displayName || user.username}
              className="w-28 h-28 rounded-full object-cover border-4 border-cyan-100 shadow"
            />
          ) : (
            <div className="w-28 h-28 rounded-full bg-cyan-100 flex items-center justify-center text-5xl font-bold text-cyan-600 border-4 border-cyan-50 shadow">
              {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl font-bold text-neutral-900">{user.displayName || user.username}</h1>
          <div className="text-neutral-500 text-lg">@{user.username}</div>
          <button
            className="mt-2 flex items-center gap-2 px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-full font-medium shadow transition-colors"
            onClick={() => window.open(messageLink, '_blank', 'noopener')}
            title="Message on Web3Lancer"
            type="button"
          >
            <FiMessageCircle className="w-5 h-5" />
            Message
          </button>
        </div>

        {/* Payment Profile Link Section */}
        <div className="w-full flex flex-col items-center gap-3">
          <div className="flex flex-col md:flex-row items-center gap-2 w-full justify-center">
            <span className="text-neutral-500 text-sm">Payment Profile Link:</span>
            <div className="flex items-center w-full md:w-auto gap-2 justify-center">
              <span
                className="font-mono text-sm text-cyan-700 bg-cyan-50 px-2 py-1 rounded truncate max-w-[180px] md:max-w-xs"
                title={profileLink}
                style={{ display: 'inline-block' }}
              >
                {profileLink}
              </span>
              <button
                onClick={handleCopy}
                className="p-2 rounded hover:bg-cyan-100 transition-colors"
                title="Copy profile link"
                type="button"
              >
                {copied ? <FiCheck className="text-green-600" /> : <FiCopy className="text-cyan-600" />}
              </button>
            </div>
          </div>
          <div className="mt-2 flex justify-center w-full">
            <QRCode value={profileLink} size={144} bgColor="#fff" fgColor="#0e7490" className="rounded-lg border border-cyan-100 shadow" />
          </div>
        </div>

        {/* About/Info Section */}
        <div className="w-full mt-6">
          <div className="bg-cyan-50 rounded-xl p-5 text-center">
            <span className="text-cyan-800 font-medium">
              {isOwnProfile
                ? "This is your public payment profile. Share your link or QR code to receive payments instantly."
                : `This is @${user.username}'s public profile. Share this link or QR code to send payments instantly.`
              }
            </span>
          </div>
        </div>

        {/* (Optional) More Info Section */}
        <div className="w-full mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-50 rounded-lg p-4 text-center">
            <div className="text-xs text-neutral-500">Country</div>
            <div className="font-medium text-neutral-900">{user.country || '-'}</div>
          </div>
          <div className="bg-neutral-50 rounded-lg p-4 text-center">
            <div className="text-xs text-neutral-500">Preferred Currency</div>
            <div className="font-medium text-neutral-900">{user.preferredCurrency || 'USD'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}