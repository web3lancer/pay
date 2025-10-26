"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getUserPosition, Position } from "@/integrations/mezo/services/musdService";
import { getBTCPrice } from "@/integrations/mezo/services/priceService";
import { getHealthStatus, getHealthPercentage } from "@/integrations/mezo/services/positionService";

export interface MezoPositionState extends Position {
  healthStatus: "safe" | "caution" | "risk";
  healthPercentage: number;
}

export const useMezoPosition = (address: string | null, network?: "mainnet" | "testnet") => {
  const [position, setPosition] = useState<MezoPositionState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPosition = useCallback(async () => {
    if (!address) {
      setPosition(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const rawPosition = await getUserPosition(address, network);

      if (rawPosition) {
        const healthStatus = getHealthStatus(rawPosition.healthFactor);
        const healthPercentage = getHealthPercentage(rawPosition.healthFactor);

        setPosition({
          ...rawPosition,
          healthStatus,
          healthPercentage,
        });
      } else {
        setPosition(null);
      }

      setLastUpdated(new Date());
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to fetch position";
      setError(errorMsg);
      setPosition(null);
    } finally {
      setLoading(false);
    }
  }, [address, network]);

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchPosition();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchPosition, 30000);
    return () => clearInterval(interval);
  }, [fetchPosition]);

  const refresh = useCallback(async () => {
    await fetchPosition();
  }, [fetchPosition]);

  return {
    position,
    loading,
    error,
    lastUpdated,
    refresh,
  };
};
