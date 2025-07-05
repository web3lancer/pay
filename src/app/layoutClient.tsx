'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import AppShell from '@/components/layout/AppShell'

// Add more routes that should NOT use AppShell here
function isMinimalRoute(pathname: string) {
  return (
    pathname.startsWith('/auth') ||
    pathname === '/' ||
    pathname.startsWith('/pitch')
  )
}

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (isMinimalRoute(pathname)) {
    // Minimal layout for auth, home, and pitch pages
    return <>{children}</>
  }
  // AppShell for main app
  return <AppShell>{children}</AppShell>
}
