import { Currency } from "@secured-finance/sf-core";
import { SecuredFinanceClient, OrderSide, WalletSource } from "@secured-finance/sf-client";

export async function placeLendOrder(
  client: SecuredFinanceClient,
  currency: Currency,
  maturity: number,
  amount: string,
  unitPrice: string
) {
  return await client.placeOrder(
    currency,
    maturity,
    OrderSide.LEND,
    amount,
    WalletSource.METAMASK,
    unitPrice
  );
}

export async function placeBorrowOrder(
  client: SecuredFinanceClient,
  currency: Currency,
  maturity: number,
  amount: string,
  unitPrice: string
) {
  return await client.placeOrder(
    currency,
    maturity,
    OrderSide.BORROW,
    amount,
    WalletSource.METAMASK,
    unitPrice
  );
}

export async function cancelOrder(
  client: SecuredFinanceClient,
  currency: Currency,
  maturity: number,
  orderId: string
) {
  return await client.cancelLendingOrder(currency, maturity, orderId);
}
