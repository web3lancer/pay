import {
  getCoinsTopGainers,
  getCoinsTopVolume24h,
  getCoinsMostValuable,
  getCoinsNew,
  getCoinsLastTraded,
  getCoinsLastTradedUnique,
  type ExploreQueryOptions,
} from "@zoralabs/coins-sdk";

// Top gainers
export function fetchTopGainers(options: ExploreQueryOptions = {}) {
  return getCoinsTopGainers(options);
}

// Top volume 24h
export function fetchTopVolume(options: ExploreQueryOptions = {}) {
  return getCoinsTopVolume24h(options);
}

// Most valuable
export function fetchMostValuable(options: ExploreQueryOptions = {}) {
  return getCoinsMostValuable(options);
}

// New coins
export function fetchNewCoins(options: ExploreQueryOptions = {}) {
  return getCoinsNew(options);
}

// Last traded
export function fetchLastTraded(options: ExploreQueryOptions = {}) {
  return getCoinsLastTraded(options);
}

// Last traded by unique traders
export function fetchLastTradedUnique(options: ExploreQueryOptions = {}) {
  return getCoinsLastTradedUnique(options);
}
