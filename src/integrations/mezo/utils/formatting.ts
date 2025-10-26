/**
 * Format large numbers with commas
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

/**
 * Format currency
 */
export const formatCurrency = (amount: number | string, currency: string = "USD"): string => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `$0.00`;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency === "USD" ? "USD" : "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Format percentage
 */
export const formatPercentage = (num: number, decimals: number = 1): string => {
  return new Intl.NumberFormat("en-US", {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num / 100);
};

/**
 * Format BTC amount
 */
export const formatBTC = (btc: number | string, decimals: number = 4): string => {
  const num = typeof btc === "string" ? parseFloat(btc) : btc;
  if (isNaN(num)) return "0 BTC";
  return `${formatNumber(num, decimals)} BTC`;
};

/**
 * Format MUSD amount
 */
export const formatMUSD = (musd: number | string, decimals: number = 2): string => {
  const num = typeof musd === "string" ? parseFloat(musd) : musd;
  if (isNaN(num)) return "0 MUSD";
  return `${formatNumber(num, decimals)} MUSD`;
};

/**
 * Format health factor as percentage
 */
export const formatHealthFactor = (hf: number): string => {
  return formatPercentage(hf);
};

/**
 * Truncate address
 */
export const truncateAddress = (address: string, chars: number = 4): string => {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};

/**
 * Format transaction hash for display
 */
export const formatTxHash = (hash: string): string => {
  return truncateAddress(hash, 6);
};
