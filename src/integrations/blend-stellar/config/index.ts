export const BLEND_FEATURE_ENABLED = process.env.REACT_APP_BLEND_FEATURE_ENABLED === 'true';

export const BLEND_DEFAULT_NETWORK = {
  rpc: process.env.REACT_APP_BLEND_RPC || '',
  passphrase: process.env.REACT_APP_BLEND_PASSPHRASE || '',
  opts: { allowHttp: true },
};
