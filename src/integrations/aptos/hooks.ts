import {
  useEffect,
  useState,
} from 'react';

import {
  createAptosAccount,
  getAccountBalance,
} from './client';
import type { AptosWallet } from './types';

export function useAptosWallet() {
  const [wallet, setWallet] = useState<AptosWallet | null>(null)
  const [balance, setBalance] = useState<string>('0')

  useEffect(() => {
    if (wallet?.address) {
      getAccountBalance(wallet.address).then(setBalance)
    }
  }, [wallet?.address])

  function createWallet() {
    const account = createAptosAccount()
    setWallet({
      address: account.address().hex(),
      publicKey: account.pubKey().hex(),
      encryptedPrivateKey: undefined,
      isDefault: true,
      isActive: true,
      balance: '0',
      creationMethod: 'inbuilt'
    })
  }

  return { wallet, balance, createWallet }
}
