/**
 * Mezo Integration Types
 * 
 * Defines all types and interfaces for Mezo protocol integration.
 * This includes collateralized borrowing, position management, and liquidation handling.
 */

export interface MezoCreditPosition {
  id: string
  userId: string
  collateralAsset: 'BTC' | 'ETH' | 'USDC'
  collateralAmount: number
  borrowedAmount: number
  borrowedAsset: 'MUSD'
  collateralizationRatio: number
  liquidationRatio: number
  interestRate: number
  createdAt: Date
  updatedAt: Date
  status: 'active' | 'pending' | 'liquidating' | 'closed'
  transactionHash?: string
}

export interface MezoBorrowRequest {
  collateralAsset: 'BTC' | 'ETH' | 'USDC'
  collateralAmount: number
  borrowAmount: number
  borrowedAsset: 'MUSD'
}

export interface MezoTransactionResult {
  transactionHash: string
  blockNumber: number
  status: 'success' | 'pending' | 'failed'
  positionId: string
  timestamp: Date
  amount: number
  type: 'deposit' | 'borrow' | 'repay' | 'withdraw' | 'liquidate'
}

export interface MezoHealthData {
  collateralizationRatio: number
  liquidationThreshold: number
  status: 'safe' | 'caution' | 'risk'
  distanceToLiquidation: number
  estimatedLiquidationPrice: number
}

export interface MezoRepayRequest {
  positionId: string
  repayAmount: number
}

export interface MezoWithdrawRequest {
  positionId: string
  withdrawAmount: number
}

/**
 * Mezo Service Interface
 * Defines all methods for interacting with Mezo protocol
 */
export interface IMezoService {
  // Position Management
  createPosition(request: MezoBorrowRequest): Promise<MezoCreditPosition>
  getPosition(positionId: string): Promise<MezoCreditPosition>
  getUserPositions(userId: string): Promise<MezoCreditPosition[]>

  // Borrowing Operations
  borrow(positionId: string, amount: number): Promise<MezoTransactionResult>
  repay(request: MezoRepayRequest): Promise<MezoTransactionResult>
  withdraw(request: MezoWithdrawRequest): Promise<MezoTransactionResult>

  // Health Monitoring
  getHealthData(positionId: string): Promise<MezoHealthData>
  calculateMaxBorrowable(collateralAmount: number, collateralAsset: string): Promise<number>
  calculateCollateralizationRatio(collateralAmount: number, borrowedAmount: number): Promise<number>

  // Price Data
  getPriceData(asset: string): Promise<{ price: number; timestamp: Date }>

  // Liquidation
  checkLiquidationRisk(positionId: string): Promise<boolean>
}
