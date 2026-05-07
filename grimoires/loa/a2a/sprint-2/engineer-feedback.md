# Sprint 2 — Engineer Feedback

**Reviewer**: Senior Technical Lead  
**Date**: 2026-05-07  
**Decision**: **APPROVED**

---

## Summary

Three hooks are correctly structured, well-typed (within wagmi's spread-inference constraints), and handle all edge cases from the risk register. Build passes clean. One annotation to carry forward before Sprint 3 testing.

---

## What's Good

**`useFaucet`**
- Two-batch design is correct: global reads always on, user reads gated by `enabled: Boolean(userAddress)`, balance read dependent on `henloTokenAddress` resolution. wagmi's multicall batches within each `useReadContracts` call automatically.
- `zeroAddress` as placeholder arg with `enabled: false` is the canonical wagmi pattern for conditional contract reads.
- `isUserLoading` when disabled is `false` (react-query disabled queries don't set `isLoading: true`) — the composite `isLoading` correctly reflects only active fetches.
- `refetchBalance()` on a disabled query is a safe no-op.

**`useBeraBalance`**
- `MIN_BERA === 0n → hasEnoughBera = true` correctly handles the risk register edge case (contract may have no minimum).
- `minBera` loads eagerly regardless of wallet connection — good for UX, value is ready immediately on connect.
- `hasEnoughBera` stays `undefined` while either value is loading, exactly per spec.

**`useClaim`**
- `useEffect` on `isSuccess` fires once when it transitions to `true`, then stays stable — no infinite loop risk.
- `resetWrite()` transitively clears receipt state (removing `txHash` disables `useWaitForTransactionReceipt`) — clean lifecycle.
- `invalidateQueries()` with no filter is intentional and correct for a faucet — everything should refresh after a claim.
- `isPending` (wallet/submission) and `isConfirming` (blockchain) are separate as specified.

---

## Annotation — Verify `claimAmount` vs `dripAmount` before Sprint 3 testing

**File**: `src/abi/faucet.ts:31-36` and `src/hooks/useFaucet.ts:29`  
**Priority**: Verify before Sprint 3 UI testing — not a code defect, a contract name question.

The ABI uses `claimAmount` but the sprint plan task 1.3 lists the function as `dripAmount()`. If the deployed contract at `0x701A9A14F7f4a79225059D4AE88A6F16794C212d` has `dripAmount`, then `globalData?.[0]?.result` will be `undefined` and ClaimCard in Sprint 3 will show "undefined HENLO" on the claim button.

**How to verify**: Run a viem read against the live contract and confirm which function name resolves:
```bash
# Quick check — one will succeed, one will error
cast call 0x701A9A14F7f4a79225059D4AE88A6F16794C212d "claimAmount()" --rpc-url https://rpc.berachain.com/
cast call 0x701A9A14F7f4a79225059D4AE88A6F16794C212d "dripAmount()" --rpc-url https://rpc.berachain.com/
```

If `dripAmount` is the correct name, update `src/abi/faucet.ts` and `src/hooks/useFaucet.ts:29` before testing Sprint 3.

**No code change required now** — this is a runtime verification item.

---

## Minor Technical Notes (informational, no changes needed)

1. **Spread loses wagmi type inference**: `{ ...faucet, functionName: 'claimAmount' }` in `useReadContracts` — wagmi can't infer the exact return type through the spread, hence the `as bigint | undefined` casts. This is a known TypeScript/wagmi limitation; the explicit interface compensates. Runtime behavior is correct.

2. **`error` cast to `Error | null`**: wagmi error types are `WriteContractErrorType` and `WaitForTransactionReceiptErrorType`, not strictly `Error`. The cast is acceptable — consumers only need `.message`. Document that consumers should use `error?.message` not `error instanceof Error`.

3. **`lastClaimDay(address)` absent from ABI**: Sprint plan task 1.3 listed this function. Not used in any hook and not needed by any Sprint 3 component, so omission is fine for now.
