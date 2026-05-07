# Software Design Document — henlo_faucet

> **Status**: Draft  
> **Created**: 2026-05-07  
> **Cycle**: cycle-001  
> **PRD**: `grimoires/loa/prd.md`

---

## 1. Executive Summary

A single-page Next.js frontend that lets Berachain community members claim HENLO tokens from a deployed ERC-20 faucet contract. No backend. All state is on-chain. The UI reads eligibility, drip config, and balance directly from the contract and submits the `claim()` transaction on the user's behalf.

**Contract**: `0x701A9A14F7f4a79225059D4AE88A6F16794C212d` (Berachain mainnet)  
**Chain**: Berachain mainnet — chain ID `80094`

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (User)                    │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │           Next.js App (Static/SSR)           │   │
│  │                                              │   │
│  │  ┌─────────────┐   ┌────────────────────┐   │   │
│  │  │  React UI   │   │  wagmi/viem hooks  │   │   │
│  │  │  Components │◄──│  (contract reads   │   │   │
│  │  │             │   │   + writes)        │   │   │
│  │  └─────────────┘   └────────┬───────────┘   │   │
│  │                             │               │   │
│  └─────────────────────────────┼───────────────┘   │
│                                │                    │
│  ┌─────────────────────────────▼───────────────┐   │
│  │           Wallet (MetaMask / Rabby)          │   │
│  └─────────────────────────────┬───────────────┘   │
└────────────────────────────────┼────────────────────┘
                                 │ JSON-RPC
                    ┌────────────▼────────────┐
                    │   Berachain mainnet RPC  │
                    │   (rpc.berachain.com)    │
                    └────────────┬────────────┘
                                 │
              ┌──────────────────▼──────────────────┐
              │         On-Chain Contracts           │
              │                                      │
              │  HenloFaucet                         │
              │  0x701A9A14F7f4a79225059D4AE88A6F16794C212d │
              │  ├── canClaim(address) → bool        │
              │  ├── claim()                         │
              │  ├── dripAmount() → uint256          │
              │  ├── nextClaimDay(address) → uint256 │
              │  ├── henloToken() → address          │
              │  ├── paused() → bool                 │
              │  └── MIN_BERA() → uint256            │
              │                                      │
              │  HENLO Token (ERC-20)                │
              │  address from henloToken()           │
              │  └── balanceOf(faucetAddress)        │
              └──────────────────────────────────────┘
```

**Architecture decision**: Pure frontend — no server, no database, no API. All state lives on-chain. Rate limiting enforced by contract. This eliminates an entire attack surface and deployment complexity.

---

## 3. Technology Stack

| Layer | Choice | Version | Rationale |
|-------|--------|---------|-----------|
| Framework | Next.js | 15.x | App Router, Vercel-native, fast SSR for marketing shell |
| Language | TypeScript | 5.x | Type-safe ABI interaction via wagmi codegen |
| Web3 | wagmi | 2.x | Declarative hooks for contract reads/writes, built on viem |
| EVM client | viem | 2.x | Type-safe EVM primitives, Berachain chain def included |
| Wallet UI | RainbowKit | 2.x | Multi-wallet connect + chain switch with minimal config |
| Styling | Tailwind CSS | 3.x | Utility-first, rapid iteration, consistent spacing |
| Package mgr | pnpm | 9.x | Faster installs, strict dependency resolution |
| Deploy | Vercel | — | Zero-config Next.js, env var management, preview URLs |

**Berachain chain config** (viem built-in):
```typescript
import { berachain } from 'viem/chains'
// chain ID: 80094
// RPC: https://rpc.berachain.com/
// Explorer: https://berascan.com
```

---

## 4. Project Structure

```
henlo_faucet/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout: Providers wrapper
│   │   ├── page.tsx            # Single page — FaucetPage composition
│   │   └── globals.css         # Tailwind directives + base styles
│   ├── components/
│   │   ├── Providers.tsx       # wagmi + RainbowKit + QueryClient providers
│   │   ├── WalletButton.tsx    # Connect/disconnect, address chip
│   │   ├── ClaimCard.tsx       # Main card: status + claim button (stateful)
│   │   ├── FaucetStats.tsx     # Drip amount, cooldown period, balance row
│   │   ├── CountdownTimer.tsx  # HH:MM:SS live countdown to next claim day
│   │   ├── TxStatus.tsx        # Pending / success / error transaction states
│   │   └── NetworkGuard.tsx    # Wrong-network banner + switch button
│   ├── hooks/
│   │   ├── useFaucet.ts        # Batch reads: canClaim, dripAmount, paused, nextClaimDay
│   │   ├── useClaim.ts         # Write: claim() + tx lifecycle
│   │   └── useBeraBalance.ts   # Native BERA balance vs MIN_BERA check
│   ├── lib/
│   │   ├── wagmi.ts            # createConfig: chains, transports, connectors
│   │   ├── utils.ts            # formatTokenAmount, truncateAddress, dayToTimestamp
│   │   └── constants.ts        # FAUCET_ADDRESS, BERACHAIN_EXPLORER_URL
│   └── abi/
│       └── faucet.ts           # Full ABI as typed const
├── .env.local.example          # Template for required env vars
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 5. Contract Integration

### ABI (key functions)

```typescript
// src/abi/faucet.ts
export const FAUCET_ABI = [
  {
    name: 'canClaim',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'claim',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    name: 'dripAmount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'nextClaimDay',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '_user', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'henloToken',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'paused',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'MIN_BERA',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'lastClaimDay',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const
```

### Cooldown Model

The contract tracks eligibility by UTC day number (`block.timestamp / 86400`). `nextClaimDay(user)` returns the first day the user can claim again.

```typescript
// Convert nextClaimDay (uint256 day number) → Date
function dayToTimestamp(dayNumber: bigint): Date {
  return new Date(Number(dayNumber) * 86400 * 1000)
}

// Countdown remaining milliseconds
function msUntilNextClaim(nextDay: bigint): number {
  return Math.max(0, Number(nextDay) * 86400 * 1000 - Date.now())
}
```

### MIN_BERA Guard

The contract has a `MIN_BERA` constant — users with insufficient BERA balance cannot claim (contract will revert). The UI must check this and surface a clear warning before the user wastes gas attempting a doomed transaction.

```typescript
// useBeraBalance.ts
const { data: beraBalance } = useBalance({ address: userAddress })
const { data: minBera } = useReadContract({ ...faucet, functionName: 'MIN_BERA' })
const hasEnoughBera = beraBalance && minBera
  ? beraBalance.value >= minBera
  : undefined
```

### Faucet Token Balance

HENLO token address is read from the contract, then `balanceOf(faucetAddress)` is called on the ERC-20:

```typescript
const { data: henloAddress } = useReadContract({ ...faucet, functionName: 'henloToken' })
const { data: faucetBalance } = useReadContract({
  address: henloAddress,
  abi: erc20Abi,
  functionName: 'balanceOf',
  args: [FAUCET_ADDRESS],
})
```

---

## 6. Component Design

### `Providers.tsx`

Wraps the app with:
1. `WagmiProvider` (wagmi config)
2. `QueryClientProvider` (TanStack Query — wagmi dependency)
3. `RainbowKitProvider` (wallet UI + theme)

```typescript
// RainbowKit theme: dark, matches Berachain's aesthetic
const theme = darkTheme({
  accentColor: '#f7b731', // HENLO honey gold
  borderRadius: 'large',
})
```

### `ClaimCard.tsx`

Central component. State machine:

```
DISCONNECTED → connect wallet
WRONG_NETWORK → NetworkGuard (switch to Berachain)
LOADING → skeleton
PAUSED → "Faucet paused" (disabled button)
EMPTY → "Faucet empty" (disabled button)
NO_BERA → "Need BERA for gas" warning (disabled button)
COOLDOWN → CountdownTimer (disabled button)
ELIGIBLE → "Claim X HENLO" (active button)
PENDING → TxStatus(pending)
SUCCESS → TxStatus(success) + updated countdown
ERROR → TxStatus(error) + retry
```

### `CountdownTimer.tsx`

Pure display component. Takes `nextClaimTimestamp: Date`, uses `useEffect` + `setInterval(1000)` to tick down. Displays `HH:MM:SS`. Clears interval on component unmount and when countdown reaches zero (triggers refetch via callback).

### `FaucetStats.tsx`

Read-only stats row displayed above the claim card:

| Stat | Source |
|------|--------|
| Drip amount | `dripAmount()` formatted as HENLO |
| Faucet balance | `ERC20.balanceOf(faucetAddress)` |
| Cooldown | "Once per day" (hardcoded — day-based contract logic) |

### `TxStatus.tsx`

Three states, each with:
- **Pending**: Spinner + "Transaction submitted" + BerascanURL link (tx hash)
- **Success**: Checkmark + "X HENLO claimed!" + BerascanURL link
- **Error**: X icon + error message (user rejection vs contract revert vs RPC error)

---

## 7. Hooks Design

### `useFaucet(userAddress?: Address)`

```typescript
// Batch reads — single multicall round trip
const { dripAmount, canClaim, nextClaimDay, paused, henloToken, minBera, faucetBalance }
  = useFaucet(address)
```

Uses `useReadContracts` for batch reads. Re-fetches on block (wagmi `watch: true`) so faucet balance and eligibility stay live.

### `useClaim()`

```typescript
const { claim, isPending, isConfirming, isSuccess, isError, txHash, error }
  = useClaim()
```

- `useWriteContract` → write `claim()`
- `useWaitForTransactionReceipt` → watch tx hash for confirmation
- On success: invalidate all faucet queries so UI reflects updated state immediately

### `useBeraBalance(userAddress: Address)`

```typescript
const { hasEnoughBera, beraBalance, minBera } = useBeraBalance(address)
```

---

## 8. Environment Variables

```bash
# .env.local.example

# Required
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_wc_project_id
NEXT_PUBLIC_FAUCET_ADDRESS=0x701A9A14F7f4a79225059D4AE88A6F16794C212d

# Optional overrides (defaults to Berachain public RPC)
NEXT_PUBLIC_RPC_URL=https://rpc.berachain.com/
```

Note: HENLO token address is read dynamically from `henloToken()` — no env var needed.

---

## 9. Security Architecture

| Concern | Mitigation |
|---------|-----------|
| No private keys in frontend | All txs signed by user's wallet — UI never holds keys |
| Rate limit bypass | Enforced entirely on-chain — UI state is advisory only |
| Contract address spoofing | Address locked in env var + verified on-chain by querying known functions |
| XSS | Next.js CSP headers; no `dangerouslySetInnerHTML`; no user-supplied HTML |
| Phishing detection | RainbowKit shows domain on wallet prompt; no custom signing messages |
| MIN_BERA check | Client-side pre-check surfaces error before tx submission, preventing wasted gas |

---

## 10. Deployment Architecture

```
GitHub repo
    │
    └── push to main
         │
         ▼
    Vercel (auto-deploy)
         │
         ├── Preview URL (every PR)
         └── Production URL (main branch)
```

**Vercel config**:
- Framework preset: Next.js
- Build command: `pnpm build`
- Output directory: `.next`
- Env vars set in Vercel dashboard (not committed)

---

## 11. Data Flow — Claim Sequence

```
User clicks "Claim"
    │
    ▼
useClaim.claim()
    │
    ├── wagmi: writeContract({ functionName: 'claim' })
    │
    ├── Wallet prompt → user signs
    │
    ├── TxStatus: PENDING (show tx hash + Berascan link)
    │
    ├── useWaitForTransactionReceipt watches tx hash
    │
    ├── [revert path] → TxStatus: ERROR
    │   ├── User rejected → "Transaction cancelled"
    │   ├── Contract revert (canClaim=false) → "Already claimed today"
    │   └── Insufficient BERA → "Need more BERA for gas"
    │
    └── [success path] → TxStatus: SUCCESS
        │
        └── Invalidate queries → useFaucet refetches → UI shows new cooldown
```

---

## 12. Technical Risks & Mitigation

| Risk | Mitigation |
|------|-----------|
| `nextClaimDay` returns 0 for unclaimed wallets | Handle `lastClaimDay == 0` as "never claimed" → eligible |
| `MIN_BERA` value unknown until runtime | Fetch dynamically — include in batch reads |
| Berachain public RPC rate limits | Allow `NEXT_PUBLIC_RPC_URL` override for operators who have dedicated RPC |
| wagmi query cache stale after claim | Invalidate all queries on `useClaim` success |
| RainbowKit / Berachain chain detection | Verify `berachain` chain from viem/chains has correct chain ID (80094) |

---

## 13. Design System — Poku/Henlo Brand

Source: `poku-zone` — replicate this exact visual language.

### Color Palette

```css
:root {
  --yellow:  #F3C734;   /* primary — buttons, borders, accents */
  --blue:    #2F63FA;   /* info, links */
  --green:   #63DE77;   /* success states */
  --black:   #000000;   /* background */
  --white:   #FFFFFF;   /* text */
  --grey:    #BABABA;   /* muted text */
  --red:     #ff4444;   /* error states */
  --paper:   #f0e8d0;   /* ClaimCard poster background */
  --ink:     #1a1208;   /* ClaimCard poster text */
}
```

### Typography

All fonts from Google Fonts:

| Font | Use |
|------|-----|
| `VT323` | Body text, stats, numbers, monospace terminal copy |
| `Black Han Sans` | Buttons, nav labels, uppercase UI labels |
| `Sixtyfour` | Page title / hero header |
| `Special Elite` | ClaimCard poster — "CLAIM" header, reward text |
| `Permanent Marker` | Poku speech bubbles only |

### Page-Level Effects (canvas + CSS)

- **Background**: Black (`#000`) with animated Y2K canvas: blinking stars, slow grid lines (blue), drifting diamonds, meteors — exact copy from poku-zone
- **Scanlines**: `repeating-linear-gradient` overlay at 3–4px intervals, 7% opacity
- **Corner glows**: 4 fixed radial blurs (yellow TR, blue TL, green BL/BR) pulsing 3s alternate
- **Custom cursor**: Yellow circle SVG
- **Custom scrollbar**: Yellow thumb on black track

### Marquee

Top of page, below nav — yellow background, black text, `Black Han Sans`:
```
🐾 HENLO FAUCET ★ CLAIM YOUR DAILY HENLO ★ CONNECT WALLET ★ OOGA BOOGA ★
DRIP DRIP ★ SAY HENLO BACK ★ POWERED BY BERACHAIN ★ POKU APPROVES ★ 🐾
```

### ClaimCard Visual Design — "Claim Poster"

Adapt the poku-zone missing-poster into a **claim poster**. Same paper (`#f0e8d0`) + ink (`#1a1208`) palette, staples, tape, slight rotation:

```
┌──────────────────────────────┐  (tape top)
│ [staple TL]      [staple TR] │
│                              │
│  ✦ HENLO FAUCET ✦            │  (Special Elite, large)
│  ─────────────────────────── │
│  Daily HENLO Distribution    │  (small caps)
│                              │
│  [poku-briefcase.png]        │  (centered image)
│                              │
│  DAILY DRIP: 100 HENLO       │  (Special Elite)
│  ────────────────────────    │
│  ⚠ CLAIM YOUR HENLO ⚠        │  (blink-border animation)
│                              │
│  [CLAIM 100 HENLO button]    │  (yellow bg, black text)
│  or countdown timer          │
│                              │
│ [staple BL]      [staple BR] │
└──────────────────────────────┘  (tape bottom)
```

States change the poster content, not the poster frame.

### Poku Image Selection by State

| State | Image | Why |
|-------|-------|-----|
| Default / eligible | `poku-briefcase.png` | "Poku has something for you" |
| Cooldown | `poku-sitting-fire.png` | "Poku, unbothered, waiting" |
| Paused | `poku-matches.png` | "Poku, innocent bystander" |
| Empty | `poku-fireeyes.png` | "Poku has seen things" |
| No BERA | `poku-helmet.png` | "Poku says henlo (you need gear)" |
| Pending tx | `poku-flamethrower.png` | "Poku, armed & sending" |
| Success | `poku-wave.png` | "Poku waves goodbye (with your tokens)" |
| Error | `poku-firehead.png` | "Poku got lit (something went wrong)" |

### FaucetStats Display

Use the `visitor-counter` pattern from poku-zone:
```html
<div class="stat-counter">
  🪙 DAILY DRIP: <span>100 HENLO</span>
</div>
<div class="stat-counter">
  💰 FAUCET BALANCE: <span>1,337,420 HENLO</span>
</div>
```
Green border (`#63DE77`), VT323 font, black background.

### Greeter (Floating Poku)

Fixed bottom-left — `poku-wave.png` floating with speech bubbles:
- Bubble 1: "henlo..."
- Bubble 2: "henlo!"
- Bubble 3: "HENLO!! 🐾" (yellow background)

Pop-in animation sequence, then continuous bobbing.

### Success Celebration

On successful claim: brief jackpot-style overlay — coin rain (🪙💛⭐🐾✨), yellow border glow, "HENLO SECURED" in `Sixtyfour` font, Poku (`poku-wave.png`) bouncing. Auto-dismiss after 3s or on click.

### Construction Banner

Use for "FAUCET PAUSED" and "FAUCET EMPTY" states — yellow/black diagonal stripes with blinking inner text.

### Error Messages in Brand Voice

| Error | Branded Message |
|-------|----------------|
| Already claimed | "ALREADY CLAIMED TODAY. ooga booga. come back tomorrow." |
| No BERA | "U NEED BERA FOR GAS. poku judges u (gently)." |
| User rejected | "TRANSACTION CANCELLED. poku understands." |
| Faucet paused | "FAUCET PAUSED. poku is unbothered." |
| Faucet empty | "FAUCET TEMPORARILY EMPTY. poku has seen things." |
| Network error | "NETWORK OOGA. try again." |

### Assets in `public/`

```
public/
├── poku.png               # Base Poku
├── poku-wave.png          # Success / greeter
├── poku-briefcase.png     # Default eligible
├── poku-flamethrower.png  # Tx pending
├── poku-helmet.png        # No BERA
├── poku-firehead.png      # Error
├── poku-fireeyes.png      # Faucet empty
├── poku-matches.png       # Faucet paused
├── poku-sitting-fire.png  # Cooldown / waiting
├── poku-chef.png          # (spare)
└── henlo.mp3              # Optional ambient audio
```

---

## 14. Sprint Decomposition (Preview)

| Sprint | Scope |
|--------|-------|
| Sprint 1 | Project scaffold + wagmi/RainbowKit config + ABI + env wiring |
| Sprint 2 | Core hooks (useFaucet, useClaim, useBeraBalance) + unit tests |
| Sprint 3 | UI components (ClaimCard, FaucetStats, CountdownTimer, TxStatus) |
| Sprint 4 | Integration, error states, responsive polish, Vercel deploy |

---

*Generated by Loa /architect — 2026-05-07*
