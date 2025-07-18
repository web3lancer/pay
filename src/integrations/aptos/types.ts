export interface AptosWallet {
  address: string
  publicKey: string
  encryptedPrivateKey?: string
  isDefault?: boolean
  isActive?: boolean
  balance?: string
  creationMethod?: 'inbuilt' | 'imported' | 'external'
}

export interface AptosContractCall {
  function: string
  args: any[]
  typeArguments?: string[]
}
