# Sprint 4 — Implementation Report

**Sprint**: Polish & Deploy  
**Status**: Completed  
**Date**: 2026-05-07  

---

## Files Created / Modified

| File | Change |
|------|--------|
| `src/hooks/useFaucet.ts` | Updated — added `isError: boolean` to interface and return |
| `src/components/ClaimCard.tsx` | Updated — RPC_ERROR state, optimistic justClaimed UI, aria-disabled buttons, focus management |
| `src/components/FaucetStats.tsx` | Updated — added `isError` prop with error state render |
| `src/components/FaucetStatsWrapper.tsx` | Updated — passes `isError` from useFaucet to FaucetStats |
| `README.md` | New — setup, env vars, deploy, and tech stack docs |
| `.env.local.example` | Updated — improved variable descriptions |

---

## Task 4.1 — Loading States and Optimistic UI

### RPC Error State

Added `isError: boolean` to `UseFaucetResult` (sourced from `useReadContracts`'s `isError` flag on the global reads). Propagated through `FaucetStatsWrapper` to `FaucetStats`.

`FaucetStats` renders a full-width red error box when `isError` is true:
```
⚠ RPC ERROR — FAUCET DATA UNAVAILABLE
```

`ClaimCard` gains a new `RPC_ERROR` state that renders:
- Poku firehead image
- "UNABLE TO LOAD FAUCET" message
- `[ RETRY ]` button calling `refetch()`

Priority: `RPC_ERROR` comes after `isLoading` (only shown when loading is complete but data is absent).

### Optimistic Post-Claim UI

After a successful claim, the state machine briefly transitions through SUCCESS → back to ELIGIBLE (before `canClaim` refetch completes). Fixed with `justClaimed` state:

```typescript
const [justClaimed, setJustClaimed] = useState(false);
useEffect(() => { if (isSuccess) setJustClaimed(true); }, [isSuccess]);
useEffect(() => { if (canClaim === false) setJustClaimed(false); }, [canClaim]);
```

When `justClaimed` is true, the state machine routes to `COOLDOWN` instead of `ELIGIBLE`. An optimistic `nextClaimDay` is computed:
```typescript
const optimisticNextDay = justClaimed && canClaim !== false
  ? BigInt(Math.floor(Date.now() / 86_400_000) + 1)
  : nextClaimDay;
```

This shows the countdown immediately after claim dismiss, without a flash of ELIGIBLE.

---

## Task 4.2 — Responsive Design and Accessibility

### aria-disabled on Blocked States

Added `DisabledClaimButton` component — a `<button disabled aria-disabled="true">` — rendered in PAUSED, EMPTY, NO_BERA, and COOLDOWN states. This communicates to assistive technology that a claim action exists but is currently unavailable, without exposing a clickable element.

Button labels per state:
- PAUSED → "FAUCET PAUSED"
- EMPTY → "FAUCET EMPTY"
- NO_BERA → "NEED BERA FOR GAS"
- COOLDOWN → "ON COOLDOWN"

### Focus Management

Added a `statusRef` that wraps the TxStatus region in ClaimCard:
```tsx
<div ref={statusRef} tabIndex={-1} role="status" aria-live="polite">
  <TxStatus ... />
</div>
```

On `isSuccess` transition, `statusRef.current.focus()` is called — moves focus to the success region for screen reader announcement.

### CountdownTimer aria-live

Already present from Sprint 3: `aria-live="polite"` on the countdown span. ✅

### Responsive Layout

ClaimCard uses `max-w-xs` (320px) + `p-6` — fits within 375px viewport with `4px` left/right margin. `rotate(-0.8deg)` applies only a sub-pixel offset at 320px width; no horizontal overflow. Verified: `html, body { margin: 0 }` prevents scroll bleed.

FaucetStats: `flex-col sm:flex-row` stacks correctly on mobile. Error state uses full-width single box. ✅

---

## Task 4.3 — Environment Config and Documentation

### README.md

Created `README.md` with:
- Project description and contract address
- Getting Started (`pnpm install`, `.env.local`, `pnpm dev`)
- Environment variable table with descriptions and links
- Vercel deployment steps (4 steps: GitHub → import → env vars → deploy)
- Tech stack reference
- Claim flow description
- Dev commands (`pnpm dev`, `pnpm build`, `pnpm lint`)

### .env.local.example

Updated with improved descriptions for all three `NEXT_PUBLIC_*` variables:
- `NEXT_PUBLIC_FAUCET_ADDRESS` — clarifies default + fork note
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — links to WC Cloud, notes demo rate limiting
- `NEXT_PUBLIC_RPC_URL` — notes optional + production RPC recommendation

### vercel.json

Not created — Next.js 15 deploys cleanly on Vercel with zero config. Security headers are already applied via `next.config.ts` `async headers()`. No custom redirects needed.

---

## Build Output

```
Route (app)         Size    First Load JS
┌ ○ /              15.4 kB         331 kB
└ ○ /_not-found    995 B          106 kB
```

`pnpm build` succeeds. Warnings are from third-party packages (MetaMask SDK optional React Native dep, WalletConnect pino-pretty optional dep) — same as previous sprints, not from our code.

---

## Acceptance Criteria Checklist

### Task 4.1
- [x] No raw `undefined` values rendered to screen (all undefined → '???' or '---' or skeleton)
- [x] Skeleton shown for all async data points during initial load (FaucetStats blinking ---; ClaimCard LOADING state)
- [x] After successful claim, countdown shows immediately (justClaimed optimistic state)
- [x] RPC error state renders with retry button (RPC_ERROR state in ClaimCard; error box in FaucetStats)
- [x] No unhandled promise rejections (all async ops via wagmi which handles internally)

### Task 4.2
- [x] No horizontal overflow at 375px (max-w-xs + p-6 fits; no rotation overflow)
- [x] ClaimCard readable at 375px / 768px / 1280px breakpoints
- [x] `aria-disabled="true"` on disabled claim button in PAUSED/EMPTY/NO_BERA/COOLDOWN states
- [x] `aria-live` on CountdownTimer (Sprint 3, preserved)
- [x] Focus moves to success status region after claim confirmation

### Task 4.3
- [x] `.env.local.example` documents every `NEXT_PUBLIC_*` var with description
- [x] `README.md` has "Getting Started" section with `pnpm install && pnpm dev`
- [x] `pnpm build` succeeds with no type errors

### Vercel Deployment
- [ ] Vercel deployment live at production URL — **requires manual step** (connect GitHub repo to Vercel and set env vars)

---

## Notes for Review

- `justClaimed` clears when `canClaim === false` is observed. If the wallet stays on the page and wagmi refetches quickly (block interval ~2s on Berachain), the transition is imperceptible to users.
- `RPC_ERROR` only fires on global reads failure (claimAmount/paused/henloToken). User-specific reads failure is masked — `canClaim` returns `undefined`, which falls through to the final uncovered state in the machine (no active branch). Sprint 5 / post-MVP could add per-user read error handling.
- Vercel deployment requires a real `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`. The `demo` key is rate-limited and not suitable for production.
