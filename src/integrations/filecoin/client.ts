import { Web3Storage } from 'web3.storage'

// Initialize a Web3Storage client for Filecoin
function getClient(token: string) {
  return new Web3Storage({ token })
}

// Upload one or more files/blobs to Filecoin via Web3Storage
async function upload(client: Web3Storage, files: (File | Blob)[]) {
  return await client.put(files)
}

// Retrieve files from Filecoin by CID
async function retrieve(client: Web3Storage, cid: string) {
  const res = await client.get(cid)
  if (!res || !res.ok) throw new Error('File not found on Filecoin')
  return await res.files()
}

export default {
  getClient,
  upload,
  retrieve
}
 */
export async function retrieveFilesFromFilecoin(client: Web3Storage, cid: string) {
  const res = await client.get(cid)
  if (!res || !res.ok) throw new Error('File not found on Filecoin')
  return await res.files()
}
