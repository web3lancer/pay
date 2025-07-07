import React, { useEffect, useState } from 'react'
import { STELLAR_RPC_URL, STELLAR_NETWORK_PASSPHRASE, STELLAR_CONTRACT_ID } from '../config'

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

export function StellarContractWidget() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {
    let mounted = true
    async function fetchContract() {
      setStatus('loading')
      try {
        if (!Server) throw new Error()
        const server = new Server(STELLAR_RPC_URL)
        const ledger = await server.ledgers().order('desc').limit(1).call()
        if (mounted) {
          setResult({ latestLedger: ledger.records[0]?.sequence })
          setStatus('success')
        }
      } catch {
        if (mounted) {
          setResult(null)
          setStatus('error')
        }
      }
    }
    fetchContract()
    return () => { mounted = false }
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mb-4 flex items-center">
      <StatusDot status={status} />
      <div>
        <span className="text-blue-700 font-medium">Stellar Network</span>
        <div className="text-xs text-neutral-500">
          {status === 'loading' && <>Connecting...</>}
          {status === 'success' && <>Latest Ledger: <span className="font-mono">{result.latestLedger}</span></>}
          {status === 'error' && <>Not connected</>}
        </div>
      </div>
    </div>
  )
}
