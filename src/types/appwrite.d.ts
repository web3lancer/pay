import { Models } from 'appwrite';

export type Users = Models.Document & {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  profileImage: string | null;
  phoneNumber: string | null;
  kycStatus: string | null;
  kycLevel: number | null;
  twoFactorEnabled: boolean | null;
  isActive: boolean | null;
  country: string | null;
  timezone: string | null;
  preferredCurrency: string | null;
  createdAt: string;
  updatedAt: string;
  wallets: Wallets[] | null;
  transactions: Transactions[] | null;
  paymentRequests: PaymentRequests[] | null;
  securityLogs: SecurityLogs[] | null;
  aPiKeys: ApiKeys[] | null;
}

export type Wallets = Models.Document & {
  walletId: string;
  userId: string;
  walletName: string;
  walletType: string;
  blockchain: string;
  publicKey: string;
  encryptedPrivateKey: string | null;
  walletAddress: string;
  derivationPath: string | null;
  isDefault: boolean | null;
  isActive: boolean | null;
  balance: number | null;
  lastSyncAt: string | null;
  createdAt: string;
  users: Users | null;
  transactions: Transactions[] | null;
}

export type Tokens = Models.Document & {
  tokenId: string;
  symbol: string;
  name: string;
  blockchain: string;
  contractAddress: string | null;
  decimals: number;
  logoUrl: string | null;
  isStablecoin: boolean | null;
  isActive: boolean | null;
  marketCap: number | null;
  currentPrice: number | null;
  priceChange24h: number | null;
  lastPriceUpdate: string | null;
  createdAt: string;
  transactions: Transactions[] | null;
}

export type Transactions = Models.Document & {
  transactionId: string;
  txHash: string | null;
  fromUserId: string;
  toUserId: string[] | null;
  fromWalletId: string;
  toWalletId: string | null;
  fromAddress: string;
  toAddress: string;
  tokenId: string;
  amount: string;
  feeAmount: string | null;
  gasPrice: string | null;
  gasUsed: string | null;
  status: string | null;
  type: string;
  description: string | null;
  metadata: string | null;
  blockNumber: number | null;
  confirmations: number | null;
  createdAt: string;
  confirmedAt: string | null;
  users: Users | null;
  wallets: Wallets | null;
  tokens: Tokens | null;
  paymentRequests: PaymentRequests | null;
}

export type PaymentRequests = Models.Document & {
  requestId: string;
  fromUserId: string;
  toUserId: string | null;
  toEmail: string | null;
  tokenId: string;
  amount: string;
  description: string | null;
  dueDate: string | null;
  status: string | null;
  paymentTxId: string | null;
  invoiceNumber: string | null;
  metadata: string | null;
  createdAt: string;
  paidAt: string | null;
  users: Users | null;
  transactions: Transactions | null;
}

export type ExchangeRates = Models.Document & {
  rateId: string;
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  source: string;
  lastUpdated: string;
  isActive: boolean | null;
}

export type SecurityLogs = Models.Document & {
  logId: string;
  userId: string;
  action: string;
  ipAddress: string;
  userAgent: string | null;
  location: string | null;
  success: boolean;
  riskScore: number | null;
  metadata: string | null;
  createdAt: string;
  users: Users | null;
}

export type ApiKeys = Models.Document & {
  keyId: string;
  userId: string;
  keyName: string;
  publicKey: string;
  hashedSecret: string;
  permissions: string;
  isActive: boolean | null;
  lastUsed: string | null;
  expiresAt: string | null;
  createdAt: string;
  users: Users | null;
}

export type VirtualCards = Models.Document & {
  cardId: string;
  userId: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardType: string;
  status: string;
  linkedWalletId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type VirtualAccounts = Models.Document & {
  accountId: string;
  userId: string;
  accountNumber: string;
  currency: string | null;
  balance: number | null;
  status: string | null;
  linkedWalletId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

