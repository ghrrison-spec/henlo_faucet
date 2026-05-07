# Sprint 3 — Security Audit

**Auditor**: Paranoid Cypherpunk Auditor  
**Date**: 2026-05-07  
**Decision**: **APPROVED — LETS FUCKING GO**

---

## Scope

Files audited (new/modified in Sprint 3):

- `src/components/FaucetStats.tsx`
- `src/components/FaucetStatsWrapper.tsx`
- `src/components/CountdownTimer.tsx` *(post-review fix applied)*
- `src/components/TxStatus.tsx`
- `src/components/PokuGreeter.tsx`
- `src/components/ClaimCard.tsx`
- `src/app/page.tsx`

Supporting files reviewed: `src/lib/utils.ts`, `src/lib/constants.ts`, `src/hooks/useClaim.ts`, `src/abi/faucet.ts`, `next.config.ts`

---

## OWASP Top 10 Findings

### A03 — Injection (XSS)

**PASS — No findings.**

`TxStatus.brandError()` is the only site where external data (wallet/RPC error messages) enters the render pipeline. It performs substring matching on `error.message.toLowerCase()` and maps to one of four hardcoded brand-voice strings. The raw error message string **never reaches the DOM** — not as text content, not as an attribute value, not via `dangerouslySetInnerHTML` (which is not used anywhere).

All other dynamic content (`dripFormatted`, `minBeraFormatted`, `balanceFormatted`) flows: contract return value → `bigint` → `formatTokenAmount()` → `parseFloat()` + `toLocaleString()` → numeric string. No user-supplied input in this chain.

`STATE_IMAGE` lookup: keyed on `ClaimState` union type — a closed 12-value enum. No user-controlled image paths.

`<style>` block in `PokuGreeter`: static string literal, no interpolation.

### A03 — URL Construction

**PASS — No findings.**

Footer link: `${BERACHAIN_EXPLORER_URL}/address/${FAUCET_ADDRESS}`
- `BERACHAIN_EXPLORER_URL = 'https://berascan.com'` — hardcoded string constant
- `FAUCET_ADDRESS` — validated at startup via viem `isAddress()`, throws on invalid

TxStatus Berascan links: `${BERACHAIN_EXPLORER_URL}/tx/${txHash}`
- `txHash` is typed `0x${string}` by wagmi/viem — sourced from RPC response, not user input
- Both anchor elements carry `rel="noopener noreferrer"` ✅

### A05 — Security Misconfiguration

**PASS — No findings.**

Security headers from Sprint 1 (`X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: on`) remain in place.

CSP remains deferred to Sprint 4 per prior audit decision (connector matrix not fully known). This is **tracked** — not forgotten.

### A07 — Auth / Access Control

**PASS — No findings.**

`claim()` has no frontend auth gate — appropriate. All rate limiting and cooldown enforcement is on-chain (`canClaim`, `nextClaimDay`, `paused`). The state machine's priority ordering (tx states > data-derived states) prevents stale-data races from enabling double-submission UI paths.

Chain guard (`chainId !== BERACHAIN_CHAIN_ID`) shows WRONG_NETWORK state and hides the claim button — users cannot submit txns to wrong chain through this UI.

### A02 — Cryptographic / Secret Exposure

**PASS — No findings.**

No hardcoded private keys, API keys, or sensitive credentials. `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` sourced from env (gitignored `.env.local`). `NEXT_PUBLIC_FAUCET_ADDRESS` and `NEXT_PUBLIC_RPC_URL` are public constants appropriate for `NEXT_PUBLIC_` prefix.

---

## CSS Injection Review

`CoinRain` sets CSS custom properties `--duration`, `--delay`, and `left` via inline style. All three values derive exclusively from `Math.random()` — no user-controlled input, no external data sources, no string interpolation from props. CSS injection risk: **None.**

---

## SSR / Hydration Safety

`CoinRain` uses `Math.random()` during render. Component is conditionally rendered only when `showJackpot === true`. `showJackpot` initializes `false` and can only become `true` via the `useEffect` on `isSuccess`, which fires post-hydration. Component never renders during SSR. Hydration mismatch risk: **None.**

---

## Deferred Items (carried from prior audits)

| Item | Severity | Sprint |
|------|----------|--------|
| Content Security Policy header | LOW | Sprint 4 (deferred: connector matrix not yet known) |
| `aria-disabled` on PAUSED/EMPTY/NO_BERA/COOLDOWN buttons | LOW (a11y) | Sprint 4 |

---

## Verdict

No security issues found in Sprint 3 implementation. The XSS mitigations (`brandError()` sanitization, no raw error rendering, no `dangerouslySetInnerHTML`), URL construction patterns (constants + RPC-typed values only), and auth model (on-chain enforcement, correct chain guard) are sound.

**APPROVED — LETS FUCKING GO** 🔒
