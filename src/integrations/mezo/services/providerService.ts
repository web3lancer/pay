import { JsonRpcProvider, Wallet } from "ethers";
import { getCurrentNetwork, MEZO_MAINNET, MEZO_TESTNET } from "@/integrations/mezo/types/networks";
import { getRpcUrl } from "@/integrations/mezo/providers/rpcProviderManager";

let cachedProvider: JsonRpcProvider | null = null;
let cachedNetwork: string = "";

/**
 * Get or create a JsonRpcProvider instance for Mezo
 * Uses intelligent RPC provider selection with fallback logic:
 * 1. Spectrum (if available)
 * 2. Boar Network (if available)
 * 3. Mezo Default RPC
 * @param network - 'mainnet' or 'testnet'
 * @returns JsonRpcProvider instance
 */
export const getMezoProvider = (network?: "mainnet" | "testnet"): JsonRpcProvider => {
  const targetNetwork = network || (process.env.NEXT_PUBLIC_MEZO_NETWORK as "mainnet" | "testnet") || "testnet";

  if (cachedProvider && cachedNetwork === targetNetwork) {
    return cachedProvider;
  }

  const networkConfig = targetNetwork === "mainnet" ? MEZO_MAINNET : MEZO_TESTNET;
  
  // Use RPC provider manager for intelligent provider selection
  const rpcUrl = getRpcUrl(targetNetwork);
  
  cachedProvider = new JsonRpcProvider(rpcUrl, {
    chainId: networkConfig.chainId,
    name: networkConfig.name,
  });
  cachedNetwork = targetNetwork;

  return cachedProvider;
};

/**
 * Get a Wallet signer (for backend operations only)
 * Should NOT be used in browser environment
 * @param network - 'mainnet' or 'testnet'
 * @returns Wallet instance or null if PRIVATE_KEY not set
 */
export const getMezoSigner = (network?: "mainnet" | "testnet"): Wallet | null => {
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.warn("PRIVATE_KEY not set in environment");
    return null;
  }

  const provider = getMezoProvider(network);
  return new Wallet(privateKey, provider);
};

/**
 * Clear cached provider (useful for testing or network switching)
 */
export const clearProviderCache = (): void => {
  cachedProvider = null;
  cachedNetwork = "";
};
