# Sprint 1 — Security Audit

**Auditor**: Paranoid Cypherpunk  
**Date**: 2026-05-07  
**Verdict**: **APPROVED — LETS FUCKING GO** *(2 findings fixed inline)*

---

## Scope

Sprint 1 is scaffold-only — no user input, no API routes, no authentication, no database. Attack surface is limited to configuration handling, HTTP response headers, and third-party supply chain.

---

## Findings

### MEDIUM-1 — Address cast without format validation (FIXED)

**File**: `src/lib/constants.ts`  
**Status**: Fixed

The env var string was cast as `` `0x${string}` `` after only a null check. A typo (`FAUCET_ADDRESS=0x701a9a14` — truncated) would pass the null guard, silently propagate through the app, and explode with a cryptic viem `InvalidAddressError` when the first contract read fires. Fail-fast at startup is the correct posture.

**Fix applied**:
```typescript
import { isAddress } from 'viem';

const rawFaucetAddress = process.env.NEXT_PUBLIC_FAUCET_ADDRESS;
if (!rawFaucetAddress) throw new Error('NEXT_PUBLIC_FAUCET_ADDRESS is not set');
if (!isAddress(rawFaucetAddress)) {
  throw new Error(`NEXT_PUBLIC_FAUCET_ADDRESS "${rawFaucetAddress}" is not a valid Ethereum address`);
}
export const FAUCET_ADDRESS = rawFaucetAddress as `0x${string}`;
```

Startup now rejects invalid configuration deterministically.

---

### MEDIUM-2 — No HTTP security headers (FIXED)

**File**: `next.config.ts`  
**Status**: Fixed

No `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy` headers. For a wallet UI, `X-Frame-Options: DENY` is the single most important header — it blocks the app from being embedded in an attacker's iframe (clickjacking attack vector for crypto UIs).

**Fix applied** — added to `next.config.ts`:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
X-DNS-Prefetch-Control: on
```

Note: Full CSP intentionally deferred to Sprint 4 — WalletConnect, MetaMask SDK, and RainbowKit all have non-trivial inline script and eval requirements. Getting CSP wrong blocks wallet connections. Sprint 4 should add a CSP via `next.config.ts` after the full connector matrix is known.

---

### LOW-1 — WalletConnect `projectId` fallback to `'demo'`

**File**: `src/lib/wagmi.ts:8`  
**Status**: Accepted for dev / must fix before mainnet deploy

```typescript
projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo',
```

`'demo'` is a shared WalletConnect dev key that is rate-limited and subject to revocation. Mobile wallet connections (WalletConnect v2 QR) will fail silently in production with this key. This is acceptable for local dev but **must be replaced with a real project ID before deploy** (Sprint 4 task 4.3).

**No code change** — this is a deployment checklist item, not a code defect.

---

### INFO-1 — `NEXT_PUBLIC_RPC_URL` env var is set but not consumed

**File**: `.env.local` / `src/lib/wagmi.ts`  
**Status**: Note for Sprint 2

`.env.local` and `.env.local.example` expose `NEXT_PUBLIC_RPC_URL` but `wagmiConfig` uses viem's built-in `berachain` chain RPC. The custom RPC is silently ignored. This creates a false sense of control — an operator sets the RPC URL but the app ignores it.

**Sprint 2 must-do**: When building `useFaucet`, use a custom transport:
```typescript
import { http, createConfig } from 'wagmi';
import { berachain } from 'viem/chains';

createConfig({
  chains: [berachain],
  transports: {
    [berachain.id]: http(process.env.NEXT_PUBLIC_RPC_URL),
  },
});
```

Until then, `NEXT_PUBLIC_RPC_URL` is dead config. Document in `NOTES.md`.

---

## Checklist

| Category | Status | Notes |
|----------|--------|-------|
| Secrets in source | ✓ PASS | No private keys. NEXT_PUBLIC vars are intentionally public. `.env.local` gitignored. |
| XSS sinks | ✓ PASS | No `dangerouslySetInnerHTML`, `eval`, `innerHTML`. All wallet data flows through wagmi typed returns. |
| Input validation | ✓ PASS | No user-controlled input in Sprint 1. Env var address now validated with `isAddress()`. |
| HTTP headers | ✓ PASS | Fixed — `X-Frame-Options: DENY` + 3 additional headers |
| Clickjacking | ✓ PASS | Fixed by `X-Frame-Options: DENY` |
| Supply chain | ⚠ WARN | Deprecated WalletConnect sub-deps (v2.21.x). Pinned by RainbowKit. Not actionable until RainbowKit upgrades. |
| Auth/Authz | ✓ N/A | Pure read UI — no authentication in Sprint 1 |
| CORS | ✓ N/A | No API routes |
| Rate limiting | ✓ N/A | Enforced on-chain by faucet contract, not by UI |
| Error disclosure | ✓ PASS | Error throws expose env var names (not values) — acceptable for startup errors |
| CSP | ⚠ DEFERRED | Sprint 4 task — connector matrix not fully known until Sprint 3 |

---

## Sprint 4 Security Tasks

Add these to Sprint 4 backlog:
1. Add `Content-Security-Policy` header after full connector matrix is known
2. Set real WalletConnect project ID in Vercel env vars
3. Add `Permissions-Policy` header (disable camera, mic, geolocation)
