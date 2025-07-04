'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  loginEmailPassword, 
  sendEmailOtp, 
  completeEmailOtpLogin, 
  sendMagicUrl, 
  completeMagicUrlLogin 
} from '@/lib/appwrite'
import { ID } from 'appwrite'
import Link from 'next/link'

type Mode = 'email' | 'otp' | 'magic'

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpUserId, setOtpUserId] = useState('')
  const [otpSecret, setOtpSecret] = useState('')
  const [otp, setOtp] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [magicUserId, setMagicUserId] = useState('')
  const [magicSecret, setMagicSecret] = useState('')

  // Email/password login
  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await loginEmailPassword(email, password)
      window.location.href = '/home'
    } catch (err: any) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  // Email OTP flow
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await sendEmailOtp(email)
      setOtpUserId(res.userId)
      setOtpSecret(res.secret || '')
      setOtpSent(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }
  async function handleOtpLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await completeEmailOtpLogin(otpUserId, otp)
      window.location.href = '/home'
    } catch (err: any) {