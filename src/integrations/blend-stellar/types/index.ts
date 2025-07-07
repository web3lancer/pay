export interface BlendNetworkConfig {
  rpc: string;
  passphrase: string;
  opts?: { allowHttp?: boolean };
}

export interface BlendPoolInfo {
  id: string;
  reserves: any[];
  interestRate: number;
  // ...add more as needed
}
