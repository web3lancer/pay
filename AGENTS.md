# AGENTS.md - Coding Guidelines for Web3 Pay App

## Build/Test/Lint Commands
- **Dev**: `npm run dev` (Next.js with Turbopack)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Type Check**: `npx tsc --noEmit`
- **No test framework configured** - check with user for testing approach

## Code Style Guidelines
- **Language**: TypeScript with strict mode enabled
- **Framework**: Next.js 15 with App Router
- **Imports**: Use `@/` alias for src imports, organize: React → libraries → local
- **Components**: Export both named and default exports with TypeScript interfaces
- **Styling**: Tailwind CSS with custom glassmorphism patterns and gradients
- **State Management**: React Context for auth, Zustand for global state
- **Forms**: React Hook Form with Zod validation schemas
- **Error Handling**: try/catch with react-hot-toast, set loading states

## Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `PaymentInterface`, `Button`)
- **Functions**: camelCase with descriptive names (e.g., `validateWalletAddress`)
- **Types**: PascalCase interfaces, snake_case for database fields
- **Constants**: UPPER_SNAKE_CASE

## Key Dependencies & Patterns
- **Web3**: ethers, viem, @aptos-labs/ts-sdk, @stellar/stellar-sdk
- **UI Utils**: clsx + tailwind-merge via `cn()` helper function
- **Validation**: Input validation before processing (addresses, amounts)
- **Context Pattern**: AuthContext → WalletContext → TransactionContext order