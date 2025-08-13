import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getMorphProvider } from './provider';

const ENABLE_MORPH =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_INTEGRATION_MORPH === undefined || process.env.NEXT_PUBLIC_INTEGRATION_MORPH === 'true');

export function useWallet() {
  const [address, setAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.Signer | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!ENABLE_MORPH) return;
    if (typeof window === 'undefined' || !(window as any).ethereum) return;
    const browserProvider = new ethers.BrowserProvider((window as any).ethereum);
    setProvider(browserProvider);
    browserProvider.send('eth_accounts', []).then((accounts: string[]) => {
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setConnected(true);
        browserProvider.getSigner().then(setSigner);
      }
    });
  }, []);

  const connect = async () => {
    if (!ENABLE_MORPH) return;
    if (!provider) return;
    const accounts = await provider.send('eth_requestAccounts', []);
    if (accounts.length > 0) {
      setAddress(accounts[0]);
      setConnected(true);
      setSigner(await provider.getSigner());
    }
  };

  const disconnect = () => {
    setAddress(null);
    setConnected(false);
    setSigner(null);
  };

  return {
    address: ENABLE_MORPH ? address : null,
    provider: ENABLE_MORPH ? provider : null,
    signer: ENABLE_MORPH ? signer : null,
    connected: ENABLE_MORPH ? connected : false,
    connect: ENABLE_MORPH ? connect : () => {},
    disconnect: ENABLE_MORPH ? disconnect : () => {},
  };
}
