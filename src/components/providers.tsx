'use client'

import { AppThemeProvider } from './ThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppThemeProvider>
      {children}
    </AppThemeProvider>
  )
}