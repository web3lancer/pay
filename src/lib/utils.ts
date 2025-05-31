import clsx, { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

/**
 * Truncates a string based on specified start and end lengths
 */
export function truncateString(
  str: string,
  startLength = 6,
  endLength = 4,
  separator = '...'
): string {
  if (!str) return ''
  if (str.length <= startLength + endLength) return str
  
  return `${str.substring(0, startLength)}${separator}${str.substring(str.length - endLength)}`
}

/**
 * Formats a date relative to current time
 */
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
  }
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
  }
  
  const diffInMonths = Math.floor(diffInDays / 30)
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`
  }
  
  const diffInYears = Math.floor(diffInMonths / 12)
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`
}

/**
 * Format currency values with proper decimal places
 */
export function formatCurrency(amount: number | string, currency: string = 'USD'): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(num)) return '$0.00'
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(num)
}

/**
 * Format crypto amounts with appropriate decimal places
 */
export function formatCryptoAmount(amount: number | string, symbol: string, decimals: number = 8): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(num)) return '0'
  
  // Format based on the amount size
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M ${symbol}`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(2)}K ${symbol}`
  } else if (num >= 1) {
    return `${num.toFixed(4)} ${symbol}`
  } else {
    return `${num.toFixed(decimals)} ${symbol}`
  }
}

/**
 * Format address with truncation
 */
export function formatAddress(address: string, startLength: number = 6, endLength: number = 4): string {
  if (!address || address.length < startLength + endLength) return address
  
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

/**
 * Format time ago
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}

/**
 * Validation utilities
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidBitcoinAddress(address: string): boolean {
  // Basic Bitcoin address validation (simplified)
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/
  return btcRegex.test(address)
}

export function isValidEthereumAddress(address: string): boolean {
  // Basic Ethereum address validation
  const ethRegex = /^0x[a-fA-F0-9]{40}$/
  return ethRegex.test(address)
}

export function getNetworkFromAddress(address: string): string {
  if (isValidBitcoinAddress(address)) return 'bitcoin'
  if (isValidEthereumAddress(address)) return 'ethereum'
  return 'unknown'
}

/**
 * Price utilities
 */
export function calculatePriceChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1e12) return `$${(marketCap / 1e12).toFixed(2)}T`
  if (marketCap >= 1e9) return `$${(marketCap / 1e9).toFixed(2)}B`
  if (marketCap >= 1e6) return `$${(marketCap / 1e6).toFixed(2)}M`
  if (marketCap >= 1e3) return `$${(marketCap / 1e3).toFixed(2)}K`
  return `$${marketCap.toFixed(2)}`
}

/**
 * Transaction utilities
 */
export function generateTransactionId(): string {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

export function getTransactionStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'completed':
    case 'success':
      return 'text-green-600'
    case 'pending':
    case 'processing':
      return 'text-yellow-600'
    case 'failed':
    case 'error':
    case 'cancelled':
      return 'text-red-600'
    default:
      return 'text-neutral-600'
  }
}

export function getTransactionStatusBg(status: string): string {
  switch (status.toLowerCase()) {
    case 'confirmed':
    case 'completed':
    case 'success':
      return 'bg-green-100'
    case 'pending':
    case 'processing':
      return 'bg-yellow-100'
    case 'failed':
    case 'error':
    case 'cancelled':
      return 'bg-red-100'
    default:
      return 'bg-neutral-100'
  }
}

/**
 * Storage utilities
 */
export function setLocalStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function getLocalStorage<T>(key: string, defaultValue?: T): T | null {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue || null
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue || null
  }
}

export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Error removing from localStorage:', error)
  }
}

/**
 * Clipboard utilities
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    console.error('Failed to copy to clipboard:', error)
    return false
  }
}

/**
 * URL utilities
 */
export function generateShareableUrl(username: string, base?: string): string {
  const baseUrl = base || 'https://pay.web3lancer.website'
  return `${baseUrl}/pay/${username}`
}

export function generateQRData(type: 'profile' | 'payment', data: any): string {
  if (type === 'profile') {
    return generateShareableUrl(data.username)
  }
  
  if (type === 'payment') {
    let qrData = `${data.currency.toLowerCase()}:${data.address}`
    const params = new URLSearchParams()
    
    if (data.amount) params.set('amount', data.amount.toString())
    if (data.message) params.set('message', data.message)
    if (data.label) params.set('label', data.label)
    
    if (params.toString()) {
      qrData += `?${params.toString()}`
    }
    
    return qrData
  }
  
  return data.toString()
}

/**
 * Apply easing to animations
 */
export const easings = {
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeSpring: [0.34, 1.56, 0.64, 1],
  easeBounce: [0.68, -0.55, 0.265, 1.55]
}

/**
 * Animation durations
 */
export const durations = {
  instant: 0.1,
  quick: 0.15,
  snappy: 0.2,
  swift: 0.3,
  smooth: 0.4,
  fluid: 0.5,
  gentle: 0.6,
  calm: 0.8,
  slow: 1.0,
  patient: 1.2
}

/**
 * GPU acceleration styles for animations
 */
export const gpuAccelerated = {
  transform: 'translateZ(0)',
  backfaceVisibility: 'hidden' as const,
  perspective: '1000px',
  willChange: 'transform'
}

/**
 * Check if reduced motion is preferred
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}