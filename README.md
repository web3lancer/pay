# 🚀 PayLancer

**The next-gen payment platform for freelancers, creators, businesses, and the web3 world.**

![PayLancer Dashboard](https://placehold.co/1200x600/0F172A/34D399?text=PayLancer+Capital)

PayLancer is a professional-grade platform designed to fix cross-border payment delays, high transaction fees, and complex freelancer payment flows. We provide an API-first, secure architecture for instant, low-fee transfers.

---

## ✨ PayLancer Capital (Mezo Hackathon Focus)

For the Mezo Hackathon, we've built **PayLancer Capital**—a transformative feature that solves our users' single biggest pain point: cash flow.

Freelancers are often asset-rich (in Bitcoin) but cash-poor. Instead of forcing them to sell their best asset to cover expenses, PayLancer Capital allows them to collateralize their BTC and instantly borrow MUSD at a 1% fixed rate. We are turning static Bitcoin into productive working capital.

### How It Works

1.  **Hold BTC:** Freelancers hold their Bitcoin in their trusted PayLancer account or connected wallet.
2.  **Get Advance:** With one click, they access a credit line and borrow MUSD against their BTC using Mezo's secure protocol.
3.  **Spend Instantly:** They receive stable MUSD to cover rent, expenses, and new equipment, all without selling their Bitcoin.

### Integrations

Paylancer capital is powered by **Spectrum** and **Boar**, all integrations in src/integrations/mezo/providers

---

## Key Features

-   🌐 **Global Payments:** Send, receive, and manage crypto & fiat.
-   ⚡ **Capital Advance:** Instantly borrow MUSD against your Bitcoin (Powered by Mezo).
-   🔒 **Secure:** 2FA, KYC (optional), and advanced security logs.
-   🪄 **Modern UI:** Beautiful, interactive experience built with React 19.
-   🛡️ **Robust Backend:** Powered by Appwrite for real-time updates and auth.
-   📱 **Fully Responsive:** Works seamlessly on all devices.
-   🧑‍💻 **Open Source:** Built for the community, by the community.

---

## Quickstart

```bash
# 1. Clone the repo
$git clone [https://github.com/web3lancer/pay.git](https://github.com/web3lancer/pay.git)
$ cd pay

# 2. Install dependencies
$ pnpm install

# 3. Copy and edit your .env
$ cp env.sample .env
# (Fill in your Appwrite and API keys)

# 4. Start the dev server
$ pnpm dev

```
---

## Tech Stack

-   **Next.js 15** + **React 19**
-   **Appwrite** (Auth, DB, Storage, Realtime)
-   **Mezo (npm package)** (Bitcoin-backed borrowing)
-   **Tailwind CSS** + **Framer Motion**
-   **TypeScript**
-   **Zustand** (state management)
-   **Recharts** (visualizations)
-   **Dexie** (IndexedDB)

---

## Roadmap

-   [x] Email/password & OAuth login
-   [x] Animated dashboard & onboarding
-   [x] Multi-currency wallet support
-   [x] KYC & 2FA security
-   [x] Invoicing & payment requests
-   [x] **Mezo Testnet Integration (Hackathon Demo)**
-   [ ] **Mezo Mainnet Launch (Q1 2026)**
-   [ ] **Full Loan Management (Repay, Top-up) (Q2 2026)**
-   [ ] **MUSD Auto-Repay with Yield (Q3 2026)**
-   [ ] Token swaps & on/off ramp
-   [ ] Mobile app (PWA)
-   [ ] Marketplace for freelancers

---

## Contributing

We welcome PRs, issues, and ideas! See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

-   Star ⭐ the repo
-   Fork & PR
-   Join our [Discord](https://discord.gg/B8efmXtE)

---

## License

MIT © [web3lancer](https://github.com/web3lancer)