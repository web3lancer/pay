'use client';

import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { Network } from '@aptos-labs/ts-sdk';
import { PropsWithChildren } from 'react';
import { isAptosEnabled } from './client';

const NETWORK = (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) || Network.TESTNET;

export function AptosProvider({ children }: PropsWithChildren) {
  if (!isAptosEnabled()) {
    return <>{children}</>;
  }

  return (
    <AptosWalletAdapterProvider
      autoConnect={true}
      dappConfig={{ network: NETWORK }}
      onError={(error) => {
        console.error('Aptos wallet error:', error);
      }}
    >
      {children}
    </AptosWalletAdapterProvider>
  );
}
