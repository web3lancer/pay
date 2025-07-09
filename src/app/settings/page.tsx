'use client'

import React, { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/contexts/AuthContext'
import TwoFactorSettings from '@/components/security/TwoFactorSettings'
import { motion } from 'framer-motion'
import { FiUser, FiShield, FiKey, FiBell, FiGlobe, FiCreditCard } from 'react-icons/fi'
import dynamic from "next/dynamic"

const ZoraUpdateWidget = dynamic(
  () => import('@/integrations/zora/ui/ZoraUpdateWidget'),
  { ssr: false }
)

const integrationZora = process.env.NEXT_PUBLIC_INTEGRATION_ZORA === "true"

export default function SettingsPage() {
  const { user, userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'integrations'>('security')

  const tabs = [
    {
      id: 'profile' as const,
      label: 'Profile',
      icon: FiUser,
      description: 'Manage your personal information'
    },
    {
      id: 'security' as const,
      label: 'Security',
      icon: FiShield,
      description: 'Two-factor authentication and security settings'
    },
    {
      id: 'notifications' as const,
      label: 'Notifications',
      icon: FiBell,
      description: 'Email and push notification preferences'
    },
    {
      id: 'preferences' as const,
      label: 'Preferences',
      icon: FiGlobe,
      description: 'Currency, language and display settings'
    },
    {
      id: 'integrations' as const,
      label: 'Integrations',
      icon: FiCreditCard,
      description: 'Manage third-party integrations'
    }
  ]

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Profile Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Display Name
            </label>
            <input
              type="text"
              value={userProfile?.displayName || ''}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Your display name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={userProfile?.username || ''}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="Your username"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg bg-neutral-50 cursor-not-allowed"
              disabled
            />
            <p className="text-xs text-neutral-500 mt-1">
              Email cannot be changed for security reasons
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={userProfile?.phoneNumber || ''}
              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">KYC Status</h3>
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">
                Verification Level: {userProfile?.kycLevel || 0}
              </p>
              <p className="text-sm text-neutral-600 capitalize">
                Status: {userProfile?.kycStatus || 'Pending'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${
              userProfile?.kycStatus === 'verified' 
                ? 'bg-green-100 text-green-800'
                : userProfile?.kycStatus === 'rejected'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {userProfile?.kycStatus || 'Pending'}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  )

  const renderSecurityTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Two-Factor Authentication</h3>
        <TwoFactorSettings />
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Password</h3>
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 mb-1">Change Password</p>
              <p className="text-sm text-neutral-600">
                Last changed: Never
              </p>
            </div>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">API Keys</h3>
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900 mb-1">API Access</p>
              <p className="text-sm text-neutral-600">
                Manage API keys for third-party applications
              </p>
            </div>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <FiKey className="h-4 w-4" />
              Manage Keys
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderNotificationsTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {[
            { id: 'transactions', label: 'Transaction confirmations', description: 'Get notified when transactions are confirmed' },
            { id: 'security', label: 'Security alerts', description: 'Important security events and login attempts' },
            { id: 'marketing', label: 'Product updates', description: 'New features and product announcements' },
            { id: 'price', label: 'Price alerts', description: 'Notifications about significant price changes' }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between py-3 border-b border-neutral-200 last:border-0">
              <div>
                <p className="font-medium text-neutral-900">{item.label}</p>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked={item.id === 'security'} />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderPreferencesTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Currency & Region</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Preferred Currency
            </label>
            <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Timezone
            </label>
            <select className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500">
              <option value="UTC">UTC - Coordinated Universal Time</option>
              <option value="America/New_York">EST - Eastern Time</option>
              <option value="America/Los_Angeles">PST - Pacific Time</option>
              <option value="Europe/London">GMT - Greenwich Mean Time</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Display Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Dark Mode</p>
              <p className="text-sm text-neutral-600">Toggle between light and dark themes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">Show Balance</p>
              <p className="text-sm text-neutral-600">Display wallet balances on dashboard</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-cyan-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Save Preferences
        </button>
      </div>
    </div>
  )

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
          <p className="text-neutral-600 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-cyan-50 text-cyan-700 border-l-4 border-cyan-500'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-5 w-5" />
                      <div>
                        <p className="font-medium">{tab.label}</p>
                        <p className="text-xs text-neutral-500 mt-1 lg:hidden">
                          {tab.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'security' && renderSecurityTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'preferences' && renderPreferencesTab()}
                {activeTab === 'integrations' && integrationZora && (
                  <div>
                    <h2 className="text-xl font-bold mb-2 text-cyan-700">Zora Coin Management (Beta)</h2>
                    <ZoraUpdateWidget />
                    {/* Future integrations can be added here */}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}