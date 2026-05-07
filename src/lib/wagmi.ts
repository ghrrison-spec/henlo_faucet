'use client';

import { http } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { berachain } from 'viem/chains';

export const wagmiConfig = getDefaultConfig({
  appName: 'henlo faucet',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'demo',
  chains: [berachain],
  transports: {
    [berachain.id]: http(process.env.NEXT_PUBLIC_RPC_URL || undefined),
  },
  ssr: true,
});
