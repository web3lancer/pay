'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useMezoWallet, useMezoPosition } from '@/integrations/mezo'
import { CapitalDashboard, GetAdvanceModal } from '@/components/capital'
import { AppShell } from '@/components/layout/AppShell'
import { FiArrowLeft } from 'react-icons/fi'
import Link from 'next/link'

export default function CapitalPage() {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { address, network } = useMezoWallet()
  const { position } = useMezoPosition(address, network === 'mainnet' ? 'mainnet' : 'testnet')
  const [showModal, setShowModal] = useState(false)

  const collateral = position?.collateral ? parseFloat(position.collateral) : 0

  if (authLoading) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppShell>
    )
  }

  if (!isAuthenticated) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-neutral-600">Please log in to access Capital Hub</p>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="space-y-6 pb-20 md:pb-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Capital Hub</h1>
            <p className="text-neutral-600">Unlock credit with your Bitcoin</p>
          </div>
        </div>

        {/* Main Dashboard */}
        <CapitalDashboard />

        {/* Get Advance Modal */}
        <GetAdvanceModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={() => {
            // Modal will close automatically
          }}
          collateral={collateral}
        />

        {/* Educational Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* How It Works */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">How It Works</h3>
            <ol className="space-y-3">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Deposit BTC</p>
                  <p className="text-sm text-neutral-600">Use your Bitcoin as collateral</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Borrow MUSD</p>
                  <p className="text-sm text-neutral-600">Get stablecoin instantly, no selling</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="font-medium text-neutral-900">Use Freely</p>
                  <p className="text-sm text-neutral-600">Pay bills, invest, manage cashflow</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Key Benefits */}
          <div className="bg-white rounded-2xl border border-neutral-200 p-6">
            <h3 className="text-lg font-bold text-neutral-900 mb-4">Key Benefits</h3>
            <ul className="space-y-3">
              <li className="flex gap-3">
                <div className="flex-shrink-0 text-primary-600 mt-1">✓</div>
                <div>
                  <p className="font-medium text-neutral-900">Keep Your Bitcoin</p>
                  <p className="text-sm text-neutral-600">Stay invested while you borrow</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 text-primary-600 mt-1">✓</div>
                <div>
                  <p className="font-medium text-neutral-900">Instant Access</p>
                  <p className="text-sm text-neutral-600">Get MUSD in minutes, not days</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 text-primary-600 mt-1">✓</div>
                <div>
                  <p className="font-medium text-neutral-900">Flexible Terms</p>
                  <p className="text-sm text-neutral-600">Borrow what you need, when you need it</p>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 text-primary-600 mt-1">✓</div>
                <div>
                  <p className="font-medium text-neutral-900">Transparent Pricing</p>
                  <p className="text-sm text-neutral-600">No hidden fees or surprises</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Risk Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h3 className="font-bold text-yellow-900 mb-2">⚠️ Risk Warning</h3>
          <p className="text-sm text-yellow-800">
            Collateralized borrowing involves risk. If your collateral value drops significantly or you exceed your borrowing limit, your position may be liquidated. Always maintain a healthy collateralization ratio. Do not borrow more than you can comfortably repay.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
