'use client';

import { useEffect } from 'react';
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { useQueryClient } from '@tanstack/react-query';
import { faucetAbi } from '@/abi/faucet';
import { FAUCET_ADDRESS } from '@/lib/constants';

export interface UseClaimResult {
  claim: () => void;
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  isError: boolean;
  txHash: `0x${string}` | undefined;
  error: Error | null;
  reset: () => void;
}

export function useClaim(): UseClaimResult {
  const queryClient = useQueryClient();

  const {
    writeContract,
    data: txHash,
    isPending,
    isError: isWriteError,
    error: writeError,
    reset: resetWrite,
  } = useWriteContract();

  const {
    isPending: isReceiptPending,
    isSuccess,
    isError: isReceiptError,
    error: receiptError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
    query: { enabled: Boolean(txHash) },
  });

  // In TanStack Query v5, a disabled query with no data returns isPending=true.
  // Only treat as confirming when we actually have a txHash in flight.
  const isConfirming = Boolean(txHash) && isReceiptPending;

  // Invalidate all wagmi query cache on confirmation so useFaucet refetches
  useEffect(() => {
    if (isSuccess) {
      void queryClient.invalidateQueries();
    }
  }, [isSuccess, queryClient]);

  const claim = () => {
    writeContract({
      address: FAUCET_ADDRESS,
      abi: faucetAbi,
      functionName: 'claim',
    });
  };

  return {
    claim,
    isPending,
    isConfirming,
    isSuccess,
    isError: isWriteError || isReceiptError,
    txHash,
    error: (writeError ?? receiptError ?? null) as Error | null,
    reset: resetWrite,
  };
}
