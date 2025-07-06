import { Currency } from "@secured-finance/sf-core";
import { SecuredFinanceClient } from "@secured-finance/sf-client";

export async function getUserPositions(client: SecuredFinanceClient, account: string) {
  return await client.getPositions(account);
}

export async function unwindPosition(
  client: SecuredFinanceClient,
  currency: Currency,
  maturity: number
) {
  return await client.unwindPosition(currency, maturity);
}

export async function getTotalPresentValue(client: SecuredFinanceClient) {
  return await client.getTotalPresentValueInBaseCurrency();
}
