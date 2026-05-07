'use client';

import { useBalance, useReadContract } from 'wagmi';
import type { Address } from 'viem';
import { faucetAbi } from '@/abi/faucet';
import { FAUCET_ADDRESS } from '@/lib/constants';

export interface UseBeraBalanceResult {
  beraBalance: bigint | undefined;
  minBera: bigint | undefined;
  hasEnoughBera: boolean | undefined;
  isLoading: boolean;
}

export function useBeraBalance(userAddress?: Address): UseBeraBalanceResult {
  const { data: balanceData, isLoading: isBalanceLoading } = useBalance({
    address: userAddress,
    query: { enabled: Boolean(userAddress) },
  });

  const { data: minBera, isLoading: isMinBeraLoading } = useReadContract({
    address: FAUCET_ADDRESS,
    abi: faucetAbi,
    functionName: 'MIN_BERA',
  });

  const beraBalance = balanceData?.value;

  let hasEnoughBera: boolean | undefined;
  if (beraBalance !== undefined && minBera !== undefined) {
    // MIN_BERA === 0n means no minimum required
    hasEnoughBera = minBera === 0n ? true : beraBalance >= minBera;
  }

  return {
    beraBalance,
    minBera,
    hasEnoughBera,
    isLoading: isBalanceLoading || isMinBeraLoading,
  };
}
