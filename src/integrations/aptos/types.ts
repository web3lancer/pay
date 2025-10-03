export interface PaymentRequest {
  recipient: string;
  amount: number;
  tokenType: string;
  fulfilled: boolean;
  createdAt: number;
}

export interface PaymentTransaction {
  sender: string;
  recipient: string;
  amount: number;
  timestamp: number;
  hash?: string;
}

export interface AptosWalletState {
  address: string | null;
  connected: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signAndSubmitTransaction: (transaction: any) => Promise<any>;
  account: any;
  wallet: any;
}
