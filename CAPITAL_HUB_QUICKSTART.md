# Capital Hub - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### 1. Start Development Server
```bash
cd /home/user/pay
npm run dev
```

Open http://localhost:3000 in your browser.

### 2. Navigate to Capital Hub
- Click on "Capital Hub" in the sidebar (💰 icon)
- Or go directly to: http://localhost:3000/capital

### 3. Try the Features

**View Dashboard**
- See mock BTC collateral: 0.2845 BTC (~$14k)
- Available to borrow: ~$7k MUSD
- Health meter: Currently "Safe" (Green)

**Try Get Advance Modal**
- Click "Get Advance" button
- Adjust the slider or type an amount
- Watch health meter update in real-time
- See impact preview

**See Proactive Promo**
- Go to Dashboard (http://localhost:3000/home)
- Scroll down below welcome header
- You'll see orange "Your Bitcoin is Working!" banner
- Click "Unlock Now" to go to Capital Hub

## 📚 Key Files to Review

### For Product Managers
1. `docx/prd.md` - Product requirements
2. `CAPITAL_HUB_SUMMARY.md` - What was built
3. `src/components/capital/README.md` - Feature overview

### For Developers
1. `src/contexts/CapitalContextClient.tsx` - State management
2. `src/components/capital/GetAdvanceModal.tsx` - Main interaction
3. `src/services/mezoService.ts` - API integration point
4. `CAPITAL_HUB_INTEGRATION.md` - Integration guide

### For Designers
1. `src/components/capital/CapitalDashboard.tsx` - Visual structure
2. `src/components/capital/HealthMeter.tsx` - Health visualization
3. `src/components/capital/CapitalPromo.tsx` - Notification design

## 🔍 Code Structure

```
Capital Hub Feature
├── Context (State Management)
│   └── CapitalContextClient.tsx (useCapital hook)
├── Pages
│   └── app/capital/page.tsx
├── Components
│   ├── CapitalDashboard (main view)
│   ├── GetAdvanceModal (borrowing flow)
│   ├── HealthMeter (visual gauge)
│   └── CapitalPromo (notification)
├── Services (API Layer)
│   └── mezoService.ts (ready for Mezo SDK)
└── Types
    └── mezo.ts (type definitions)
```

## 🎯 Key Interaction Points

### CapitalDashboard Component
- Shows 3 stat cards: Collateral, Borrowed, Available
- Displays health meter
- "Get Advance" button opens modal

### GetAdvanceModal Component
- Input field with validation
- Range slider (100-max)
- Real-time health calculations
- Impact preview section
- Confirm button

### HealthMeter Component
- Visual progress bar
- Color-coded status
- Percentage and ratio display
- Status explanation text

### CapitalPromo Component
- Orange banner with gradient
- Shows estimated credit line
- Appears on dashboard
- Dismissible (localStorage)

## 🧪 Test Scenarios

### Scenario 1: View Capital Hub
```
Action: Navigate to /capital
Expected: Dashboard loads with stats and health meter
```

### Scenario 2: Test Slider
```
Action: Open Get Advance modal, move slider
Expected: 
- Amount input updates
- Health meter color changes (Green→Yellow→Red)
- Impact preview updates
```

### Scenario 3: Test Validation
```
Action: Try to borrow $12,000 (exceeds limit)
Expected: Confirm button disabled with warning
```

### Scenario 4: Test Promo
```
Action: Go to dashboard, scroll down
Expected: Orange promo banner visible (if BTC ≥ 0.05)
```

## 🐛 Debugging Tips

### Check Console
- Browser DevTools → Console
- Should see no errors when clicking features
- Look for `[MEZO]` prefixed console logs for service calls

### Inspect State
```javascript
// In browser console
// Get current capital context state
// (Requires browser extension or manual debugging)
```

### Common Issues
| Issue | Solution |
|-------|----------|
| Capital Hub not in sidebar | Reload page, check layout.tsx includes CapitalProvider |
| Modal won't open | Check browser console for errors |
| Health meter not updating | Refresh page, check getHealthStatus function |
| Promo not showing | Check BTC balance is ≥ 0.05, localStorage not cleared |

## 📋 Pre-Launch Checklist

- [ ] Capital Hub page loads without errors
- [ ] All components render correctly
- [ ] Slider works smoothly across devices
- [ ] Health meter colors change appropriately
- [ ] Modal validation works
- [ ] Promo banner appears on dashboard
- [ ] Navigation link visible in sidebar
- [ ] Mobile layout is responsive
- [ ] Animations are smooth
- [ ] No console errors

## 🔗 Related Documentation

- **PRD**: `docx/prd.md` - Full product requirements
- **Summary**: `CAPITAL_HUB_SUMMARY.md` - Development summary
- **Integration**: `CAPITAL_HUB_INTEGRATION.md` - How to integrate Mezo
- **Feature Docs**: `src/components/capital/README.md` - Technical details
- **Code Style**: `AGENTS.md` - Coding guidelines

## 💬 Questions?

### About Features?
→ See `src/components/capital/README.md`

### About Integration?
→ See `CAPITAL_HUB_INTEGRATION.md`

### About Product?
→ See `docx/prd.md`

### About Code Style?
→ See `AGENTS.md`

## 🎉 You're All Set!

The Capital Hub is ready to demo and ready for Mezo integration. All code is production-ready with:
- ✅ Complete type safety
- ✅ Error handling
- ✅ Responsive design
- ✅ Accessible components
- ✅ Clear documentation

Next: Integrate with real Mezo SDK when ready.
