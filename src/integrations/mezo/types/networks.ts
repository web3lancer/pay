export interface MezoNetworkConfig {
  name: string;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  rpcUrlWss: string;
  blockExplorer: string;
  alternateRpcUrls: {
    name: string;
    https: string;
    wss?: string;
  }[];
}

export const MEZO_MAINNET: MezoNetworkConfig = {
  name: "Mezo Mainnet",
  chainId: 31612,
  chainIdHex: "0x7b7c",
  rpcUrl: "https://mainnet.mezo.public.validationcloud.io/",
  rpcUrlWss: "wss://mainnet.mezo.public.validationcloud.io/",
  blockExplorer: "https://explorer.mezo.org/",
  alternateRpcUrls: [
    {
      name: "Boar",
      https: "https://rpc-http.mezo.boar.network",
      wss: "wss://rpc-ws.mezo.boar.network",
    },
    {
      name: "Imperator",
      https: "https://rpc_evm-mezo.imperator.co",
      wss: "wss://ws_evm-mezo.imperator.co",
    },
    {
      name: "Lavender Five",
      https: "https://rpc.lavenderfive.com:443/mezo/",
      wss: "wss://rpc.lavenderfive.com:443/mezo/websocket",
    },
  ],
};

export const MEZO_TESTNET: MezoNetworkConfig = {
  name: "Mezo Testnet",
  chainId: 31611,
  chainIdHex: "0x7b7b",
  rpcUrl: "https://rpc.test.mezo.org",
  rpcUrlWss: "wss://rpc-ws.test.mezo.org",
  blockExplorer: "https://explorer.test.mezo.org/",
  alternateRpcUrls: [
    {
      name: "dRPC",
      https: "https://mezo-testnet.drpc.org",
      wss: "wss://mezo-testnet.drpc.org",
    },
    {
      name: "Lavender Five",
      https: "https://testnet-rpc.lavenderfive.com:443/mezo/",
    },
  ],
};

export const getCurrentNetwork = (): MezoNetworkConfig => {
  const network = process.env.NEXT_PUBLIC_MEZO_NETWORK || "testnet";
  return network === "mainnet" ? MEZO_MAINNET : MEZO_TESTNET;
};
