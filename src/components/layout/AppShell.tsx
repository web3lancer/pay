'use client'

import React from 'react'
import { useSidebar } from '@/contexts/SidebarContext'
import { BottomNavigation } from './BottomNavigation'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { isSidebarOpen, toggleSidebar } = useSidebar()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
        <Sidebar isOpen={true} onClose={() => {}} />
      </div>

      <div className="flex flex-col flex-1">
        {/* Mobile Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={toggleSidebar} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <div className="lg:hidden">
          <BottomNavigation />
        </div>
      </div>
    </div>
  )
}

export default AppShell