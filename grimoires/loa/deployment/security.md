# Security Configuration — henlo_faucet

---

## HTTP Security Headers

Applied via both `next.config.ts` and `vercel.json` (belt-and-suspenders):

| Header | Value | Purpose |
|--------|-------|---------|
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `X-DNS-Prefetch-Control` | `on` | Performance (DNS pre-resolve) |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Disable unused browser APIs |

### Deferred: Content Security Policy

CSP was deliberately deferred through all sprints. Reason: RainbowKit v2 uses `@walletconnect/ethereum-provider` which connects to multiple relay domains, and MetaMask SDK uses `blob:` workers. A CSP that's too strict silently breaks wallet connectors.

**Recommended approach post-deploy**:
1. Deploy to Vercel (no CSP)
2. Open browser DevTools → Network tab → note all external origins loaded
3. Check Console for any `Content-Security-Policy` violation reports
4. Construct CSP using observed origins

**Expected origins for CSP**:
```
connect-src:  https://rpc.berachain.com
              wss://*.walletconnect.com https://*.walletconnect.com
              wss://*.walletconnect.org https://*.walletconnect.org
              https://*.web3modal.com
script-src:   'self' 'unsafe-eval'  (wagmi requires eval for provider detection)
style-src:    'self' 'unsafe-inline'
img-src:      'self' data: blob: https://*.walletconnect.com
worker-src:   blob:
```

> `'unsafe-eval'` is required by wagmi/MetaMask SDK. Without it, MetaMask connector silently fails.

---

## Secrets Management

| Secret | Where Stored | Rotation |
|--------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Vercel env vars | Rotate if leaked; update in WC Cloud + Vercel |
| `NEXT_PUBLIC_FAUCET_ADDRESS` | Vercel env vars | Only changes if contract redeployed |
| `NEXT_PUBLIC_RPC_URL` | Vercel env vars | Rotate if using paid RPC with API key in URL |

> All three are `NEXT_PUBLIC_*` — they are sent to the browser. Do not use them for secrets that must remain server-side.

---

## Access Control

| Resource | Access | Notes |
|----------|--------|-------|
| Vercel project | Owner account only | Enable 2FA on Vercel account |
| GitHub repo | Owner / team | Enable branch protection on `main` |
| WalletConnect project | Owner account only | Enable 2FA on WC Cloud |
| Contract admin | Contract owner wallet | Not managed by this UI |

---

## No Backend = Minimal Attack Surface

This app has no:
- Server-side API routes
- Database
- Authentication system
- Session management
- File uploads

The only sensitive operation is contract interaction — executed by the user's own wallet. The UI cannot sign transactions on behalf of users.

---

## Incident Response

| Incident | Response |
|----------|----------|
| XSS discovered | Patch → deploy via GitHub push → auto-deploys in ~90s |
| WC project ID leaked | Rotate in WC Cloud → update Vercel env var → redeploy |
| Malicious RPC response | App reads from RPC but displays only typed data (bigints); no eval of RPC output |
| Contract paused | UI automatically shows PAUSED state (reads `paused()`) |
| Faucet empty | UI automatically shows EMPTY state (reads ERC-20 `balanceOf`) |
