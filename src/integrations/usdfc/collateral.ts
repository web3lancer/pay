import { Currency } from "@secured-finance/sf-core";
import { SecuredFinanceClient } from "@secured-finance/sf-client";

export async function depositCollateral(
  client: SecuredFinanceClient,
  currency: Currency,
  amount: string
) {
  return await client.depositCollateral(currency, amount);
}

export async function getProtocolDepositAmount(client: SecuredFinanceClient) {
  return await client.getProtocolDepositAmount();
}
