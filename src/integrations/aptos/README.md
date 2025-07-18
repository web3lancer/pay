# Aptos Integration

This directory contains all code for integrating Aptos blockchain and smart contracts with the Paylancer application.

## Structure

- `client.ts` - Aptos client setup, wallet/account management, faucet
- `contract.ts` - Contract interaction logic (pending ABI)
- `types.ts` - TypeScript types/interfaces for wallets and contract calls
- `hooks.ts` - React hooks for Aptos wallet and contract integration
- `config.ts` - Feature toggles and RPC URLs
- `index.ts` - Main entry point

## Usage

- Enable Aptos integration via `NEXT_PUBLIC_INTEGRATION_APTOS=true` in your environment.
- Use hooks and client methods to create wallets, fund accounts, and interact with contracts.
- Extend contract.ts with your contract ABI and logic when available.


