'use client'

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FiHome, FiCreditCard, FiSend, FiDownload, FiRefreshCw, FiSettings, FiMenu, FiX } from 'react-icons/fi'
import { cn } from '@/lib/utils'

type AppShellProps = {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  // Navigation items
  const navItems = [
    { href: '/', label: 'Home', icon: FiHome },
    { href: '/wallets', label: 'Wallets', icon: FiCreditCard },
    { href: '/send', label: 'Send', icon: FiSend },
    { href: '/requests', label: 'Requests', icon: FiDownload },
    { href: '/exchange', label: 'Exchange', icon: FiRefreshCw },
    { href: '/settings', label: 'Settings', icon: FiSettings }
  ]

  // Determine if we're on mobile based on screen width
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar for desktop/tablet */}
      <motion.aside 
        className={cn(
          "bg-white fixed inset-y-0 z-50 lg:z-auto border-r border-neutral-200 w-64 lg:w-60 lg:static lg:flex lg:flex-col",
          sidebarOpen ? "flex flex-col" : "hidden lg:flex lg:flex-col"
        )}
        initial={isMobile ? { x: "-100%" } : false}
        animate={isMobile && sidebarOpen ? { x: 0 } : false}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} // ease-out-expo from animations.md
      >
        {/* Sidebar Header - Logo/Brand */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-neutral-200">
          <Link href="/" className="flex items-center" onClick={closeSidebar}>
            <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
              <span className="text-white font-bold">W3</span>
            </div>
            <span className="ml-2 font-bold text-lg text-neutral-900">Pay</span>
          </Link>
          
          {/* Close button on mobile */}
          <button 
            className="p-2 text-neutral-500 hover:text-neutral-700 lg:hidden"
            onClick={closeSidebar}
          >
            <FiX />
          </button>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeSidebar}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary-50 text-primary-700"
                        : "text-neutral-700 hover:bg-neutral-100"
                    )}
                  >
                    <item.icon 
                      className={cn(
                        "h-5 w-5 mr-3",
                        isActive ? "text-primary-500" : "text-neutral-400"
                      )}
                    />
                    {item.label}
                    {isActive && (
                      <motion.div
                        className="absolute left-0 w-1 h-8 bg-primary-500 rounded-r-full"
                        layoutId="activeNavIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Profile Section */}
        <div className="p-3 border-t border-neutral-200">
          <div className="flex items-center p-3 rounded-lg hover:bg-neutral-100 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-neutral-200 flex-shrink-0">
              <div className="flex items-center justify-center h-full text-neutral-600 font-medium">
                JD
              </div>
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                John Doe
              </p>
              <p className="text-xs text-neutral-500 truncate">
                john@example.com
              </p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Backdrop for mobile sidebar */}
      {sidebarOpen && (
        <motion.div 
          className="fixed inset-0 bg-neutral-900/30 backdrop-blur-sm z-40 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }} // ease-micro from animations.md
          onClick={closeSidebar}
        />
      )}
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-neutral-200 h-16 flex items-center px-4">
          {/* Mobile Menu Button */}
          <button 
            className="p-2 mr-4 text-neutral-500 hover:text-neutral-700 focus:outline-none lg:hidden"
            onClick={toggleSidebar}
          >
            <FiMenu />
          </button>
          
          {/* Top Bar Content - could add search, notifications, etc. */}
          <div className="flex-1"></div>
          
          <div className="flex items-center space-x-2">
            {/* Placeholder for notifications, settings, etc. */}
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.16, 1, 0.3, 1], // ease-out-expo from animations.md
            }}
          >
            {children}
          </motion.div>
        </main>
        
        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-neutral-200 z-10">
          <div className="grid grid-cols-5 h-14">
            {navItems.filter(item => [
              '/', '/wallets', '/send', '/requests', '/exchange'
            ].includes(item.href)).map((item) => {
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center justify-center text-xs font-medium",
                    isActive 
                      ? "text-primary-500"
                      : "text-neutral-500"
                  )}
                >
                  <item.icon 
                    className={cn(
                      "h-5 w-5 mb-1",
                      isActive ? "text-primary-500" : "text-neutral-400"
                    )}
                  />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}