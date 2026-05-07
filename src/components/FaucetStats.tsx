'use client';

import { formatTokenAmount } from '@/lib/utils';

interface FaucetStatsProps {
  dripAmount: bigint | undefined;
  faucetBalance: bigint | undefined;
  isLoading: boolean;
  isError?: boolean;
}

function StatBox({
  label,
  value,
  icon,
  isLoading,
}: {
  label: string;
  value: string | undefined;
  icon: string;
  isLoading: boolean;
}) {
  return (
    <div className="border-2 border-brand-green bg-black px-6 py-4 flex-1 min-w-[180px]">
      <div className="font-black-han text-brand-green text-xs tracking-widest uppercase mb-1">
        {icon} {label}
      </div>
      <div className="font-vt323 text-brand-green text-4xl tracking-wider">
        {isLoading || value === undefined ? (
          <span className="animate-blink text-brand-yellow">---</span>
        ) : (
          <>{value} <span className="text-2xl text-brand-grey">HENLO</span></>
        )}
      </div>
    </div>
  );
}

export default function FaucetStats({ dripAmount, faucetBalance, isLoading, isError }: FaucetStatsProps) {
  const dripFormatted = dripAmount !== undefined ? formatTokenAmount(dripAmount) : undefined;
  const balanceFormatted = faucetBalance !== undefined ? formatTokenAmount(faucetBalance) : undefined;

  if (isError) {
    return (
      <div className="flex gap-3 w-full max-w-xl mx-auto">
        <div className="border-2 border-brand-red/40 bg-black px-6 py-4 flex-1 min-w-[180px]">
          <div className="font-vt323 text-brand-red text-sm tracking-widest animate-blink">
            ⚠ RPC ERROR — FAUCET DATA UNAVAILABLE
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xl mx-auto">
      <StatBox
        label="Daily Drip"
        value={dripFormatted}
        icon="🪙"
        isLoading={isLoading}
      />
      <StatBox
        label="Faucet Balance"
        value={balanceFormatted}
        icon="💰"
        isLoading={isLoading}
      />
    </div>
  );
}
