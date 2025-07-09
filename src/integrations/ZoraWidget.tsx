import { useState } from 'react'
import { mintZoraNFT, fetchZoraNFTs } from './zora/zora'

export default function ZoraWidget() {
  const [minting, setMinting] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [nfts, setNfts] = useState<any[]>([])
  const [address, setAddress] = useState('')
  const [mintResult, setMintResult] = useState<any>(null)

  const handleMint = async () => {
    setMinting(true)
    const result = await mintZoraNFT({
      name: 'Demo NFT',
      description: 'Minted via Zora integration',
      image: 'https://placehold.co/200x200'
    })
    setMintResult(result)
    setMinting(false)
  }

  const handleFetch = async () => {
    setFetching(true)
    const result = await fetchZoraNFTs(address)
    setNfts(result)
    setFetching(false)
  }

  return (
    <div className="p-4 border rounded-xl bg-white shadow space-y-4 max-w-md">
      <h3 className="font-bold text-lg mb-2">Zora Integration Demo</h3>
      <button
        onClick={handleMint}
        disabled={minting}
        className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
      >
        {minting ? 'Minting...' : 'Mint Demo NFT'}
      </button>
      {mintResult && (
        <div className="text-green-600 text-sm">Minted: {mintResult.message}</div>
      )}
      <div>
        <input
          type="text"
          placeholder="Wallet address"
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="border px-2 py-1 rounded w-full mb-2"
        />
        <button
          onClick={handleFetch}
          disabled={fetching || !address}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {fetching ? 'Fetching...' : 'Fetch NFTs'}
        </button>
      </div>
      {nfts.length > 0 && (
        <div>
          <div className="font-semibold mb-1">NFTs:</div>
          <ul>
            {nfts.map(nft => (
              <li key={nft.id} className="flex items-center space-x-2 mb-2">
                <img src={nft.image} alt={nft.name} className="w-8 h-8 rounded" />
                <span>{nft.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
