import {
  useEffect,
  useState,
} from 'react';

export function useAssetData(fetchAssetData: () => Promise<any[]>) {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchAssetData().then(setData);
  }, [fetchAssetData]);

  return data;
}
