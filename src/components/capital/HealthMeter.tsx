'use client'

import React from 'react'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

interface HealthMeterProps {
  healthPercentage: number
  collateralizationRatio: number
  status: 'safe' | 'caution' | 'risk'
  className?: string
}

export function HealthMeter({
  healthPercentage,
  collateralizationRatio,
  status,
  className = ''
}: HealthMeterProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return 'from-green-400 to-green-500'
      case 'caution':
        return 'from-yellow-400 to-yellow-500'
      case 'risk':
        return 'from-red-400 to-red-500'
    }
  }

  const getStatusBg = () => {
    switch (status) {
      case 'safe':
        return 'bg-green-50'
      case 'caution':
        return 'bg-yellow-50'
      case 'risk':
        return 'bg-red-50'
    }
  }

  const getStatusTextColor = () => {
    switch (status) {
      case 'safe':
        return 'text-green-700'
      case 'caution':
        return 'text-yellow-700'
      case 'risk':
        return 'text-red-700'
    }
  }

  const getStatusLabel = () => {
    switch (status) {
      case 'safe':
        return 'Safe'
      case 'caution':
        return 'Caution'
      case 'risk':
        return 'Risk'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'safe':
        return <FiCheckCircle className="w-5 h-5" />
      case 'caution':
        return <FiAlertCircle className="w-5 h-5" />
      case 'risk':
        return <FiAlertCircle className="w-5 h-5" />
    }
  }

  return (
    <div className={className}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-sm font-medium text-neutral-600">Position Health</h3>
          <p className="text-2xl font-bold text-neutral-900 mt-1">
            {collateralizationRatio.toFixed(0)}%
          </p>
        </div>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getStatusBg()}`}>
          <div className={getStatusTextColor()}>
            {getStatusIcon()}
          </div>
          <span className={`text-sm font-semibold ${getStatusTextColor()}`}>
            {getStatusLabel()}
          </span>
        </div>
      </div>

      {/* Health Bar */}
      <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getStatusColor()} transition-all duration-500`}
          style={{ width: `${Math.min(100, healthPercentage)}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2 text-xs text-neutral-600">
        <span>Low Risk (200%+)</span>
        <span>Liquidation (150%)</span>
      </div>

      {/* Info Message */}
      <div className="mt-4 p-3 rounded-lg bg-neutral-50 border border-neutral-200">
        <p className="text-sm text-neutral-700">
          {status === 'safe' && (
            <>Your position is <strong>healthy</strong>. You can borrow more or withdraw collateral safely.</>
          )}
          {status === 'caution' && (
            <>Your position is <strong>approaching caution</strong>. Monitor your health closely to avoid liquidation.</>
          )}
          {status === 'risk' && (
            <>Your position is at <strong>risk</strong>. Add more collateral or repay to avoid liquidation.</>
          )}
        </p>
      </div>
    </div>
  )
}
