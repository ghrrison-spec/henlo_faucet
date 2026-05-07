import { isAddress } from 'viem';

const rawFaucetAddress = process.env.NEXT_PUBLIC_FAUCET_ADDRESS;
if (!rawFaucetAddress) throw new Error('NEXT_PUBLIC_FAUCET_ADDRESS is not set');
if (!isAddress(rawFaucetAddress)) {
  throw new Error(`NEXT_PUBLIC_FAUCET_ADDRESS "${rawFaucetAddress}" is not a valid Ethereum address`);
}
export const FAUCET_ADDRESS = rawFaucetAddress as `0x${string}`;

export const BERACHAIN_EXPLORER_URL = 'https://berascan.com';

export const BERACHAIN_CHAIN_ID = 80094;
