'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { findUserByUsername, canonizeUsername } from '@/lib/appwrite'
import type { Users } from '@/types/appwrite.d'
import QRCode from 'react-qr-code'
import { FiCopy, FiCheck } from 'react-icons/fi'

export default function UserProfilePage() {
  const params = useParams()
  const username = Array.isArray(params?.username) ? params.username[0] : params?.username
  const [user, setUser] = useState<Users | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [copied, setCopied] = useState(false)

  // Canonize username for link
  const canonUsername = canonizeUsername(username)
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const profileLink = `${baseUrl}/${canonUsername}`

  useEffect(() => {
    if (!username) return
    setLoading(true)
    findUserByUsername(username)
      .then((u) => {
        if (u) {
          setUser(u as Users) // <-- Explicit cast here
          setNotFound(false)
        } else {
          setUser(null)
          setNotFound(true)
        }
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

  if (notFound || !user) {
    return <div className="p-8 text-center text-red-600">User not found</div>
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 flex flex-col items-center gap-6">
        {/* Avatar & Basic Info */}
        <div className="flex flex-col items-center gap-2">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.displayName || user.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-cyan-100 shadow"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-cyan-100 flex items-center justify-center text-4xl font-bold text-cyan-600 border-4 border-cyan-50 shadow">
              {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold text-neutral-900">{user.displayName || user.username}</h1>
          <div className="text-neutral-500 text-lg">@{user.username}</div>
        </div>

        {/* Payment Profile Link Section */}
        <div className="w-full flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-neutral-500 text-sm">Payment Profile Link:</span>
            <span className="font-mono text-sm text-cyan-700 bg-cyan-50 px-2 py-1 rounded">{profileLink}</span>
            <button
              onClick={handleCopy}
              className="p-2 rounded hover:bg-cyan-100 transition-colors"
              title="Copy profile link"
              type="button"
            >
              {copied ? <FiCheck className="text-green-600" /> : <FiCopy className="text-cyan-600" />}
            </button>
          </div>
          <div className="mt-2">
            <QRCode value={profileLink} size={128} bgColor="#fff" fgColor="#0e7490" className="rounded-lg border border-cyan-100 shadow" />
          </div>
        </div>

        {/* About/Info Section */}
        <div className="w-full mt-6">
          <div className="bg-cyan-50 rounded-xl p-4 text-center">
            <span className="text-cyan-800 font-medium">
              This is a public payment profile. Share your link or QR code to receive payments instantly.
            </span>
          </div>
        </div>

        {/* (Optional) More Info Section */}
        {/* <div className="w-full mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-neutral-500">Country</div>
              <div className="font-medium text-neutral-900">{user.country || '-'}</div>
            </div>
            <div>
              <div className="text-xs text-neutral-500">Preferred Currency</div>
              <div className="font-medium text-neutral-900">{user.preferredCurrency || 'USD'}</div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  )
}