import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Crypto formatting utilities
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatCryptoAmount(amount: number, symbol: string, precision: number = 6): string {
  // Adjust precision based on amount size
  let actualPrecision = precision
  if (amount >= 1000) actualPrecision = 2
  else if (amount >= 100) actualPrecision = 3
  else if (amount >= 10) actualPrecision = 4
  else if (amount >= 1) actualPrecision = 5
  
  const formatted = amount.toFixed(actualPrecision)
  
  // Remove trailing zeros
  const cleaned = parseFloat(formatted).toString()
  
  return `${cleaned} ${symbol}`
}

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}

export function formatCompactNumber(num: number): string {
  const formatter = new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1
  })
  return formatter.format(num)
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B'
  }
  if (num >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M'
  }
  if (num >= 1e3) {
    return (num / 1e3).toFixed(2) + 'K'
  }
  return num.toString()
}

// Address validation
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

export function isValidCryptoAddress(address: string, network: string): boolean {
  switch (network.toLowerCase()) {
    case 'bitcoin':
    case 'btc':
      return isValidBitcoinAddress(address)
    case 'ethereum':
    case 'eth':
      return isValidEthereumAddress(address)
    default:
      return false
  }
}

export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return ''
  if (address.length <= chars * 2 + 2) return address
  
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}

// QR code data generation
export function generateQRData(type: 'payment' | 'profile' | 'address', data: any): string {
  switch (type) {
    case 'payment':
      return `web3lancer://pay?to=${data.address}&amount=${data.amount}&currency=${data.currency}&message=${encodeURIComponent(data.message || '')}`
    case 'profile':
      return `web3lancer://profile/${data.username}`
    case 'address':
      return data.address
    default:
      return ''
  }
}

export function parseQRData(qrData: string): { type: string, data: any } | null {
  try {
    if (qrData.startsWith('web3lancer://pay')) {
      const url = new URL(qrData)
      return {
        type: 'payment',
        data: {
          address: url.searchParams.get('to'),
          amount: url.searchParams.get('amount'),
          currency: url.searchParams.get('currency'),
          message: url.searchParams.get('message')
        }
      }
    } else if (qrData.startsWith('web3lancer://profile')) {
      const username = qrData.replace('web3lancer://profile/', '')
      return {
        type: 'profile',
        data: { username }
      }
    } else if (isValidBitcoinAddress(qrData) || isValidEthereumAddress(qrData)) {
      return {
        type: 'address',
        data: { address: qrData }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

// Storage utilities
export function setStorageItem(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn('Failed to set storage item:', error)
  }
}

export function getStorageItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    console.warn('Failed to get storage item:', error)
    return defaultValue
  }
}

export function removeStorageItem(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn('Failed to remove storage item:', error)
  }
}

// Transaction utilities
export function getTransactionStatus(status: string): {
  label: string
  color: string
  bgColor: string
} {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'confirmed':
      return {
        label: 'Completed',
        color: 'text-green-700',
        bgColor: 'bg-green-100'
      }
    case 'pending':
      return {
        label: 'Pending',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100'
      }
    case 'failed':
    case 'error':
      return {
        label: 'Failed',
        color: 'text-red-700',
        bgColor: 'bg-red-100'
      }
    case 'cancelled':
      return {
        label: 'Cancelled',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100'
      }
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-700',
        bgColor: 'bg-gray-100'
      }
  }
}

export function getTransactionTypeIcon(type: string): string {
  switch (type.toLowerCase()) {
    case 'send':
      return '↗️'
    case 'receive':
      return '↙️'
    case 'swap':
      return '🔄'
    case 'buy':
      return '💳'
    case 'sell':
      return '💰'
    default:
      return '💸'
  }
}

// Time utilities
export function formatRelativeTime(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) {
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes}m ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours}h ago`
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days}d ago`
  } else {
    return date.toLocaleDateString()
  }
}

export function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

// Price calculation utilities
export function calculatePriceChange(current: number, previous: number): {
  absolute: number
  percentage: number
  isPositive: boolean
} {
  const absolute = current - previous
  const percentage = previous !== 0 ? (absolute / previous) * 100 : 0
  
  return {
    absolute,
    percentage,
    isPositive: absolute >= 0
  }
}

export function calculatePortfolioValue(holdings: Array<{
  amount: number
  price: number
}>): number {
  return holdings.reduce((total, holding) => {
    return total + (holding.amount * holding.price)
  }, 0)
}

// Copy to clipboard utility
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const result = document.execCommand('copy')
      document.body.removeChild(textArea)
      return result
    } catch (fallbackError) {
      console.error('Failed to copy to clipboard:', fallbackError)
      return false
    }
  }
}

// Network utilities
export function getNetworkInfo(network: string): {
  name: string
  symbol: string
  color: string
  explorer: string
} {
  switch (network.toLowerCase()) {
    case 'bitcoin':
    case 'btc':
      return {
        name: 'Bitcoin',
        symbol: 'BTC',
        color: '#f7931a',
        explorer: 'https://blockchair.com/bitcoin'
      }
    case 'ethereum':
    case 'eth':
      return {
        name: 'Ethereum',
        symbol: 'ETH',
        color: '#627eea',
        explorer: 'https://etherscan.io'
      }
    case 'polygon':
    case 'matic':
      return {
        name: 'Polygon',
        symbol: 'MATIC',
        color: '#8247e5',
        explorer: 'https://polygonscan.com'
      }
    default:
      return {
        name: 'Unknown',
        symbol: '?',
        color: '#gray',
        explorer: ''
      }
  }
}

// Animation utilities
export function generateSparklineData(length: number = 20, volatility: number = 0.1): number[] {
  const data: number[] = []
  let current = 100 // Starting value
  
  for (let i = 0; i < length; i++) {
    const change = (Math.random() - 0.5) * volatility * current
    current = Math.max(0, current + change)
    data.push(current)
  }
  
  return data
}

export function smoothValue(currentValue: number, targetValue: number, factor: number = 0.1): number {
  return currentValue + (targetValue - currentValue) * factor
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Dark mode utilities
export function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return 'light'
}

export function setTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return
  
  const root = window.document.documentElement
  
  if (theme === 'system') {
    const systemTheme = getSystemTheme()
    root.classList.toggle('dark', systemTheme === 'dark')
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }
  
  setStorageItem('theme', theme)
}

// Utility functions for Web3Lancer Pay

export const truncateString = (str: string, startChars: number = 6, endChars: number = 4): string => {
  if (str.length <= startChars + endChars) {
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCryptoAmount = (amount: number, symbol: string): string => {
  // Format crypto amounts with appropriate decimal places
  let decimals = 8; // Default for most cryptocurrencies
  
  // Adjust decimals based on symbol
  if (symbol === 'BTC') decimals = 8;
  else if (symbol === 'ETH') decimals = 6;
  else if (symbol === 'USDC' || symbol === 'USDT') decimals = 2;
  
  const formattedAmount = amount.toFixed(decimals).replace(/\.?0+$/, '');
  return `${formattedAmount} ${symbol}`;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateWalletAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  // Basic Bitcoin address validation
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
  
  return ethRegex.test(address) || btcRegex.test(address);
};

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const generateTransactionId = (): string => {
  return 'tx_' + Math.random().toString(36).substring(2, 15);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export const getTimeAgo = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy text: ', err);
    return false;
  }
};

export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0;
};

export const formatLargeNumber = (num: number): string => {
  if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
  if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
  if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
  return num.toString();
};

export const getRandomGradient = (): string => {
  const gradients = [
    'from-cyan-500 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-green-500 to-emerald-500',
    'from-orange-500 to-red-500',
    'from-indigo-500 to-purple-500',
    'from-pink-500 to-rose-500'
  ];
  return gradients[Math.floor(Math.random() * gradients.length)];
};