import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const ENABLE_APTOS =
  typeof process !== 'undefined' &&
  (process.env.NEXT_PUBLIC_INTEGRATION_APTOS === undefined || process.env.NEXT_PUBLIC_INTEGRATION_APTOS === 'true');

const NETWORK = (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) || Network.TESTNET;
const MODULE_ADDRESS = process.env.NEXT_PUBLIC_APTOS_MODULE_ADDRESS || '';

const config = new AptosConfig({ 
  network: NETWORK,
});

const aptos = new Aptos(config);

export function getAptosClient() {
  return ENABLE_APTOS ? aptos : null;
}

export function getModuleAddress() {
  return ENABLE_APTOS ? MODULE_ADDRESS : null;
}

export function isAptosEnabled() {
  return ENABLE_APTOS;
}

export { NETWORK };
