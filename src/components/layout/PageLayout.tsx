
'use client'

import React, { ReactNode } from 'react';
import { TopBar } from './TopBar';
import { useSidebar } from '@/contexts/SidebarContext';

interface PageLayoutProps {
  children: ReactNode;
}

export const PageLayout = ({ children }: PageLayoutProps) => {
  const { toggleSidebar } = useSidebar();

  return (
    <div className="flex flex-col h-screen">
      <TopBar onMenuClick={toggleSidebar} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {children}
      </div>
    </div>
  );
};
