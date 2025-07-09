import {
  getCoin,
  getCoins,
  getCoinComments,
  type GetCoinParams,
  type GetCoinsParams,
  type GetCoinCommentsParams,
} from "@zoralabs/coins-sdk";

// Get details for a single coin
export async function fetchCoinDetails(params: GetCoinParams) {
  return getCoin(params);
}

// Get details for multiple coins
export async function fetchCoinsBatch(params: GetCoinsParams) {
  return getCoins(params);
}

// Get comments for a coin
export async function fetchCoinComments(params: GetCoinCommentsParams) {
  return getCoinComments(params);
}
