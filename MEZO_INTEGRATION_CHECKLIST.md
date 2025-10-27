# Mezo Integration Checklist

## ⚠️ CRITICAL: CONTRACT VERIFICATION REQUIRED

**Status:** Integration is architecturally complete but requires contract verification.

**Blocker:** The BorrowerOperations contract address and ABI used in the codebase are **HYPOTHETICAL** (based on Liquity assumptions). They must be verified against actual Mezo contracts before testing or deployment.

**See:** `MEZO_INTEGRATION_ANALYSIS.md` for detailed findings.

---

## 📋 Pre-Integration Tasks

- [x] Read `docx/prd.md` for product requirements
- [x] Read `docx/prd-research.md` for technical research
- [x] Review `src/services/mezoService.ts` - identified as legacy/unused
- [x] Review `src/types/mezo.ts` - type definitions complete
- [x] Review `src/integrations/mezo/` - new integration layer built
- [ ] **BLOCKED:** Verify actual Mezo contracts (see Contract Verification section below)
- [ ] Set up testnet environment with verified contracts
- [ ] Get testnet tBTC tokens for testing

## 🔍 CONTRACT VERIFICATION (CRITICAL)

### Required Information
- [ ] BorrowerOperations (or equivalent) contract address for mainnet
- [ ] BorrowerOperations (or equivalent) contract address for testnet
- [ ] Verified ABI from Mezo block explorer
- [ ] Confirm function signatures match assumptions:
  - [ ] Open position function: `openTrove()`? or different name?
  - [ ] Query position function: `getTrove()`? or different name?
  - [ ] Repay function: `repayMUSD()`? or different name?
  - [ ] Withdraw function: `withdrawCollateral()`? or different name?
  - [ ] Upper/lower hint parameters: Required or not?

### Verification Sources (Try All)
- [ ] Official Mezo documentation: https://docs.mezo.org
- [ ] Mezo mainnet explorer: https://explorer.mezo.org
- [ ] Mezo testnet explorer: https://explorer.test.mezo.org
- [ ] Mezo GitHub: Search for mezo-protocol or similar
- [ ] Mezo Discord/Telegram: Ask community or team
- [ ] Find existing dApp using Mezo MUSD: Inspect their contracts

### Fallback Plan (If Contracts Cannot Be Verified)
- [ ] Implement mock service for demo purposes
- [ ] Update UI with "Contract Verification in Progress" banner
- [ ] Disable borrow functionality with clear messaging
- [ ] Show token balances only (MUSD, tBTC)
- [ ] Document blockers in user-facing way

## ✅ What's Already Built

### Architecture Complete
- [x] Network configuration (`src/integrations/mezo/types/networks.ts`)
- [x] Provider service with caching (`src/integrations/mezo/services/providerService.ts`)
- [x] Token service for ERC-20 operations (`src/integrations/mezo/services/tokenService.ts`)
- [x] MUSD service with Liquity-style functions (`src/integrations/mezo/services/musdService.ts`)
- [x] Position calculation service (`src/integrations/mezo/services/positionService.ts`)
- [x] Price service with BTC price oracle (`src/integrations/mezo/services/priceService.ts`)
- [x] Error handler with toast notifications (`src/integrations/mezo/services/errorHandler.ts`)

### React Hooks Complete
- [x] `useMezoWallet()` - Wallet connection
- [x] `useMezoPosition()` - Auto-refreshing position data
- [x] `useMezoBorrow()` - Borrow operations with state management
- [x] `useMezoTokens()` - Token balance tracking

### UI Components Complete
- [x] Capital Dashboard (`src/components/capital/CapitalDashboard.tsx`)
- [x] Get Advance Modal (`src/components/capital/GetAdvanceModal.tsx`)
- [x] Health Meter (`src/components/capital/HealthMeter.tsx`)
- [x] Capital Promo (`src/components/capital/CapitalPromo.tsx`)

### Contract Integration (⚠️ NEEDS VERIFICATION)
- [x] Contract addresses defined (`src/integrations/mezo/contracts/addresses.ts`)
- [x] ABIs created (`src/integrations/mezo/contracts/abis/`)
- ⚠️ **BorrowerOperations contract is HYPOTHETICAL - needs verification**
- ⚠️ **Function names (openTrove, getTrove, etc.) are ASSUMPTIONS**

## 🔧 Step 1: Verify Contracts (MUST DO FIRST)

**DO NOT SKIP THIS STEP**

1. Access Mezo resources and find actual contract addresses
2. Compare with our assumptions in `src/integrations/mezo/contracts/addresses.ts`
3. Get verified ABIs from block explorer
4. Update code if contracts differ from Liquity pattern

## 🔑 Step 2: Configure Environment Variables

Already configured in codebase. Optionally add to `.env.local` for overrides:
```env
# Optional: Override default RPC
NEXT_PUBLIC_MEZO_RPC_URL=https://rpc.test.mezo.org

# Optional: Set network (defaults to testnet in dev)
NEXT_PUBLIC_MEZO_NETWORK=testnet

# Optional: Enable mock mode for demo
NEXT_PUBLIC_MEZO_USE_MOCK=false
```

## 🏗️ Step 3: Update Contract Addresses (After Verification)

Once contracts are verified, update:

**In `src/integrations/mezo/contracts/addresses.ts`:**
```typescript
export const MEZO_MAINNET_ADDRESSES: MezoAddresses = {
  // ... existing verified addresses ...
  BorrowerOperations: "0xVERIFIED_ADDRESS_FROM_EXPLORER", // ← UPDATE THIS
}

export const MEZO_TESTNET_ADDRESSES: MezoAddresses = {
  // ... existing verified addresses ...
  BorrowerOperations: "0xVERIFIED_TESTNET_ADDRESS", // ← UPDATE THIS
}
```

**In `src/integrations/mezo/contracts/abis/BorrowerOperations.ts`:**
Replace the entire ABI array with the verified ABI from the block explorer.

**In `src/integrations/mezo/services/musdService.ts`:**
If function names differ from Liquity pattern, update the function calls:
```typescript
// Current assumption:
const tx = await borrowerOpsContract.openTrove(...)

// If actual function is different:
const tx = await borrowerOpsContract.actualFunctionName(...)
```

## 🧪 Step 4: Test on Testnet

**Prerequisites:**
- [ ] Contracts verified and addresses updated
- [ ] Have testnet wallet with some tBTC
- [ ] Connected to Mezo testnet (Chain ID: 31611)

**Test Scenarios:**
```bash
# Run the app
npm run dev

# Navigate to /capital
# Test:
1. Wallet connection to Mezo testnet
2. View tBTC balance
3. Open a small position (e.g., 0.01 tBTC, borrow 100 MUSD)
4. Verify MUSD received in wallet
5. Check health meter updates correctly
6. Verify position appears in dashboard
```

Checklist:
- [ ] Can connect wallet to Mezo testnet
- [ ] tBTC balance displays correctly
- [ ] Can open position successfully
- [ ] MUSD balance increases after borrow
- [ ] Position data loads correctly
- [ ] Health calculations match expectations
- [ ] No console errors
- [ ] Transaction hash links to explorer
- [ ] Can refresh position data

## 📊 Step 5: Review Legacy Service (Optional Cleanup)

The old mock service at `src/services/mezoService.ts` is **NOT USED** by the new integration. The new integration uses `src/integrations/mezo/` instead.

**Options:**
- [ ] Keep it as reference documentation
- [ ] Delete it to avoid confusion
- [ ] Mark with deprecation notice

## 📝 Step 6: Update Documentation

After successful testing:
- [ ] Update `src/integrations/mezo/README.md` with any contract-specific findings
- [ ] Remove any "hypothetical" or "assumed" language
- [ ] Add actual contract addresses to documentation
- [ ] Document any quirks or Mezo-specific behavior discovered

## ✅ Step 7: Final Validation Checklist

### Functional Tests
- [ ] Open position works on testnet
- [ ] Position query returns correct data
- [ ] Health calculations accurate
- [ ] Wallet balance updates correctly
- [ ] Transaction history shows correctly
- [ ] Error handling works (insufficient balance, etc.)
- [ ] Mobile layout responsive
- [ ] All links to explorer work

### Code Quality
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] No console warnings in production build
- [ ] All imports resolve correctly

### Security
- [ ] No private keys in code
- [ ] No sensitive data logged
- [ ] Contract addresses verified on block explorer
- [ ] Input validation complete
- [ ] Error messages don't leak sensitive info

## 🚀 Step 8: Deployment Checklist

### Pre-Deployment
- [ ] All tests pass on testnet
- [ ] Security review complete
- [ ] Documentation updated
- [ ] Environment variables configured for production
- [ ] Monitoring/alerts set up
- [ ] Rollback plan documented

### Mainnet Preparation
- [ ] Update addresses to mainnet contracts
- [ ] Verify mainnet contracts on explorer
- [ ] Test with small amounts first
- [ ] Have emergency pause mechanism (if applicable)

### Launch
```bash
# Switch to mainnet
NEXT_PUBLIC_MEZO_NETWORK=mainnet

# Build and deploy
npm run build
# ... your deployment process ...
```

### Post-Launch Monitoring
- [ ] Watch transaction success rates
- [ ] Monitor error logs
- [ ] Track gas usage
- [ ] Monitor contract TVL
- [ ] User feedback tracking

## 🐛 Troubleshooting Guide

| Problem | Likely Cause | Solution |
|---------|--------------|----------|
| "Contract not found" | Wrong contract address | Verify address on explorer |
| "Function not found" | Wrong function name | Check verified contract ABI |
| Transaction reverts | Incorrect parameters | Decode revert reason from explorer |
| Position not loading | Wrong query function | Verify getTrove or equivalent exists |
| Health meter wrong | Price data stale | Check price oracle working |
| Build fails | Import errors | Verify all mezo paths use @/integrations/mezo |

## 📞 Support Resources

- **Mezo Official:** https://docs.mezo.org
- **Block Explorers:** 
  - Mainnet: https://explorer.mezo.org
  - Testnet: https://explorer.test.mezo.org
- **Our Docs:** `src/integrations/mezo/README.md`
- **PRD:** `docx/prd.md`
- **Analysis:** `MEZO_INTEGRATION_ANALYSIS.md`
- **Restructuring Plan:** `MEZO_RESTRUCTURING_PLAN.md`

## ✨ Success Criteria

Integration is **production-ready** when:
- ✅ All contract addresses verified from official sources
- ✅ All ABIs match deployed contracts
- ✅ Position can be opened on testnet
- ✅ Position can be queried successfully
- ✅ Health calculations match on-chain values
- ✅ UI updates correctly after transactions
- ✅ Error handling covers all edge cases
- ✅ Security audit passed
- ✅ Documentation complete
- ✅ Team trained on operations

## 🎯 Current Status

**Phase:** Contract Verification
**Blocker:** BorrowerOperations contract must be verified
**Next Action:** Access Mezo documentation/explorer to find actual contracts
**ETA:** TBD (depends on contract verification)

---

**Last Updated:** 2025-10-27
**Integration Progress:** 80% (Architecture complete, awaiting contract verification)
