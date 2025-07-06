import { Currency } from "@secured-finance/sf-core";
import { SecuredFinanceClient } from "@secured-finance/sf-client";

export async function getSupportedCurrencies(client: SecuredFinanceClient) {
  return await client.getCurrencies();
}

export async function getLendingMarkets(client: SecuredFinanceClient, currency: Currency) {
  const maturities = await client.getMaturities(currency);
  const orderBookDetails = await client.getOrderBookDetailsPerCurrency(currency);
  return { maturities, orderBookDetails };
}

export async function getOrderBook(client: SecuredFinanceClient, currency: Currency, maturity: number) {
  const orderBookDetail = await client.getOrderBookDetail(currency, maturity);
  const lendOrders = await client.getLendOrderBook(currency, maturity, 0, 10);
  const borrowOrders = await client.getBorrowOrderBook(currency, maturity, 0, 10);
  return { orderBookDetail, lendOrders, borrowOrders };
}
