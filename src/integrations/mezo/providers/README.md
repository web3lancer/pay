# RPC Providers Integration

This module provides intelligent RPC provider management for Mezo with support for multiple premium providers and automatic fallback logic.

## Provider Types

### 1. Spectrum GraphQL API (PRIMARY)
**For blockchain queries across 20+ chains**
- **Type**: GraphQL API (NOT JSON-RPC)
- **Use Case**: Multi-chain blockchain queries (blocks, transactions, balances, fees)
- **Documentation**: https://spectrumnodes.gitbook.io/docs/developer-guides/apis/general-blockchain-api
- **Implementation**: `spectrumGraphqlService.ts`
- **Key Methods**:
  - `getBlockHeights()` - Get current block height
  - `getBlockByNumber()`, `getBlockByHash()` - Get block details
  - `getTransactionByHash()` - Get transaction details
  - `getAddressBalance()` - Get token/native balance
  - `getBlockFee()` - Get base and priority fees

### 2. Spectrum RPC Endpoint (SECONDARY)
**For Mezo-specific JSON-RPC calls**
- **Type**: JSON-RPC (Mezo Testnet/Mainnet)
- **Use Case**: Standard EVM JSON-RPC operations
- **Implementation**: `spectrumRpcService.ts`
- **Environment Variables**:
  - `NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET` - Testnet endpoint
  - `NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET` - Mainnet endpoint
  - `NEXT_PUBLIC_SPECTRUM_API_KEY` - Optional API key

### 3. Boar Network
- **Status**: Backup RPC provider
- **Access**: Upgraded free tier access for Mezo Hackathon
- **Documentation**: https://boar.network/
- **Features**: HTTP and WebSocket endpoints
- **Environment Variables**:
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_HTTPS` - Testnet HTTPS endpoint
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_WSS` - Testnet WebSocket endpoint
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_HTTPS` - Mainnet HTTPS endpoint
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_WSS` - Mainnet WebSocket endpoint
  - `NEXT_PUBLIC_BOAR_API_KEY` - API key (optional)

### 4. Mezo Default RPC
- **Status**: Official Mezo RPC (always available fallback)
- **Environment Variables**:
  - `NEXT_PUBLIC_MEZO_RPC_TESTNET` - Testnet endpoint
  - `NEXT_PUBLIC_MEZO_RPC_MAINNET` - Mainnet endpoint

## Intelligent Fallback Logic

The RPC provider manager automatically selects providers in priority order for JSON-RPC calls:

1. **Spectrum** (if configured) - Priority 1
2. **Boar Network** (if configured) - Priority 2
3. **Mezo Default** (always available) - Priority 3

If the first provider fails, it automatically falls back to the next available provider.

## Usage by Use Case

### For Multi-Chain Blockchain Queries
```typescript
import { 
  getBlockHeights, 
  getAddressBalance, 
  getTransactionByHash 
} from '@/integrations/mezo'

// Query multiple chains at once
const heights = await getBlockHeights(['CHAIN_0X1', 'CHAIN_SOLANA_MAINNET'])
const balance = await getAddressBalance([
  { chain: 'CHAIN_0X1', address: '0x...', token: 'native' }
])
```

### For Mezo-Specific Operations
```typescript
import { getMezoProvider } from '@/integrations/mezo'

const provider = getMezoProvider('testnet')
const balance = await provider.getBalance('0x...')
const blockNumber = await provider.getBlockNumber()
```

### For RPC Provider Management
```typescript
import { getRpcUrl, checkAllRpcProviderHealth } from '@/integrations/mezo'

const url = getRpcUrl('testnet')
const health = await checkAllRpcProviderHealth('testnet')
```

## Configuration

Add to `.env.local` or `.env`:

```env
# Spectrum GraphQL Endpoint (for multi-chain queries)
NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET=https://spectrum-01.simplystaking.xyz/aWxuZml5bXQtMDEtMWZmYjJlMGQ/c0_bvE1zqrJ95g/mezo/testnet/
NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET=

# Spectrum API Key (optional)
NEXT_PUBLIC_SPECTRUM_API_KEY=

# Boar Network Configuration (optional)
NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_HTTPS=https://rpc-http.mezo.boar.network
NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_WSS=wss://rpc-ws.mezo.boar.network
NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_HTTPS=https://rpc-http.mezo.boar.network
NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_WSS=wss://rpc-ws.mezo.boar.network
NEXT_PUBLIC_BOAR_API_KEY=

# Mezo Official RPC (fallback)
NEXT_PUBLIC_MEZO_RPC_TESTNET=https://rpc.test.mezo.org
NEXT_PUBLIC_MEZO_RPC_MAINNET=https://mainnet.mezo.public.validationcloud.io/
```

## Individual Provider APIs

### Spectrum GraphQL
```typescript
import { 
  getBlockHeights, 
  getBlockByNumber,
  getBlockByHash,
  getTransactionByHash,
  getAddressBalance,
  getBlockFee,
  isSpectrumGraphqlAvailable,
  checkSpectrumGraphqlHealth
} from '@/integrations/mezo'

const available = isSpectrumGraphqlAvailable('testnet')
const healthy = await checkSpectrumGraphqlHealth('testnet')
```

See `SPECTRUM_INTEGRATION.md` for complete API documentation.

### Spectrum RPC (JSON-RPC)
```typescript
import { 
  getSpectrumRpcUrl, 
  isSpectrumRpcAvailable, 
  checkSpectrumRpcHealth 
} from '@/integrations/mezo'

const url = getSpectrumRpcUrl('testnet')
const available = isSpectrumRpcAvailable('testnet')
const healthy = await checkSpectrumRpcHealth('testnet')
```

### Boar Network RPC
```typescript
import { 
  getBoarRpcUrl, 
  getBoarWssUrl,
  isBoarRpcAvailable, 
  checkBoarRpcHealth 
} from '@/integrations/mezo'

const httpsUrl = getBoarRpcUrl('testnet')
const wssUrl = getBoarWssUrl('testnet')
const available = isBoarRpcAvailable('testnet')
const healthy = await checkBoarRpcHealth('testnet')
```

## Setup Steps

### 1. Get Spectrum Access
1. Visit: https://spectrumnodes.gitbook.io/docs/user-guides/create-your-first-endpoint
2. Fill out the Spectrum Access Form
3. Receive your custom endpoint URL
4. Add to environment variables

### 2. Get Boar Access (Optional)
1. Visit: https://boar.network/
2. Follow user guide for hackathon credits
3. Get your HTTP and WebSocket endpoints
4. Add to environment variables

### 3. Test Configuration
```typescript
import { 
  initializeRpcProviders, 
  getRpcProviderStatus,
  getBlockHeights 
} from '@/integrations/mezo'

// Check RPC provider status
await initializeRpcProviders('testnet')
const status = await getRpcProviderStatus('testnet')
console.log(status)

// Test GraphQL API
const heights = await getBlockHeights(['CHAIN_0X1'], 'testnet')
console.log(heights)
```

## Benefits

✅ **Multi-Chain Support**: Query 20+ blockchains with single service
✅ **Reliability**: Automatic fallback if primary provider fails
✅ **Performance**: Premium RPC providers with better performance
✅ **Flexibility**: Easy to add new providers
✅ **Zero Configuration**: Works with sensible defaults
✅ **Health Monitoring**: Built-in health checks
✅ **Transparent**: Know which provider is being used

## Troubleshooting

### "Endpoint not configured"
Ensure `NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET` is set in environment variables.

### Provider health check failures
- Verify API keys are correct
- Check network connectivity
- Ensure endpoints are still active
- Try manual health check with `checkSpectrumGraphqlHealth()` or `checkSpectrumRpcHealth()`

### GraphQL queries failing
- See `SPECTRUM_INTEGRATION.md` for detailed troubleshooting
- Verify chain ID is valid and supported
- Check request parameters match API specification

## Future Enhancements

- [ ] Rate limiting per provider
- [ ] Load balancing across multiple providers
- [ ] Provider reputation scoring
- [ ] Automatic failover retry logic
- [ ] Provider usage metrics

