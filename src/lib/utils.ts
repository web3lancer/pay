import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combines and merges class names with Tailwind CSS
 */
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
export function formatCurrency(
  amount: number,
  currency = 'USD',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Format crypto amounts with appropriate decimal places
 */
export function formatCryptoAmount(
  amount: number,
  symbol: string,
  significantDigits = 6
): string {
  // Different symbols may have different decimal place conventions
  const decimalPlaces: { [key: string]: number } = {
    'BTC': 8,
    'ETH': 6,
    'USDC': 2,
    'USDT': 2,
    'SOL': 4,
    'DOT': 4
  }
  
  const places = decimalPlaces[symbol] || significantDigits
  
  // Use toFixed for exact decimal places
  return `${amount.toFixed(places)} ${symbol}`
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