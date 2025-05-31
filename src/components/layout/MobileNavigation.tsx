'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiHome, FiSend, FiCamera, FiCreditCard, FiTrendingUp, FiSettings, FiUser } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

interface MobileNavigationProps {
  currentPath?: string
}

export function MobileNavigation({ currentPath = '/' }: MobileNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useAuth()

  const navigationItems = [
    { href: '/', icon: FiHome, label: 'Dashboard' },
    { href: '/send', icon: FiSend, label: 'Send' },
    { href: '/scan', icon: FiCamera, label: 'Scan' },
    { href: '/wallets', icon: FiCreditCard, label: 'Wallets' },
    { href: '/exchange', icon: FiTrendingUp, label: 'Exchange' },
    { href: '/settings', icon: FiSettings, label: 'Settings' }
  ]

  const handleNavigation = (href: string) => {
    window.location.href = href
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-40 md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href
            
            return (
              <button
                key={item.href}
                onClick={() => handleNavigation(item.href)}
                className={`flex flex-col items-center justify-center p-3 text-xs transition-colors ${
                  isActive 
                    ? 'text-primary-600 bg-primary-50' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="h-5 w-5 mb-1" />
                <span className="text-xs">{item.label}</span>
              </button>
            )
          })}
          
          {/* Menu Button */}
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center justify-center p-3 text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <FiMenu className="h-5 w-5 mb-1" />
            <span className="text-xs">More</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-neutral-200">
                <div className="flex items-center">
                  {user && (
                    <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-medium">
                        {user.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-neutral-900">
                      {user?.name || 'Web3Pay'}
                    </h3>
                    <p className="text-sm text-neutral-600">
                      {user?.email || 'Not signed in'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600 transition-colors"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <div className="p-6 space-y-4">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPath === item.href
                  
                  return (
                    <button
                      key={item.href}
                      onClick={() => handleNavigation(item.href)}
                      className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                        isActive 
                          ? 'bg-primary-50 text-primary-700' 
                          : 'text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}

                {/* Profile Link */}
                {user && (
                  <button
                    onClick={() => handleNavigation(`/pay/${user.name}`)}
                    className="w-full flex items-center p-3 rounded-lg text-left text-neutral-700 hover:bg-neutral-50 transition-colors border-t border-neutral-200 pt-6 mt-6"
                  >
                    <FiUser className="h-5 w-5 mr-3" />
                    <span className="font-medium">My Payment Profile</span>
                  </button>
                )}

                {/* Sign Out */}
                <button
                  onClick={() => {
                    // Handle sign out
                    setIsOpen(false)
                  }}
                  className="w-full flex items-center p-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <span className="font-medium">Sign Out</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}