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
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-2">
          Manage your account settings in one centralized location
        </p>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <a
              key={tab.id}
              href={tab.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white rounded-xl border border-neutral-200 p-6 hover:border-cyan-500 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-500 transition-colors">
                  <Icon className="h-6 w-6 text-cyan-600 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-1 group-hover:text-cyan-600 transition-colors">
                    {tab.label}
                  </h3>
                  <p className="text-sm text-neutral-600">
                    {tab.description}
                  </p>
                </div>
                <div className="text-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {/* Info Box */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          💡 All account settings are managed in one centralized location. Click any option above to manage your preferences.
        </p>
      </div>
    </div>
  )
}
