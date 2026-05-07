'use client';

import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { BERACHAIN_CHAIN_ID } from '@/lib/constants';

export default function NetworkGuard({ children }: { children: React.ReactNode }) {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== BERACHAIN_CHAIN_ID;

  if (!isWrongNetwork) return <>{children}</>;

  return (
    <>
      {/* Construction banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-brand-yellow text-black py-2 overflow-hidden">
        <div className="whitespace-nowrap animate-marquee font-black-han text-sm tracking-widest uppercase">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i}>
              ⚠ WRONG NETWORK — SWITCH TO BERACHAIN MAINNET &nbsp;&nbsp;
            </span>
          ))}
        </div>
      </div>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 pt-10">
        <div className="border-2 border-brand-yellow bg-black p-8 text-center max-w-sm">
          <div className="font-vt323 text-brand-yellow text-6xl mb-4">⚠</div>
          <p className="font-black-han text-brand-yellow tracking-widest uppercase text-sm mb-2">
            Wrong Network
          </p>
          <p className="font-vt323 text-brand-grey text-xl mb-6">
            poku needs berachain mainnet
          </p>
          <button
            onClick={() => switchChain?.({ chainId: BERACHAIN_CHAIN_ID })}
            className="font-black-han text-sm tracking-widest uppercase px-6 py-3 border-2 border-brand-yellow text-brand-yellow bg-black hover:bg-brand-yellow hover:text-black transition-colors duration-150"
          >
            [ SWITCH NETWORK ]
          </button>
        </div>
      </div>
      {children}
    </>
  );
}
