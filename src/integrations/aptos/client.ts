import { AptosClient, FaucetClient, AptosAccount } from 'aptos'

export const APTOS_TESTNET_RPC = process.env.NEXT_PUBLIC_APTOS_RPC_URL || 'https://fullnode.testnet.aptoslabs.com/v1'
export const APTOS_FAUCET_URL = process.env.NEXT_PUBLIC_APTOS_FAUCET_URL || 'https://faucet.testnet.aptoslabs.com'

export const aptosClient = new AptosClient(APTOS_TESTNET_RPC)
export const faucetClient = new FaucetClient(APTOS_TESTNET_RPC, APTOS_FAUCET_URL)

/**
 * Create a new Aptos account (wallet).
 */
export function createAptosAccount(): AptosAccount {
  return new AptosAccount()
}

/**
 * Fund account with testnet faucet.
 */
export async function fundAccount(address: string, amount: number = 10000000) {
  return faucetClient.fundAccount(address, amount)
}

/**
 * Get account balance.
 */
export async function getAccountBalance(address: string) {
  const resources = await aptosClient.getAccountResources(address)
  const coin = resources.find((r: any) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>')
  return coin ? coin.data.coin.value : '0'
}
