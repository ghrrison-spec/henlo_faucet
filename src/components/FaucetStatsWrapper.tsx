'use client';

import { useAccount } from 'wagmi';
import { useFaucet } from '@/hooks/useFaucet';
import FaucetStats from './FaucetStats';

export default function FaucetStatsWrapper() {
  const { address } = useAccount();
  const { dripAmount, faucetBalance, isLoading, isError } = useFaucet(address);

  return (
    <FaucetStats
      dripAmount={dripAmount}
      faucetBalance={faucetBalance}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
