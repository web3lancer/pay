import { MODULE_ADDRESS } from '../constants';

export type CreateUserArgs = {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  preferredCurrency: string;
  createdAt: number;
};

export function createUser(args: CreateUserArgs) {
  return {
    function: `${MODULE_ADDRESS}::user::create_user`,
    args: [
      args.userId,
      args.email,
      args.username,
      args.displayName,
      args.preferredCurrency,
      args.createdAt,
    ],
  };
}
