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
  { name: 'Home', href: '/home', icon: icons.home },
  { name: 'Wallets', href: '/wallets', icon: icons.wallet },
  { name: 'Send', href: '/send', icon: icons.send },
  { name: 'Request', href: '/requests', icon: icons.request },
  { name: 'History', href: '/history', icon: icons.history },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 lg:hidden transition-colors duration-300">
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
                  'text-cyan-600 dark:text-cyan-400': isActive,
                  'text-neutral-600 dark:text-neutral-400': !isActive,
                }
              )}
            >
              <div className={cn('text-xl', {
                'scale-110': isActive,
              })}>
                {item.icon}
              </div>
              <span className={cn('text-xs font-medium', {
                'text-cyan-600 dark:text-cyan-400': isActive,
                'text-neutral-600 dark:text-neutral-400': !isActive,
              })}>
                {item.name}
              </span>
              {isActive && (
                <div className="absolute -top-1 h-1 w-8 bg-cyan-500 dark:bg-cyan-400 rounded-full transition-colors"></div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
