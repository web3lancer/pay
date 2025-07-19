import { PropsWithChildren } from 'react';

import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

import { ENABLE_APTOS } from '../constants';
import { WalletProvider } from './WalletProvider';

const queryClient = new QueryClient();

export function AptosIntegrationProvider({ children }: PropsWithChildren) {
  if (!ENABLE_APTOS) return <>{children}</>;
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>{children}</WalletProvider>
    </QueryClientProvider>
  );
}
