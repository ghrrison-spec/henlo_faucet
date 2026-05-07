# Sprint 2 — Security Audit

**Auditor**: Paranoid Cypherpunk  
**Date**: 2026-05-07  
**Verdict**: **APPROVED — LETS FUCKING GO**

---

## Scope

Three hooks + wagmiConfig transport update. Attack surface: contract address handling, write lifecycle, data flow from on-chain reads.

---

## Findings

### INFO-1 — `henloTokenAddress` sourced from on-chain data (accepted by architecture)

**File**: `src/hooks/useFaucet.ts:48,55-61`  
**Status**: Accepted

`henloTokenAddress` is returned by `henloToken()` from the faucet contract, then used directly as the `address` for the ERC-20 `balanceOf` read. If the faucet contract is compromised or malicious, it could return an arbitrary address causing the UI to query any ERC-20.

This is inherent to the PRD architecture ("HENLO token address read dynamically from `henloToken()`"). The faucet contract is trusted by design. There is no safe way to externally verify this without hardcoding the token address (which conflicts with the dynamic design decision). Acceptable.

If you want defense-in-depth: could validate that `henloTokenAddress` is also a valid Ethereum address before using it (viem's `isAddress()`). But since wagmi already validates addresses before RPC calls, this adds no real protection.

---

### INFO-2 — No double-submit guard in `useClaim` (deferred to Sprint 3 UI)

**File**: `src/hooks/useClaim.ts:49-55`  
**Status**: Deferred to Sprint 3

`claim()` can be called again while `isPending` or `isConfirming` is already true. The hook does not defend against this at the hook level. A second submission while the first is pending would waste gas (the second tx will revert on-chain due to day-based cooldown).

Mitigation is correctly placed in Sprint 3 ClaimCard: the claim button must be `disabled` when `isPending || isConfirming || isSuccess`. No hook-level change needed.

---

## Checklist

| Category | Status | Notes |
|----------|--------|-------|
| Secrets in source | ✓ PASS | No credentials in hooks. All env vars consumed as NEXT_PUBLIC (intentionally public). |
| XSS sinks | ✓ PASS | No `dangerouslySetInnerHTML`, `eval`, or DOM mutation in any hook. |
| User input injection | ✓ PASS | No user-typed strings flow into RPC calls. All inputs are wallet addresses from wagmi (already validated) or none. |
| Contract address validation | ✓ PASS | `FAUCET_ADDRESS` validated with `isAddress()` at startup (Sprint 1 fix). wagmi validates `henloTokenAddress` before use. |
| Write lifecycle | ✓ PASS | `useEffect` on `isSuccess` fires once. `reset()` correctly tears down receipt state via txHash removal. |
| Cache invalidation scope | ✓ PASS | `invalidateQueries()` with no filter is intentional — full refresh after claim is correct for this app. |
| Front-running | ✓ N/A | `claim()` takes no secret parameters. Front-running is a contract concern, not a UI concern. |
| Gas manipulation | ✓ PASS | Gas estimated by viem/wagmi. No user-controlled gas limit. |
| Error disclosure | ✓ PASS | Contract revert reasons are public information. Displaying them in the UI is fine. |
| Data from untrusted sources | ✓ PASS | All data comes from the trusted faucet contract or wagmi/viem-validated reads. |
| RPC URL | ✓ PASS | `NEXT_PUBLIC_RPC_URL` is deployer-controlled. Deployer is trusted. Falls back to viem's public RPC if unset. |

---

## Sprint 3 Security Checklist Items

These must be verified when building Sprint 3 components:

1. **Claim button `disabled` attribute** — must be set when `isPending || isConfirming || isSuccess` to prevent double-submit
2. **`error.message` display** — display via text content only, never as HTML. React's JSX is XSS-safe here but note it explicitly.
3. **Transaction hash links** — Berascan URL must be constructed as `${BERACHAIN_EXPLORER_URL}/tx/${txHash}` (static base URL + validated hex hash). No user input in the URL.
4. **Coin rain animation** — CSS `--duration` and `--delay` properties set via inline `style`. These values must be hardcoded numbers, not user input.
