import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/providers'
import { AuthProvider } from '@/contexts/AuthContext'
import { WalletProvider } from '@/contexts/WalletContext'
import { TransactionProvider } from '@/contexts/TransactionContext'
import { PaymentRequestProvider } from '@/contexts/PaymentRequestContext'
import { ExchangeRateProvider } from '@/contexts/ExchangeRateContext'
import { AptosProvider } from '@/integrations/aptos/provider'
import LayoutClient from './layoutClient'

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
          <ExchangeRateProvider>
            <AptosProvider>
              <WalletProvider>
                <TransactionProvider>
                  <PaymentRequestProvider>
                    <Providers>
                      <LayoutClient>{children}</LayoutClient>
                    </Providers>
                  </PaymentRequestProvider>
                </TransactionProvider>
              </WalletProvider>
            </AptosProvider>
          </ExchangeRateProvider>
        </AuthProvider>
      </body>
    </html>
  )
}