/**
 * Validate Ethereum address format
 */
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

/**
 * Validate positive number
 */
export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return !isNaN(num) && num > 0;
};

/**
 * Validate that amount is not too small (minimum 0.0001)
 */
export const isMinimumAmount = (amount: string | number, minimum: number = 0.0001): boolean => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return num >= minimum;
};

/**
 * Validate health factor is safe
 */
export const isSafeHealthFactor = (healthFactor: number): boolean => {
  return healthFactor >= 1.1;
};

/**
 * Validate LTV ratio
 */
export const isValidLTV = (ltv: number): boolean => {
  return ltv > 0 && ltv <= 1;
};

/**
 * Format address for display (e.g., 0x1234...5678)
 */
export const formatAddress = (address: string): string => {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Validate collateral is sufficient
 */
export const isSufficientCollateral = (collateral: number, debt: number, ltv: number = 0.5): boolean => {
  return collateral * ltv >= debt;
};

/**
 * Check if position is at liquidation risk
 */
export const isAtLiquidationRisk = (healthFactor: number, threshold: number = 1.1): boolean => {
  return healthFactor < threshold;
};
