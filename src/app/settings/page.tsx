'use client'

import React, { useState } from 'react';
import {
  FiBell,
  FiCreditCard,
  FiGlobe,
  FiKey,
  FiShield,
  FiUser,
} from 'react-icons/fi';


import TwoFactorSettings from '@/components/security/TwoFactorSettings';
import { useAuth } from '@/contexts/AuthContext';



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

  const renderIntegrationsTab = () => (
    <div className="space-y-6">
      <div className="text-center py-12">
        <div className="text-neutral-400 mb-4">
          <span className="text-4xl">🔌</span>
        </div>
        <h3 className="text-lg font-medium text-neutral-700 mb-2">No integrations available</h3>
        <p className="text-neutral-500">
          Integration features will be available in future updates.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Horizontal Tab Navigation */}
      <div className="mb-6 border-b border-neutral-200">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div key={activeTab} className="animate-fadeIn">
          {activeTab === 'profile' && renderProfileTab()}
          {activeTab === 'security' && renderSecurityTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'preferences' && renderPreferencesTab()}
          {activeTab === 'integrations' && renderIntegrationsTab()}
        </div>
      </div>
    </div>
  )
}