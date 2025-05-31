'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const { isLoading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // If still loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setMobileMenuOpen(false)} />
          <Sidebar mobile onClose={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <TopBar 
          onMenuClick={() => setMobileMenuOpen(true)}
          mobile 
        />
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}