import {
  Aptos,
  AptosConfig,
} from '@aptos-labs/ts-sdk';

import {
  APTOS_API_KEY,
  NETWORK,
} from '../constants';

const aptos = new Aptos(new AptosConfig({ network: NETWORK as AptosConfig['network'], clientConfig: { API_KEY: APTOS_API_KEY } }));

// Reuse same Aptos instance to utilize cookie based sticky routing
export function aptosClient() {
  return aptos;
}
