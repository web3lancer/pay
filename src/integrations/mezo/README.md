# Mezo Protocol Integration

Complete Next.js integration for the Mezo Protocol - a Bitcoin-backed lending platform.

## Architecture

### Service Layer (`/services`)

**Network & Provider**
- `providerService.ts` - Ethers.js provider management with caching
- `walletService.ts` - Wallet connection and network switching
- `queryService.ts` - Network queries (balance, block number, etc.)

**Protocol Operations**
- `tokenService.ts` - ERC-20 token operations (MUSD, tBTC)
- `musdService.ts` - MUSD borrowing operations (open, repay, withdraw)
- `positionService.ts` - Position calculations (health, liquidation, LTV)
- `priceService.ts` - BTC price oracle with caching

**Utilities**
- `customRpcService.ts` - Mezo custom RPC methods
- `errorHandler.ts` - Error parsing and toast notifications

### React Hooks (`/hooks`)

- `useMezoWallet()` - Wallet connection state management
- `useMezoPosition(address, network)` - Auto-refreshing position data
- `useMezoBorrow(network)` - Borrow operations with loading/error states
- `useMezoTokens(tokenAddress, userAddress)` - Token balance tracking
- `useMezoProvider()` - Direct provider access (advanced)

### Type Definitions (`/types`)

- `networks.ts` - Network configurations and constants
- `errors.ts` - Error types and parsing
- `global.ts` - Global TypeScript definitions

### Utilities (`/utils`)

- `validation.ts` - Input and state validation
- `formatting.ts` - Number, currency, and address formatting

## Usage Examples

### Basic Wallet Connection

```tsx
import { useMezoWallet } from "@/integrations/mezo";

export function WalletConnect() {
  const { connected, address, network, connect } = useMezoWallet();

  return (
    <div>
      {connected ? (
        <p>Connected: {address} on {network}</p>
      ) : (
        <button onClick={connect}>Connect Wallet</button>
      )}
    </div>
  );
}
```

### Display User Position

```tsx
import { useMezoWallet, useMezoPosition } from "@/integrations/mezo";

export function PositionDisplay() {
  const { address, network } = useMezoWallet();
  const { position, loading, error } = useMezoPosition(address, network === "mainnet" ? "mainnet" : "testnet");

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!position) return <div>No position</div>;

  return (
    <div>
      <p>Collateral: {position.collateral} BTC</p>
      <p>Debt: {position.debt} MUSD</p>
      <p>Health Factor: {(position.healthFactor * 100).toFixed(0)}%</p>
      <p>Status: {position.healthStatus}</p>
    </div>
  );
}
```

### Open a Position

```tsx
import { useMezoBorrow } from "@/integrations/mezo";
import toast from "react-hot-toast";

export function BorrowForm() {
  const { openPosition, loading, error } = useMezoBorrow();
  const [collateral, setCollateral] = useState("0.5");
  const [borrowAmount, setBorrowAmount] = useState("5000");

  const handleBorrow = async () => {
    const result = await openPosition(collateral, borrowAmount);
    if (result.success) {
      toast.success(`Position opened! Tx: ${result.txHash}`);
    } else {
      toast.error(result.error?.message || "Failed");
    }
  };

  return (
    <div>
      <input value={collateral} onChange={(e) => setCollateral(e.target.value)} />
      <input value={borrowAmount} onChange={(e) => setBorrowAmount(e.target.value)} />
      <button onClick={handleBorrow} disabled={loading}>
        {loading ? "Processing..." : "Borrow"}
      </button>
      {error && <p>{error}</p>}
    </div>
  );
}
```

### Track Token Balance

```tsx
import { useMezoTokenBalance } from "@/integrations/mezo/hooks/useMezoTokens";
import { getAddresses } from "@/integrations/mezo";

export function TokenBalance({ userAddress }) {
  const addresses = getAddresses();
  const { balance, loading } = useMezoTokenBalance(addresses.MUSD, userAddress);

  return <div>MUSD Balance: {balance} {loading && "..."}</div>;
}
```

## Configuration

### Environment Variables

```env
# Network selection (testnet or mainnet)
NEXT_PUBLIC_MEZO_NETWORK=testnet

# Optional RPC URL override
NEXT_PUBLIC_MEZO_RPC_URL=https://rpc.test.mezo.org
```

### Network Constants

See `types/networks.ts` for network configurations. Mainnet and testnet are pre-configured with:
- Chain ID
- RPC URLs (primary + 3 fallbacks)
- Block explorer URLs

## Error Handling

All operations include comprehensive error handling:

```tsx
import { handleMezoError } from "@/integrations/mezo/services/errorHandler";

try {
  await openPosition(collateral, amount);
} catch (error) {
  const mezoError = handleMezoError(error, "openPosition");
  // Error is logged and toast is shown automatically
}
```

Error codes include:
- `INSUFFICIENT_BALANCE` - Not enough tokens
- `APPROVAL_FAILED` - Token approval failed
- `POSITION_AT_RISK` - Health factor too low
- `NETWORK_ERROR` - RPC connection issue
- `WALLET_NOT_CONNECTED` - User not connected
- `USER_REJECTED` - User rejected transaction
- And more...

## Performance Optimizations

### Caching
- Provider instances are cached (singleton pattern)
- BTC price is cached for 60 seconds
- Re-renders are memoized

### Auto-Refresh
- Position data refreshes every 30 seconds
- Token balance refreshes every 15 seconds
- User can manually trigger refresh

### Lazy Loading
- Services are loaded on demand
- No circular dependencies
- Tree-shakeable exports

## Testing

### Manual Testing Checklist

1. **Wallet Connection**
   - [ ] Connect wallet
   - [ ] Switch network
   - [ ] Disconnect

2. **Position Operations**
   - [ ] View position (if exists)
   - [ ] Open position with small amount
   - [ ] Verify MUSD received
   - [ ] Check health factor updates
   - [ ] Repay partial debt
   - [ ] Withdraw collateral

3. **Error Cases**
   - [ ] Insufficient balance
   - [ ] Amount too low
   - [ ] Health factor too low
   - [ ] Network error recovery

## Security Considerations

- Private keys are **never** stored in frontend
- All user transactions require wallet confirmation
- Amounts are validated before submission
- Health factors are checked to prevent liquidation
- All contract addresses are verified constants

## API Reference

### Services

See individual service files for complete API documentation.

Key functions:
- `openPosition(collateral, amount, signer)` - Create new position
- `repayMUSD(amount, signer)` - Repay debt
- `withdrawCollateral(amount, signer)` - Withdraw collateral
- `getUserPosition(address)` - Query position data
- `getBTCPrice()` - Get current BTC price
- `calculateHealthFactor(collateral, debt, price)` - Calculate health

### Hooks

All hooks follow React conventions and include loading/error states.

Return types include:
- `position` - User's position data
- `loading` - Operation in progress
- `error` - Error message if any
- `refresh()` - Manual refresh function

## Troubleshooting

### Position not loading
- Check wallet connection
- Verify network selection
- Check RPC endpoint availability
- Review browser console for errors

### Transaction fails
- Ensure sufficient wallet balance
- Check health factor (must be > 110%)
- Verify network is correct (mainnet vs testnet)
- Check for approval step if first time using token

### Price not updating
- API might be rate-limited (uses CoinGecko free tier)
- Check internet connection
- Price caches for 60 seconds (wait or refresh)

## Links

- [Mezo Docs](https://docs.mezo.org)
- [CoinGecko API](https://www.coingecko.com/api)
- [Ethers.js](https://docs.ethers.org)
