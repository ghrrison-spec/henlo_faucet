# Monitoring — henlo_faucet

---

## What to Monitor

This is a static frontend. There's no backend to alert on. Key failure modes:

| Failure | Symptom | Detection |
|---------|---------|-----------|
| Vercel deployment failure | Build error, old version served | Vercel email notification |
| Berachain RPC degraded | FaucetStats shows `---`, ClaimCard in RPC_ERROR | User reports / manual check |
| WalletConnect relay down | Wallet modal fails to connect | User reports |
| Contract paused | UI shows PAUSED state (expected behavior) | — |
| Faucet empty | UI shows EMPTY state (expected behavior) | — |

---

## Vercel Built-in Monitoring

Available on all Vercel tiers:

- **Deployment notifications**: Email on deploy success/fail (enabled by default)
- **Analytics**: `vercel.com/<project>/analytics` — page views, Web Vitals (enable in project settings)
- **Logs**: `vercel.com/<project>/logs` — runtime logs for SSR/edge functions (none for this app, but useful if API routes added later)

Enable Vercel Analytics:
1. Project → **Settings** → **Analytics** → Enable
2. Free for Hobby tier (basic vitals)

---

## Uptime Monitoring (Recommended)

Simple uptime check suffices — no backend health endpoint needed, just check the page loads.

**Option A — UptimeRobot (free)**:
1. [uptimerobot.com](https://uptimerobot.com) → Add Monitor
2. Type: HTTP(S)
3. URL: `https://henlo-faucet.vercel.app`
4. Interval: 5 minutes
5. Alert: email on down

**Option B — Vercel cron (no external service)**:
Not applicable — the app is static.

---

## RPC Health Check

The public `rpc.berachain.com` endpoint occasionally has latency spikes. Signs:
- FaucetStats shows blinking `---` for >5 seconds on page load
- ClaimCard stuck in LOADING or RPC_ERROR

**Mitigation**: Switch to a dedicated RPC provider:
- [Ankr](https://www.ankr.com/rpc/) — free tier available for Berachain
- [dRPC](https://drpc.org) — free tier with Berachain support
- [QuickNode](https://www.quicknode.com) — paid, lowest latency

Update `NEXT_PUBLIC_RPC_URL` in Vercel and redeploy.

---

## Success Metrics (from PRD)

These require manual tracking or on-chain analytics:

| Metric | Target | How to Track |
|--------|--------|-------------|
| Daily unique claimants | ≥ 50/month | Berascan event logs for `Claimed(address, amount)` |
| Claim success rate | ≥ 95% | Compare submitted vs confirmed txns on Berascan |
| Time-to-claim | ≤ 60s | Vercel Web Vitals (load time) + Berascan tx confirmation time |
| Faucet uptime | ≥ 99% | UptimeRobot |
