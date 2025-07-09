import { tradeCoin, TradeParameters } from "@zoralabs/coins-sdk";
import { zoraPublicClient, getZoraWalletClient } from "./sdk";
import { Address, Hex } from "viem";

// Trade Zora coins (ETH <-> ERC20, ERC20 <-> ERC20, etc.)
export async function tradeZoraCoin({
  tradeParameters,
  account,
  rpcUrl,
  validateTransaction = true,
}: {
  tradeParameters: TradeParameters;
  account: string;
  rpcUrl?: string;
  validateTransaction?: boolean;
}) {
  const walletClient = getZoraWalletClient(account, rpcUrl);
  return await tradeCoin({
    tradeParameters,
    walletClient,
    account,
    publicClient: zoraPublicClient,
    validateTransaction,
  });
}
