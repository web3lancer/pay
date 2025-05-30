'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { cn, formatCurrency, formatCrypto, truncateAddress } from '@/lib/utils'
import {
  FaEthereum,
  FaBitcoin
} from 'react-icons/fa'
import {
  FiSend,
  FiDownload,
  FiRepeat,
  FiMoreHorizontal
} from 'react-icons/fi'

interface WalletCardProps {
  name: string
  address: string
  balance: {
    crypto: number
    usd: number
  }
  symbol: string
  icon?: React.ReactNode
  className?: string
}

export function WalletCard({ 
  name, 
  address, 
  balance, 
  symbol, 
  icon = <FaBitcoin className="h-5 w-5" />,
  className 
}: WalletCardProps) {
  return (
    <Card className={cn('group', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              {icon}
            </div>
            <div>
              <CardTitle className="text-base">{name}</CardTitle>
              <p className="text-xs text-neutral-500 font-mono">
                {truncateAddress(address)}
              </p>
            </div>
          </div>
          <button className="p-2 text-neutral-400 hover:text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
            <FiMoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-2 mb-4">
          <p className="text-2xl font-bold text-neutral-900">
            {formatCurrency(balance.usd)}
          </p>
          <p className="text-sm text-neutral-600 font-mono">
            {formatCrypto(balance.crypto, symbol)}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" icon={<FiSend className="h-4 w-4" />}>
            Send
          </Button>
          <Button size="sm" variant="secondary" className="flex-1" icon={<FiDownload className="h-4 w-4" />}>
            Receive
          </Button>
          <Button size="sm" variant="ghost" icon={<FiRepeat className="h-4 w-4" />}>
            Swap
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}