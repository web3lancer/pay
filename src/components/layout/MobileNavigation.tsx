'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter, usePathname } from 'next/navigation'
import { 
  FiHome, FiSend, FiCamera, FiCreditCard, FiUser, FiSettings, 
  FiArrowUp, FiArrowDown, FiRefreshCw, FiPieChart, FiBell,
  FiZap, FiTrendingUp, FiGift, FiPlus
} from 'react-icons/fi'

export function MobileNavigation() {
  const { user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [showQuickActions, setShowQuickActions] = useState(false)

  const mainNavItems = [
    { icon: FiHome, label: 'Home', path: '/' },
    { icon: FiCreditCard, label: 'Wallets', path: '/wallets' },
    { icon: FiPieChart, label: 'Portfolio', path: '/portfolio' },
    { icon: FiUser, label: 'Profile', path: '/profile' }
  ]

  const quickActions = [
    { 
      icon: FiSend, 
      label: 'Send', 
      path: '/send',
      color: 'from-blue-500 to-blue-600',
      lightColor: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    { 
      icon: FiCamera, 
      label: 'Scan', 
      path: '/scan',
      color: 'from-green-500 to-green-600',
      lightColor: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    { 
      icon: FiRefreshCw, 
      label: 'Swap', 
      path: '/exchange',
      color: 'from-purple-500 to-purple-600',
      lightColor: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    { 
      icon: FiZap, 
      label: 'Request', 
      path: '/request',
      color: 'from-orange-500 to-orange-600',
      lightColor: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(path)
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleQuickAction = (path: string) => {
    setShowQuickActions(false)
    router.push(path)
  }

  return (
    <>
      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {showQuickActions && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-end justify-center pb-24"
            onClick={() => setShowQuickActions(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 500 }}
              className="bg-white rounded-t-3xl p-6 w-full max-w-md mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-6" />
              
              <h3 className="text-xl font-bold text-neutral-900 mb-6 text-center">
                Quick Actions
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {quickActions.map((action, index) => (
                  <motion.button
                    key={action.path}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleQuickAction(action.path)}
                    className="flex flex-col items-center p-6 bg-white border border-neutral-200 rounded-2xl hover:shadow-md transition-all group"
                  >
                    <div className={`w-16 h-16 ${action.lightColor} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <action.icon className={`h-8 w-8 ${action.iconColor}`} />
                    </div>
                    <span className="font-semibold text-neutral-900">{action.label}</span>
                  </motion.button>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowQuickActions(false)}
                className="w-full mt-6 py-3 bg-neutral-100 text-neutral-700 rounded-xl font-medium hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Navigation */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-30 md:hidden"
      >
        <div className="flex items-center justify-around py-2 px-4 safe-area-bottom">
          {mainNavItems.map((item, index) => {
            const active = isActive(item.path)
            
            return (
              <motion.button
                key={item.path}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleNavigation(item.path)}
                className="flex flex-col items-center py-2 px-3 relative"
              >
                <motion.div
                  animate={{
                    backgroundColor: active ? '#6366f1' : 'transparent',
                    scale: active ? 1.1 : 1
                  }}
                  className={`p-2 rounded-xl transition-colors ${
                    active ? 'text-white' : 'text-neutral-600'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </motion.div>
                
                <motion.span
                  animate={{
                    color: active ? '#6366f1' : '#6b7280',
                    fontWeight: active ? 600 : 500
                  }}
                  className="text-xs mt-1"
                >
                  {item.label}
                </motion.span>

                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 w-8 h-1 bg-primary-500 rounded-full"
                  />
                )}
              </motion.button>
            )
          })}
          
          {/* Quick Actions Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowQuickActions(true)}
            className="relative"
          >
            <motion.div
              animate={{ rotate: showQuickActions ? 45 : 0 }}
              className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg"
            >
              <FiPlus className="h-6 w-6 text-white" />
            </motion.div>
            
            {/* Pulsing animation for emphasis */}
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.7, 0.3, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute inset-0 w-12 h-12 bg-primary-500 rounded-2xl -z-10"
            />
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats Bar (appears above navigation) */}
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="fixed bottom-20 left-4 right-4 bg-white rounded-2xl border border-neutral-200 p-4 z-20 md:hidden"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-neutral-600">Live</span>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-neutral-600">Total Balance</p>
              <p className="font-bold text-neutral-900">$12,847.32</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-green-600">
            <FiTrendingUp className="h-4 w-4" />
            <span className="text-sm font-semibold">+7.2%</span>
          </div>
        </div>
      </motion.div>

      {/* Notification Indicator */}
      {user && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="fixed top-4 right-4 z-50 md:hidden"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => router.push('/notifications')}
            className="w-10 h-10 bg-white border border-neutral-200 rounded-full flex items-center justify-center shadow-md relative"
          >
            <FiBell className="h-5 w-5 text-neutral-600" />
            
            {/* Notification badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center"
            >
              <span className="text-white text-xs font-bold">3</span>
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </>
  )
}