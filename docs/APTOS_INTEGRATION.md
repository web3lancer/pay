# Aptos Integration Guide

Complete guide for integrating Aptos blockchain payments into the Pay application.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Contract Deployment](#contract-deployment)
3. [Frontend Integration](#frontend-integration)
4. [API Reference](#api-reference)
5. [Examples](#examples)
6. [Troubleshooting](#troubleshooting)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Aptos CLI installed
- Aptos wallet (Petra, Martian, etc.)

### Installation

The Aptos dependencies are already included in the project:

```json
{
  "@aptos-labs/ts-sdk": "^3.1.3",
  "@aptos-labs/wallet-adapter-react": "^7.0.1"
}
```

### Configuration

1. Copy environment variables:

```bash
cp env.sample .env.local
```

2. Update Aptos configuration in `.env.local`:

```env
NEXT_PUBLIC_INTEGRATION_APTOS=true
NEXT_PUBLIC_APTOS_NETWORK=testnet
NEXT_PUBLIC_APTOS_MODULE_ADDRESS=0xYOUR_MODULE_ADDRESS
```

## 📦 Contract Deployment

### Step 1: Navigate to Contract Directory

```bash
cd ignore1/contracts_lancerpay
```

### Step 2: Deploy Contract

**For Testnet:**
```bash
./scripts/deploy.sh testnet
```

**For Mainnet:**
```bash
./scripts/deploy.sh mainnet
```

### Step 3: Save Module Address

After deployment, copy the module address from the output and update `.env.local`:
```env
NEXT_PUBLIC_APTOS_MODULE_ADDRESS=0xYOUR_MODULE_ADDRESS
```

## 🎨 Frontend Integration

### Using in Components

#### 1. Send Payment

```tsx
'use client';
import { useAptosPayment } from '@/integrations/aptos';

export default function SendPayment() {
  const { sendPayment, loading, connected } = useAptosPayment();

  const handleSend = async () => {
    await sendPayment('0x1234...', 1.5); // Send 1.5 APT
  };

  return (
    <button onClick={handleSend} disabled={loading || !connected}>
      Send Payment
    </button>
  );
}
```

#### 2. Create Payment Request

```tsx
import { useAptosPayment } from '@/integrations/aptos';

export default function CreateRequest() {
  const { createPaymentRequest } = useAptosPayment();

  const handleCreate = async () => {
    await createPaymentRequest('0x1234...', 5.0, 'APT');
  };

  return <button onClick={handleCreate}>Create Request</button>;
}
```

#### 3. Wallet Connection

```tsx
import { useWallet } from '@/integrations/aptos';

export default function WalletButton() {
  const { address, connected, connect, disconnect } = useWallet();

  return (
    <button onClick={connected ? disconnect : connect}>
      {connected ? `${address?.slice(0, 6)}...` : 'Connect Wallet'}
    </button>
  );
}
```

## 📚 API Reference

### `useAptosPayment()`

```typescript
const {
  address,              // Current wallet address
  connected,            // Connection status
  loading,              // Loading state
  sendPayment,          // Send APT to address
  createPaymentRequest, // Create payment request
  fulfillPaymentRequest,// Fulfill existing request
  getPaymentRequest,    // Get request details
  getRequestCount,      // Get user's request count
  getBalance,           // Get account balance
} = useAptosPayment();
```

## 🔧 Troubleshooting

**"Module address not configured"**
- Set `NEXT_PUBLIC_APTOS_MODULE_ADDRESS` in `.env.local`

**"Wallet not connected"**
- Connect wallet before attempting transactions

**Testing on Testnet:**
1. Get testnet APT: https://aptos.dev/network/faucet
2. Verify connection

## 🎉 Success!

Your Aptos integration is ready! The system supports:
- ✅ Direct payments
- ✅ Payment requests
- ✅ Balance queries
- ✅ Transaction history

See `src/integrations/aptos/examples.ts` for more usage examples.
