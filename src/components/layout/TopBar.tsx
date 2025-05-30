'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiPlus,
  FiSend
} from 'react-icons/fi'

interface TopBarProps {
  onMenuClick: () => void
  mobile?: boolean
}

export function TopBar({ onMenuClick, mobile = false }: TopBarProps) {
  return (
    <header className={cn(
      'flex h-16 items-center justify-between bg-white border-b border-neutral-200 px-6',
      {
        'px-4': mobile,
      }
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {mobile && (
          <button
            onClick={onMenuClick}
            className="p-2 text-neutral-600 hover:text-neutral-900 lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </button>
        )}

        {mobile && (
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">LP</span>
            </div>
            <span className="font-semibold text-neutral-900">LancerPay</span>
          </div>
        )}

        {/* Search - Desktop only */}
        {!mobile && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-neutral-400" />
            </div>
            <input
              type="text"
              placeholder="Search transactions, addresses..."
              className="w-96 pl-10 pr-4 py-2 border border-neutral-300 rounded-lg bg-neutral-50 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200"
            />
          </div>
        )}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Quick Actions - Desktop */}
        {!mobile && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" icon={<FiPlus className="h-4 w-4" />}>
              Add Wallet
            </Button>
            <Button size="sm" icon={<FiSend className="h-4 w-4" />}>
              Send
            </Button>
          </div>
        )}

        {/* Notifications */}
        <button className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors">
          <FiBell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] text-white font-bold">3</span>
          </span>
        </button>

        {/* Profile */}
        <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors">
          <div className="h-8 w-8 rounded-full bg-primary-100 flex items-center justify-center">
            <FiUser className="h-4 w-4 text-primary-600" />
          </div>
          {!mobile && (
            <span className="text-sm font-medium text-neutral-900">John</span>
          )}
        </button>
      </div>
    </header>
  )
}