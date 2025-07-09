import {
  getProfile,
  getProfileBalances,
  type GetProfileParams,
  type GetProfileBalancesParams,
} from "@zoralabs/coins-sdk";

// Get user profile
export function fetchProfile(params: GetProfileParams) {
  return getProfile(params);
}

// Get user profile balances
export function fetchProfileBalances(params: GetProfileBalancesParams) {
  return getProfileBalances(params);
}
