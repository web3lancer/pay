# RPC Providers Integration

This module provides intelligent RPC provider management for Mezo with support for multiple premium providers and automatic fallback logic.

## Supported Providers

### 1. Spectrum RPC
- **Status**: Premium, reliable RPC solutions
- **Access**: Free premium access during Mezo Hackathon
- **Documentation**: https://spectrumnodes.gitbook.io/docs/user-guides/create-your-first-endpoint
- **Setup**: Fill out the Spectrum Access Form to get your endpoint
- **Environment Variables**:
  - `NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET` - Testnet endpoint
  - `NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET` - Mainnet endpoint
  - `NEXT_PUBLIC_SPECTRUM_API_KEY` - API key (optional)

### 2. Boar Network
- **Status**: Backup, alternative RPC provider
- **Access**: Upgraded free tier access for Mezo Hackathon
- **Documentation**: https://boar.network/
- **Features**: HTTP and WebSocket endpoints
- **Environment Variables**:
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_HTTPS` - Testnet HTTPS endpoint
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_WSS` - Testnet WebSocket endpoint
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_HTTPS` - Mainnet HTTPS endpoint
  - `NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_WSS` - Mainnet WebSocket endpoint
  - `NEXT_PUBLIC_BOAR_API_KEY` - API key (optional)

### 3. Mezo Default RPC
- **Status**: Official Mezo RPC (always available fallback)
- **Environment Variables**:
  - `NEXT_PUBLIC_MEZO_RPC_TESTNET` - Testnet endpoint
  - `NEXT_PUBLIC_MEZO_RPC_MAINNET` - Mainnet endpoint

## Intelligent Fallback Logic

The RPC provider manager automatically selects providers in priority order:

1. **Spectrum** (if configured) - Priority 1
2. **Boar Network** (if configured) - Priority 2
3. **Mezo Default** (always available) - Priority 3

If the first provider fails, it automatically falls back to the next available provider.

## Usage

### Get Current RPC URL
```typescript
import { getRpcUrl } from '@/integrations/mezo'

const rpcUrl = getRpcUrl('testnet') // Uses intelligent provider selection
```

### Get All Available Providers
```typescript
import { getAvailableRpcProviders } from '@/integrations/mezo'

const providers = getAvailableRpcProviders('testnet')
// Returns: [{ name, url, priority, isAvailable }, ...]
```

### Check Provider Health
```typescript
import { checkAllRpcProviderHealth } from '@/integrations/mezo'

const healthStatus = await checkAllRpcProviderHealth('testnet')
// Returns sorted list of providers by availability and priority
```

### Get Provider Status
```typescript
import { getRpcProviderStatus } from '@/integrations/mezo'

const status = await getRpcProviderStatus('testnet')
// Output: "[TESTNET] Spectrum: ✓ (priority: 1) | Boar: ✓ (priority: 2) | Mezo Default: ✓ (priority: 3)"
```

### Initialize RPC System
```typescript
import { initializeRpcProviders } from '@/integrations/mezo'

await initializeRpcProviders('testnet')
// Performs health checks and logs status
```

## Individual Provider APIs

### Spectrum RPC
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

## Configuration

Add to `.env.local` or `.env`:

```env
# Spectrum RPC Configuration
NEXT_PUBLIC_MEZO_RPC_SPECTRUM_TESTNET=https://your-spectrum-endpoint-testnet
NEXT_PUBLIC_MEZO_RPC_SPECTRUM_MAINNET=https://your-spectrum-endpoint-mainnet
NEXT_PUBLIC_SPECTRUM_API_KEY=your-spectrum-api-key

# Boar Network Configuration
NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_HTTPS=https://rpc-http.mezo.boar.network
NEXT_PUBLIC_MEZO_RPC_BOAR_TESTNET_WSS=wss://rpc-ws.mezo.boar.network
NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_HTTPS=https://rpc-http.mezo.boar.network
NEXT_PUBLIC_MEZO_RPC_BOAR_MAINNET_WSS=wss://rpc-ws.mezo.boar.network
NEXT_PUBLIC_BOAR_API_KEY=your-boar-api-key
```

## How Providers Are Used

The `getMezoProvider()` function in `providerService.ts` automatically uses the RPC provider manager to select the best available endpoint:

```typescript
import { getMezoProvider } from '@/integrations/mezo'

// Automatically uses Spectrum > Boar > Mezo Default
const provider = getMezoProvider('testnet')
const balance = await provider.getBalance('0x...')
```

## Benefits

✅ **Reliability**: Automatic fallback if primary provider fails
✅ **Performance**: Premium RPC providers with better performance
✅ **Flexibility**: Easy to add new providers
✅ **Zero Configuration**: Works with sensible defaults
✅ **Health Monitoring**: Built-in health checks
✅ **Transparent**: Know which provider is being used

## Setup Steps

### 1. Get Spectrum Access
1. Visit: https://spectrumnodes.gitbook.io/docs/user-guides/create-your-first-endpoint
2. Fill out the Spectrum Access Form
3. Get your custom endpoint URLs
4. Add to environment variables

### 2. Get Boar Access
1. Visit: https://boar.network/
2. Follow user guide for hackathon credits
3. Get your HTTP and WebSocket endpoints
4. Add to environment variables

### 3. Test Configuration
```typescript
import { initializeRpcProviders, getRpcProviderStatus } from '@/integrations/mezo'

// Initialize and log status
await initializeRpcProviders('testnet')
const status = await getRpcProviderStatus('testnet')
console.log(status)
```

## Troubleshooting

### "RPC URL not configured"
Ensure the appropriate environment variables are set. Check `env.sample` for required variables.

### Provider health check failures
- Verify API keys are correct
- Check network connectivity
- Ensure endpoints are still active
- Try manual health check: `checkSpectrumRpcHealth()` or `checkBoarRpcHealth()`

### Performance issues
All providers are working but performance is slow:
- Check network latency
- Consider load balancing across multiple providers
- Use `getAllRpcUrls()` for distribution

## Migration Path

The system automatically selects the best provider. No code changes needed to switch providers - just update environment variables and the system will use new providers on next initialization.

## Future Enhancements

- [ ] Rate limiting per provider
- [ ] Load balancing across multiple providers
- [ ] Provider reputation scoring
- [ ] Automatic failover retry logic
- [ ] Provider usage metrics
