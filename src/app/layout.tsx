import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'
import { TransactionProvider } from '@/contexts/TransactionContext'
import { PaymentRequestProvider } from '@/contexts/PaymentRequestContext'
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext'
import AppShell from '@/components/layout/AppShell'
import { usePathname } from 'next/navigation'
import React from 'react'

export const metadata: Metadata = {
  title: 'Pay by Web3Lancer',
  description: 'Decentralized payment platform for the Web5 economy',
}

// Helper to check if path is an auth route
function isAuthRoute(pathname: string) {
  return pathname.startsWith('/auth/')
}

// Client wrapper to conditionally apply AppShell
function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  if (isAuthRoute(pathname)) {
    // Minimal layout for auth pages
    return <>{children}</>
  }
  // AppShell for main app
  return <AppShell>{children}</AppShell>
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ExchangeRateProvider>
            <WalletProvider>
              <TransactionProvider>
                <PaymentRequestProvider>
                  <Providers>
                    {/* Only wrap with AppShell if not an auth route */}
                    <React.Suspense fallback={children}>
                      <LayoutShell>{children}</LayoutShell>
                    </React.Suspense>
                  </Providers>
                </PaymentRequestProvider>
              </TransactionProvider>
            </WalletProvider>
          </ExchangeRateProvider>
        </AuthProvider>
      </body>
    </html>
  )
}