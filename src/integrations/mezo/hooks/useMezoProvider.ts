"use client";

import { useCallback, useRef } from "react";
import { getMezoProvider, clearProviderCache } from "@/integrations/mezo/services/providerService";

/**
 * Hook to access Mezo provider
 * Provides lazy-loaded, memoized provider instance
 */
export const useMezoProvider = () => {
  const providerRef = useRef<any>(null);

  const getProvider = useCallback((network?: "mainnet" | "testnet") => {
    if (!providerRef.current) {
      providerRef.current = getMezoProvider(network);
    }
    return providerRef.current;
  }, []);

  const switchNetwork = useCallback((network: "mainnet" | "testnet") => {
    clearProviderCache();
    providerRef.current = null;
    return getMezoProvider(network);
  }, []);

  return {
    getProvider,
    switchNetwork,
  };
};
