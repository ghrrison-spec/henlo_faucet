# Sprint 4 — Engineer Feedback

**Reviewer**: Senior Technical Lead  
**Date**: 2026-05-07  
**Decision**: **APPROVED** *(1 bug found and fixed inline)*

---

## Bug Fixed — `justClaimed` not cleared on wallet address change

**File**: `src/components/ClaimCard.tsx`  
**Severity**: Medium — incorrect COOLDOWN state shown to eligible wallet after switching accounts

### Root Cause

`justClaimed` was cleared by two effects:
1. When `canClaim === false` (refetch confirms cooldown)
2. Never on address change

If a user claimed with wallet A (→ `justClaimed = true`), then switched to wallet B which is eligible (`canClaim === true`), the clear effect `if (canClaim === false)` never fires for wallet B. Result: wallet B sees COOLDOWN state instead of ELIGIBLE.

### Fix Applied

Added a third effect to clear `justClaimed` on address change:

```typescript
// Clear on address change — different wallet must not inherit prior wallet's claim state
useEffect(() => {
  setJustClaimed(false);
}, [address]);
```

This ensures the optimistic claim state is scoped to a single wallet session.

---

## What's Good

**RPC error handling**: `isGlobalError` surfaced from `useReadContracts`, propagated through FaucetStatsWrapper to FaucetStats and ClaimCard. Both display points have distinct error UI. Retry button wired to `refetch()`. Clean path.

**Optimistic COOLDOWN**: `justClaimed` + `optimisticNextDay` pattern correctly prevents ELIGIBLE flash after dismiss. `optimisticNextDay = BigInt(Math.floor(Date.now() / 86_400_000) + 1)` is stable within any render cycle and never needs resetting (the 24-hour countdown won't expire during the seconds it's displayed optimistically).

**`DisabledClaimButton` component**: Clean extraction. `disabled` + `aria-disabled="true"` on a single reusable component avoids repetition. Correct in all four blocked states.

**Focus management**: `statusRef` with `tabIndex={-1}` + `focus()` on `isSuccess` is the correct pattern for programmatic focus. `role="status"` + `aria-live="polite"` on the wrapper ensures screen readers announce the success state. Redundancy between `role="status"` (which implies `aria-live="polite"`) and the explicit `aria-live` is harmless.

**README.md**: Complete — getting started, env table with links, Vercel steps, tech stack, claim flow description. No over-documentation.

**`.env.local.example`**: Clear descriptions, production guidance on RPC URL, WC project ID rate-limit note.

---

## Notes

- `isError` in `useFaucet` covers only global reads failure. User-specific reads errors (canClaim/nextClaimDay) are not surfaced — acceptable for MVP (masked as undefined, no ELIGIBLE shown without data).
- Vercel deployment is a manual step (can't automate from CLI). Configuration is complete (env vars documented, no custom vercel.json needed).
