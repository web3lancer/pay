'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import {
  FiHome,
  FiCreditCard,
  FiSend,
  FiDownload,
  FiRefreshCw
} from 'react-icons/fi'

const navigation = [
  { name: 'Home', href: '/', icon: FiHome },
  { name: 'Wallets', href: '/wallets', icon: FiCreditCard },
  { name: 'Send', href: '/send', icon: FiSend },
  { name: 'Requests', href: '/requests', icon: FiDownload },
  { name: 'Exchange', href: '/exchange', icon: FiRefreshCw },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-neutral-200 lg:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {navigation.map((item, index) => {
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
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  duration: 0.3, 
                  ease: [0.34, 1.56, 0.64, 1], // ease-spring
                  delay: 0.05 * index 
                }}
              >
                <Icon className={cn('h-5 w-5', {
                  'scale-110': isActive,
                })} />
              </motion.div>
              <span className={cn('text-xs font-medium', {
                'text-primary-600': isActive,
                'text-neutral-600': !isActive,
              })}>
                {item.name}
              </span>
              {isActive && (
                <motion.div 
                  className="absolute -top-1 h-1 w-8 bg-primary-500 rounded-full"
                  layoutId="bottomNavIndicator"
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30 
                  }}
                />
              )}
            </Link>
          )
        })}
      </div>
    </motion.nav>
  )
}