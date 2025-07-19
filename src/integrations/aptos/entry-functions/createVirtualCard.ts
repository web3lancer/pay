import { MODULE_ADDRESS } from '../constants';

export type CreateVirtualCardArgs = {
  cardId: string;
  userId: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardType: string;
  status: string;
  createdAt: number;
};

export function createVirtualCard(args: CreateVirtualCardArgs) {
  return {
    function: `${MODULE_ADDRESS}::virtual_cards::create_virtual_card`,
    args: [
      args.cardId,
      args.userId,
      args.cardNumber,
      args.expiry,
      args.cvv,
      args.cardType,
      args.status,
      args.createdAt,
    ],
  };
}
