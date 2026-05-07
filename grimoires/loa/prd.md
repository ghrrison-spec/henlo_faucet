# Product Requirements Document — henlo_faucet

> **Status**: Draft  
> **Created**: 2026-05-07  
> **Cycle**: cycle-001  
> **Author**: Discovery interview, Phase 1–7  

---

## 1. Problem Statement

Community members of the HENLO token ecosystem on Berachain want a simple, trust-minimized way to claim a small amount of HENLO tokens without needing to buy them or perform complex on-chain actions. Without a faucet, new community members have a high barrier to participate in the ecosystem — they either need to purchase tokens on a DEX or receive them from a community member directly.

The faucet removes that friction: any wallet can claim a small fixed amount of HENLO per day, enabling grassroots community growth and token distribution.

> Sources: Phase 1 discovery interview

---

## 2. Goals & Success Metrics

### Business Goals

- Lower the barrier to HENLO token acquisition for new community members
- Drive wallet-level engagement with the HENLO ecosystem on Berachain
- Distribute tokens organically without centralized airdrop management

### Success Metrics

| Metric | Target |
|--------|--------|
| Daily unique claimants | ≥ 50 within first month |
| Claim success rate | ≥ 95% (no failed txns due to UI bugs) |
| Time-to-claim (wallet connected → tx confirmed) | ≤ 60 seconds |
| Faucet uptime | ≥ 99% |

### Out of Scope for v1

- Social auth / Proof of humanity gating
- Tiered claim amounts by on-chain activity
- Admin dashboard UI (contract owner manages via block explorer)
- Multi-token support

---

## 3. User & Stakeholder Context

### Primary Persona: Community Member (Claimer)

- **Who**: Anyone curious about Berachain / HENLO — likely already has a Berachain-compatible wallet (MetaMask, Rabby, Bear Wallet)
- **Goal**: Claim free HENLO quickly without signing up or creating an account
- **Pain points**: Gas costs (on Berachain, gas is paid in BERA), confusing wallet prompts, slow feedback on claim status
- **Technical level**: Comfortable with Web3 wallets, may be new to Berachain specifically

### Secondary Persona: Token Treasury Admin

- **Who**: Project team member / contract owner
- **Goal**: Monitor faucet health, adjust claim amounts if needed (via contract directly)
- **Constraint**: All admin actions happen through the deployed contract — no admin UI in v1

### Stakeholder: 0xHoneyJar Team

- Wants a polished, on-brand experience consistent with Berachain's playful aesthetic
- Needs the codebase to be maintainable and extensible

---

## 4. Functional Requirements

### FR-1: Wallet Connection

- **FR-1.1**: User can connect any EVM-compatible wallet (MetaMask, Rabby, WalletConnect, Coinbase Wallet)
- **FR-1.2**: App displays connected wallet address (truncated: `0x1234...abcd`)
- **FR-1.3**: User can disconnect wallet
- **FR-1.4**: App detects if user is on wrong network and prompts to switch to Berachain mainnet

### FR-2: Claim Flow

- **FR-2.1**: User sees current claimable HENLO amount before connecting wallet
- **FR-2.2**: Connected user sees their eligibility status:
  - **Eligible**: "Claim X HENLO" button active
  - **Cooldown**: "Come back in HH:MM:SS" countdown, button disabled
  - **Already claimed today**: Clear message with next available time
- **FR-2.3**: User clicks claim → wallet prompts for transaction signature
- **FR-2.4**: App shows transaction pending state with tx hash link to Berachain explorer
- **FR-2.5**: App shows success state after tx confirmation with updated next-claim time
- **FR-2.6**: App handles tx failure gracefully (user rejection, out of gas, contract revert) with clear error message

### FR-3: Faucet Status Display

- **FR-3.1**: Display current faucet token balance (so users know if it has tokens)
- **FR-3.2**: Display claim amount per period
- **FR-3.3**: Display cooldown period (e.g., "once per 24 hours")
- **FR-3.4**: If faucet is empty, show "Faucet temporarily empty" and disable claim button

### FR-4: Contract Integration

- **FR-4.1**: App reads claim eligibility by querying the deployed faucet contract
- **FR-4.2**: App calls the contract's claim function
- **FR-4.3**: All contract addresses and ABIs are configurable via environment variables (no hardcoded mainnet addresses in source)

---

## 5. Technical & Non-Functional Requirements

### NFR-1: Stack

- **Frontend**: Next.js 14+ (App Router) + React — SSR for fast initial load, easy Vercel deployment
- **Web3 layer**: wagmi v2 + viem — current standard for EVM React apps, Berachain-compatible
- **Wallet UI**: RainbowKit — polished multi-wallet connect with chain switching built in
- **Styling**: Tailwind CSS — fast iteration, consistent design
- **Language**: TypeScript throughout

> Recommendation rationale: Next.js + wagmi/viem + RainbowKit is the dominant Web3 frontend stack as of 2026. It has first-class Berachain support via viem's chain definitions. Vercel deployment is free and trivially simple.

### NFR-2: Performance

- Initial page load: ≤ 2s on average connection
- Claim eligibility check: ≤ 500ms after wallet connect (single RPC call)

### NFR-3: Security

- No private keys in frontend (read-only except user-initiated transactions)
- Contract address and ABI loaded from env vars, not embedded in source
- No backend required — pure frontend + on-chain reads/writes
- Rate limit enforcement is **entirely on-chain** (faucet contract) — the UI is purely presentational

### NFR-4: Compatibility

- Berachain mainnet (chain ID TBD — confirm from deployed contract)
- Modern browsers: Chrome, Firefox, Safari, Edge (last 2 major versions)
- Mobile wallet support via WalletConnect v2

### NFR-5: Deployment

- Static export or Vercel deployment
- Environment variables for all chain-specific config (contract address, RPC URL, token address)

---

## 6. Scope & Prioritization

### MVP (v1) — In Scope

- Single-page claim UI with wallet connect
- Eligibility check (cooldown display + countdown)
- Claim transaction flow (pending → success → error states)
- Faucet balance display
- Network switching prompt (if not on Berachain)
- RainbowKit wallet modal
- Responsive design (desktop + mobile)

### Not in Scope (v1)

- Admin dashboard
- Social auth gating
- Multi-token support
- Analytics dashboard
- Email/push notifications
- Leaderboard / claim history

---

## 7. Risks & Dependencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Deployed contract ABI not yet available | Medium | High | Request ABI + address from team before architecture phase |
| Berachain RPC reliability | Medium | Medium | Use a reliable RPC provider (Berachain public RPC or Alchemy) |
| wagmi/viem Berachain chain support | Low | High | viem has `berachain` chain definition; verify before building |
| Faucet runs out of tokens | High | Medium | Display faucet balance prominently; contract owner monitors separately |
| User confusion about Berachain gas (BERA required) | Medium | Medium | Show clear message if user has no BERA for gas |

### External Dependencies

- Deployed faucet contract (address + ABI needed for architecture phase)
- Berachain mainnet RPC endpoint
- Vercel account for deployment (or alternative static host)

---

## 8. Open Questions

- [ ] What is the deployed faucet contract address on Berachain mainnet?
- [ ] What is the contract ABI? (specifically: claim function signature, cooldown check function, balance read)
- [ ] What is the HENLO token contract address?
- [ ] What is the exact claim amount and cooldown period configured in the contract?
- [ ] What is the Berachain mainnet chain ID?
- [ ] Are there any existing brand guidelines / design assets for HENLO?

---

*Generated by Loa /plan-and-analyze — 2026-05-07*
