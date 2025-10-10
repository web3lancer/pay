'use client';

import { PropsWithChildren } from 'react';

export function AptosProvider({ children }: PropsWithChildren) {
  // Aptos wallet adapter removed to reduce dependencies
  // Direct wallet integration can be added later if needed
  return <>{children}</>;
}
