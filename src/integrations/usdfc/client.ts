import { SecuredFinanceClient } from "@secured-finance/sf-client";
import { createPublicClient, createWalletClient, http } from "viem";
import { filecoin } from "viem/chains";

export async function getSecuredFinanceClient() {
  const publicClient = createPublicClient({
    chain: filecoin,
    transport: http()
  });

  const walletClient = createWalletClient({
    chain: filecoin,
    transport: http()
  });

  const client = new SecuredFinanceClient();
  await client.init(publicClient, walletClient);

  return client;
}
