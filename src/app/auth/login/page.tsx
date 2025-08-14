'use client'

import { AuthClient } from '../AuthClient'

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

  return <AuthClient mode="login" />;
}