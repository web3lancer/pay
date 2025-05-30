import { AppShell } from '@/components/layout/AppShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { FiActivity, FiArrowUp, FiArrowDown, FiPlusCircle } from 'react-icons/fi'

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-sm text-neutral-500">Welcome back, John</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              leftIcon={<FiPlusCircle />}
              size="sm"
            >
              Add Wallet
            </Button>
            <Button 
              leftIcon={<FiArrowUp />}
              size="sm"
            >
              Send
            </Button>
          </div>
        </div>

        {/* Portfolio Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6 md:items-center">
              <div>
                <p className="text-sm text-neutral-500">Total Balance</p>
                <h2 className="text-3xl font-bold">$12,345.67</h2>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">+5.23%</span>
                  <span className="text-xs text-neutral-500">Last 24h</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 md:ml-auto">
                <div className="bg-neutral-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FiArrowUp className="text-green-500" />
                    <span className="text-sm font-medium">Income</span>
                  </div>
                  <p className="text-xl font-bold">$3,240.00</p>
                </div>
                <div className="bg-neutral-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FiArrowDown className="text-red-500" />
                    <span className="text-sm font-medium">Spent</span>
                  </div>
                  <p className="text-xl font-bold">$1,150.00</p>
                </div>
                <div className="bg-neutral-100 px-4 py-3 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <FiActivity className="text-blue-500" />
                    <span className="text-sm font-medium">Transactions</span>
                  </div>
                  <p className="text-xl font-bold">234</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Cards and Transactions - Placeholder for now */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Placeholder transactions */}
                  <p className="text-neutral-500">Transaction list will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Assets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Placeholder assets */}
                  <p className="text-neutral-500">Asset list will appear here</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  )
}