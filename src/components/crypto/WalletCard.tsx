'use client'

import React from 'react'
import { Card, CardContent, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency, formatCrypto, truncateAddress } from '@/lib/utils'
import { 
  FaBitcoin, 
  FaEthereum, 
  FaDollarSign,
  FaEllipsisV,
  FaPaperPlane,
  FaDownload,
  FaExchangeAlt
} from 'react-icons/fa'

interface CryptoToken {
  symbol: string
  name: string
  balance: number
  usdValue: number
  address: string
  icon?: React.ReactNode
}

interface WalletCardProps {
  wallet: {
    name: string
    address: string
    tokens: CryptoToken[]
    totalUsdValue: number
  }
  className?: string
  onSend?: () => void
  onReceive?: () => void
  onSwap?: () => void
}

const getTokenIcon = (symbol: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    BTC: <FaBitcoin className="text-orange-500" />,
    ETH: <FaEthereum className="text-blue-500" />,
    USD: <FaDollarSign className="text-green-500" />,
  }
  
  return iconMap[symbol] || <div className="w-4 h-4 bg-gray-400 rounded-full" />
}

export const WalletCard: React.FC<WalletCardProps> = ({
  wallet,
  className,
  onSend,
  onReceive,
  onSwap,
}) => {
  const primaryToken = wallet.tokens[0] // Assume first token is primary
  
  return (
    <Card className={cn('relative overflow-hidden', className)} variant="elevated">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-gray-900">{wallet.name}</h3>
            <p className="text-sm text-gray-500 font-mono">
              {truncateAddress(wallet.address)}
            </p>
          </div>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600">
            <FaEllipsisV />
          </Button>
        </div>
        
        {/* Balance */}
        <div className="mb-6">
          <div className="text-2xl font-bold text-gray-900">
            {formatCurrency(wallet.totalUsdValue)}
          </div>
          {primaryToken && (
            <div className="text-sm text-gray-600">
              {formatCrypto(primaryToken.balance, primaryToken.symbol)}
            </div>
          )}
        </div>
        
        {/* Token List */}
        <div className="space-y-2 mb-6">
          {wallet.tokens.slice(0, 3).map((token, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTokenIcon(token.symbol)}
                <div>
                  <div className="text-sm font-medium">{token.symbol}</div>
                  <div className="text-xs text-gray-500">{token.name}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">
                  {formatCrypto(token.balance, token.symbol, 4)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatCurrency(token.usdValue)}
                </div>
              </div>
            </div>
          ))}
          
          {wallet.tokens.length > 3 && (
            <div className="text-xs text-gray-500 text-center pt-2">
              +{wallet.tokens.length - 3} more tokens
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="px-6 pb-6">
        <div className="flex space-x-2 w-full">
          <Button size="sm" onClick={onSend} leftIcon={<FaPaperPlane />} className="flex-1">
            Send
          </Button>
          <Button size="sm" variant="secondary" onClick={onReceive} leftIcon={<FaDownload />} className="flex-1">
            Receive
          </Button>
          <Button size="sm" variant="ghost" onClick={onSwap} leftIcon={<FaExchangeAlt />} className="flex-1">
            Swap
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}