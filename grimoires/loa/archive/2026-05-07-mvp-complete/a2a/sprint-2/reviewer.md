# Sprint 2 — Implementation Report

**Sprint**: Contract Hooks  
**Status**: Completed  
**Date**: 2026-05-07  

---

## Files Created / Modified

| File | Change |
|------|--------|
| `src/hooks/useFaucet.ts` | New — batch contract reads hook |
| `src/hooks/useBeraBalance.ts` | New — native BERA balance + MIN_BERA hook |
| `src/hooks/useClaim.ts` | New — write + tx lifecycle hook |
| `src/lib/wagmi.ts` | Updated — wire `NEXT_PUBLIC_RPC_URL` via custom `http()` transport (Sprint 1 audit debt) |
| `tsconfig.json` | Updated — `target: ES2017` → `ES2020` (required for `0n` BigInt literals) |

---

## Task 2.1 — `useFaucet`

Two batched multicall groups (wagmi coalesces into a single multicall RPC request per group):

**Global reads** (always enabled):
1. `claimAmount()` → `dripAmount: bigint | undefined`
2. `paused()` → `paused: boolean | undefined`
3. `henloToken()` → `henloTokenAddress: Address | undefined`

**User reads** (gated on `userAddress`, disabled when undefined):
4. `canClaim(userAddress)` → `canClaim: boolean | undefined`
5. `nextClaimDay(userAddress)` → `nextClaimDay: bigint | undefined`

**Dependent read** (gated on `henloTokenAddress` resolving):
6. `ERC20.balanceOf(FAUCET_ADDRESS)` via `henloTokenAddress` → `faucetBalance: bigint | undefined`

`zeroAddress` used as placeholder arg for user reads when no address — `query.enabled: false` prevents actual call.

---

## Task 2.2 — `useBeraBalance`

- `useBalance(userAddress)` → native BERA balance
- `useReadContract(faucet, 'MIN_BERA')` → minimum balance required
- `hasEnoughBera` computed: `undefined` while either loading, `true` when `minBera === 0n` (no minimum), otherwise `beraBalance >= minBera`

---

## Task 2.3 — `useClaim`

- `useWriteContract` → `isPending` (wallet prompt + tx submission), `txHash`
- `useWaitForTransactionReceipt(txHash)` → `isConfirming` (blockchain confirmation)
- `useEffect` on `isSuccess` → `queryClient.invalidateQueries()` refreshes all reads
- `error` unifies both write error and receipt error with null fallback

---

## Build Fixes Applied

1. **`tsconfig.json` target**: `ES2017` → `ES2020` — BigInt literal `0n` requires ES2020 syntax target
2. **`useQueryClient` import**: was incorrectly imported from `wagmi`, corrected to `@tanstack/react-query`
3. **`wagmiConfig` transport**: wired `NEXT_PUBLIC_RPC_URL` via `http(process.env.NEXT_PUBLIC_RPC_URL || undefined)` — resolving Sprint 1 audit INFO-1

---

## Acceptance Criteria Checklist

- [x] Single multicall for global faucet reads (not N separate calls)
- [x] `faucetBalance` only fetches after `henloTokenAddress` resolves
- [x] All fields typed, no `any`
- [x] `isLoading` true while any read is pending
- [x] `refetch()` re-runs all reads
- [x] Works without `userAddress` (returns `undefined` for user-specific fields)
- [x] `hasEnoughBera` undefined while loading, true/false once resolved
- [x] `MIN_BERA === 0n` → `hasEnoughBera = true` (no minimum path)
- [x] `claim()` calls `writeContract` with correct FAUCET_ADDRESS + ABI
- [x] `isPending` = wallet prompt state
- [x] `isConfirming` = blockchain confirmation state
- [x] Cache invalidated on success via `queryClient.invalidateQueries()`
- [x] `pnpm build` succeeds

---

## Notes for Sprint 3

- `dripAmount` returns `bigint` — use `formatTokenAmount(dripAmount, 18)` from utils for display
- `nextClaimDay === 0n` → wallet has never claimed → eligible (canClaim handles this contract-side)
- `faucetBalance === 0n` → "FAUCET TEMPORARILY EMPTY" state in ClaimCard
- `useClaim.isSuccess` should trigger jackpot overlay immediately (don't wait for `canClaim` to update)
- All hooks accept `userAddress?: Address` — pass `account.address` from `useAccount()`
