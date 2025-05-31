'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// Simple icons using emoji
const icons = {
  home: "🏠",
  wallet: "👛",
  send: "📤",
  request: "📥",
  history: "📋"
}

const navigation = [
  { name: 'Home', href: '/', icon: icons.home },
  { name: 'Wallets', href: '/wallets', icon: icons.wallet },
  { name: 'Send', href: '/send', icon: icons.send },
  { name: 'Request', href: '/requests', icon: icons.request },
  { name: 'History', href: '/history', icon: icons.history },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-200',
                {
                  'text-cyan-600': isActive,
                  'text-neutral-600': !isActive,
                }
              )}
            >
              <div className={cn('text-xl', {
                'scale-110': isActive,
              })}>
                {item.icon}
              </div>
              <span className={cn('text-xs font-medium', {
                'text-cyan-600': isActive,
                'text-neutral-600': !isActive,
              })}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -top-1 h-1 w-8 bg-cyan-500 rounded-full"></div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}// Simple icons using emoji
const icons = {
  home: "🏠",
  wallet: "👛",
  send: "📤",
  request: "📥",
  history: "📋"
}mport React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

// Simple icons using emoji
const icons = {
  home: "🏠",
  wallet: "👛",
  send: "📤",
  request: "📥",
  history: "�"
}

const navigation = [
  { name: 'Home', href: '/', icon: icons.home },
  { name: 'Wallets', href: '/wallets', icon: icons.wallet },
  { name: 'Send', href: '/send', icon: icons.send },
  { name: 'Request', href: '/requests', icon: icons.request },
  { name: 'History', href: '/history', icon: icons.history },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg px-3 py-2 transition-all duration-200',
                {
                  'text-cyan-600': isActive,
                  'text-neutral-600': !isActive,
                }
              )}
            >
              <div className={cn('text-xl', {
                'scale-110': isActive,
              })}>
                {item.icon}
              </div>
              <span className={cn('text-xs font-medium', {
                'text-cyan-600': isActive,
                'text-neutral-600': !isActive,
              })}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -top-1 h-1 w-8 bg-cyan-500 rounded-full"></div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}