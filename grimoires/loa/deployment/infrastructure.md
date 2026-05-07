# Infrastructure Architecture — henlo_faucet

**Platform**: Vercel (Hobby / Pro)  
**Type**: Static Next.js 15 (SSR where needed, static pre-render for `/`)  
**Backend**: None — all state is on Berachain mainnet via browser wallet

---

## Architecture Diagram

```
                    ┌──────────────────────────────┐
                    │   Vercel Edge Network (CDN)   │
                    │   henlo-faucet.vercel.app      │
                    │   (or custom domain)           │
                    └──────────────┬───────────────┘
                                   │ HTTPS
                    ┌──────────────▼───────────────┐
                    │   Browser (User)              │
                    │                               │
                    │  Next.js 15 App Bundle        │
                    │  ├── wagmi v2 (contract reads)│
                    │  ├── RainbowKit v2 (wallet UI)│
                    │  └── viem v2 (tx signing)     │
                    └──────────────┬───────────────┘
                                   │ JSON-RPC
                    ┌──────────────▼───────────────┐
                    │  Berachain RPC                │
                    │  rpc.berachain.com            │
                    │  (or NEXT_PUBLIC_RPC_URL)     │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────▼───────────────┐
                    │  HenloFaucet Contract         │
                    │  0x701A9A14F7f4a79225059D4...  │
                    │  Berachain mainnet (ID 80094) │
                    └───────────────────────────────┘
```

## Components

| Component | Provider | Notes |
|-----------|----------|-------|
| Hosting | Vercel | Auto-deploy from GitHub main branch |
| CDN | Vercel Edge Network | Global, automatic, included |
| DNS | Vercel (default subdomain) | `henlo-faucet.vercel.app` |
| TLS | Vercel (automatic) | Let's Encrypt, auto-renew |
| Wallet modal | RainbowKit v2 | WalletConnect relay via cloud.walletconnect.com |
| Chain RPC | rpc.berachain.com | Public endpoint; swap for dedicated in production |
| Contract | Berachain mainnet | Read-only state + claim() write |

## Environment Variables (Production)

| Variable | Where Set | Value |
|----------|-----------|-------|
| `NEXT_PUBLIC_FAUCET_ADDRESS` | Vercel Dashboard → Settings → Env Vars | `0x701A9A14F7f4a79225059D4AE88A6F16794C212d` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Vercel Dashboard → Settings → Env Vars | Your WC project ID from cloud.walletconnect.com |
| `NEXT_PUBLIC_RPC_URL` | Vercel Dashboard → Settings → Env Vars | Optional; use dedicated endpoint for production |

## Build Configuration

- **Framework**: Next.js (auto-detected by Vercel)
- **Build command**: `pnpm build` (auto-detected via `pnpm-lock.yaml`)
- **Output directory**: `.next` (auto-detected)
- **Node.js version**: 20.x (Vercel default, compatible with Next.js 15)

## Scaling

No backend to scale. Vercel Edge CDN handles traffic automatically. The app is fully static for the initial page load; all dynamic state comes from on-chain reads via user's RPC connection. Vercel Hobby tier (free) is sufficient for expected traffic.

## Cost Estimate

| Tier | Cost | Suitable for |
|------|------|-------------|
| Vercel Hobby | Free | ≤ 100GB bandwidth/month, ≤ 6000 min build/month |
| Vercel Pro | $20/month | Higher limits, team collaboration, advanced analytics |

Expected traffic for a community faucet (~50-500 daily users): **Hobby tier is sufficient**.
