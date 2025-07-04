'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { 
  signupEmailPassword, 
  sendEmailOtp, 
  completeEmailOtpLogin, 
  sendMagicUrl, 
  completeMagicUrlLogin,
  sendEmailVerification,
  getEmailVerificationStatus,
  loginEmailPassword
} from '@/lib/appwrite'
import { ID } from 'appwrite'
import Link from 'next/link'
import Image from 'next/image'

type Mode = 'email' | 'otp' | 'magic'

export default function SignupPage() {
  const [mode, setMode] = useState<Mode>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otpUserId, setOtpUserId] = useState('')
  const [otpSecret, setOtpSecret] = useState('')
  const [otp, setOtp] = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [magicUserId, setMagicUserId] = useState('')
  const [magicSecret, setMagicSecret] = useState('')
  const [showVerifyNotice, setShowVerifyNotice] = useState(false)

  // Email/password signup
  async function handleEmailSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (password !== password2) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    try {
      await signupEmailPassword(email, password, name) // Pass name here
      await loginEmailPassword(email, password) // Ensure session is created
      await sendEmailVerification(window.location.origin + '/auth/verify')
      setShowVerifyNotice(true)
    } catch (err: any) {
      setError(err?.message || 'Signup failed')
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
  async function handleOtpSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await completeEmailOtpLogin(otpUserId, otp)
      window.location.href = '/home'
    } catch (err: any) {
      setError(err?.message || 'OTP signup failed')
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
      const redirectUrl = window.location.origin + '/auth/signup'
      const res = await sendMagicUrl(email, redirectUrl)
      setMagicUserId(res.userId)
      setMagicSecret(res.secret || '')
      setMagicSent(true)
    } catch (err: any) {
      setError(err?.message || 'Failed to send magic link')
    } finally {
      setLoading(false)
    }
  }
  async function handleMagicSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await completeMagicUrlLogin(magicUserId, magicSecret)
      window.location.href = '/home'
    } catch (err: any) {
      setError(err?.message || 'Magic link signup failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Card className="w-full max-w-md shadow-2xl">
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
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>
            Create your account with your preferred method.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showVerifyNotice ? (
            <div className="text-center space-y-4 py-8">
              <div className="text-cyan-700 font-medium text-lg">
                Please check your email to verify your account.
              </div>
              <div className="text-neutral-500 text-sm">
                After verifying, you can log in.
              </div>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => window.location.href = '/auth/login'}
              >
                Go to Login
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex justify-center space-x-2 mb-6">
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
                <form onSubmit={handleEmailSignup} className="space-y-4 text-center">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    autoComplete="name"
                  />
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
                    autoComplete="new-password"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Re-enter Password"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-cyan-500 outline-none text-center"
                    value={password2}
                    onChange={e => setPassword2(e.target.value)}
                    autoComplete="new-password"
                  />
                  <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                    {loading ? 'Signing up...' : 'Sign Up'}
                  </Button>
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
                  <form onSubmit={handleOtpSignup} className="space-y-4 text-center">
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
                      {loading ? 'Verifying...' : 'Verify & Signup'}
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
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <span className="text-sm text-neutral-500 text-center">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-cyan-600 hover:underline">
              Sign in
            </Link>
          </span>
          <span className="text-xs text-neutral-400 text-center">
            <Link href="/auth/reset-password" className="text-cyan-500 hover:underline">
              Forgot password?
            </Link>
          </span>
        </CardFooter>
      </Card>
    </div>
  )
}