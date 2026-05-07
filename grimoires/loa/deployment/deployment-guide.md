# Deployment Guide — henlo_faucet

**Platform**: Vercel  
**Estimated time**: ~10 minutes (first deploy), ~2 minutes (subsequent)

---

## Prerequisites

- [ ] GitHub account with the `henlo_faucet` repo pushed
- [ ] Vercel account at [vercel.com](https://vercel.com) (free)
- [ ] WalletConnect project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com) (free)

---

## First Deploy

### Step 1 — Push to GitHub

```bash
# From henlo_faucet/
git add .
git commit -m "chore: ready for production"
git push origin main
```

### Step 2 — Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Add GitHub Account** (if not done) → authorize Vercel
3. Find `henlo_faucet` in the repo list → click **Import**

### Step 3 — Configure Environment Variables

In the Vercel import screen under **Environment Variables**, add:

| Name | Value | Environments |
|------|-------|-------------|
| `NEXT_PUBLIC_FAUCET_ADDRESS` | `0x701A9A14F7f4a79225059D4AE88A6F16794C212d` | Production, Preview, Development |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | `<your-project-id>` | Production, Preview, Development |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.berachain.com/` | Production, Preview, Development |

> **Important**: Do NOT use the `demo` WalletConnect project ID in production — it is rate-limited.

### Step 4 — Deploy

Click **Deploy**. Vercel will:
1. Detect Next.js 15
2. Run `pnpm build`
3. Deploy to their edge network

Build takes ~60-90 seconds. You'll get a URL like `henlo-faucet.vercel.app`.

### Step 5 — Smoke Test

After deploy, verify:
- [ ] Page loads (faucet stats show or display skeleton)
- [ ] Connect wallet modal opens (RainbowKit)
- [ ] Wrong network banner shows if not on Berachain (chain ID 80094)
- [ ] Faucet stats load after a moment (dripAmount, faucet balance visible)
- [ ] No console errors on page load

---

## Subsequent Deploys

Push to `main` → Vercel auto-deploys. No manual steps needed.

Pull requests get automatic **Preview URLs** (e.g., `henlo-faucet-git-feature-branch.vercel.app`) — useful for reviewing UI changes before merge.

---

## Rollback

If a deploy causes issues:

1. Go to Vercel Dashboard → `henlo_faucet` project → **Deployments**
2. Find the last good deployment → click `...` → **Promote to Production**

Instant rollback, no rebuild needed.

---

## Environment Variable Updates

1. Vercel Dashboard → Project → **Settings** → **Environment Variables**
2. Edit or add the variable
3. **Redeploy** the production deployment (required for changes to take effect)

---

## WalletConnect Project Setup

1. Go to [cloud.walletconnect.com](https://cloud.walletconnect.com)
2. Create new project → name it `henlo-faucet`
3. Set **Allowed Domains** to your Vercel URL (e.g., `henlo-faucet.vercel.app`)
4. Copy the **Project ID** → set as `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in Vercel
5. Redeploy

> **Security**: Add only your production and preview domains to the WC allowed list. This prevents other sites from using your project quota.
