'use client'

import React, { useState, useEffect } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { FiUser, FiLock, FiBell, FiGlobe, FiShield, FiDollarSign, FiToggleLeft, FiToggleRight, FiInfo } from 'react-icons/fi'
import { useAuth } from '@/contexts/AuthContext'

export function SettingsClient() {
  const { user, updateProfile, isLoading } = useAuth()
  
  // Settings state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Initialize form with user data when available
  useEffect(() => {
    if (user) {
      setProfileForm({
        name: user.profile?.displayName || user.name || '',
        email: user.email || '',
        phone: user.profile?.phoneNumber || ''
      })
    }
  }, [user])
  
  const [notifications, setNotifications] = useState({
    transactions: true,
    security: true,
    marketing: false,
    priceAlerts: true
  })
  
  const [preferences, setPreferences] = useState({
    currency: 'USD',
    theme: 'system',
    language: 'en',
    reducedMotion: false
  })
  
  // Handle profile form changes
  const handleProfileChange = (field: string, value: string) => {
    setProfileForm({
      ...profileForm,
      [field]: value
    })
  }
  
  // Toggle notification settings
  const toggleNotification = (field: string) => {
    setNotifications({
      ...notifications,
      [field]: !notifications[field]
    })
  }
  
  // Handle preference changes
  const handlePreferenceChange = (field: string, value: string | boolean) => {
    setPreferences({
      ...preferences,
      [field]: value
    })
  }
  
  // Save changes
  const handleSave = async () => {
    try {
      // Update profile if user exists
      if (user) {
        await updateProfile({
          displayName: profileForm.name,
          phoneNumber: profileForm.phone,
        })
      }
      
      // Log other settings that would be saved in a real app
      console.log('Saving settings:', {
        notifications: {
          transactions: notifications.transactions,
          security: notifications.security,
          marketing: notifications.marketing,
          priceAlerts: notifications.priceAlerts
        },
        preferences: {
          currency: preferences.currency,
          theme: preferences.theme,
          language: preferences.language,
          reducedMotion: preferences.reducedMotion
        }
      })
      // Would show success toast here
    } catch (error) {
      console.error('Failed to save settings:', error)
    }
  }

  return (
    <AppShell>
      <div className="space-y-8 max-w-4xl mx-auto">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
          <p className="text-sm text-neutral-500">Manage your account preferences and settings</p>
        </div>

        {/* Settings Tabs */}
        <Tabs defaultValue="profile" className="w-full" onValueChange={() => {}}>
          <TabsList>
            <TabsTrigger value="profile">
              <FiUser className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security">
              <FiShield className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <FiBell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="preferences">
              <FiGlobe className="h-4 w-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Full Name"
                  value={profileForm.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
                <Input
                  label="Phone Number"
                  value={profileForm.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="ghost">Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="mt-6">
            <div className="grid grid-cols-1 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Password</CardTitle>
                  <CardDescription>
                    Change or update your account password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Current Password"
                    type="password"
                    placeholder="Enter your current password"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    placeholder="Enter your new password"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    placeholder="Confirm your new password"
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost">Cancel</Button>
                  <Button>Update Password</Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Two-Factor Authentication</CardTitle>
                  <CardDescription>
                    Add an extra layer of security to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <FiLock className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Authenticator App</p>
                        <p className="text-sm text-gray-500">
                          Use an authenticator app to generate one-time codes
                        </p>
                      </div>
                    </div>
                    <Button variant="secondary">Set Up</Button>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-3">
                        <FiLock className="h-5 w-5 text-indigo-600 mt-0.5" />
                        <div>
                          <p className="font-medium">SMS Recovery</p>
                          <p className="text-sm text-gray-500">
                            Use your phone number as a backup option
                          </p>
                        </div>
                      </div>
                      <Button variant="secondary">Enable</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Manage how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {/* Transaction Notifications */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <FiDollarSign className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Transaction Notifications</p>
                        <p className="text-sm text-gray-500">
                          Receive alerts about your transactions
                        </p>
                      </div>
                    </div>
                    <button 
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      style={{ 
                        backgroundColor: notifications.transactions 
                          ? 'rgb(99, 102, 241)' 
                          : 'rgb(209, 213, 219)' 
                      }}
                      onClick={() => toggleNotification('transactions')}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          notifications.transactions ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Security Alerts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <FiShield className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Security Alerts</p>
                        <p className="text-sm text-gray-500">
                          Get notified about important security events
                        </p>
                      </div>
                    </div>
                    <button 
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      style={{ 
                        backgroundColor: notifications.security 
                          ? 'rgb(99, 102, 241)' 
                          : 'rgb(209, 213, 219)' 
                      }}
                      onClick={() => toggleNotification('security')}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          notifications.security ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Marketing */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <FiInfo className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Marketing & Updates</p>
                        <p className="text-sm text-gray-500">
                          Receive product updates and offers
                        </p>
                      </div>
                    </div>
                    <button 
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      style={{ 
                        backgroundColor: notifications.marketing 
                          ? 'rgb(99, 102, 241)' 
                          : 'rgb(209, 213, 219)' 
                      }}
                      onClick={() => toggleNotification('marketing')}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          notifications.marketing ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Price Alerts */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3">
                      <FiDollarSign className="h-5 w-5 text-indigo-600 mt-0.5" />
                      <div>
                        <p className="font-medium">Price Alerts</p>
                        <p className="text-sm text-gray-500">
                          Get notified about significant price changes
                        </p>
                      </div>
                    </div>
                    <button 
                      className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                      style={{ 
                        backgroundColor: notifications.priceAlerts 
                          ? 'rgb(99, 102, 241)' 
                          : 'rgb(209, 213, 219)' 
                      }}
                      onClick={() => toggleNotification('priceAlerts')}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                          notifications.priceAlerts ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* App Preferences */}
          <TabsContent value="preferences" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Application Preferences</CardTitle>
                <CardDescription>
                  Customize your app experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={preferences.currency}
                    onChange={(e) => handlePreferenceChange('currency', e.target.value)}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Theme
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={preferences.theme}
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                  >
                    <option value="system">System Default</option>
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Language
                  </label>
                  <select
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Reduced Motion</p>
                    <p className="text-sm text-gray-500">
                      Minimize animations and motion effects
                    </p>
                  </div>
                  <button 
                    className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1"
                    style={{ 
                      backgroundColor: preferences.reducedMotion 
                        ? 'rgb(99, 102, 241)' 
                        : 'rgb(209, 213, 219)' 
                    }}
                    onClick={() => handlePreferenceChange('reducedMotion', !preferences.reducedMotion)}
                  >
                    <span
                      className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                        preferences.reducedMotion ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}