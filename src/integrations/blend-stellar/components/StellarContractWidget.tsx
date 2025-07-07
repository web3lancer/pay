import React, { useEffect, useState } from 'react'
import { STELLAR_RPC_URL, STELLAR_NETWORK_PASSPHRASE, STELLAR_CONTRACT_ID } from '../config'

// Only import if needed to avoid SSR issues
let Server: any, ContractClient: any
if (typeof window !== 'undefined') {
  try {
    // @ts-ignore
    Server = require('@stellar/stellar-sdk').Server
    // @ts-ignore
    ContractClient = require('@stellar/stellar-sdk/contract').Client
  } catch {}
}

export function StellarContractWidget() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    async function fetchContract() {
      setStatus('loading')
      setError(null)
      try {
        if (!Server || !ContractClient) throw new Error('Stellar SDK not available')
        // Just fetch latest ledger as a demo of live Stellar data
        const server = new Server(STELLAR_RPC_URL)
        const ledger = await server.ledgers().order('desc').limit(1).call()
        if (mounted) {
          setResult({ latestLedger: ledger.records[0]?.sequence })
          setStatus('success')
        }
      } catch (e: any) {
        if (mounted) {
          setError(e.message || 'Failed to fetch Stellar contract data')
          setStatus('error')
        }
      }
    }
    fetchContract()
    return () => { mounted = false }
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-blue-200 p-6 mb-4">
      <h2 className="text-lg font-semibold text-blue-700 mb-2">Stellar Network Status</h2>
      {status === 'loading' && <div className="text-neutral-500">Loading Stellar data...</div>}
      {status === 'error' && <div className="text-red-500">{error}</div>}
      {status === 'success' && (
        <div>
          <div className="text-blue-800">Latest Ledger: <span className="font-mono">{result.latestLedger}</span></div>
          <div className="text-xs text-neutral-500 mt-2">Contract ID: <span className="font-mono">{STELLAR_CONTRACT_ID}</span></div>
        </div>
      )}
    </div>
  )
}
