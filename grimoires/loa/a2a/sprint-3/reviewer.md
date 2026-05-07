# Sprint 3 — Implementation Report

**Sprint**: UI Components  
**Status**: Completed  
**Date**: 2026-05-07  

---

## Files Created / Modified

| File | Change |
|------|--------|
| `src/components/FaucetStats.tsx` | New — stats display (daily drip + faucet balance) |
| `src/components/FaucetStatsWrapper.tsx` | New — client boundary wrapper for FaucetStats |
| `src/components/CountdownTimer.tsx` | New — live HH:MM:SS countdown with expiry callback |
| `src/components/TxStatus.tsx` | New — tx lifecycle display (pending/error/jackpot overlay) |
| `src/components/PokuGreeter.tsx` | New — fixed bottom-left greeter with staggered bubbles |
| `src/components/ClaimCard.tsx` | New — main state machine (11 states) |
| `src/app/page.tsx` | Updated — full page composition |

---

## Task 3.1 — FaucetStats

Two stat boxes in a `flex-col sm:flex-row` row. Green (`#63DE77`) border, `VT323` font for values, `Black Han Sans` for labels. Loading state shows blinking `---` in yellow. Uses `formatTokenAmount` for display. Implemented `FaucetStatsWrapper` as a `'use client'` boundary so `page.tsx` can stay a Server Component.

---

## Task 3.2 — CountdownTimer

`setInterval`-based, 1-second ticks. `msUntilNextClaim(nextClaimDay)` → `formatCountdown(ms)` → `HH:MM:SS`. Clears interval on unmount. Fires `onExpired()` when countdown hits zero (ClaimCard passes `refetch` as the callback). Past `nextClaimDay` immediately shows "ELIGIBLE NOW" and fires `onExpired`. `aria-live="polite"` for screen readers.

---

## Task 3.3 — TxStatus

Three states:
- **Pending/Confirming**: `poku-flamethrower.png` + bouncing "TRANSACTION SUBMITTED..." + Berascan link
- **Error**: `poku-firehead.png` + `brandError()` mapping (user rejected / EnforcedPause / network / default) + [ TRY AGAIN ] button calling `reset()`
- **Jackpot overlay**: 30-coin `CoinRain` component, `poku-wave.png` bouncing, "HENLO SECURED" in Sixtyfour font, auto-dismisses after 3s or on click. After jackpot, shows compact success state.

`brandError()` maps error `.message` substring patterns to brand-voice strings without exposing raw revert data.

---

## Task 3.4 — PokuGreeter

Fixed bottom-left, `z-index: 998`. Three speech bubbles with `setTimeout` staggered reveal (600ms / 1000ms / 1400ms). Transitions via Tailwind `opacity`/`translate-y`. Third bubble is yellow. Poku image uses `@keyframes pokuFloat` (rotate + translateY). Hidden on `< 640px` (`hidden sm:flex`).

---

## Task 3.5 — ClaimCard

11-state machine: `DISCONNECTED` → `WRONG_NETWORK` → `LOADING` → `PAUSED` → `EMPTY` → `NO_BERA` → `COOLDOWN` → `ELIGIBLE` → `PENDING` → `CONFIRMING` → `SUCCESS` / `ERROR`.

Poster frame: `paper-texture` class, `rotate(-0.8deg)`, `box-shadow: 8px 8px 0 rgba(0,0,0,0.6)`, 4 staple elements, 2 tape elements. Poku image (90px) changes per `STATE_IMAGE` map. Claim button: yellow bg, black text, `Black Han Sans`, `aria-label` with drip amount. `ELIGIBLE` state shows blink-border "⚠ CLAIM YOUR HENLO ⚠". Tx lifecycle states delegate to `TxStatus`. `CountdownTimer` in `COOLDOWN` state passes `refetch` as `onExpired`.

Priority state ordering ensures `PENDING/CONFIRMING/SUCCESS/ERROR` always win over data-derived states (user sees the latest tx state, not stale contract data).

---

## Task 3.6 — Page Layout

- **Marquee**: `animation: marquee 30s linear infinite`, yellow bg, black text, `Black Han Sans`
- **Nav**: sticky, `border-b-4 border-brand-yellow/40`, `★ HENLO FAUCET ★` in Sixtyfour, WalletButton right
- **Main**: `FaucetStatsWrapper` + `ClaimCard` centered
- **Footer**: `🌐 HENLO FAUCET` + contract address chip (links to Berascan) + "Built on Berachain 🐻"
- **PokuGreeter**: fixed bottom-left
- **Y2KBackground**: canvas behind all content

---

## Build Output

```
Route (app)         Size    First Load JS
┌ ○ /              15 kB         331 kB
└ ○ /_not-found   995 B         106 kB
```

---

## Acceptance Criteria Checklist

- [x] All 11 states render without crash, correct Poku image per state
- [x] Poster frame (paper bg, staples, tape, rotation) visible in all states
- [x] Claim button disabled during PENDING/CONFIRMING (button only shown in ELIGIBLE)
- [x] Claim button label shows `dripFormatted` value
- [x] BERA warning shows `minBeraFormatted` value
- [x] Poster max-width ~300px (max-w-xs = 20rem), centered, box-shadow applied
- [x] Jackpot overlay: coin rain + auto-dismiss 3s + click to dismiss
- [x] Berascan links constructed from `BERACHAIN_EXPLORER_URL` constant (no string concatenation with user input)
- [x] CountdownTimer ticks every second, calls `refetch` on expiry
- [x] Marquee scrolls continuously (CSS animation)
- [x] Nav sticky at top
- [x] Footer shows truncated contract address with Berascan link
- [x] Y2KBackground canvas visible behind all content
- [x] `pnpm build` succeeds

---

## Notes for Sprint 4

- Verify `claimAmount` function name on live contract (sprint-2 annotation) — ClaimCard shows `dripFormatted` which is `undefined`-safe but will show "??? HENLO" if function returns nothing
- Add `<Suspense>` boundaries for FaucetStats skeleton during SSR hydration
- Optimistic UI: after claim submission, skip ELIGIBLE re-check briefly (currently handled by isPending/isConfirming priority in state machine)
- Accessibility: add `aria-disabled` to all disabled state buttons and `role="status"` to loading states
- Mobile: test at 375px — ClaimCard rotated poster may clip on very small screens, consider reducing `rotate` on mobile
