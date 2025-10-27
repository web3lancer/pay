# Mezo Integration Restructuring Plan

## Problem Statement

The current Mezo integration is built on **Liquity-style assumptions** that may not match Mezo's actual smart contracts. The research document (`docx/prd-research.md`) explicitly states that contract addresses and function signatures are hypothetical.

## Strategic Options

### Option 1: Verification-First Approach (RECOMMENDED)

**Goal:** Verify actual Mezo contracts before proceeding.

**Actions:**
1. Access Mezo documentation and block explorer
2. Find the actual MUSD borrowing contract address
3. Extract verified ABI
4. Update codebase with correct information
5. Test on testnet

**Pros:**
- Ensures functional integration
- Prevents wasted development time
- Reduces risk of runtime failures

**Cons:**
- Requires access to external resources (docs, explorer)
- May reveal significant architectural differences

### Option 2: Fallback to Known Contracts (CURRENT STATE)

**Goal:** Use only verified contracts from research, avoid assumptions.

**What We Know FOR SURE:**
- ✅ MUSD Token contract (ERC-20)
- ✅ tBTC Token contract (ERC-20)
- ✅ Portal Proxy (for BTC deposits)
- ✅ Network configuration (RPC, Chain ID)

**What We CAN Build Without BorrowerOperations:**

1. **Display User's Token Balances**
   - Query MUSD balance
   - Query tBTC balance
   - Show in Capital Dashboard

2. **Prepare UI for Future Integration**
   - Complete UI components
   - Mock the borrow flow
   - Add clear "Coming Soon" or "Testnet Only" warnings

3. **Track Transactions**
   - Monitor MUSD/tBTC transfers
   - Show transaction history
   - Link to block explorer

**Actions:**
```typescript
// Update Capital Dashboard to show:
- tBTC balance (can be used as collateral when contracts are ready)
- MUSD balance (borrowed amount once integration is complete)
- Health meter (calculated client-side from balances)
- "Borrow" button disabled with tooltip: "Contract verification in progress"
```

**Pros:**
- Can deploy partial functionality immediately
- UI/UX development continues unblocked
- Clear user communication about status

**Cons:**
- Core feature (borrowing) non-functional
- May disappoint users expecting full functionality

### Option 3: Build Testable Mock Layer

**Goal:** Create a complete mock service for development and testing.

**Architecture:**
```typescript
// src/integrations/mezo/services/mockMusdService.ts
export class MockMusdService {
  // Simulates blockchain interactions locally
  // Stores positions in localStorage
  // Allows full UI testing without real contracts
}

// src/integrations/mezo/config.ts
export const USE_MOCK = process.env.NEXT_PUBLIC_MEZO_USE_MOCK === 'true'

// Services switch based on config:
const musdService = USE_MOCK ? mockMusdService : realMusdService
```

**Pros:**
- Full UI development and testing possible
- Demo-ready for presentations
- Easy to swap to real implementation later

**Cons:**
- Requires building comprehensive mock
- Users might confuse mock with real functionality
- Doubles implementation effort

## Recommended Immediate Actions

### Phase 1: Verify What We Have (1 hour)

1. **Test Network Connectivity**
   ```bash
   # Try to connect to Mezo RPC
   curl -X POST https://rpc.test.mezo.org \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```

2. **Query Known Contracts**
   ```typescript
   // Verify MUSD and tBTC contracts are real
   // Query their balances for a test address
   // Confirm they respond correctly
   ```

3. **Document Findings**
   - Which contracts are accessible
   - What functions they expose
   - Any errors encountered

### Phase 2: Restructure Integration (2-3 hours)

**If Contracts Can Be Verified:**
```typescript
// Update addresses.ts with verified contracts
// Update ABIs from block explorer
// Update service functions to match actual signatures
// Test on testnet
```

**If Contracts Cannot Be Verified Yet:**
```typescript
// 1. Comment out borrowing logic
// 2. Update Capital Dashboard to show:
interface CapitalDashboardProps {
  mode: 'preview' | 'live' // preview mode for unverified contracts
}

// 3. Add clear messaging:
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <p className="text-sm text-blue-900">
    <strong>Mezo Integration Status:</strong> Contract verification in progress. 
    Borrowing functionality will be enabled once contracts are verified on testnet.
  </p>
</div>

// 4. Show what users CAN do:
- View their tBTC balance (potential collateral)
- See MUSD token info
- Understand the borrowing UI (disabled state)
- Sign up for notifications when live
```

### Phase 3: Create Verification Checklist

Update `MEZO_INTEGRATION_CHECKLIST.md` with:

```markdown
## Contract Verification Checklist

### Required Information
- [ ] BorrowerOperations (or equivalent) contract address
- [ ] Verified ABI from block explorer
- [ ] Mainnet vs Testnet addresses confirmed
- [ ] Function signatures verified:
  - [ ] Open position function (name, params)
  - [ ] Query position function (name, params, return values)
  - [ ] Repay function (name, params)
  - [ ] Withdraw function (name, params)

### Verification Sources
- [ ] Official Mezo documentation
- [ ] Mezo block explorer (verified contracts)
- [ ] Mezo GitHub repository
- [ ] Mezo Discord/community
- [ ] Working dApp example

### Fallback Plan
If contracts cannot be verified:
- [ ] Implement mock service for demo
- [ ] Update UI with "Coming Soon" state
- [ ] Document blockers clearly
- [ ] Set up monitoring for when contracts become available
```

## Code Changes Required

### Minimal Changes (If Verification Succeeds)

1. **Update Contract Address**
   ```typescript
   // src/integrations/mezo/contracts/addresses.ts
   export const MEZO_MAINNET_ADDRESSES: MezoAddresses = {
     // ... existing addresses ...
     BorrowerOperations: "0xVERIFIED_ADDRESS_HERE", // Replace placeholder
   }
   ```

2. **Update ABI**
   ```typescript
   // src/integrations/mezo/contracts/abis/BorrowerOperations.ts
   // Replace with verified ABI from block explorer
   ```

3. **Verify Service Functions**
   ```typescript
   // src/integrations/mezo/services/musdService.ts
   // Ensure function calls match verified contract
   ```

### Moderate Changes (If Functions Differ)

If Mezo uses different function names:
```typescript
// Instead of: openTrove()
// Might be: openPosition(), borrow(), deposit(), etc.

// Update service layer to match actual names
export const openPosition = async (...)  => {
  const tx = await contract.actualMezoFunctionName(...); // Updated
  return tx;
};
```

### Major Changes (If Architecture Differs)

If Mezo doesn't use Liquity pattern:
```typescript
// May need to completely restructure position management
// E.g., positions might use IDs instead of per-user queries
// Collateral might be handled differently
// Upper/lower hints might not exist

// Would require rewriting:
// - musdService.ts
// - positionService.ts
// - Related hooks
```

## Decision Matrix

| Scenario | Action | Timeline | Risk |
|----------|--------|----------|------|
| Contracts verified, match assumptions | Update addresses + ABIs | 1 hour | Low |
| Contracts verified, different functions | Update service layer | 2-4 hours | Medium |
| Contracts verified, different architecture | Redesign integration | 1-2 days | High |
| Contracts not yet verifiable | Build mock + preview UI | 3-4 hours | Low |
| Contracts don't exist (MUSD not launched) | Pivot to different feature | N/A | Critical |

## Success Criteria

Integration is considered complete when:
- [ ] All contract addresses are verified from official sources
- [ ] All ABIs match deployed contracts
- [ ] Position can be opened on testnet
- [ ] Position can be queried successfully
- [ ] Health calculations match on-chain values
- [ ] UI updates correctly after transactions
- [ ] Error handling covers all edge cases

## Communication Plan

### For Stakeholders
"We've built the complete UI and architecture for Mezo integration. We're currently in the contract verification phase to ensure we're calling the correct smart contracts. Once verified, the integration can go live immediately."

### For Users (if deploying partial)
"Capital Hub is coming soon! We're working with the Mezo protocol to finalize integration. You can view your balances now, and borrowing functionality will be enabled shortly."

### For Development Team
"Focus on contract verification first. All code is ready - we just need the correct contract addresses and ABIs. See MEZO_INTEGRATION_ANALYSIS.md for details."

## Next Steps for You

1. **Try to access Mezo resources:**
   - docs.mezo.org
   - explorer.mezo.org
   - explorer.test.mezo.org

2. **If accessible:** Follow "Verification-First Approach"

3. **If not accessible:** Implement "Fallback to Known Contracts"

4. **Document findings** in this file

5. **Update team** on status and timeline

---

**Created:** 2025-10-27
**Status:** Awaiting contract verification
**Blocker:** Need verified BorrowerOperations contract address and ABI
