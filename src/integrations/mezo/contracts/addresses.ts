export interface MezoAddresses {
  MUSD: string;
  tBTC: string;
  Portal: string;
  BitcoinDepositor: string;
  TBTCVault: string;
  PoolFactory: string;
  MUSDbtcPool: string;
  BorrowerOperations?: string;
}

export const MEZO_MAINNET_ADDRESSES: MezoAddresses = {
  MUSD: "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186",
  tBTC: "0x7b7C000000000000000000000000000000000000",
  Portal: "0xAB13B8eecf5AA2460841d75da5d5D861fD5B8A39",
  BitcoinDepositor: "0x1D50D75933b7b7C8AD94dbfb748B5756E3889C24",
  TBTCVault: "0x9C070027cdC9dc8F82416B2e5314E11DFb4FE3CD",
  PoolFactory: "0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248",
  MUSDbtcPool: "0x52e604c44417233b6CcEDDDc0d640A405CaacefCb",
} as const;

export const MEZO_TESTNET_ADDRESSES: MezoAddresses = {
  MUSD: "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503",
  tBTC: "0x517f2982701695D4E52f1ECFBEf3ba31Df470161",
  Portal: "0x6978E3e11b8Bc34ea836C1706fC742aC4Cb6b0Db",
  BitcoinDepositor: "0x7205535961649C4F94e1b4BAfBe26d23e2bbDd84",
  TBTCVault: "0x9C070027cdC9dc8F82416B2e5314E11DFb4FE3CD",
  PoolFactory: "0x83FE469C636C4081b87bA5b3Ae9991c6Ed104248",
  MUSDbtcPool: "0x52e604c44417233b6CcEDDDc0d640A405CaacefCb",
} as const;

export const getAddresses = (network: "mainnet" | "testnet" = "testnet"): MezoAddresses => {
  return network === "mainnet" ? MEZO_MAINNET_ADDRESSES : MEZO_TESTNET_ADDRESSES;
};
