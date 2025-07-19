import { MODULE_ADDRESS } from '../constants';

export type CreatePaymentRequestArgs = {
  requestId: string;
  fromUserId: string;
  tokenId: string;
  amount: number;
  status: string;
  createdAt: number;
};

export function createPaymentRequest(args: CreatePaymentRequestArgs) {
  return {
    function: `${MODULE_ADDRESS}::payment_request::create_payment_request`,
    args: [
      args.requestId,
      args.fromUserId,
      args.tokenId,
      args.amount,
      args.status,
      args.createdAt,
    ],
  };
}
