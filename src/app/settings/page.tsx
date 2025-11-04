'use client'

import React from 'react'
import {
  FiBell,
  FiShield,
  FiUser,
  FiGlobe,
} from 'react-icons/fi'

export default function SettingsPage() {
  // Get current page URL for source parameter
  const source = typeof window !== 'undefined' ? window.location.href : ''
  const authSubdomain = process.env.AUTH_SUBDOMAIN || 'accounts'
  const appDomain = process.env.APP_DOMAIN || 'web3lancer.website'

  const tabs = [
    {
      id: 'profile',
      label: 'Profile',
      icon: FiUser,
      description: 'Manage your personal information and display settings',
      href: `https://${authSubdomain}.${appDomain}/profile?source=${encodeURIComponent(source)}`
    },
    {
      id: 'security',
      label: 'Security',
      icon: FiShield,
      description: 'Two-factor authentication, passwords, and API keys',
      href: `https://${authSubdomain}.${appDomain}/settings?source=${encodeURIComponent(source)}`
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: FiBell,
      description: 'Email and push notification preferences',
      href: `https://${authSubdomain}.${appDomain}/notifications?source=${encodeURIComponent(source)}`
    },
    {
      id: 'preferences',
      label: 'Preferences',
      icon: FiGlobe,
      description: 'Currency, language, and display settings',
      href: `https://${authSubdomain}.${appDomain}/preferences?source=${encodeURIComponent(source)}`
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Settings</h1>
        <p className="text-neutral-600 dark:text-white mt-2">
          Manage your account settings in one centralized location
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tabs.map((tab, index) => {
          const Icon = tab.icon
          const isOdd = index % 2 === 0
          return (
            <a
              key={tab.id}
              href={tab.href}
              target="_blank"
              rel="noopener noreferrer"
              className={isOdd ? 
                "group bg-white dark:bg-blue-500/10 rounded-xl border border-neutral-200 dark:border-blue-500/30 p-6 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg dark:hover:shadow-blue-500/20 transition-all duration-300" :
                "group bg-white dark:bg-orange-500/10 rounded-xl border border-neutral-200 dark:border-orange-500/30 p-6 hover:border-orange-500 dark:hover:border-orange-500 hover:shadow-lg dark:hover:shadow-orange-500/20 transition-all duration-300"
              }
            >
              <div className="flex items-start gap-4">
                <div className={isOdd ? 
                  "w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors" :
                  "w-12 h-12 bg-orange-100 dark:bg-orange-500/20 rounded-lg flex items-center justify-center group-hover:bg-orange-500 transition-colors"
                }>
                  <Icon className={isOdd ? 
                    "h-6 w-6 text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors" :
                    "h-6 w-6 text-orange-600 dark:text-orange-400 group-hover:text-white transition-colors"
                  } />
                </div>
                <div className="flex-1">
                  <h3 className={isOdd ?
                    "text-lg font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" :
                    "text-lg font-semibold text-neutral-900 dark:text-white mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
                  }>
                    {tab.label}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {tab.description}
                  </p>
                </div>
                <div className={isOdd ? 
                  "text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" :
                  "text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity"
                }>
                  →
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg">
        <p className="text-sm text-blue-900 dark:text-blue-200">
          💡 All account settings are managed in one centralized location. Click any option above to manage your preferences.
        </p>
      </div>
    </div>
  )
}
