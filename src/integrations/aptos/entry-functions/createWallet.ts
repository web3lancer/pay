import { MODULE_ADDRESS } from '../constants';

export type CreateWalletArgs = {
  walletId: string;
  userId: string;
  walletName: string;
  walletType: string;
  blockchain: string;
  publicKey: string;
  walletAddress: string;
  isDefault: boolean;
  createdAt: number;
  creationMethod?: string;
};

export function createWallet(args: CreateWalletArgs) {
  return {
    function: `${MODULE_ADDRESS}::wallet::create_wallet`,
    args: [
      args.walletId,
      args.userId,
      args.walletName,
      args.walletType,
      args.blockchain,
      args.publicKey,
      args.walletAddress,
      args.isDefault,
      args.createdAt,
      args.creationMethod ?? null,
    ],
  };
}
