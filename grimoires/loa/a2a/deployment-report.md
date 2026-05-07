# Deployment Report — henlo_faucet

**Date**: 2026-05-07  
**Platform**: Vercel  
**Status**: Documentation complete — awaiting manual deploy steps

---

## Summary

Static Next.js 15 frontend with no backend. All state on Berachain mainnet. Deployment is: push to GitHub → connect to Vercel → set 3 env vars → live.

---

## Infrastructure Created

| Artifact | Path | Status |
|----------|------|--------|
| `vercel.json` | `vercel.json` | ✓ Created — security headers (Permissions-Policy added) |
| Infrastructure overview | `grimoires/loa/deployment/infrastructure.md` | ✓ Created |
| Deployment guide | `grimoires/loa/deployment/deployment-guide.md` | ✓ Created — step-by-step Vercel |
| Security config | `grimoires/loa/deployment/security.md` | ✓ Created — headers, CSP guidance, secrets |
| Monitoring | `grimoires/loa/deployment/monitoring.md` | ✓ Created — UptimeRobot, Vercel Analytics |
| Incident runbook | `grimoires/loa/deployment/runbooks/incident-response.md` | ✓ Created — 5 scenarios |

---

## Manual Steps Required

The following cannot be automated from the CLI:

1. **Push to GitHub** — `git push origin main`
2. **Import on Vercel** — [vercel.com/new](https://vercel.com/new) → select repo
3. **Set env vars** in Vercel dashboard:
   - `NEXT_PUBLIC_FAUCET_ADDRESS=0x701A9A14F7f4a79225059D4AE88A6F16794C212d`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=<your-project-id>`
   - `NEXT_PUBLIC_RPC_URL=https://rpc.berachain.com/`
4. **Get WalletConnect project ID** — [cloud.walletconnect.com](https://cloud.walletconnect.com) → new project → copy ID
5. **Smoke test** after deploy — wallet connect, faucet stats load, claim flow works

---

## Security Headers Summary

Applied via `next.config.ts` (runtime):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-DNS-Prefetch-Control: on`

Applied via `vercel.json` (edge, belt-and-suspenders):
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

**CSP**: Deliberately deferred — connector matrix must be confirmed on live deployment. See `deployment/security.md` for guidance on constructing the CSP after first deploy.

---

## Post-Deploy Hardening (Recommended)

1. **Add CSP header** — observe live connector origins in DevTools, construct CSP
2. **Dedicated RPC** — swap `rpc.berachain.com` for Ankr/dRPC for better reliability
3. **UptimeRobot** — 5-minute uptime check on the production URL
4. **Vercel Analytics** — enable in project settings for Web Vitals
5. **WalletConnect allowed domains** — restrict to production URL in WC Cloud

---

## No Disaster Recovery Needed

- App is stateless frontend — no data to back up
- Rollback is instant via Vercel (promote any prior deployment)
- Contract state is on-chain and independent of this deployment
