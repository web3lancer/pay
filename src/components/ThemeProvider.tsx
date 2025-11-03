'use client'

import { ThemeProvider } from 'next-themes'
import { ReactNode } from 'react'

export function AppThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange={false}
      forcedTheme={undefined}
      enableColorScheme={false}
      storageKey="app-theme"
    >
      {children}
    </ThemeProvider>
  )
}
