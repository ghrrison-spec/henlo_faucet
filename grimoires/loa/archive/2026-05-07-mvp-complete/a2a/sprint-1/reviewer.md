# Sprint 1 — Implementation Report

**Sprint**: Scaffold & Config  
**Status**: Completed  
**Date**: 2026-05-07  

---

## Files Created

### Config / Root

| File | Purpose |
|------|---------|
| `package.json` | Next.js 15, wagmi 2, viem 2, RainbowKit 2, react-query 5 |
| `next.config.ts` | Minimal — `reactStrictMode: true` |
| `tsconfig.json` | Strict mode, `@/*` path alias → `./src/*` |
| `tailwind.config.ts` | Brand palette + 5 font families + animations |
| `postcss.config.mjs` | tailwindcss + autoprefixer |
| `.env.local.example` | WalletConnect ID, faucet address, RPC URL |

### Source

| File | Purpose |
|------|---------|
| `src/abi/faucet.ts` | Typed ABI const — claim, canClaim, nextClaimDay, claimAmount, henloToken, paused, MIN_BERA, owner |
| `src/lib/constants.ts` | FAUCET_ADDRESS, BERACHAIN_EXPLORER_URL, BERACHAIN_CHAIN_ID |
| `src/lib/utils.ts` | truncateAddress, formatTokenAmount, dayToTimestamp, msUntilNextClaim, formatCountdown |
| `src/lib/wagmi.ts` | getDefaultConfig with berachain chain + SSR:true |
| `src/components/Providers.tsx` | WagmiProvider + QueryClientProvider + RainbowKitProvider (dark, yellow accent) |
| `src/components/Y2KBackground.tsx` | Canvas animation — 120 stars, grid, 12 diamonds, 6 meteors, 18 plus signs, corner glows |
| `src/components/WalletButton.tsx` | ConnectButton.Custom — connect / wrong-network / connected states |
| `src/components/NetworkGuard.tsx` | Construction banner + modal when not on Berachain mainnet |
| `src/app/globals.css` | Custom cursor, scanlines, corner glows, paper texture, coin-fall animation |
| `src/app/layout.tsx` | VT323 + Black Han Sans + Sixtyfour + Special Elite + Permanent Marker via next/font |
| `src/app/page.tsx` | Marquee header, nav with WalletButton, hero text — stub page |

---

## Acceptance Criteria Checklist

- [x] `pnpm install` completes without errors
- [x] `pnpm build` succeeds (warnings from third-party transitive deps only — @metamask/sdk, pino-pretty — not our code)
- [x] TypeScript strict mode enabled — `tsc --noEmit` passes
- [x] Tailwind brand colors and fonts available as utilities
- [x] Google Fonts wired up (VT323, Black Han Sans, Sixtyfour, Special Elite, Permanent Marker)
- [x] Custom yellow circle cursor defined in globals.css
- [x] Y2K canvas background: stars, grid, diamonds, meteors, plus signs, corner glows
- [x] Wallet connect button in Y2K style
- [x] Network guard (construction banner + modal) for wrong network
- [x] Brand color palette: yellow #F3C734, blue #2F63FA, green #63DE77, grey #BABABA, red #ff4444, paper #f0e8d0, ink #1a1208

---

## Build Output

```
Route (app)                    Size    First Load JS
┌ ○ /                         2.3 kB        317 kB
└ ○ /_not-found               995 B         106 kB
+ First Load JS shared       105 kB

○ (Static) prerendered as static content
```

---

## Known Non-Blocking Warnings

1. `@react-native-async-storage/async-storage` — from `@metamask/sdk` (transitive via wagmi connectors). Not our code, no impact on web build.
2. `pino-pretty` — from `@walletconnect/logger` (transitive). Not our code, no impact.
3. `use-sync-external-store` peer dep mismatch (React 19 vs ^18) — from `valtio` inside `@reown/appkit`. Known issue, does not affect runtime.

---

## Notes for Sprint 2

- Copy `src/lib/wagmi.ts` config into hooks — all hooks import `wagmiConfig` and use `useReadContracts` for batch reads
- `nextClaimDay()` returns a uint256 UTC day number — use `dayToTimestamp()` from utils
- `canClaim()` takes user address — use `useAccount().address`
- `MIN_BERA` check: use `useBalance` and compare against contract's `MIN_BERA` return value
