import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'

export const metadata: Metadata = {
  title: 'Pay by Web3Lancer',
  description: 'Decentralized payment platform for the Web5 economy',
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
          <WalletProvider>
            <Providers>
              {children}
            </Providers>
          </WalletProvider>
        </AuthProvider>
      </body>
    </html>
  )
}