# Sprint 1 — Engineer Feedback

**Reviewer**: Senior Technical Lead  
**Date**: 2026-05-07  
**Decision**: **APPROVED** *(issues found and fixed inline)*

---

## Summary

Scaffold is structurally solid — build passes, font setup is correct, Y2K canvas is well-implemented, RainbowKit theme is on-brand. Four issues must be fixed before Sprint 2 starts.

---

## Issue 1 — CRITICAL: Missing `.gitignore`

**File**: project root (missing)  
**Severity**: Critical — `node_modules/`, `.env.local`, `.next/` will be committed to git on first commit.

`.gitignore` does not exist. The `.env.local` file (when created from `.env.local.example`) will contain the WalletConnect project ID and will be committed.

**Fix**: Create `/Users/ghrrison/henlo_faucet/.gitignore` with standard Next.js ignores:

```
# deps
node_modules/

# next
.next/
out/

# env
.env*.local

# OS
.DS_Store
```

---

## Issue 2 — HIGH: Hardcoded contract address violates FR-4.3

**File**: `src/lib/constants.ts:1-2`  
**Severity**: High — explicit PRD violation

```typescript
// CURRENT (violates FR-4.3)
export const FAUCET_ADDRESS = (process.env.NEXT_PUBLIC_FAUCET_ADDRESS ??
  '0x701A9A14F7f4a79225059D4AE88A6F16794C212d') as `0x${string}`;
```

PRD FR-4.3: *"All contract addresses and ABIs are configurable via environment variables (no hardcoded mainnet addresses in source)"*. The fallback hardcode makes the env var optional and embeds the prod address in source.

**Fix**: Remove fallback, validate at startup:

```typescript
// CORRECT
const raw = process.env.NEXT_PUBLIC_FAUCET_ADDRESS;
if (!raw) throw new Error('NEXT_PUBLIC_FAUCET_ADDRESS is not set');
export const FAUCET_ADDRESS = raw as `0x${string}`;

export const BERACHAIN_EXPLORER_URL = 'https://berascan.com';
export const BERACHAIN_CHAIN_ID = 80094;
```

Also create `.env.local` from the example so `pnpm dev` works immediately:
```
NEXT_PUBLIC_FAUCET_ADDRESS=0x701A9A14F7f4a79225059D4AE88A6F16794C212d
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=demo
NEXT_PUBLIC_RPC_URL=https://rpc.berachain.com/
```

---

## Issue 3 — HIGH: QueryClient at module level — SSR data leak risk

**File**: `src/components/Providers.tsx:9`  
**Severity**: High — shared state across concurrent SSR requests

```typescript
// CURRENT — one instance shared across all SSR requests
const queryClient = new QueryClient();

export default function Providers(...) {
```

With Next.js App Router + `ssr: true`, `Providers` is pre-rendered on the server. Because Node.js module state is shared across concurrent requests, all concurrent server renders share the same QueryClient — query cache from one user's request can bleed into another's initial HTML.

**Fix**: Create QueryClient inside the component with `useState`:

```typescript
'use client';

import { useState } from 'react';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#F3C734',
            accentColorForeground: '#000000',
            borderRadius: 'none',
            fontStack: 'system',
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

---

## Issue 4 — LOW: Unused `tick` variable in Y2KBackground

**File**: `src/components/Y2KBackground.tsx:86,231`  
**Severity**: Low — dead code, will cause lint warning

```typescript
let tick = 0;      // line 86 — declared but never read
// ...
tick++;            // line 231 — incremented but result never used
```

**Fix**: Remove both lines.

---

## What's Good

- Y2K canvas animation is well-structured: proper cleanup in effect return, resize handler, all particle systems isolated in inner functions
- `dayToTimestamp` / `msUntilNextClaim` correctly models the UTC-day cooldown
- WalletButton's pre-hydration guard (`!mounted` aria-hidden pattern) is correct RainbowKit pattern
- NetworkGuard chain ID comparison against constant (not hardcoded number) is clean
- Tailwind config has both `yellow` and `brand.yellow` etc — convenient for Sprint 3 utility classes
- Five Google Fonts loaded correctly with `variable` CSS custom properties
- `faucet.ts` ABI matches the contract analysis: `MIN_BERA`, `canClaim(address)`, `nextClaimDay(address)`, `claimAmount`, `henloToken`, `paused`

---

## Action Items

1. [x] Created `.gitignore`
2. [x] Fixed `constants.ts` — removed fallback, added startup validation, created `.env.local`
3. [x] Fixed `Providers.tsx` — QueryClient moved into component with `useState`
4. [x] Removed `tick` from `Y2KBackground.tsx`
5. [x] `pnpm build` confirmed clean — no regressions
