"use client";

import { useEffect, useState, useCallback } from "react";
import {
  addMezoNetworkToWallet,
  switchToMezoNetwork,
  getConnectedAddress,
  getConnectedChainId,
} from "@/integrations/mezo/services/walletService";
import { MEZO_MAINNET, MEZO_TESTNET } from "@/integrations/mezo/types/networks";

export const useMezoWallet = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<"mainnet" | "testnet">("testnet");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check wallet connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const addr = await getConnectedAddress();
      const chainId = await getConnectedChainId();

      if (addr) {
        setAddress(addr);
        setConnected(true);

        const detectedNetwork = chainId === MEZO_MAINNET.chainId ? "mainnet" : "testnet";
        setNetwork(detectedNetwork);
      }
    };

    checkConnection();

    // Listen for account changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setConnected(false);
          setAddress(null);
        } else {
          setAddress(accounts[0]);
          setConnected(true);
        }
      });

      // Listen for network changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        const chainIdNum = parseInt(chainId, 16);
        const detectedNetwork = chainIdNum === MEZO_MAINNET.chainId ? "mainnet" : "testnet";
        setNetwork(detectedNetwork);
      });
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners?.();
      }
    };
  }, []);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const addr = await getConnectedAddress();
      if (addr) {
        setAddress(addr);
        setConnected(true);

        const chainId = await getConnectedChainId();
        const detectedNetwork = chainId === MEZO_MAINNET.chainId ? "mainnet" : "testnet";
        setNetwork(detectedNetwork);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress(null);
  }, []);

  const switchNetwork = useCallback(
    async (targetNetwork: "mainnet" | "testnet") => {
      setLoading(true);
      setError(null);

      try {
        const success = await switchToMezoNetwork();
        if (success) {
          setNetwork(targetNetwork);
        } else {
          throw new Error("Failed to switch network");
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to switch network";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    connected,
    address,
    network,
    loading,
    error,
    connect,
    disconnect,
    switchNetwork,
  };
};
