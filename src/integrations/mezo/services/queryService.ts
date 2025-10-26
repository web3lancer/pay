import { formatEther } from "ethers";
import { getMezoProvider } from "./providerService";

/**
 * Get current block number
 * @param network - 'mainnet' or 'testnet'
 * @returns Current block number
 */
export const getBlockNumber = async (network?: "mainnet" | "testnet"): Promise<number> => {
  const provider = getMezoProvider(network);
  return provider.getBlockNumber();
};

/**
 * Get wallet balance in BTC (human-readable format)
 * @param address - Wallet address
 * @param network - 'mainnet' or 'testnet'
 * @returns Balance as string in BTC units
 */
export const getBalance = async (address: string, network?: "mainnet" | "testnet"): Promise<string> => {
  const provider = getMezoProvider(network);
  const balanceWei = await provider.getBalance(address);
  return formatEther(balanceWei);
};

/**
 * Get transaction count (nonce) for address
 * @param address - Wallet address
 * @param network - 'mainnet' or 'testnet'
 * @returns Nonce value
 */
export const getNonce = async (address: string, network?: "mainnet" | "testnet"): Promise<number> => {
  const provider = getMezoProvider(network);
  return provider.getTransactionCount(address);
};

/**
 * Get gas price on the network
 * @param network - 'mainnet' or 'testnet'
 * @returns Gas price in wei as string
 */
export const getGasPrice = async (network?: "mainnet" | "testnet"): Promise<string> => {
  const provider = getMezoProvider(network);
  const gasPrice = await provider.getGasPrice();
  return gasPrice.toString();
};

/**
 * Get network info
 * @param network - 'mainnet' or 'testnet'
 * @returns Network details
 */
export const getNetworkInfo = async (network?: "mainnet" | "testnet"): Promise<{
  chainId: number;
  name: string;
  blockNumber: number;
}> => {
  const provider = getMezoProvider(network);
  const net = await provider.getNetwork();
  const blockNumber = await provider.getBlockNumber();

  return {
    chainId: net.chainId,
    name: net.name,
    blockNumber,
  };
};
