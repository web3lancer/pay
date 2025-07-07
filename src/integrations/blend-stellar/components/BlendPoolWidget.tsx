import React, { useEffect, useState } from 'react';
import { BlendPoolService } from '../services/pool.service';
import { BLEND_DEFAULT_NETWORK } from '../config';

const DEMO_POOL_ID = process.env.NEXT_PUBLIC_BLEND_DEMO_POOL_ID || 'CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

export function BlendPoolWidget() {
  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    BlendPoolService.loadPool(BLEND_DEFAULT_NETWORK, DEMO_POOL_ID)
      .then(data => {
        if (mounted) {
          setPool(data);
          setLoading(false);
        }
      })
      .catch(e => {
        if (mounted) {
          setError('Failed to load Blend pool');
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="text-neutral-500">Loading Blend pool...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!pool) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-cyan-200 p-6">
      <h2 className="text-xl font-semibold text-cyan-700 mb-2">Blend Pool (Demo)</h2>
      <pre className="text-xs bg-cyan-50 rounded p-2 overflow-x-auto">{JSON.stringify(pool, null, 2)}</pre>
    </div>
  );
}
