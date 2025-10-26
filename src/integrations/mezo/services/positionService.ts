/**
 * Calculate health factor from collateral and debt values
 * Health Factor = Collateral Value / Debt Value
 * @param collateralBTC - Collateral amount in BTC (human-readable)
 * @param debtMUSD - Debt amount in MUSD (human-readable)
 * @param btcPrice - Current BTC price in USD
 * @returns Health factor as number
 */
export const calculateHealthFactor = (
  collateralBTC: number | string,
  debtMUSD: number | string,
  btcPrice: number = 50000
): number => {
  const collateral = typeof collateralBTC === "string" ? parseFloat(collateralBTC) : collateralBTC;
  const debt = typeof debtMUSD === "string" ? parseFloat(debtMUSD) : debtMUSD;

  if (debt === 0) return 999;
  return (collateral * btcPrice) / debt;
};

/**
 * Calculate collateralization ratio
 * @param collateralBTC - Collateral in BTC
 * @param debtMUSD - Debt in MUSD
 * @param btcPrice - Current BTC price
 * @returns Ratio as percentage
 */
export const calculateRatio = (
  collateralBTC: number | string,
  debtMUSD: number | string,
  btcPrice: number = 50000
): number => {
  const healthFactor = calculateHealthFactor(collateralBTC, debtMUSD, btcPrice);
  return healthFactor * 100;
};

/**
 * Calculate liquidation price
 * Liquidation happens when health factor drops below 1.1 (110%)
 * @param collateralBTC - Collateral in BTC
 * @param debtMUSD - Debt in MUSD
 * @param liquidationThreshold - Liquidation threshold (default 1.1 = 110%)
 * @returns Liquidation price in USD
 */
export const calculateLiquidationPrice = (
  collateralBTC: number | string,
  debtMUSD: number | string,
  liquidationThreshold: number = 1.1
): number => {
  const collateral = typeof collateralBTC === "string" ? parseFloat(collateralBTC) : collateralBTC;
  const debt = typeof debtMUSD === "string" ? parseFloat(debtMUSD) : debtMUSD;

  if (collateral === 0) return 0;
  return (debt / collateral) * liquidationThreshold;
};

/**
 * Calculate maximum borrowable amount
 * Based on LTV (Loan-To-Value) ratio
 * @param collateralBTC - Collateral in BTC
 * @param btcPrice - Current BTC price
 * @param ltv - LTV ratio (default 0.5 = 50%)
 * @returns Maximum borrowable amount in MUSD
 */
export const calculateMaxBorrowable = (
  collateralBTC: number | string,
  btcPrice: number = 50000,
  ltv: number = 0.5
): number => {
  const collateral = typeof collateralBTC === "string" ? parseFloat(collateralBTC) : collateralBTC;
  return collateral * btcPrice * ltv;
};

/**
 * Check if position is at risk of liquidation
 * @param healthFactor - Current health factor
 * @param riskThreshold - Risk threshold (default 1.1 = 110%)
 * @returns true if at risk
 */
export const isPositionAtRisk = (healthFactor: number, riskThreshold: number = 1.1): boolean => {
  return healthFactor < riskThreshold;
};

/**
 * Get position health status
 * @param healthFactor - Current health factor
 * @returns 'safe' | 'caution' | 'risk'
 */
export const getHealthStatus = (
  healthFactor: number
): "safe" | "caution" | "risk" => {
  if (healthFactor >= 2.0) return "safe";
  if (healthFactor >= 1.1) return "caution";
  return "risk";
};

/**
 * Get health percentage for UI display
 * Maps health factor to 0-100 percentage
 * @param healthFactor - Current health factor
 * @returns Health percentage (0-100)
 */
export const getHealthPercentage = (healthFactor: number): number => {
  const minHealth = 1.1;
  const maxHealth = 3.0;
  const normalized = Math.max(0, Math.min(1, (healthFactor - minHealth) / (maxHealth - minHealth)));
  return normalized * 100;
};
