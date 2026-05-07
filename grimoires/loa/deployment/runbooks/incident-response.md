# Runbook — Incident Response

---

## Deploy Failure

**Symptom**: Vercel build email shows failure; production still serves old version.

**Steps**:
1. Check Vercel Dashboard → Deployments → click failed deploy → read build logs
2. Common causes:
   - TypeScript error: run `pnpm build` locally, fix type errors
   - Missing env var: check Vercel Settings → Env Vars, add missing var
   - Dependency resolution: delete `node_modules/.pnpm` and re-run
3. Push fix → auto-redeploy triggers

---

## RPC Error State Showing for All Users

**Symptom**: FaucetStats shows red error banner; ClaimCard shows RPC_ERROR with RETRY.

**Diagnosis**: Berachain public RPC is degraded.

**Steps**:
1. Verify at [berascan.com](https://berascan.com) — does it load? If yes, RPC might still work.
2. Test RPC directly:
   ```bash
   curl -s -X POST https://rpc.berachain.com/ \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
   ```
3. If RPC is down: update `NEXT_PUBLIC_RPC_URL` to an alternative:
   - `https://rpc.ankr.com/berachain` (Ankr)
   - `https://berachain.drpc.org` (dRPC)
4. Redeploy on Vercel (new env var takes effect on next build)

---

## Wallet Connect Modal Not Working

**Symptom**: RainbowKit modal opens but wallet connections fail; WalletConnect QR code doesn't generate.

**Diagnosis**: WalletConnect project ID issue or relay down.

**Steps**:
1. Check [status.walletconnect.com](https://status.walletconnect.com) for relay outage
2. If relay is up: verify `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set in Vercel and is valid
3. Check WC Cloud dashboard: is the project's allowed domain list correct?
4. MetaMask browser extension connects directly (doesn't use WC relay) — users can use that as fallback

---

## Rollback Procedure

**When**: A deploy breaks the UI or causes console errors.

**Steps**:
1. Vercel Dashboard → `henlo_faucet` → **Deployments**
2. Find last known-good deployment (check timestamps)
3. Click `...` → **Promote to Production**
4. Verify production URL is serving the rolled-back version
5. Investigate the breaking change and fix before re-deploying

---

## Contract Paused (Expected State)

**Symptom**: All users see PAUSED state in ClaimCard.

**This is expected behavior**. The contract owner has called `pause()`.

**No action needed from frontend**. The UI reads `paused()` from the contract and displays the appropriate state automatically.

---

## Faucet Empty (Expected State)

**Symptom**: All users see EMPTY state in ClaimCard.

**This is expected behavior**. The faucet's HENLO balance is 0.

**No action needed from frontend**. The contract owner needs to send HENLO tokens to the faucet contract address: `0x701A9A14F7f4a79225059D4AE88A6F16794C212d`.
