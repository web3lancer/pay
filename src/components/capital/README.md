# Capital Hub - Mezo Integration

## Overview

Capital Hub is PayLancer's innovative financial feature that empowers Web3 freelancers to unlock credit using their Bitcoin as collateral, without selling it. This feature integrates with the Mezo protocol to provide collateralized borrowing in MUSD (Mezo USD stablecoin).

## Features

### Core Features (MVP)
- **Capital Dashboard**: Clear overview of collateral, borrowed amounts, and position health
- **Health Meter**: Visual representation of position health (Safe → Caution → Risk)
- **Get Advance Modal**: Simple, one-click borrowing with real-time impact preview
- **Position Health Tracking**: Live collateralization ratio monitoring
- **Proactive Notifications**: Smart prompts to users with idle Bitcoin

### User Experience Principles
1. **Simplicity is Key**: No DeFi jargon. "Credit Line" not "CDP", "Health" not "Ratio"
2. **Visual Feedback**: Real-time health meter updates as users adjust borrow amounts
3. **One-Click Magic**: From idle Bitcoin to available MUSD in one flow

## File Structure

```
src/
├── contexts/
│   ├── CapitalContext.tsx                 # Re-export for client use
│   └── CapitalContextClient.tsx           # Main context logic
├── components/capital/
│   ├── CapitalDashboard.tsx               # Main dashboard component
│   ├── CapitalPromo.tsx                   # Proactive notification banner
│   ├── GetAdvanceModal.tsx                # Borrowing flow modal
│   ├── HealthMeter.tsx                    # Health visualization component
│   └── index.ts                           # Component exports
├── services/
│   └── mezoService.ts                     # Mezo API integration layer
├── types/
│   └── mezo.ts                            # Mezo protocol types
└── app/capital/
    └── page.tsx                           # Capital Hub page
```

## Architecture

### Context Pattern
```typescript
// Using the Capital context
const { position, borrowMUSD, getHealthStatus } = useCapital()
```

**CapitalContextClient** manages:
- Position state (collateral, borrowed amount, ratio)
- Borrowing/repaying operations
- Health calculations
- Error handling

### Component Hierarchy
```
CapitalPage
├── CapitalDashboard (main hub)
│   ├── Stats cards (collateral, borrowed, available)
│   ├── HealthMeter
│   └── Get Advance button
└── GetAdvanceModal
    ├── Amount input + slider
    ├── Impact preview
    └── Health meter preview
```

### Service Layer
**MezoService** provides:
- Smart contract interactions
- Price data fetching
- Position management
- Health calculations

## Key Metrics

### Health Calculation
- **Collateralization Ratio**: `(Collateral Value / Borrowed Amount) × 100`
- **Max LTV**: 50% (user can borrow up to 50% of collateral value)
- **Liquidation Threshold**: 150% (position liquidated below this)

### Health Status
- **Safe** (Green): Ratio ≥ 200%
- **Caution** (Yellow): 150% ≤ Ratio < 200%
- **Risk** (Red): Ratio < 150%

## Integration with Mezo

### Current State
- Mock implementation with realistic data structures
- Ready for Mezo SDK integration
- All API points marked with TODO comments

### To Integrate Real Mezo
1. Install Mezo SDK: `npm install @mezo/sdk` (when available)
2. Update `mezoService.ts` with real contract calls
3. Add environment variables:
   - `NEXT_PUBLIC_MEZO_API_URL`
   - `NEXT_PUBLIC_MEZO_API_KEY`
   - `NEXT_PUBLIC_MEZO_CONTRACT_ADDRESS`
3. Update type definitions as needed
4. Test with testnet first

## User Flows

### 1. Browse Capital Hub
User navigates to `/capital` and sees:
- Current BTC balance and collateral value
- Currently borrowed MUSD
- Available credit line
- Position health meter

### 2. Get Advance (Borrow)
1. User clicks "Get Advance"
2. Modal opens with borrowing form
3. User enters amount or uses slider
4. Real-time health meter updates
5. User confirms transaction
6. Smart contract executes
7. MUSD appears in wallet

### 3. Proactive Notification
- Dashboard checks BTC balance on load
- If BTC ≥ 0.05 and position healthy, shows promo banner
- User can dismiss or click "Unlock Now"
- Dismissal persists for session (localStorage)

## Safety & Risk Management

### Position Monitoring
- Health ratio checked before all operations
- Warnings displayed when approaching risk zone
- Liquidation risk prevents over-borrowing

### Limits & Validations
- Minimum borrow: $100 MUSD
- Maximum borrow: 50% of collateral value
- Prevents borrowing when ratio would drop below 150%

### Disclaimer
- Clear risk warning on Capital Hub page
- All transactions require explicit confirmation
- Users educated on liquidation mechanics

## Development Notes

### Mock Data
Currently using:
- BTC Price: $50,000
- Interest Rate: 5.5% APR
- Liquidation Threshold: 150%
- Max LTV: 50%

These are placeholders and should be fetched from Mezo price oracle in production.

### Performance
- Components use React.memo and useCallback
- Minimal re-renders through proper context usage
- Animations handled by Framer Motion (already dependency)

### Testing Considerations
- Test health calculations with edge cases
- Test modal validation and error states
- Test promo notification persistence
- Test real-time updates as values change

## Future Enhancements

- **Repayment Flow**: Pay back borrowed MUSD
- **Collateral Management**: Add/remove collateral from existing position
- **Yield Strategies**: Deploy borrowed MUSD into yield opportunities
- **Notifications**: Email/SMS alerts for position health
- **Advanced Analytics**: Historical data, performance charts
- **Multi-Collateral**: Support ETH, USDC as collateral
- **Multiple Positions**: Allow users to create multiple independent positions

## Environment Variables

Required for production:
```
NEXT_PUBLIC_MEZO_API_URL=https://api.mezo.io
NEXT_PUBLIC_MEZO_API_KEY=your_api_key_here
NEXT_PUBLIC_MEZO_CONTRACT_ADDRESS=0x...
```

## References

- [Mezo Documentation](https://docs.mezo.io)
- [PRD](../../docx/prd.md)
- [PayLancer README](../../README.md)
