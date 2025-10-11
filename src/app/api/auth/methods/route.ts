/**
 * API Route: Check Auth Methods Available for Email
 * 
 * This endpoint checks if a user exists and returns available auth methods
 * without exposing sensitive user data
 */

import { NextRequest, NextResponse } from 'next/server'
import { Client, Users } from 'node-appwrite'

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')
    
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      )
    }

    // Initialize Appwrite client with API key (server-side only)
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!)

    const users = new Users(client)

    try {
      // Search for user by email
      const userList = await users.list([`search("${email}")`])
      
      if (userList.total === 0) {
        // User doesn't exist - show OTP option
        return NextResponse.json({
          exists: false,
          methods: ['otp'],
        })
      }

      // User exists - check their preferences for auth methods
      const user = userList.users[0]
      const prefs = user.prefs || {}
      
      const methods: string[] = []
      
      // Check for passkey credentials
      if (prefs.passkey_credentials) {
        methods.push('passkey')
      }
      
      // Check for wallet
      if (prefs.walletEth) {
        methods.push('wallet')
      }
      
      // If user has no methods set up, fallback to OTP
      if (methods.length === 0) {
        methods.push('otp')
      }

      return NextResponse.json({
        exists: true,
        methods,
        recommendedMethod: prefs.passkey_credentials ? 'passkey' : methods[0],
      })

    } catch (error: any) {
      // If user not found or error, assume new user
      return NextResponse.json({
        exists: false,
        methods: ['otp'],
      })
    }

  } catch (error: any) {
    console.error('Auth methods check error:', error)
    return NextResponse.json(
      { error: 'Failed to check authentication methods' },
      { status: 500 }
    )
  }
}
