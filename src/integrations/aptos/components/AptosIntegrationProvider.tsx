import { PropsWithChildren } from 'react';

import { WalletProvider } from '@/integrations/aptos/components/WalletProvider';
import { ENABLE_APTOS } from '@/integrations/aptos/constants';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

const queryClient = new QueryClient();

export function AptosIntegrationProvider({ children }: PropsWithChildren) {
  if (!ENABLE_APTOS) return <>{children}</>;
  return (
    <QueryClientProvider client={queryClient}>
      <WalletProvider>{children}</WalletProvider>
    </QueryClientProvider>
  );
}
