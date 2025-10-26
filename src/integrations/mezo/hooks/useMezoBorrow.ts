"use client";

import { useCallback, useState } from "react";
import { BrowserProvider, TransactionResponse } from "ethers";
import {
  openPosition as openPositionService,
  repayMUSD as repayMUSDService,
  withdrawCollateral as withdrawCollateralService,
} from "@/integrations/mezo/services/musdService";
import { parseContractError } from "@/integrations/mezo/types/errors";

export const useMezoBorrow = (network?: "mainnet" | "testnet") => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Get signer from wallet
  const getSigner = useCallback(async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      throw new Error("Wallet not connected");
    }

    const provider = new BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    return signer;
  }, []);

  const openPosition = useCallback(
    async (collateralAmount: string, musdAmount: string) => {
      setLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const signer = await getSigner();
        const tx = await openPositionService(collateralAmount, musdAmount, signer, network);

        if (tx) {
          setTxHash(tx.hash);
          await tx.wait();
          return { success: true, txHash: tx.hash };
        }

        throw new Error("Transaction failed");
      } catch (err) {
        const mezoError = parseContractError(err);
        setError(mezoError.message);
        return { success: false, error: mezoError };
      } finally {
        setLoading(false);
      }
    },
    [getSigner, network]
  );

  const repay = useCallback(
    async (repayAmount: string) => {
      setLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const signer = await getSigner();
        const tx = await repayMUSDService(repayAmount, signer, network);

        if (tx) {
          setTxHash(tx.hash);
          await tx.wait();
          return { success: true, txHash: tx.hash };
        }

        throw new Error("Repay transaction failed");
      } catch (err) {
        const mezoError = parseContractError(err);
        setError(mezoError.message);
        return { success: false, error: mezoError };
      } finally {
        setLoading(false);
      }
    },
    [getSigner, network]
  );

  const withdraw = useCallback(
    async (withdrawAmount: string) => {
      setLoading(true);
      setError(null);
      setTxHash(null);

      try {
        const signer = await getSigner();
        const tx = await withdrawCollateralService(withdrawAmount, signer, network);

        if (tx) {
          setTxHash(tx.hash);
          await tx.wait();
          return { success: true, txHash: tx.hash };
        }

        throw new Error("Withdraw transaction failed");
      } catch (err) {
        const mezoError = parseContractError(err);
        setError(mezoError.message);
        return { success: false, error: mezoError };
      } finally {
        setLoading(false);
      }
    },
    [getSigner, network]
  );

  return {
    openPosition,
    repay,
    withdraw,
    loading,
    error,
    txHash,
  };
};
