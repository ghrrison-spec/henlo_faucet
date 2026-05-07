# Sprint Plan — henlo_faucet

> **Cycle**: cycle-001  
> **Created**: 2026-05-07  
> **PRD**: `grimoires/loa/prd.md`  
> **SDD**: `grimoires/loa/sdd.md`  
> **Executor**: AI (Claude via /build)

---

## Overview

4 sprints, each focused and independently verifiable. Tasks are sized for single AI implementation sessions with clear acceptance criteria. No external dependencies within sprints — each sprint builds on the previous.

| Sprint | Focus | Key Output |
|--------|-------|-----------|
| 1 | Scaffold + Config | Boilerplate Next.js app wired to Berachain, wallet connect works |
| 2 | Contract Hooks | All on-chain data reads and claim write hook, tested |
| 3 | UI Components | Full claim UI — all states rendered and interactive |
| 4 | Polish + Deploy | Error handling, responsive design, Vercel deployment |

---

## Sprint 1 — Project Scaffold & Configuration

**Goal**: A running Next.js app that can connect a wallet on Berachain mainnet. No claim logic yet — just the foundation.

**Exit criteria**: `pnpm dev` starts, wallet connect modal opens, connected address displays, wrong-network prompt appears if not on Berachain (chain ID 80094).

### Task 1.1 — Initialize Next.js project with pnpm

**Description**: Scaffold a new Next.js 15 app with TypeScript, Tailwind CSS, and App Router. Configure `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`. Set up `src/app/layout.tsx` and `src/app/page.tsx` stubs. Add `.env.local.example` with all required env vars.

Add the Poku/Henlo Google Fonts to `layout.tsx`:
```html
<link href="https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Sixtyfour&family=VT323&family=Special+Elite&family=Permanent+Marker&display=swap" rel="stylesheet"/>
```

Extend `tailwind.config.ts` with the brand palette and font families:
```js
colors: {
  yellow: '#F3C734', blue: '#2F63FA', green: '#63DE77',
  grey: '#BABABA', red: '#ff4444', paper: '#f0e8d0', ink: '#1a1208',
},
fontFamily: {
  vt323: ['VT323', 'monospace'],
  'black-han': ['Black Han Sans', 'sans-serif'],
  sixtyfour: ['Sixtyfour', 'monospace'],
  'special-elite': ['Special Elite', 'serif'],
  marker: ['Permanent Marker', 'cursive'],
},
```

Add global CSS in `globals.css`: custom cursor (yellow circle SVG), custom scrollbar (yellow thumb/black track), scanline overlay class, construction-banner class.

**Acceptance criteria**:
- `pnpm dev` starts without errors
- `pnpm build` succeeds
- TypeScript strict mode enabled (`"strict": true` in tsconfig)
- Tailwind brand colors and fonts available as utilities
- Google Fonts load in browser (VT323, Black Han Sans, Sixtyfour, Special Elite, Permanent Marker)
- `.env.local.example` documents `NEXT_PUBLIC_FAUCET_ADDRESS`, `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`, `NEXT_PUBLIC_RPC_URL`
- Custom yellow circle cursor visible on page

**Dependencies**: None

---

### Task 1.2 — Install and configure wagmi + viem + RainbowKit

**Description**: Install `wagmi@^2`, `viem@^2`, `@rainbow-me/rainbowkit@^2`, `@tanstack/react-query`. Create `src/lib/wagmi.ts` with `createConfig` using `berachain` chain from `viem/chains`. Create `src/components/Providers.tsx` wrapping `WagmiProvider`, `QueryClientProvider`, `RainbowKitProvider` with a dark honey-gold theme. Wire `Providers` into `src/app/layout.tsx`.

**Acceptance criteria**:
- `wagmi`, `viem`, `@rainbow-me/rainbowkit` installed at correct major versions
- `berachain` chain used (chain ID 80094, RPC `https://rpc.berachain.com/`)
- `RainbowKitProvider` uses dark theme with `accentColor: '#f7b731'`
- No TypeScript errors
- `WagmiProvider` and `QueryClientProvider` wrap entire app in layout

**Dependencies**: Task 1.1

---

### Task 1.3 — Add faucet ABI and contract constants

**Description**: Create `src/abi/faucet.ts` with the full typed ABI `as const`. Create `src/lib/constants.ts` exporting `FAUCET_ADDRESS` (from `process.env.NEXT_PUBLIC_FAUCET_ADDRESS`), `BERACHAIN_EXPLORER_URL` (`https://berascan.com`). Create `src/lib/utils.ts` with helper functions: `truncateAddress(addr: string): string`, `formatTokenAmount(amount: bigint, decimals: number): string`, `dayToTimestamp(day: bigint): Date`, `msUntilNextClaim(nextDay: bigint): number`.

**ABI to include** (from deployed contract):
```
canClaim(address) → bool
claim() → void
dripAmount() → uint256
nextClaimDay(address) → uint256
henloToken() → address
paused() → bool
MIN_BERA() → uint256
lastClaimDay(address) → uint256
```

**Acceptance criteria**:
- `FAUCET_ABI` exported from `src/abi/faucet.ts` as `const` (wagmi type inference works)
- `FAUCET_ADDRESS` throws/warns if env var missing
- `truncateAddress('0x1234567890abcdef1234567890abcdef12345678')` → `'0x1234...5678'`
- `formatTokenAmount(1000000000000000000n, 18)` → `'1.0'`
- `dayToTimestamp(BigInt(Math.floor(Date.now() / 1000 / 86400)))` returns today's date (UTC)
- `msUntilNextClaim` returns 0 for past days, positive ms for future days
- No TypeScript errors

**Dependencies**: Task 1.1

---

### Task 1.4 — WalletButton component + network guard + Y2K background

**Description**: 

**WalletButton** (`src/components/WalletButton.tsx`): Black background, yellow border (`border-2 border-yellow`), `Black Han Sans` font. "CONNECT WALLET" when disconnected; truncated address + "DISCONNECT" when connected. Hover: yellow background, black text.

**NetworkGuard** (`src/components/NetworkGuard.tsx`): Construction banner style — yellow/black diagonal stripes with blinking inner message: "⚠ WRONG NETWORK — SWITCH TO BERACHAIN ⚠" + yellow-bordered switch button.

**Y2KBackground** (`src/components/Y2KBackground.tsx`): Faithful port of poku-zone's canvas animation — blinking stars (120), slow blue grid, drifting diamonds (12), meteors (6), floating plus signs (18). Fixed position, `pointer-events: none`, `z-index: 0`. Also render 4 corner glow divs.

Add Y2KBackground to `layout.tsx` outside the main content (renders behind everything).

**Acceptance criteria**:
- Connect button opens RainbowKit modal (RainbowKit dark theme with `accentColor: '#F3C734'`)
- Connected: shows `0x1234...abcd` format in `VT323` font
- Disconnect works
- NetworkGuard: construction-banner style renders only when `chainId !== 80094`
- "SWITCH TO BERACHAIN" calls `switchChain({ chainId: berachain.id })`
- Y2KBackground canvas visible on page load (stars, grid lines, at least some animation)
- Scanlines overlay visible (subtle horizontal lines over everything)
- All components responsive at 375px

**Dependencies**: Tasks 1.2, 1.3

---

## Sprint 2 — Contract Hooks

**Goal**: All on-chain data is readable via custom hooks. The claim transaction can be submitted and tracked. No UI components yet — hooks are the unit under test.

**Exit criteria**: Each hook returns correct typed data from the contract. `useClaim` can submit a transaction in a local test environment.

### Task 2.1 — `useFaucet` hook (batch contract reads)

**Description**: Create `src/hooks/useFaucet.ts`. Uses `useReadContracts` to batch the following reads in a single multicall:
1. `dripAmount()` → `bigint`
2. `paused()` → `boolean`
3. `henloToken()` → `Address`
4. `canClaim(userAddress)` → `boolean` (only when `userAddress` defined)
5. `nextClaimDay(userAddress)` → `bigint` (only when `userAddress` defined)

Then uses a second `useReadContract` call (dependent on `henloToken` result) to read `balanceOf(FAUCET_ADDRESS)` from the HENLO ERC-20.

Hook signature:
```typescript
useFaucet(userAddress?: Address): {
  dripAmount: bigint | undefined
  paused: boolean | undefined
  henloTokenAddress: Address | undefined
  faucetBalance: bigint | undefined
  canClaim: boolean | undefined
  nextClaimDay: bigint | undefined
  isLoading: boolean
  refetch: () => void
}
```

**Acceptance criteria**:
- Single multicall for all faucet reads (not N separate calls)
- `faucetBalance` only fetches after `henloTokenAddress` resolves
- All fields typed, no `any`
- `isLoading` true while any read is pending
- `refetch()` re-runs all reads
- Works without `userAddress` (returns `undefined` for user-specific fields)
- Hook exported from `src/hooks/useFaucet.ts`

**Dependencies**: Tasks 1.2, 1.3

---

### Task 2.2 — `useBeraBalance` hook

**Description**: Create `src/hooks/useBeraBalance.ts`. Uses `useBalance` (wagmi) to read the user's native BERA balance and `useReadContract` to read `MIN_BERA()` from the faucet. Returns whether user has sufficient BERA.

Hook signature:
```typescript
useBeraBalance(userAddress?: Address): {
  beraBalance: bigint | undefined
  minBera: bigint | undefined
  hasEnoughBera: boolean | undefined   // undefined while loading
  isLoading: boolean
}
```

**Acceptance criteria**:
- `hasEnoughBera` is `undefined` while either value is loading
- `hasEnoughBera` is `true` when `beraBalance >= minBera`
- `hasEnoughBera` is `false` when `beraBalance < minBera`
- Works with no `userAddress` (returns all `undefined`)
- Hook exported from `src/hooks/useBeraBalance.ts`

**Dependencies**: Tasks 1.2, 1.3

---

### Task 2.3 — `useClaim` hook (write + tx lifecycle)

**Description**: Create `src/hooks/useClaim.ts`. Uses `useWriteContract` to call `claim()` and `useWaitForTransactionReceipt` to track the tx to confirmation. On success, invalidates all wagmi query cache so `useFaucet` refetches automatically.

Hook signature:
```typescript
useClaim(): {
  claim: () => void
  isPending: boolean        // tx submitted, not yet confirmed
  isConfirming: boolean     // waiting for receipt
  isSuccess: boolean
  isError: boolean
  txHash: `0x${string}` | undefined
  error: Error | null
  reset: () => void
}
```

**Acceptance criteria**:
- `claim()` calls `writeContract({ address: FAUCET_ADDRESS, abi: FAUCET_ABI, functionName: 'claim' })`
- `isPending` true from submission until receipt (not just wallet prompt)
- On success: `useQueryClient().invalidateQueries()` called to refresh all reads
- `isError` true for user rejection, contract revert, and RPC errors
- `reset()` clears error and success state for retry
- Hook exported from `src/hooks/useClaim.ts`

**Dependencies**: Tasks 1.2, 1.3

---

## Sprint 3 — UI Components

**Goal**: A fully rendered, interactive claim page. All states from the SDD state machine are visually represented. No new contract logic — only UI consuming hooks from Sprint 2.

**Exit criteria**: With a connected eligible wallet, the full claim flow renders correctly through all states (eligible → pending → success). Wrong network, paused, empty, and cooldown states all render correctly.

### Task 3.1 — `FaucetStats` component

**Description**: Create `src/components/FaucetStats.tsx`. Displays stats in poku-zone `visitor-counter` style — black background, green (`#63DE77`) border, `VT323` font, large numbers:

```
┌─────────────────────────┐   ┌─────────────────────────┐
│ 🪙 DAILY DRIP           │   │ 💰 FAUCET BALANCE       │
│  100 HENLO              │   │  1,337,420 HENLO        │
└─────────────────────────┘   └─────────────────────────┘
```

Skeleton: same border/dimensions but with a blinking `---` placeholder in yellow.

**Acceptance criteria**:
- Two stat boxes in a row (stacks on mobile)
- Green (`#63DE77`) border, `VT323` font for values, `Black Han Sans` for labels
- Skeleton shown while `isLoading` (blinking `---`)
- Correct formatted values when data resolves (comma-separated thousands)
- No user address required
- Component exported from `src/components/FaucetStats.tsx`

**Dependencies**: Task 2.1

---

### Task 3.2 — `CountdownTimer` component

**Description**: Create `src/components/CountdownTimer.tsx`. Takes `nextClaimDay: bigint` prop. Computes target timestamp via `dayToTimestamp(nextClaimDay)` and displays a live `HH:MM:SS` countdown. Ticks every second via `setInterval`. Calls an `onExpired?: () => void` callback when countdown reaches zero (triggers parent to refetch eligibility).

**Acceptance criteria**:
- Displays `HH:MM:SS` format (zero-padded: `09:04:02` not `9:4:2`)
- Ticks every second accurately
- Clears interval on unmount (no memory leak)
- Calls `onExpired` callback when countdown hits zero
- Shows "Eligible now" (or triggers parent state change) when `msUntilNextClaim` is 0
- Handles edge case: `nextClaimDay` in the past → renders 0 or triggers `onExpired` immediately
- Component exported from `src/components/CountdownTimer.tsx`

**Dependencies**: Task 1.3

---

### Task 3.3 — `TxStatus` component

**Description**: Create `src/components/TxStatus.tsx`. Displays transaction status in brand voice with Poku images:

- **Pending**: `poku-flamethrower.png` (small, 80px) + `VT323` text "TRANSACTION SUBMITTED..." + yellow Berascan link. Poku bounces slightly.
- **Success**: Full jackpot-style celebration overlay (auto-dismisses after 3s or on click): coin rain (🪙💛⭐🐾✨ via CSS animation), yellow border glow, `Sixtyfour` "HENLO SECURED", `poku-wave.png` bouncing. After dismiss, poster shows `poku-wave.png` + next claim time.
- **Error**: `poku-firehead.png` (small) + branded error message (see SDD §13 error table) + "TRY AGAIN" button (yellow bordered).

Error message mapping:
- User rejected → "TRANSACTION CANCELLED. poku understands."
- `EnforcedPause` revert → "FAUCET PAUSED. poku is unbothered."
- Other revert → "ALREADY CLAIMED TODAY. ooga booga. come back tomorrow."
- Network error → "NETWORK OOGA. try again."

**Acceptance criteria**:
- All three states render with correct Poku image and branded copy
- Success overlay shows coin rain animation then auto-dismisses after 3s
- Berascan links use correct URL format
- Error messages match brand voice (not raw revert strings)
- "TRY AGAIN" button (`Black Han Sans`, yellow border, black bg) calls `reset()`
- Component exported from `src/components/TxStatus.tsx`

**Dependencies**: Task 1.3, Task 2.3

---

### Task 3.4 — `PokuGreeter` component

**Description**: Create `src/components/PokuGreeter.tsx`. Fixed bottom-left, `z-index: 998`. Faithful port of poku-zone greeter: `poku-wave.png` floating with pop-in speech bubbles in sequence:
1. "henlo..." (0.6s delay, small, white bubble)
2. "henlo!" (1.0s delay, medium, white bubble)
3. "HENLO!! 🐾" (1.4s delay, large, yellow bubble)

Bubbles use `Permanent Marker` font. Poku image floats with rotate(-2deg)/rotate(2deg) animation. Hidden on mobile viewports below 640px to avoid covering content.

**Acceptance criteria**:
- Poku image renders bottom-left, fixed position
- Three bubbles animate in with correct delays (pop-in then bob)
- Yellow background on third bubble
- Continuous gentle float animation on Poku image
- Hidden (`hidden sm:flex`) on screens < 640px
- Component exported from `src/components/PokuGreeter.tsx`

**Dependencies**: None (pure visual)

---

### Task 3.5 — `ClaimCard` component (main state machine)

**Description**: Create `src/components/ClaimCard.tsx`. Central component styled as a **claim poster** (see SDD §13): paper background `#f0e8d0`, ink text `#1a1208`, `Special Elite` font, rotate(-0.8deg), 4 staples (absolute positioned grey rectangles), 2 tape pieces (semi-transparent yellow). Poku image (90px, centered) changes by state.

State machine — poster content changes, frame stays:

| State | Condition | Poster Content | Poku Image |
|-------|-----------|----------------|------------|
| `DISCONNECTED` | `!address` | "CONNECT WALLET TO CLAIM" + hint | `poku-briefcase.png` |
| `WRONG_NETWORK` | `chainId !== 80094` | Delegated to NetworkGuard banner | — |
| `LOADING` | `isLoading` | Shimmer skeleton inside poster | `poku-briefcase.png` |
| `PAUSED` | `paused === true` | Construction banner: "FAUCET PAUSED" | `poku-matches.png` |
| `EMPTY` | `faucetBalance === 0n` | "FAUCET TEMPORARILY EMPTY" | `poku-fireeyes.png` |
| `NO_BERA` | `hasEnoughBera === false` | "U NEED BERA FOR GAS. poku judges u (gently)." | `poku-helmet.png` |
| `COOLDOWN` | `canClaim === false` | CountdownTimer + "COME BACK TOMORROW" | `poku-sitting-fire.png` |
| `ELIGIBLE` | `canClaim === true` | "⚠ CLAIM YOUR HENLO ⚠" (blink-border) + active button | `poku-briefcase.png` |
| `PENDING` | `isPending \|\| isConfirming` | TxStatus(pending) | `poku-flamethrower.png` |
| `SUCCESS` | `isSuccess` | TxStatus(success overlay) | `poku-wave.png` |
| `ERROR` | `isError` | TxStatus(error) + branded message | `poku-firehead.png` |

Claim button: yellow (`#F3C734`) background, black text, `Black Han Sans`, uppercase, bold border. Label: "CLAIM X HENLO".

**Acceptance criteria**:
- All 11 states render without crash, correct Poku image per state
- Poster frame (paper bg, staples, tape, rotation) visible in all states
- State transitions correct (eligible → pending → success/error)
- Claim button label shows actual `dripAmount` value
- BERA warning shows `minBera` formatted value
- Poster max-width ~300px, centered, `box-shadow: 8px 8px 0 rgba(0,0,0,0.6)`
- Component exported from `src/components/ClaimCard.tsx`

**Dependencies**: Tasks 2.1, 2.2, 2.3, 3.2, 3.3

---

### Task 3.6 — Compose page layout

**Description**: Update `src/app/page.tsx` to compose the full page in poku-zone style:

1. **Marquee** (top, below nav): yellow bg, black text, Black Han Sans, scrolling: `🐾 HENLO FAUCET ★ CLAIM YOUR DAILY HENLO ★ CONNECT WALLET ★ OOGA BOOGA ★ DRIP DRIP ★ SAY HENLO BACK ★ POWERED BY BERACHAIN ★ POKU APPROVES ★ 🐾`
2. **Nav bar**: black bg, yellow bottom border, `WalletButton` right-aligned, "★ HENLO FAUCET ★" title left — sticky top
3. **Hero area**: `FaucetStats` row + `ClaimCard` centered
4. **PokuGreeter**: fixed bottom-left (already its own component)
5. **Footer**: black bg, yellow top border, poku-zone badge style: `🌐 HENLO FAUCET`, contract address chip linking to Berascan, "Built on Berachain" badge

**Acceptance criteria**:
- Marquee scrolls continuously (CSS animation, not JS)
- Nav sticky at top, yellow bottom border 4px
- ClaimCard centered horizontally, comfortable vertical margin
- Footer shows `0x701A...212d` truncated, links to Berascan
- No horizontal scroll at 375px
- `Y2KBackground` canvas visible behind all content
- No console errors on page load

**Dependencies**: Tasks 1.4, 3.1, 3.4, 3.5

**Dependencies**: Tasks 1.4, 3.1, 3.4

---

## Sprint 4 — Polish, Error Handling & Deploy

**Goal**: Production-ready. All edge cases handled. Deployed to Vercel with correct env vars. Performance and accessibility checked.

**Exit criteria**: Live URL on Vercel. Claim flow works end-to-end on Berachain mainnet with a real wallet.

### Task 4.1 — Loading states and optimistic UI

**Description**: Audit all components for loading/empty/error states. Add:
- Skeleton components for `FaucetStats` while loading
- Optimistic UI: after claim submission, immediately show "claimed today" state (don't wait for `canClaim` to refetch)
- `Suspense` boundaries where appropriate
- Handle RPC connectivity issues: if reads fail, show "Unable to load faucet data" with retry button

**Acceptance criteria**:
- No raw `undefined` values rendered to screen
- Skeleton shown for all async data points during initial load
- After successful claim, countdown shows immediately (no flash of "eligible" state)
- RPC error state renders and allows manual retry
- No unhandled promise rejections in console

**Dependencies**: Sprint 3

---

### Task 4.2 — Responsive design and accessibility

**Description**: Verify and fix responsive layout for mobile (375px), tablet (768px), desktop (1280px). Add basic accessibility:
- All interactive elements have accessible labels
- Color contrast ratio ≥ 4.5:1 for body text
- Claim button has `aria-disabled` when inactive
- Countdown has `aria-live="polite"` for screen readers
- Focus management: after successful claim, focus moves to success message

**Acceptance criteria**:
- No horizontal overflow at 375px
- ClaimCard readable and usable at all three breakpoints
- `aria-disabled="true"` on disabled claim button
- `aria-live` on CountdownTimer
- Lighthouse accessibility score ≥ 90 (run in Chrome DevTools)

**Dependencies**: Sprint 3

---

### Task 4.3 — Environment configuration and Vercel deployment

**Description**: 
1. Create `.env.local.example` (if not done in Sprint 1) with all required vars
2. Create `vercel.json` if any custom config needed (headers, redirects)
3. Add `README.md` at project root with: setup instructions, env var docs, deploy instructions, contract address
4. Deploy to Vercel: connect GitHub repo, set env vars, verify production build
5. Smoke test the live URL: wallet connect, eligibility check, claim flow

**Acceptance criteria**:
- `.env.local.example` documents every `NEXT_PUBLIC_*` var with description
- `README.md` has "Getting Started" section with `pnpm install && pnpm dev`
- `pnpm build` succeeds with no type errors or lint warnings
- Vercel deployment live at production URL
- Live URL: wallet connect modal opens, faucet stats load (dripAmount, balance visible)
- Live URL: wrong-network banner appears if connected to non-Berachain chain

**Dependencies**: Tasks 4.1, 4.2

---

## Risk Register

| Risk | Sprint | Mitigation |
|------|--------|-----------|
| `MIN_BERA` value is 0 (no minimum) | 2 | `useBeraBalance` handles `minBera === 0n` → `hasEnoughBera = true` always |
| `nextClaimDay` returns 0 for unclaimed wallets | 2 | `useFaucet` treats `nextClaimDay === 0n` as eligible |
| Berachain RPC returns stale data | 3 | `wagmi` refetches on block; add manual refresh button as fallback |
| WalletConnect project ID rate limit | 4 | Use project-specific WC ID, not public demo key |
| `berachain` chain in viem/chains has wrong RPC | 1 | Override with `NEXT_PUBLIC_RPC_URL` env var |

---

## Definition of Done (per sprint)

- [ ] All task acceptance criteria met
- [ ] `pnpm build` succeeds (no TS errors, no lint errors)
- [ ] No console errors on happy path
- [ ] Code reviewed (via `/review-sprint`)
- [ ] Security audited (via `/audit-sprint`)

---

*Generated by Loa /sprint-plan — 2026-05-07*
