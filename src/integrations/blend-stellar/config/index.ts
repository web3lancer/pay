export const BLEND_FEATURE_ENABLED = process.env.NEXT_PUBLIC_FEATURE_BLEND === 'true';

export const BLEND_DEFAULT_NETWORK = {
  rpc: process.env.NEXT_PUBLIC_BLEND_RPC || '',
  passphrase: process.env.NEXT_PUBLIC_BLEND_PASSPHRASE || '',
  opts: { allowHttp: true },
};
