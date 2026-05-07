# Agent Working Memory (NOTES.md)

> This file persists agent context across sessions and compaction cycles.
> Updated automatically by agents. Manual edits are preserved.

## Active Sub-Goals
<!-- Current objectives being pursued -->

## Discovered Technical Debt
<!-- Issues found during implementation that need future attention -->

## Blockers & Dependencies
<!-- External factors affecting progress -->

## Session Continuity
<!-- Key context to restore on next session -->
| Timestamp | Agent | Summary |
|-----------|-------|---------|

## Decision Log
<!-- Major decisions with rationale -->

### 2026-05-07 — Design system from poku-zone

Brand source: `/Users/ghrrison/Downloads/poku-zone-main.zip` — single HTML file with full Y2K aesthetic.

Key decisions:
- ClaimCard is a "claim poster" (paper/ink) adapted from the missing-poster in poku-zone
- Poku image swaps per faucet state (briefcase=eligible, sitting-fire=cooldown, wave=success, etc.)
- Y2K canvas background ported from poku-zone JS animation (stars, grid, diamonds, meteors)
- Success state = jackpot overlay with coin rain, auto-dismiss 3s
- Brand voice for errors: "ooga booga", "poku understands", "poku is unbothered"
- All assets copied to `public/` (10 PNGs + henlo.mp3)
- Fonts: VT323 (body), Black Han Sans (buttons/labels), Sixtyfour (hero title), Special Elite (poster), Permanent Marker (speech bubbles)

### 2026-05-07 — Architecture: pure frontend, no backend

Rate limiting is entirely on-chain. UI is presentational only. No server needed.

### 2026-05-07 — Contract analysis

Address: `0x701A9A14F7f4a79225059D4AE88A6F16794C212d` (Berachain mainnet)
- `MIN_BERA` constant exists — users need min BERA balance to claim. UI must pre-check.
- Cooldown is day-based (UTC day number), not 24h rolling. Use `nextClaimDay()`.
- HENLO token address read dynamically from `henloToken()`.
- `paused()` state must be handled in UI.

## Discovered Technical Debt

- `NEXT_PUBLIC_RPC_URL` is set in `.env.local` but `wagmiConfig` uses viem's built-in berachain RPC, not this env var. Sprint 2 **must** wire it up via a custom `http()` transport so operators can actually override the RPC endpoint.

## Blockers & Dependencies

- [ ] WalletConnect project ID needed before deploy (Task 4.3)
- [x] Berachain mainnet chain ID confirmed = 80094 (viem `berachain` chain definition matches)
