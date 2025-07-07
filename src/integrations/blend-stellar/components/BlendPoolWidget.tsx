import React, { useEffect, useState } from 'react'
import { BlendPoolService } from '../services/pool.service'
import { BLEND_DEFAULT_NETWORK } from '../config'

const DEMO_POOL_ID = process.env.NEXT_PUBLIC_BLEND_DEMO_POOL_ID || 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'

function StatusDot({ status }: { status: 'loading' | 'success' | 'error' }) {
  let color = 'bg-gray-300'
  if (status === 'success') color = 'bg-green-400'
  if (status === 'error') color = 'bg-yellow-400'
  return <span className={`inline-block w-2 h-2 rounded-full mr-2 ${color}`} />
}

export function BlendPoolWidget() {
  const [pool, setPool] = useState<any>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    let mounted = true
    setStatus('loading')
    BlendPoolService.loadPool(BLEND_DEFAULT_NETWORK, DEMO_POOL_ID)
      .then(data => {
        if (mounted) {
          setPool(data)
          setStatus('success')
        }
      })
      .catch(() => {
        if (mounted) {
          setStatus('error')
        }
      })
    return () => { mounted = false }
  }, [])

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6 flex items-center">
      <StatusDot status={status} />
      <div>
        <span className="text-cyan-700 font-medium">Blend Pool</span>
        <div className="text-xs text-neutral-500">
          {status === 'loading' && <>Syncing pool data...</>}
          {status === 'success' && <span>Pool loaded</span>}
          {status === 'error' && <>Taking a break, try again soon!</>}
        </div>
        {status === 'success' && (
          <pre className="text-xs bg-cyan-50 rounded p-2 overflow-x-auto mt-2">{JSON.stringify(pool, null, 2)}</pre>
        )}
      </div>
    </div>
  )
}
