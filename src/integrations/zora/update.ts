import { updateCoinURI, updatePayoutRecipient } from "@zoralabs/coins-sdk";
import { zoraPublicClient, getZoraWalletClient } from "./sdk";
import { Address } from "viem";

export type UpdateCoinURIParams = {
  coin: Address;
  newURI: string;
};

export async function updateZoraCoinURI(
  params: UpdateCoinURIParams,
  account: string,
  rpcUrl?: string
) {
  const walletClient = getZoraWalletClient(account, rpcUrl);
  return await updateCoinURI(params, walletClient, zoraPublicClient);
}

export type UpdatePayoutRecipientParams = {
  coin: Address;
  newPayoutRecipient: Address;
};

export async function updateZoraPayoutRecipient(
  params: UpdatePayoutRecipientParams,
  account: string,
  rpcUrl?: string
) {
  const walletClient = getZoraWalletClient(account, rpcUrl);
  return await updatePayoutRecipient(params, walletClient, zoraPublicClient);
}
