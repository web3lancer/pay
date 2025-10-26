# Mezo Integration Checklist

## 📋 Pre-Integration Tasks

- [ ] Read `docx/prd.md` for product requirements
- [ ] Read `CAPITAL_HUB_SUMMARY.md` for feature overview
- [ ] Read `CAPITAL_HUB_INTEGRATION.md` for integration details
- [ ] Review `src/services/mezoService.ts` - all TODO methods
- [ ] Review `src/types/mezo.ts` - all type definitions
- [ ] Set up Mezo account/API access
- [ ] Obtain Mezo SDK and documentation
- [ ] Set up testnet environment
- [ ] Get contract addresses from Mezo team

## 🔧 Step 1: Install Mezo SDK

```bash
npm install @mezo/sdk
# or
yarn add @mezo/sdk
```

Update `package.json` and commit.

## 🔑 Step 2: Configure Environment Variables

Add to `.env.local`:
```env
NEXT_PUBLIC_MEZO_API_URL=https://api.mezo.io
NEXT_PUBLIC_MEZO_API_KEY=your_api_key_here
NEXT_PUBLIC_MEZO_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_MEZO_NETWORK=testnet  # Start with testnet
```

## 🏗️ Step 3: Implement MezoService Methods

In `src/services/mezoService.ts`:

### 3.1 Replace Mock initializePosition
```typescript
async createPosition(request: MezoBorrowRequest): Promise<MezoCreditPosition> {
  // TODO → DONE: Call Mezo SDK to create position
  const mezo = new MezoSDK({...})
  const tx = await mezo.contracts.borrowing.createPosition(
    request.collateralAsset,
    request.collateralAmount,
    request.borrowAmount
  )
  // Parse and return response
}
```

### 3.2 Replace Mock borrowMUSD
```typescript
async borrow(positionId: string, amount: number): Promise<MezoTransactionResult> {
  // TODO → DONE: Call Mezo SDK to borrow
  const tx = await mezo.contracts.borrowing.borrow(positionId, amount)
  return {
    transactionHash: tx.hash,
    blockNumber: tx.blockNumber,
    status: 'success',
    positionId,
    timestamp: new Date(),
    amount,
    type: 'borrow'
  }
}
```

### 3.3 Replace Mock getPriceData
```typescript
async getPriceData(asset: string): Promise<{ price: number; timestamp: Date }> {
  // TODO → DONE: Fetch from Mezo price oracle
  const price = await mezo.oracle.getPrice(asset)
  return {
    price: parseFloat(price.toString()),
    timestamp: new Date()
  }
}
```

### 3.4 Replace All Remaining Mock Methods
- [ ] getPosition
- [ ] getUserPositions
- [ ] repay
- [ ] withdraw
- [ ] getHealthData
- [ ] calculateMaxBorrowable
- [ ] calculateCollateralizationRatio
- [ ] checkLiquidationRisk

## 🧪 Step 4: Test with Testnet

```bash
# Update .env.local
NEXT_PUBLIC_MEZO_NETWORK=testnet

# Run tests
npm run dev

# Test scenarios:
# 1. Create position with test BTC
# 2. Borrow MUSD
# 3. Check health meter updates
# 4. Verify position in Mezo dashboard
```

Checklist:
- [ ] Borrow flow works on testnet
- [ ] Position appears in Mezo
- [ ] Health calculations match Mezo
- [ ] Wallet balance updates
- [ ] No console errors
- [ ] Transaction hashes correct
- [ ] Gas estimates reasonable

## 📊 Step 5: Update Mock Values

Replace hardcoded values with real data:

In `mezoService.ts`:
```typescript
// OLD
const btcPrice = 50000

// NEW
const btcPrice = await this.getPriceData('BTC').then(d => d.price)
```

Replace:
- [ ] BTC price ($50,000)
- [ ] Interest rate (5.5%)
- [ ] Max LTV (50%)
- [ ] Liquidation threshold (150%)
- [ ] Min borrow amount ($100)

## 🔐 Step 6: Security Review

- [ ] No private keys in code
- [ ] No sensitive data logged
- [ ] Contract addresses verified
- [ ] Input validation complete
- [ ] Error handling comprehensive
- [ ] Rate limiting ready
- [ ] Access control verified

## 📝 Step 7: Update Documentation

- [ ] Update `src/services/mezoService.ts` comments (remove TODO)
- [ ] Update `src/types/mezo.ts` if needed
- [ ] Update `CAPITAL_HUB_INTEGRATION.md` with real API details
- [ ] Document any Mezo-specific quirks
- [ ] Add troubleshooting guide

## ✅ Step 8: Testing Checklist

Test all user flows:
- [ ] View Capital Hub with real position
- [ ] Get Advance with real transaction
- [ ] See position update on blockchain
- [ ] Health meter reflects real ratio
- [ ] Liquidation risk calculated correctly
- [ ] Error handling for failed transactions
- [ ] Error handling for network issues
- [ ] Mobile layout works with real data
- [ ] No console errors

## 🚀 Step 9: Launch Preparation

- [ ] All code reviewed
- [ ] Security audit passed
- [ ] Mainnet environment ready
- [ ] Contracts deployed
- [ ] Price feeds verified
- [ ] Monitoring/alerts configured
- [ ] Rollback plan ready
- [ ] Team trained on deployment

## 🎉 Step 10: Launch

```bash
# Update environment
NEXT_PUBLIC_MEZO_NETWORK=mainnet

# Deploy
npm run build
# ... deployment process ...

# Monitor
# - Watch transaction flow
# - Monitor error rates
# - Watch gas usage
# - Monitor TVL and positions
```

## 🐛 Troubleshooting During Integration

| Problem | Solution |
|---------|----------|
| SDK import errors | Check Mezo SDK version matches your TS version |
| Contract call fails | Verify contract address, network, account permissions |
| Price data stale | Check Mezo oracle availability |
| Transaction pending | Add timeout handling, check network congestion |
| Type errors | Update Mezo types if they changed from docs |
| Build fails | Clear .next, reinstall node_modules |

## 📞 Support Resources

- Mezo Documentation: https://docs.mezo.io
- Mezo SDK GitHub: https://github.com/mezo-io/sdk-js
- PayLancer Docs: `src/components/capital/README.md`
- PRD: `docx/prd.md`

## ✨ Success Criteria

Integration is complete when:
- ✅ All mezoService methods call real API
- ✅ Testnet deployment successful
- ✅ All test scenarios pass
- ✅ Documentation updated
- ✅ Security audit passed
- ✅ Mainnet deployment successful
- ✅ Team trained on operations
- ✅ Monitoring alerts active

## 📅 Estimated Timeline

- Day 1: SDK setup, environment config
- Day 2: mezoService implementation
- Day 3: Testnet integration & testing
- Day 4: Security audit & fixes
- Day 5: Mainnet deployment & launch

Total: ~5 business days

---

**Good luck with the integration! 🚀**

For questions, refer to:
1. `CAPITAL_HUB_INTEGRATION.md` - Integration guide
2. `src/components/capital/README.md` - Technical details
3. `docx/prd.md` - Product requirements
