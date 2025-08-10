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
import Image from 'next/image'

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
      // Appwrite returns { userId, secret, phrase? }
      const res = await sendEmailOtp(email)
      setOtpUserId(res.userId)
      // secret is not needed for login, only for phrase display (optional)
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
      // Only need userId and OTP code
      await completeEmailOtpLogin(otpUserId, otp)
      window.location.href = '/home'
    } catch (err: any) {
      setError(err?.message || 'OTP login failed')
    } finally {
      setLoading(false)
    }
  }

  // Magic URL flow
  async function handleSendMagic(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const redirectUrl = window.location.origin + '/auth/login'
      // Appwrite returns { userId, secret }
      await sendMagicUrl(email, redirectUrl)
      setMagicSent(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }
  async function handleMagicLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await completeMagicUrlLogin(magicUserId, magicSecret)
      window.location.href = '/home'
    } catch (err: any) {
      setError(err?.message || 'Magic link login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Card className="w-full max-w-xs sm:max-w-sm md:max-w-md shadow-2xl" />
        <div className="flex justify-center pt-8 pb-2">
          <Image
            src="/images/logo.png"
            alt="LancerPay Logo"
            width={56}
            height={56}
            className="rounded-xl shadow-lg"
            priority
          />
        </div>
        <CardHeader className="text-center">
          <CardTitle>Sign In</CardTitle>
          <CardDescription>
            Welcome back! Choose a login method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center space-x-1 mb-4">
            <Button 
              variant={mode === 'email' ? 'primary' : 'outline'} 
              onClick={() => setMode('email')}
              size="sm"
            >
              Email/Password
            </Button>
            <Button 
              variant={mode === 'otp' ? 'primary' : 'outline'} 
              onClick={() => setMode('otp')}
              size="sm"
            >
              Email OTP
            </Button>
            <Button 
              variant={mode === 'magic' ? 'primary' : 'outline'} 
              onClick={() => setMode('magic')}
              size="sm"
            >
              Magic Link
            </Button>
          </div>
          {error && <div className="mb-4 text-red-600 text-sm text-center">{error}</div>}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 text-center">
              <input
                type="email"
                required
                placeholder="Email"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
              />
              <input
                type="password"
                required
                placeholder="Password"
                className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
              <div className="mt-2 text-right">
                <Link href="/auth/reset-password" className="text-sm text-cyan-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
            </form>
          )}
          {mode === 'otp' && (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-center">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleOtpLogin} className="space-y-4 text-center">
                <input
                  type="text"
                  required
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  autoComplete="one-time-code"
                />
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>
              </form>
            )
          )}
          {mode === 'magic' && (
            !magicSent ? (
              <form onSubmit={handleSendMagic} className="space-y-4 text-center">
                <input
                  type="email"
                  required
                  placeholder="Email"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  autoComplete="email"
                />
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Sending Link...' : 'Send Magic Link'}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="text-cyan-700 font-medium">
                  Check your email for a magic link!
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => { setMagicSent(false); setEmail(''); }}
                >
                  Use another email
                </Button>
              </div>
            )
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <span className="text-sm text-neutral-500 text-center">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="text-cyan-600 hover:underline">
              Sign up
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}