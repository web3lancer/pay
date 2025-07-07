import React, { useEffect, useState } from 'react'
const rpcUrl = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org'

// Only import if needed to avoid SSR issues
let Server: any
if (typeof window !== 'undefined') {
  try {
    // @ts-ignore
    Server = require('@stellar/stellar-sdk').Server
  } catch {}
}

function StatusDot({ status }: { status: 'loading' | 'success' | 'error' }) {
  let color = 'bg-gray-300'
  if (status === 'success') color = 'bg-green-400'
  if (status === 'error') color = 'bg-yellow-400'
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${color}`} />
}

function Loader() {
  return (
    <span className="inline-block align-middle mr-2">
      <span className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-400"></span>
    </span>
  )
}

export function StellarContractWidget() {
  const [ledger, setLedger] = useState<string | null>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    let mounted = true
    async function fetchLedger() {
      setStatus('loading')
      try {
        if (!Server) throw new Error()
        const server = new Server(rpcUrl)
        const ledger = await server.ledgers().order('desc').limit(1).call()
        if (mounted) {
          setLedger(ledger.records[0]?.sequence)
          setStatus('success')
        }
      } catch {
        if (mounted) setStatus('error')
      }
    }
    fetchLedger()
    return () => { mounted = false }
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mb-4 flex items-center">
      <StatusDot status={status} />
      <div>
        <span className="text-blue-700 font-medium">Stellar Network</span>
        <div className="text-xs text-neutral-500 flex items-center">
          {(status === 'loading' || status === 'error') && (
            <>
              <Loader />
              Connecting...
            </>
          )}
          {status === 'success' && (
            <>Latest Ledger: <span className="font-mono">{ledger}</span></>
          )}
        </div>
      </div>
    </div>
  )
}
