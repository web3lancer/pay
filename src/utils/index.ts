// Utility functions for Web3Lancer Pay

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatCrypto = (amount: number, symbol: string): string => {
  const formattedAmount = amount.toFixed(8).replace(/\.?0+$/, '');
  return `${formattedAmount} ${symbol}`;
};

export const shortenAddress = (address: string, chars: number = 4): string => {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
};

export const generateTransactionId = (): string => {
  return 'tx_' + Math.random().toString(36).substring(2, 15);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateWalletAddress = (address: string): boolean => {
  // Basic Ethereum address validation
  const ethRegex = /^0x[a-fA-F0-9]{40}$/;
  return ethRegex.test(address);
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

export const calculateTransactionFee = (amount: number, feePercentage: number = 0.01): number => {
  return amount * feePercentage;
};

export const generateQRCodeData = (address: string, amount?: number): string => {
  let qrData = `ethereum:${address}`;
  if (amount) {
    qrData += `?value=${amount}`;
  }
  return qrData;
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

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const randomBetween = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
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

export const createNotification = (title: string, message: string, type: 'success' | 'error' | 'info' = 'info') => {
  // This would integrate with a notification system
  console.log(`${type.toUpperCase()}: ${title} - ${message}`);
  
  // For now, we'll show a simple alert
  if (type === 'error') {
    alert(`Error: ${title}\n${message}`);
  } else {
    console.log(`${title}: ${message}`);
  }
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  // Analytics tracking would go here
  console.log('Track Event:', eventName, properties);
};

export const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
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

export const truncateString = (str: string, startChars: number = 6, endChars: number = 4): string => {
  if (str.length <= startChars + endChars) {
    return str;
  }
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
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