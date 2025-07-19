import { PropsWithChildren } from 'react';

import { toast } from './ui/toast'; // Use local toast component
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';

import {
  APTOS_API_KEY,
  NETWORK,
} from '../constants';

export function WalletProvider({ children }: PropsWithChildren) {
  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK, aptosApiKeys: { [NETWORK]: APTOS_API_KEY } }}
      onError={(error) => {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message || error || "Unknown wallet error",
        });
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}