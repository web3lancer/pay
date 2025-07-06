// ...pseudo-code...
import { Web3Storage } from 'web3.storage'

export function getWeb3StorageClient(token: string) {
  return new Web3Storage({ token })
}

export async function uploadToFilecoin(client: Web3Storage, file: File | Blob) {
  const cid = await client.put([file])
  return cid
}
