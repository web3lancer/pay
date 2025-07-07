import { useState, useEffect } from 'react';
import { BlendPoolService } from '../services/pool.service';

export function useBlendPool(network: any, poolId: string) {
  const [pool, setPool] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    BlendPoolService.loadPool(network, poolId).then((data) => {
      if (mounted) {
        setPool(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [network, poolId]);

  return { pool, loading };
}
