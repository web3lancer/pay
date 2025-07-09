import { setApiKey } from "@zoralabs/coins-sdk";
import { createPublicClient, createWalletClient, http } from "viem";
import { base } from "viem/chains";

// Set API key from env
const ZORA_API_KEY = process.env.ZORA_API || process.env.NEXT_PUBLIC_ZORA_API || "";

if (ZORA_API_KEY) {
  setApiKey(ZORA_API_KEY);
}

// Public client for read operations
export const zoraPublicClient = createPublicClient({
  chain: base,
  transport: http(),
});

// Wallet client for write operations (must be configured with user wallet/account)
export function getZoraWalletClient(account: string, rpcUrl?: string) {
  return createWalletClient({
    account,
    chain: base,
    transport: http(rpcUrl),
  });
}
