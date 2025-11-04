# Spectrum Integration Guide

## Overview

The Spectrum integration provides access to **multi-chain blockchain queries** via GraphQL API, not traditional JSON-RPC. Spectrum supports querying 20+ blockchains including:

- Ethereum Mainnet
- Polygon
- BSC
- Optimism
- Arbitrum
- Solana
- Bitcoin
- Cosmos chains (Osmosis, Noble, etc.)

## Architecture

### Two Layers:

1. **spectrumRpcService.ts** - Configuration and health checks
2. **spectrumGraphqlService.ts** - GraphQL queries for blockchain data

## Environment Setup

Add to `.env` and `env.sample`:

```env
# Spectrum GraphQL Endpoint (for multi-chain queries)
NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET=https://spectrum-01.simplystaking.xyz/aWxuZml5bXQtMDEtMWZmYjJlMGQ/c0_bvE1zqrJ95g/mezo/testnet/

# Optional: Mainnet endpoint (when available)
NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET=

# Optional: API Key (if Spectrum requires authentication)
NEXT_PUBLIC_SPECTRUM_API_KEY=
```

## API Methods

All methods are in `spectrumGraphqlService.ts`:

### 1. getBlockHeights()

Get current block height of specified chains:

```typescript
import { getBlockHeights } from '@/integrations/mezo'

const heights = await getBlockHeights(
  ['CHAIN_0X1', 'CHAIN_SOLANA_MAINNET', 'CHAIN_0X89'],
  'testnet'
)

// Response:
// [
//   { chain: 'CHAIN_0X1', height: '23496397', error: null },
//   { chain: 'CHAIN_SOLANA_MAINNET', height: '370889831', error: null },
//   ...
// ]
```

### 2. getBlockByNumber()

Get block details by block number:

```typescript
const blocks = await getBlockByNumber(
  [
    { chain: 'CHAIN_0X1', block: '23496397' },
    { chain: 'CHAIN_0X89', block: '77203578' }
  ],
  'testnet'
)
```

### 3. getBlockByHash()

Get block details by block hash:

```typescript
const blocks = await getBlockByHash(
  [
    { chain: 'CHAIN_BITCOIN_MAINNET', hash: '000000000000000000008821ef71d5916c449073616cebf8fc8ca5ca6c8dc8ec' },
    { chain: 'CHAIN_0X1', hash: '0xe305c4089d540324fff0d34be9fdbf90249188d7c9d98a5af4c964175de84479' }
  ],
  'testnet'
)
```

### 4. getTransactionByHash()

Get transaction details by transaction hash:

```typescript
const transactions = await getTransactionByHash(
  [
    { chain: 'CHAIN_SOLANA_MAINNET', hash: '2VDfSLfGL5s6aUYUCKj2BuRVrmRAVDxYDUBnKfj9XsdC5VoN8hVpPFCKA84FMpmQ3D6459Z6njUhxDMKif263H3F' },
    { chain: 'CHAIN_0X1', hash: '0xe57793e686785c5b12c6c142b4803a19b3108684b67af64c4fa35ef84b78d101' }
  ],
  'testnet'
)
```

### 5. getAddressBalance()

Get native or token balance for an address:

```typescript
const balances = await getAddressBalance(
  [
    { chain: 'CHAIN_0X1', address: '0xF977814e90dA44bFA03b6295A0616a897441aceC', token: 'native' },
    { chain: 'CHAIN_0X1', address: '0xF977814e90dA44bFA03b6295A0616a897441aceC', token: '0xdac17f958d2ee523a2206206994597c13d831ec7' },
    { chain: 'CHAIN_NOBLE_1', address: 'noble1w79dl6rw5w4wrv2ptpjmalt867jtls5qmgpmqj', token: 'USDC' }
  ],
  'testnet'
)

// Response:
// [
//   { chain: 'CHAIN_0X1', address: '...', token: 'native', balance: '688622.3968901488', error: null },
//   ...
// ]
```

### 6. getBlockFee()

Get base fee and priority fee for specified chains:

```typescript
const fees = await getBlockFee(
  ['CHAIN_0X1', 'CHAIN_0X89', 'CHAIN_0X38'],
  'testnet'
)

// Response:
// [
//   { chain: 'CHAIN_0X1', baseFeePerGas: '0.185158901', maxPriorityFeePerGas: '0.185158901', error: null },
//   ...
// ]
```

## Supported Chains

Full list of supported chains with Query IDs:

### EVM Chains (🟢 Full Support)
- `CHAIN_0X1` - Ethereum Mainnet
- `CHAIN_0X89` - Polygon
- `CHAIN_0X38` - BSC
- `CHAIN_0XA` - Optimism
- `CHAIN_0XA4B1` - Arbitrum
- `CHAIN_0X64` - Gnosis
- `CHAIN_0XE708` - Linea
- `CHAIN_0X2105` - Base

### Other Chains
- `CHAIN_SOLANA_MAINNET` - Solana
- `CHAIN_BITCOIN_MAINNET` - Bitcoin
- `CHAIN_COSMOSHUB_4` - Cosmos Hub
- `CHAIN_OSMOSIS_1` - Osmosis
- `CHAIN_NOBLE_1` - Noble
- `CHAIN_AXELAR_DOJO_1` - Axelar

### Support Levels
- 🟢 All functions available
- 🟡 Functional but some functions limited
- 🔴 Coming soon

## Health Checks

### Check API Availability

```typescript
import { isSpectrumGraphqlAvailable, checkSpectrumGraphqlHealth } from '@/integrations/mezo'

const available = isSpectrumGraphqlAvailable('testnet')
const healthy = await checkSpectrumGraphqlHealth('testnet')
```

## Error Handling

All responses include an `error` field. Handle errors:

```typescript
const [result] = await getBlockHeights(['CHAIN_0X1'], 'testnet')

if (result.error) {
  console.error(`Failed to get block height: ${result.error}`)
} else {
  console.log(`Current block: ${result.height}`)
}
```

## Type Definitions

```typescript
interface BlockHeightResponse {
  chain: string
  height: string
  error: string | null
}

interface BlockDetailsResponse {
  chain: string
  height: string | null
  hash: string | null
  block: Record<string, unknown> | null
  error: string | null
}

interface TransactionDetailsResponse {
  chain: string
  hash: string | null
  transaction: Record<string, unknown> | null
  error: string | null
}

interface AddressBalanceResponse {
  chain: string
  address: string
  token: string
  balance: string
  error: string | null
}

interface BlockFeeResponse {
  chain: string
  baseFeePerGas: string
  maxPriorityFeePerGas: string
  error: string | null
}
```

## Integration with RPC Provider Manager

The Spectrum endpoint is also registered in the RPC provider manager as a fallback provider. However, **for blockchain queries, always use the GraphQL methods** as they provide better support for multi-chain queries.

```typescript
import { getCurrentRpcProvider } from '@/integrations/mezo'

// This gets the primary RPC provider (JSON-RPC)
const provider = getCurrentRpcProvider('testnet')
// For Mezo-specific JSON-RPC calls

// But for blockchain queries across chains:
import { getBlockHeights } from '@/integrations/mezo'
// Use the GraphQL methods
```

## Documentation References

- **Spectrum Docs**: https://spectrumnodes.gitbook.io/docs/developer-guides/apis/general-blockchain-api
- **General Blockchain API**: Methods, supported chains, status
- **Supported Chains**: Chain IDs and support levels
- **Method Documentation**: Detailed API for each query method

## Troubleshooting

### "Endpoint not configured"
Ensure `NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET` is set in `.env`.

### GraphQL Error
Check that:
1. Endpoint URL is correct
2. Chain ID is valid (see supported chains list)
3. For token balances, use `native` for native tokens or token address/name
4. Query variables match the expected types

### Rate Limiting
Spectrum may have rate limits. Check response errors for rate limit messages.

### Empty Results
- Verify the chain is supported
- Check that the block/transaction/address exists
- Ensure chain ID format is correct

## Best Practices

1. **Use GraphQL for multi-chain queries** - More efficient than multiple JSON-RPC calls
2. **Batch requests** - Query multiple chains in a single request
3. **Error handling** - Always check the `error` field in responses
4. **Chain validation** - Verify chain is in supported list before querying
5. **Caching** - Cache block heights and fees as they change frequently
