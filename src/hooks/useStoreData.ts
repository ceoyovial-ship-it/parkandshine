import { useEffect, useState } from 'react';

export function useStoreData<T>(fetcher: () => T): [T, () => void] {
  const [data, setData] = useState<T>(fetcher);
  const refresh = () => setData(fetcher());

  useEffect(() => {
    const handler = () => setData(fetcher());
    window.addEventListener('parkshine_update', handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener('parkshine_update', handler);
      window.removeEventListener('storage', handler);
    };
  }, [fetcher]);

  return [data, refresh];
}
