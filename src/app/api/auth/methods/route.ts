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

    // Check if API key is configured
    const apiKey = process.env.APPWRITE_API_KEY
    if (!apiKey || apiKey.trim() === '') {
      console.warn('APPWRITE_API_KEY is not configured, using fallback auth methods')
      // Fallback: Allow all auth methods for new users
      return NextResponse.json({
        exists: false,
        methods: ['passkey', 'wallet', 'otp'],
        recommendedMethod: 'otp',
      })
    }

    // Initialize Appwrite client with API key (server-side only)
    const client = new Client()
      .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
      .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
      .setKey(apiKey)

    const users = new Users(client)

    try {
      // Search for user by email
      const userList = await users.list([`search("${email}")`])
      
      if (userList.total === 0) {
        // User doesn't exist - show all auth methods
        return NextResponse.json({
          exists: false,
          methods: ['passkey', 'wallet', 'otp'],
          recommendedMethod: 'otp',
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
      
      // Always allow OTP as a fallback
      methods.push('otp')

      return NextResponse.json({
        exists: true,
        methods,
        recommendedMethod: prefs.passkey_credentials ? 'passkey' : methods[0],
      })

    } catch (error: any) {
      console.error('User lookup error:', error)
      // If user not found or error, assume new user
      return NextResponse.json({
        exists: false,
        methods: ['passkey', 'wallet', 'otp'],
        recommendedMethod: 'otp',
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
