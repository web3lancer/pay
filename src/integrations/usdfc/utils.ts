import { getUTCMonthYear } from "@secured-finance/sf-core";
import { SecuredFinanceClient, OrderSide } from "@secured-finance/sf-client";
import { Currency } from "@secured-finance/sf-core";

export function unitPriceToAPR(unitPrice: number, maturity: number) {
  const now = Math.floor(Date.now() / 1000);
  const secondsToMaturity = maturity - now;
  const secondsPerYear = 365 * 24 * 60 * 60;
  const yearsToMaturity = secondsToMaturity / secondsPerYear;

  if (yearsToMaturity < 1) {
    return ((10000 / unitPrice) - 1) * (secondsPerYear / secondsToMaturity) * 100;
  } else {
    return (Math.pow(10000 / unitPrice, 1 / yearsToMaturity) - 1) * 100;
  }
}

export function formatMaturity(maturity: number) {
  return getUTCMonthYear(maturity, true);
}

export async function calculateOrderEstimation(
  client: SecuredFinanceClient,
  currency: Currency,
  maturity: number,
  account: string,
  side: OrderSide,
  amount: string,
  unitPrice: string
) {
  return await client.getOrderEstimation(
    currency,
    maturity,
    account,
    side,
    amount,
    unitPrice
  );
}
