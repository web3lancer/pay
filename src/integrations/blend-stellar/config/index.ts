export const BLEND_FEATURE_ENABLED = process.env.NEXT_PUBLIC_FEATURE_BLEND === 'true';

export const BLEND_DEFAULT_NETWORK = {
  rpc: process.env.NEXT_PUBLIC_BLEND_RPC || '',
  passphrase: process.env.NEXT_PUBLIC_BLEND_PASSPHRASE || '',
  opts: { allowHttp: true },
};

// Stellar contract widget config
export const STELLAR_CONTRACT_WIDGET_ENABLED = process.env.NEXT_PUBLIC_FEATURE_STELLAR_CONTRACT === 'true';
export const STELLAR_RPC_URL = process.env.NEXT_PUBLIC_STELLAR_RPC_URL || '';
export const STELLAR_NETWORK_PASSPHRASE = process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE || '';
export const STELLAR_CONTRACT_ID = process.env.NEXT_PUBLIC_STELLAR_CONTRACT_ID || '';
