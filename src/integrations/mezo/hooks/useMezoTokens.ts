"use client";

import { useEffect, useState, useCallback } from "react";
import { getTokenBalance } from "@/integrations/mezo/services/tokenService";

export const useMezoTokenBalance = (
  tokenAddress: string | null,
  userAddress: string | null,
  network?: "mainnet" | "testnet"
) => {
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!tokenAddress || !userAddress) {
      setBalance(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const bal = await getTokenBalance(tokenAddress, userAddress, network);
      setBalance(bal);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch balance";
      setError(errorMsg);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  }, [tokenAddress, userAddress, network]);

  // Fetch on mount and when dependencies change
  useEffect(() => {
    fetchBalance();

    // Auto-refresh every 15 seconds
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  const refresh = useCallback(async () => {
    await fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refresh,
  };
};
