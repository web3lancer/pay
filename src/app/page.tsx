'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { AppShell } from '@/components/layout/AppShell'

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [isAuthenticated, isLoading, router])

  // If still loading, show nothing (AppShell will show loading spinner)
  if (isLoading) {
    return null
  }

  // If not authenticated, show nothing (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Welcome to LancerPay</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-2">Total Balance</h3>
            <p className="text-3xl font-bold">$4,328.51</p>
          </div>
          
          <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-2">Pending Payments</h3>
            <p className="text-3xl font-bold">$1,250.00</p>
          </div>
          
          <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm">
            <h3 className="font-medium text-lg mb-2">This Month</h3>
            <p className="text-3xl font-bold">$2,841.73</p>
          </div>
        </div>
        
        <div className="bg-white border border-neutral-200 p-6 rounded-lg shadow-sm mb-6">
          <h2 className="font-semibold text-lg mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">Payment to Alice Smith</p>
                <p className="text-sm text-neutral-500">Apr 12, 2023 • ETH</p>
              </div>
              <p className="text-red-600 font-medium">-0.5 ETH</p>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">Received from Company XYZ</p>
                <p className="text-sm text-neutral-500">Apr 10, 2023 • USDC</p>
              </div>
              <p className="text-green-600 font-medium">+1,000 USDC</p>
            </div>
            
            <div className="flex items-center justify-between py-2 border-b border-neutral-100">
              <div>
                <p className="font-medium">Token Swap</p>
                <p className="text-sm text-neutral-500">Apr 8, 2023 • ETH → USDC</p>
              </div>
              <p className="text-neutral-600 font-medium">0.25 ETH → 450 USDC</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}