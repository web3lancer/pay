'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  FiHome,
  FiCreditCard,
  FiSend,
  FiDownload,
  FiRepeat,
  FiSettings,
  FiUser,
  FiX
} from 'react-icons/fi'

const navigation = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Wallets', href: '/wallets', icon: FiCreditCard },
  { name: 'Send', href: '/send', icon: FiSend },
  { name: 'Requests', href: '/requests', icon: FiDownload },
  { name: 'Exchange', href: '/exchange', icon: FiRepeat },
  { name: 'Settings', href: '/settings', icon: FiSettings },
]

interface SidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function Sidebar({ mobile = false, onClose }: SidebarProps) {
  const pathname = usePathname()

  const sidebarClasses = cn(
    'flex h-full w-64 flex-col bg-white border-r border-neutral-200',
    {
      'fixed inset-y-0 left-0 z-50': mobile,
    }
  )

  return (
    <div className={sidebarClasses}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-neutral-200">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">LP</span>
          </div>
          <span className="font-semibold text-neutral-900">LancerPay</span>
        </div>
        {mobile && (
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-600"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={mobile ? onClose : undefined}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                {
                  'bg-primary-100 text-primary-700 border border-primary-200': isActive,
                  'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900': !isActive,
                }
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}