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
  FiUser
} from 'react-icons/fi'

const navigation = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Wallets', href: '/wallets', icon: FiCreditCard },
  { name: 'Send', href: '/send', icon: FiSend },
  { name: 'Requests', href: '/requests', icon: FiDownload },
  { name: 'Profile', href: '/profile', icon: FiUser },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-200',
                {
                  'text-primary-600': isActive,
                  'text-neutral-600': !isActive,
                }
              )}
            >
              <Icon className={cn('h-5 w-5', {
                'scale-110': isActive,
              })} />
              <span className={cn('text-xs font-medium', {
                'text-primary-600': isActive,
                'text-neutral-600': !isActive,
              })}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -top-1 h-1 w-8 bg-primary-500 rounded-full" />
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}