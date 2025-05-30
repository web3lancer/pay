'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts'
import { FiArrowUp, FiArrowDown } from 'react-icons/fi'
import { cn } from '@/lib/utils'

type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'ALL'

interface PriceChartProps {
  data: Array<{
    timestamp: Date | number | string
    price: number
    volume?: number
  }>
  currency: string
  symbol?: string
  percentChange?: number
  timeRanges?: TimeRange[]
  onTimeRangeChange?: (range: TimeRange) => void
  chartHeight?: number
  advanced?: boolean
  loading?: boolean
  className?: string
}

export function PriceChart({
  data,
  currency,
  symbol = 'BTC',
  percentChange = 0,
  timeRanges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'],
  onTimeRangeChange,
  chartHeight = 300,
  advanced = false,
  loading = false,
  className
}: PriceChartProps) {
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1W')
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)
  const [chartData, setChartData] = useState(data)
  const containerRef = useRef<HTMLDivElement>(null)

  // Process data when it changes
  useEffect(() => {
    setChartData(data)
  }, [data])

  // Handle time range change
  const handleTimeRangeChange = (range: TimeRange) => {
    setSelectedRange(range)
    if (onTimeRangeChange) {
      onTimeRangeChange(range)
    }
  }

  // Get the current price (last in dataset)
  const currentPrice = data.length > 0 ? data[data.length - 1].price : 0

  // Determine if price is positive or negative
  const isPriceUp = percentChange >= 0

  // Format for the tooltip
  const formatTooltip = (value: number) => {
    return `$${value.toFixed(2)}`
  }

  // Format for x-axis depending on time range
  const formatXAxis = (timestamp: any) => {
    const date = new Date(timestamp)
    if (selectedRange === '1D') {
      return format(date, 'HH:mm')
    } else if (selectedRange === '1W' || selectedRange === '1M') {
      return format(date, 'dd MMM')
    } else {
      return format(date, 'MMM yyyy')
    }
  }

  // Handle price hover
  const handleMouseMove = (e: any) => {
    if (e.activePayload && e.activePayload[0]) {
      setHoveredPrice(e.activePayload[0].payload.price)
    }
  }

  const handleMouseLeave = () => {
    setHoveredPrice(null)
  }

  return (
    <div className={cn('rounded-xl bg-white p-4', className)} ref={containerRef}>
      {/* Chart header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
        <div className="mb-3 sm:mb-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{symbol} Price</h3>
            <div 
              className={cn(
                'flex items-center text-sm font-medium px-2 py-0.5 rounded-full',
                isPriceUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              )}
            >
              {isPriceUp ? (
                <FiArrowUp className="h-3 w-3 mr-1" />
              ) : (
                <FiArrowDown className="h-3 w-3 mr-1" />
              )}
              {Math.abs(percentChange).toFixed(2)}%
            </div>
          </div>
          <p className="text-2xl font-semibold mt-1">
            {currency === 'USD' ? '$' : ''}{(hoveredPrice || currentPrice).toFixed(2)}
          </p>
        </div>

        {/* Time range selector */}
        <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
          {timeRanges.map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-md transition-all duration-150',
                selectedRange === range 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:bg-white/50'
              )}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      {loading ? (
        <div className="flex items-center justify-center" style={{ height: chartHeight }}>
          <div className="animate-spin h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full" />
        </div>
      ) : (
        <motion.div 
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResponsiveContainer width="100%" height={chartHeight}>
            {advanced ? (
              <LineChart
                data={chartData}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#888' }}
                  stroke="#e0e0e0"
                />
                <YAxis
                  tickFormatter={formatTooltip}
                  tick={{ fontSize: 12, fill: '#888' }}
                  stroke="#e0e0e0"
                  domain={['dataMin', 'dataMax']}
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={(timestamp) => format(new Date(timestamp), 'PPp')}
                />
                <Line 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#6366F1', fill: 'white' }}
                  className="animate-drawLine"
                />
                {chartData[0]?.volume && (
                  <Line 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="#A5A6FA" 
                    strokeWidth={1}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 1, stroke: '#A5A6FA', fill: 'white' }}
                  />
                )}
              </LineChart>
            ) : (
              <AreaChart
                data={chartData}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
              >
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="timestamp"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 12, fill: '#888' }}
                  stroke="#e0e0e0"
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  hide={true}
                  domain={['dataMin', 'dataMax']} 
                />
                <Tooltip 
                  formatter={formatTooltip}
                  labelFormatter={(timestamp) => format(new Date(timestamp), 'PPp')}
                  cursor={{ stroke: '#6366F1', strokeWidth: 1, strokeDasharray: '5 5' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke="#6366F1" 
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                  animationDuration={1500}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: '#6366F1', fill: 'white' }}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  )
}