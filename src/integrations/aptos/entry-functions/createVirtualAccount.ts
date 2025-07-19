import { MODULE_ADDRESS } from '../constants';

export type CreateVirtualAccountArgs = {
  accountId: string;
  userId: string;
  accountNumber: string;
  currency: string;
  status: string;
  createdAt: number;
};

export function createVirtualAccount(args: CreateVirtualAccountArgs) {
  return {
    function: `${MODULE_ADDRESS}::virtual_accounts::create_virtual_account`,
    args: [
      args.accountId,
      args.userId,
      args.accountNumber,
      args.currency,
      args.status,
      args.createdAt,
    ],
  };
}
