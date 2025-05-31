'use client'

import React, { useState } from 'react';
import { TopBar } from './TopBar';
import { BottomNavigation } from './BottomNavigation';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden">
        <TopBar onMenuClick={handleMenuToggle} mobile={true} />
      </div>
      
      {/* Desktop Header */}
      <div className="hidden lg:block">
        <TopBar onMenuClick={handleMenuToggle} mobile={false} />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="pt-16 pb-20 lg:pb-8">
          {children}
        </main>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default AppShell;