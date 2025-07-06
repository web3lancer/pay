'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { findUserByUsername } from '@/lib/appwrite'
import type { Users } from '@/types/appwrite.d'

export default function UserProfilePage() {
  const params = useParams()
  const username = Array.isArray(params?.username) ? params.username[0] : params?.username
  const [user, setUser] = useState<Users | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!username) return
    setLoading(true)
    findUserByUsername(username)
      .then((u) => {
        if (u) {
          setUser(u)
          setNotFound(false)
        } else {
          setUser(null)
          setNotFound(true)
        }
      })
      .finally(() => setLoading(false))
  }, [username])

  if (loading) {
    return <div className="p-8 text-center">Loading profile...</div>
  }

  if (notFound || !user) {
    return <div className="p-8 text-center text-red-600">User not found</div>
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <div className="flex flex-col items-center gap-4">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.displayName || user.username}
            className="w-24 h-24 rounded-full object-cover border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-cyan-100 flex items-center justify-center text-4xl font-bold text-cyan-600">
            {user.displayName?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-2xl font-bold text-neutral-900">{user.displayName || user.username}</h1>
        <div className="text-neutral-500 text-lg">@{user.username}</div>
        {/* Add more public info here if needed */}
      </div>
      <div className="mt-8 text-center">
        {/* In the future: payment actions, QR, etc. */}
        <span className="text-neutral-400">This is a public payment profile.</span>
      </div>
    </div>
  )
}
