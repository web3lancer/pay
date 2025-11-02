'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navigation = [
  { name: 'Dashboard', href: '/home', icon: '🏠' },
  { name: 'Capital Hub', href: '/capital', icon: '💰' },
  { name: 'Wallets', href: '/wallets', icon: '👛' },
  { name: 'Send', href: '/send', icon: '📤' },
  { name: 'Request', href: '/requests', icon: '📥' },
  { name: 'Trading', href: 'https://deepcoin.deepersensor.com', icon: '📈', external: true },
  { name: 'History', href: '/history', icon: '📋' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'bg-white border-r border-neutral-200 h-full flex flex-col',
        // Mobile: fixed overlay, slide from left
        'fixed top-0 left-0 z-50 w-64 transform transition-transform duration-300 lg:hidden',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        // Desktop: static sidebar, always visible
        'lg:static lg:w-64 lg:translate-x-0 lg:transition-none lg:flex'
      )}>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              const isExternal = 'external' in item && item.external
              
              if (isExternal) {
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onClose()}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                  >
                    <span className="mr-3 text-base">{item.icon}</span>
                    {item.name}
                  </a>
                )
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => onClose()}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    {
                      'bg-cyan-50 text-cyan-700 border-r-2 border-cyan-500': isActive,
                      'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900': !isActive,
                    }
                  )}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  {item.name}
                </Link>
              )
            })}
        </nav>
        
        {/* Footer */}
        <div className="px-4 py-4 border-t border-neutral-200 flex-shrink-0">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">W3</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-neutral-900">Web3Lancer Pay</p>
              <p className="text-xs text-neutral-500">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}