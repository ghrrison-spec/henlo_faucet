# henlo faucet

A Y2K-styled faucet UI for claiming daily HENLO tokens on Berachain mainnet. All rate limiting is enforced on-chain — the frontend is purely presentational.

**Contract**: `0x701A9A14F7f4a79225059D4AE88A6F16794C212d` on Berachain mainnet (chain ID 80094)

## Getting Started

```bash
pnpm install
cp .env.local.example .env.local
# fill in your WalletConnect project ID
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FAUCET_ADDRESS` | Yes | HenloFaucet contract address. Default: `0x701A9A14F7f4a79225059D4AE88A6F16794C212d` |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | Yes | WalletConnect Cloud project ID. Get one at [cloud.walletconnect.com](https://cloud.walletconnect.com). Use `demo` for local dev only. |
| `NEXT_PUBLIC_RPC_URL` | No | Berachain RPC endpoint. Defaults to the public `https://rpc.berachain.com/` via viem's built-in. |

## Deploy to Vercel

1. Push to GitHub
2. Import repo in [Vercel](https://vercel.com/new)
3. Set environment variables:
   - `NEXT_PUBLIC_FAUCET_ADDRESS` — contract address
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` — your WC project ID
   - `NEXT_PUBLIC_RPC_URL` — (optional) dedicated RPC URL
4. Deploy

## Tech Stack

- **Next.js 15** — App Router, Server Components
- **wagmi v2 + viem v2** — contract reads (multicall) and write (claim tx)
- **RainbowKit v2** — wallet connection UI
- **Tailwind CSS** — Y2K styling with brand palette
- **Berachain mainnet** — chain ID 80094, explorer [berascan.com](https://berascan.com)

## Claim Flow

1. Connect wallet (RainbowKit)
2. Frontend reads `canClaim(address)`, `claimAmount()`, faucet HENLO balance
3. If eligible: click claim → `claim()` tx → confirm in wallet → success overlay
4. Cooldown tracked by `nextClaimDay(address)` — resets at UTC midnight

## Development

```bash
pnpm dev      # local dev server
pnpm build    # production build (checks types)
pnpm lint     # ESLint
```
