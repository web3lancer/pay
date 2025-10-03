# 🚀 Aptos Integration - Quick Start

## Lightning Fast Setup ⚡

### 1️⃣ Deploy Contract (5 minutes)

```bash
cd ignore1/contracts_lancerpay
./scripts/deploy.sh testnet
```

Copy the module address from output.

### 2️⃣ Configure App (1 minute)

```bash
# Update .env.local
NEXT_PUBLIC_INTEGRATION_APTOS=true
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_MODULE_ADDRESS=0xYOUR_MODULE_ADDRESS
```

### 3️⃣ Start Building! (Now!)

```tsx
import { useAptosPayment } from '@/integrations/aptos';

export default function PayButton() {
  const { sendPayment } = useAptosPayment();
  
  return (
    <button onClick={() => sendPayment('0x123...', 1.5)}>
      Send 1.5 APT
    </button>
  );
}
```

## 📦 What You Get

✅ Production-ready smart contract
✅ React hooks for payments
✅ Wallet integration
✅ Payment requests system
✅ Event tracking
✅ Complete TypeScript types

## 🎯 Common Operations

### Send Payment
```tsx
const { sendPayment } = useAptosPayment();
await sendPayment(recipient, amount);
```

### Create Request
```tsx
const { createPaymentRequest } = useAptosPayment();
await createPaymentRequest(recipient, amount, 'APT');
```

### Connect Wallet
```tsx
const { connect, connected } = useWallet();
if (!connected) await connect();
```

## 📚 Full Documentation

- Contract: `ignore1/contracts_lancerpay/README.md`
- Integration: `docs/APTOS_INTEGRATION.md`
- Implementation: `APTOS_IMPLEMENTATION.md`
- Examples: `src/integrations/aptos/examples.ts`

## 🆘 Get Testnet APT

https://aptos.dev/network/faucet

---

**That's it!** You're ready to build the next big payment system on Aptos! 🎉
