import { Address, Hex } from "viem";
import { base } from "viem/chains";
import { getCoinCreateFromLogs } from "@zoralabs/coins-sdk";

// Predict coin address (if SDK exposes, otherwise stub)
export function extractCoinAddressFromReceipt(receipt: any) {
  // Uses SDK helper to extract coin address from logs
  return getCoinCreateFromLogs(receipt)?.coin;
}

// Factory contract addresses (Base mainnet & Sepolia)
export const ZORA_FACTORY_ADDRESSES: Record<number, Address> = {
  [base.id]: "0x777777751622c0d3258f214F9DF38E35BF45baF3",
  84532: "0x777777751622c0d3258f214F9DF38E35BF45baF3", // Base Sepolia
};
