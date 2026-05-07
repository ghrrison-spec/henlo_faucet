# Sprint 3 — Engineer Feedback

**Reviewer**: Senior Technical Lead  
**Date**: 2026-05-07  
**Decision**: **APPROVED** *(1 bug found and fixed inline)*

---

## Bug Fixed — CountdownTimer: double `onExpired` call

**File**: `src/components/CountdownTimer.tsx`  
**Severity**: Medium — `refetch()` fired twice on countdown expiry

### Root Cause

Two code paths both called `onExpired`:

```typescript
// Path 1 — inside setMs callback when next === 0
const id = setInterval(() => {
  setMs((prev) => {
    const next = Math.max(0, prev - 1000);
    if (next === 0) {
      clearInterval(id);
      onExpired?.();     // ← Call 1
    }
    return next;
  });
}, 1000);

// Path 2 — effect re-runs with ms = 0, fires immediately
useEffect(() => {
  if (ms <= 0) {
    onExpired?.();       // ← Call 2 (fired on same render cycle as Call 1)
```

The `[ms, onExpired]` dep list meant: when the interval fires and sets `ms = 0`, the component re-renders, the effect re-evaluates with `ms <= 0`, and fires `onExpired` a second time.

### Fix Applied

Removed the `onExpired?.()` call from inside `setMs`. The effect is the single authoritative call site. Also introduced `onExpiredRef` to give the interval closure a stable reference to the latest `onExpired` callback without adding it to the effect dep list (prevents unnecessary restarts if caller doesn't memoize):

```typescript
const onExpiredRef = useRef(onExpired);
useEffect(() => { onExpiredRef.current = onExpired; }); // no deps = always synced

useEffect(() => {
  if (ms <= 0) {
    onExpiredRef.current?.();   // Single call path
    return;
  }
  const id = setInterval(() => {
    setMs((prev) => Math.max(0, prev - 1000)); // No onExpired call here
  }, 1000);
  return () => clearInterval(id);
}, [ms]);
```

---

## What's Good

**FaucetStats**: StatBox factored correctly. `isLoading || value === undefined` composite guard handles both states cleanly. `sm:flex-row` stack collapses correctly.

**TxStatus**: `brandError()` mapping is clean — maps error `.message` substrings to brand-voice strings. `Pick<UseClaimResult, ...>` props type avoids coupling to full hook shape. `showJackpot` state separate from `isSuccess` correctly models the "show overlay → auto-dismiss → show compact success" flow.

**ClaimCard state machine**: Priority ordering is correct — tx states (PENDING/CONFIRMING/SUCCESS/ERROR) take priority over data-derived states. Prevents "eligible flash" after successful claim. `STATE_IMAGE` lookup table is a clean data-driven pattern. `aria-label` on claim button includes drip amount.

**PokuGreeter**: `onExpiredRef` pattern correctly prevents stale closure. `hidden sm:flex` correctly hides on small screens. Cleanup on `BUBBLES.map(...)` timers array is correct.

**FaucetStatsWrapper**: Correctly places the `'use client'` boundary so `page.tsx` can be a Server Component.

**page.tsx**: FAUCET_ADDRESS and BERACHAIN_EXPLORER_URL used as static constants for footer link — no user input in URL construction.

---

## Notes

- `CoinRain` uses `Math.random()` during render — safe because `showJackpot` starts `false` and can only be `true` after client-side interaction (never during SSR). No hydration mismatch risk.
- `faucetBalance === 0n` check would fail silently if balance read returns `undefined` (RPC error). This is acceptable optimistic behavior for MVP — on error, don't show EMPTY state.
- Sprint 4 should add `aria-disabled` to PAUSED/EMPTY/NO_BERA/COOLDOWN states per the accessibility task.
