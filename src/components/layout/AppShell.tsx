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
      {/* Top Bar - Fixed across all screen sizes */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="lg:hidden">
          <TopBar onMenuClick={handleMenuToggle} mobile={true} />
        </div>
        <div className="hidden lg:block">
          <TopBar onMenuClick={handleMenuToggle} mobile={false} />
        </div>
      </div>

      {/* Main Layout Container */}
      <div className="pt-16 min-h-screen">
        {/* Desktop Layout */}
        <div className="hidden lg:flex h-full">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <Sidebar isOpen={true} onClose={() => {}} />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 pb-8">
            <main>
              {children}
            </main>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Mobile Sidebar Overlay */}
          <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
          
          {/* Mobile Main Content */}
          <main className="pb-20">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default AppShell;