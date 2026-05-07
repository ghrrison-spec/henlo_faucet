'use client';

import { useReadContracts, useReadContract } from 'wagmi';
import { erc20Abi, zeroAddress, type Address } from 'viem';
import { faucetAbi } from '@/abi/faucet';
import { FAUCET_ADDRESS } from '@/lib/constants';

export interface UseFaucetResult {
  dripAmount: bigint | undefined;
  paused: boolean | undefined;
  henloTokenAddress: Address | undefined;
  faucetBalance: bigint | undefined;
  canClaim: boolean | undefined;
  nextClaimDay: bigint | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

export function useFaucet(userAddress?: Address): UseFaucetResult {
  const faucet = { address: FAUCET_ADDRESS, abi: faucetAbi } as const;

  // Global reads — always on
  const {
    data: globalData,
    isLoading: isGlobalLoading,
    isError: isGlobalError,
    refetch: refetchGlobal,
  } = useReadContracts({
    contracts: [
      { ...faucet, functionName: 'claimAmount' },
      { ...faucet, functionName: 'paused' },
      { ...faucet, functionName: 'henloToken' },
    ] as const,
  });

  // User-specific reads — gated on address
  const {
    data: userData,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useReadContracts({
    contracts: [
      { ...faucet, functionName: 'canClaim', args: [userAddress ?? zeroAddress] },
      { ...faucet, functionName: 'nextClaimDay', args: [userAddress ?? zeroAddress] },
    ] as const,
    query: { enabled: Boolean(userAddress) },
  });

  const henloTokenAddress = globalData?.[2]?.result as Address | undefined;

  // Dependent read: faucet's HENLO balance from ERC-20
  const {
    data: faucetBalance,
    isLoading: isBalanceLoading,
    refetch: refetchBalance,
  } = useReadContract({
    address: henloTokenAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [FAUCET_ADDRESS],
    query: { enabled: Boolean(henloTokenAddress) },
  });

  const refetch = () => {
    void refetchGlobal();
    void refetchUser();
    void refetchBalance();
  };

  return {
    dripAmount: globalData?.[0]?.result as bigint | undefined,
    paused: globalData?.[1]?.result as boolean | undefined,
    henloTokenAddress,
    faucetBalance: faucetBalance as bigint | undefined,
    canClaim: userAddress ? (userData?.[0]?.result as boolean | undefined) : undefined,
    nextClaimDay: userAddress ? (userData?.[1]?.result as bigint | undefined) : undefined,
    isLoading: isGlobalLoading || isUserLoading || isBalanceLoading,
    isError: isGlobalError,
    refetch,
  };
}
