import { useState, useEffect } from 'react';
import { useWallet as useAptosWallet } from '@aptos-labs/wallet-adapter-react';
import { isAptosEnabled } from './client';

export function useWallet() {
  const aptosWallet = useAptosWallet();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isAptosEnabled() || !mounted) {
    return {
      address: null,
      connected: false,
      connect: async () => {},
      disconnect: async () => {},
      signAndSubmitTransaction: async () => null,
      account: null,
      wallet: null,
    };
  }

  return {
    address: aptosWallet.account?.address || null,
    connected: aptosWallet.connected,
    connect: aptosWallet.connect,
    disconnect: aptosWallet.disconnect,
    signAndSubmitTransaction: aptosWallet.signAndSubmitTransaction,
    account: aptosWallet.account,
    wallet: aptosWallet.wallet,
  };
}
