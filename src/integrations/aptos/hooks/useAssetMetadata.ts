import {
  useEffect,
  useState,
} from 'react';

export function useAssetMetadata(fetchRegistry: () => Promise<any>, fetchObjects: (registry: any) => Promise<string[]>, fetchMetadata: (objects: string[]) => Promise<any[]>) {
  const [metadata, setMetadata] = useState<any[]>([]);

  useEffect(() => {
    fetchRegistry().then((registry) => {
      fetchObjects(registry).then((objects) => {
        fetchMetadata(objects).then((metadatas) => {
          setMetadata(metadatas);
        });
      });
    });
  }, [fetchRegistry, fetchObjects, fetchMetadata]);

  return metadata;
}
