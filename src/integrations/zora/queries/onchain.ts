import { getOnchainCoinDetails, type GetOnchainCoinDetailsParams } from "@zoralabs/coins-sdk";

// Get onchain coin details (optionally for a user)
export function fetchOnchainCoinDetails(params: GetOnchainCoinDetailsParams) {
  return getOnchainCoinDetails(params);
}
