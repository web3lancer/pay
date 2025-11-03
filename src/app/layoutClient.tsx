'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'
import { RouteGuard } from '@/components/RouteGuard'
import { useThemeSync } from '@/hooks/useThemeSync'

// Add more routes that should NOT use AppShell here
function isMinimalRoute(pathname: string) {
  return (
    pathname === '/' ||
    pathname.startsWith('/pitch')
  )
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Initialize theme from Appwrite on app load
  useThemeSync()
  
  if (isMinimalRoute(pathname)) {
    // Minimal layout for home and pitch pages
    return <RouteGuard>{children}</RouteGuard>
  }
  
  // AppShell for main app with route guard
  return (
    <RouteGuard>
      <AppShell>{children}</AppShell>
    </RouteGuard>
  )
}
