import { createCoin, DeployCurrency, ValidMetadataURI } from "@zoralabs/coins-sdk";
import { zoraPublicClient, getZoraWalletClient } from "./sdk";
import { Address, Hex } from "viem";
import { base } from "viem/chains";

export type CreateCoinParams = {
  name: string;
  symbol: string;
  uri: ValidMetadataURI;
  payoutRecipient: Address;
  platformReferrer?: Address;
  chainId?: number;
  currency?: DeployCurrency;
};

export async function createZoraCoin(
  params: CreateCoinParams,
  account: string,
  rpcUrl?: string
) {
  const walletClient = getZoraWalletClient(account, rpcUrl);
  const coinParams = {
    ...params,
    chainId: params.chainId || base.id,
    currency: params.currency || DeployCurrency.ZORA,
  };
  return await createCoin(coinParams, walletClient, zoraPublicClient);
}
