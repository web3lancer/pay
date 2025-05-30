'use client'

import React, { useState } from 'react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import QRCode from 'react-qr-code'
import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { CryptoAmountInput } from '@/components/crypto/CryptoAmountInput'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs'
import { FiPlus, FiCopy, FiDownload, FiShare2, FiTrash2, FiCheck, FiClock, FiArrowLeft } from 'react-icons/fi'

// Currency data (would come from an API or state)
const currencies = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', balance: { value: 0.45123, formatted: '0.45123 BTC' } },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', balance: { value: 3.12345, formatted: '3.12345 ETH' } },
  { id: 'usdc', name: 'USD Coin', symbol: 'USDC', balance: { value: 1000, formatted: '1,000 USDC' } }
]

// Exchange rates
const exchangeRates: Record<string, number> = {
  'btc': 27000,
  'eth': 1800,
  'usdc': 1
}

// Mock payment requests data
const mockRequests = [
  {
    id: 'req_1',
    status: 'pending',
    description: 'Design services',
    amount: { value: 0.05, currency: 'BTC' },
    createdAt: new Date(2023, 6, 15),
    expiresAt: new Date(2023, 7, 15),
    paymentLink: 'https://pay.example.com/btc/req_1'
  },
  {
    id: 'req_2',
    status: 'paid',
    description: 'Website development',
    amount: { value: 1.5, currency: 'ETH' },
    createdAt: new Date(2023, 6, 10),
    paidAt: new Date(2023, 6, 12),
    paymentLink: 'https://pay.example.com/eth/req_2'
  },
  {
    id: 'req_3',
    status: 'expired',
    description: 'Monthly subscription',
    amount: { value: 100, currency: 'USDC' },
    createdAt: new Date(2023, 5, 20),
    expiresAt: new Date(2023, 6, 20),
    paymentLink: 'https://pay.example.com/usdc/req_3'
  }
]

export function RequestsClient() {
  const [selectedTab, setSelectedTab] = useState('active')
  const [showNewRequestModal, setShowNewRequestModal] = useState(false)
  const [showQRModal, setShowQRModal] = useState(false)
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  
  // New request form state
  const [requestForm, setRequestForm] = useState({
    description: '',
    selectedCurrency: currencies[0],
    amount: '',
    expiresIn: '30' // days
  })

  // Filter requests based on selected tab
  const getFilteredRequests = () => {
    if (selectedTab === 'active') {
      return mockRequests.filter(req => req.status === 'pending')
    } else if (selectedTab === 'paid') {
      return mockRequests.filter(req => req.status === 'paid')
    } else {
      return mockRequests.filter(req => req.status === 'expired')
    }
  }

  // Handle form changes
  const handleFormChange = (field: string, value: any) => {
    setRequestForm({
      ...requestForm,
      [field]: value
    })
  }

  // Create a new request
  const handleCreateRequest = () => {
    // This would typically send data to an API
    const newRequest = {
      id: `req_${Date.now()}`,
      status: 'pending',
      description: requestForm.description,
      amount: { 
        value: Number(requestForm.amount), 
        currency: requestForm.selectedCurrency.symbol 
      },
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + Number(requestForm.expiresIn) * 24 * 60 * 60 * 1000),
      paymentLink: `https://pay.example.com/${requestForm.selectedCurrency.symbol.toLowerCase()}/${Date.now()}`
    }
    
    // For demo purposes, we would push to the array and refresh
    console.log('Created request:', newRequest)
    
    // Close modal and reset form
    setShowNewRequestModal(false)
    setRequestForm({
      description: '',
      selectedCurrency: currencies[0],
      amount: '',
      expiresIn: '30'
    })
  }

  // Show QR code for a request
  const handleShowQR = (request: any) => {
    setSelectedRequest(request)
    setShowQRModal(true)
  }

  // Copy payment link to clipboard
  const handleCopyLink = (link: string) => {
    navigator.clipboard.writeText(link)
    // Would show a toast notification here
    alert('Link copied to clipboard!')
  }

  // Format date helper
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A'
    return format(date, 'MMM d, yyyy')
  }

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Payment Requests</h1>
            <p className="text-sm text-neutral-500">Create and manage payment requests</p>
          </div>
          <Button 
            leftIcon={<FiPlus />}
            onClick={() => setShowNewRequestModal(true)}
          >
            New Request
          </Button>
        </div>

        {/* Tab Navigation */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">
                {mockRequests.filter(req => req.status === 'pending').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="paid">
              Paid
              <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                {mockRequests.filter(req => req.status === 'paid').length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="expired">
              Expired
              <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                {mockRequests.filter(req => req.status === 'expired').length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedTab === 'active' ? 'Active Requests' : 
                   selectedTab === 'paid' ? 'Paid Requests' : 
                   'Expired Requests'}
                </CardTitle>
                <CardDescription>
                  {selectedTab === 'active' ? 'Payment requests awaiting payment' : 
                   selectedTab === 'paid' ? 'Successfully paid requests' : 
                   'Requests that have expired'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getFilteredRequests().length > 0 ? (
                    getFilteredRequests().map((request) => (
                      <motion.div
                        key={request.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border border-gray-200 hover:border-indigo-200 transition-colors"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            {request.status === 'pending' && (
                              <span className="flex items-center gap-1 text-amber-600 text-sm">
                                <FiClock className="h-4 w-4" />
                                Pending
                              </span>
                            )}
                            {request.status === 'paid' && (
                              <span className="flex items-center gap-1 text-green-600 text-sm">
                                <FiCheck className="h-4 w-4" />
                                Paid
                              </span>
                            )}
                            {request.status === 'expired' && (
                              <span className="flex items-center gap-1 text-gray-600 text-sm">
                                <FiArrowLeft className="h-4 w-4" />
                                Expired
                              </span>
                            )}
                          </div>
                          <h3 className="font-medium">{request.description}</h3>
                          <p className="text-gray-500 text-sm">
                            Created: {formatDate(request.createdAt)}
                            {request.status === 'pending' ? 
                              ` • Expires: ${formatDate(request.expiresAt)}` : 
                             request.status === 'paid' ?
                              ` • Paid: ${formatDate(request.paidAt)}` :
                              ` • Expired: ${formatDate(request.expiresAt)}`}
                          </p>
                        </div>

                        <div className="flex flex-col sm:items-end">
                          <p className="font-semibold">{request.amount.value} {request.amount.currency}</p>
                          <p className="text-sm text-gray-500">
                            ${(request.amount.value * exchangeRates[request.amount.currency.toLowerCase()]).toLocaleString()}
                          </p>
                          
                          <div className="flex gap-2 mt-2">
                            {request.status === 'pending' && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  leftIcon={<FiCopy />}
                                  onClick={() => handleCopyLink(request.paymentLink)}
                                >
                                  Copy Link
                                </Button>
                                <Button 
                                  variant="secondary" 
                                  size="sm"
                                  leftIcon={<FiShare2 />}
                                  onClick={() => handleShowQR(request)}
                                >
                                  QR Code
                                </Button>
                              </>
                            )}
                            {request.status === 'expired' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiTrash2 />}
                              >
                                Delete
                              </Button>
                            )}
                            {request.status === 'paid' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                leftIcon={<FiDownload />}
                              >
                                Receipt
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">No {selectedTab} requests found</p>
                      <Button 
                        variant="ghost"
                        className="mt-4"
                        onClick={() => setShowNewRequestModal(true)}
                      >
                        Create New Request
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* New Request Modal */}
      <Modal
        isOpen={showNewRequestModal}
        onClose={() => setShowNewRequestModal(false)}
        title="Create Payment Request"
        description="Generate a payment link or QR code for others to pay you"
      >
        <div className="space-y-6">
          <Input
            label="Description"
            placeholder="e.g., Design services"
            value={requestForm.description}
            onChange={(e) => handleFormChange('description', e.target.value)}
          />

          <CryptoAmountInput
            currencies={currencies}
            selectedCurrency={requestForm.selectedCurrency}
            onCurrencyChange={(currency) => handleFormChange('selectedCurrency', currency)}
            value={requestForm.amount}
            onChange={(value) => handleFormChange('amount', value)}
            exchangeRate={exchangeRates[requestForm.selectedCurrency.id]}
            label="Amount"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expires In
            </label>
            <select
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              value={requestForm.expiresIn}
              onChange={(e) => handleFormChange('expiresIn', e.target.value)}
            >
              <option value="1">1 day</option>
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <Button 
              variant="ghost"
              onClick={() => setShowNewRequestModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              disabled={!requestForm.description || !requestForm.amount}
            >
              Create Request
            </Button>
          </div>
        </div>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        title="Payment QR Code"
        description={selectedRequest?.description}
      >
        <div className="flex flex-col items-center">
          <div className="mb-6 bg-white p-5 rounded-lg">
            {selectedRequest && (
              <QRCode 
                value={selectedRequest.paymentLink} 
                size={200} 
                bgColor="#FFFFFF" 
                fgColor="#000000" 
                level="L" 
              />
            )}
          </div>

          <div className="mb-6 w-full">
            <p className="text-center font-medium mb-2">{selectedRequest?.amount.value} {selectedRequest?.amount.currency}</p>
            <p className="text-center text-sm text-gray-500 mb-4">
              ${selectedRequest && (selectedRequest.amount.value * exchangeRates[selectedRequest.amount.currency.toLowerCase()]).toLocaleString()}
            </p>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-gray-600 truncate">{selectedRequest?.paymentLink}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                leftIcon={<FiCopy />} 
                onClick={() => handleCopyLink(selectedRequest?.paymentLink)}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="flex gap-3">
            <Button 
              variant="secondary"
              leftIcon={<FiDownload />}
              onClick={() => console.log('Download QR')}
            >
              Download QR
            </Button>
            <Button 
              leftIcon={<FiShare2 />}
              onClick={() => console.log('Share link')}
            >
              Share
            </Button>
          </div>
        </div>
      </Modal>
    </AppShell>
  )
}