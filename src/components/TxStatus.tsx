'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { BERACHAIN_EXPLORER_URL } from '@/lib/constants';
import type { UseClaimResult } from '@/hooks/useClaim';

interface TxStatusProps {
  claimState: Pick<UseClaimResult, 'isPending' | 'isConfirming' | 'isSuccess' | 'isError' | 'txHash' | 'error' | 'reset'>;
  nextClaimDay?: bigint;
}

function brandError(error: Error | null): string {
  if (!error) return 'SOMETHING WENT WRONG. ooga booga.';
  const msg = error.message.toLowerCase();
  if (msg.includes('user rejected') || msg.includes('denied') || msg.includes('cancelled')) {
    return 'TRANSACTION CANCELLED. poku understands.';
  }
  if (msg.includes('enforcedpause') || msg.includes('paused')) {
    return 'FAUCET PAUSED. poku is unbothered.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
    return 'NETWORK OOGA. try again.';
  }
  if (msg.includes('already claimed') || msg.includes('cooldown') || msg.includes('wait')) {
    return 'ALREADY CLAIMED TODAY. ooga booga. come back tomorrow.';
  }
  return 'CLAIM FAILED. check console for details.';
}

const COINS = ['🪙', '💛', '⭐', '🐾', '✨'];

function CoinRain() {
  const coins = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    emoji: COINS[i % COINS.length],
    left: `${Math.random() * 100}%`,
    duration: `${0.6 + Math.random() * 0.8}s`,
    delay: `${Math.random() * 0.6}s`,
  }));

  return (
    <>
      {coins.map((c) => (
        <span
          key={c.id}
          className="coin"
          style={
            {
              left: c.left,
              '--duration': c.duration,
              '--delay': c.delay,
            } as React.CSSProperties
          }
        >
          {c.emoji}
        </span>
      ))}
    </>
  );
}

export default function TxStatus({ claimState, nextClaimDay }: TxStatusProps) {
  const { isPending, isConfirming, isSuccess, isError, txHash, error, reset } = claimState;
  const [showJackpot, setShowJackpot] = useState(false);

  useEffect(() => {
    if (isSuccess) {
      setShowJackpot(true);
      const t = setTimeout(() => setShowJackpot(false), 3000);
      return () => clearTimeout(t);
    }
  }, [isSuccess]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Image
          src="/poku-flamethrower.png"
          alt="poku flamethrower"
          width={80}
          height={80}
          className="animate-bounce"
        />
        <p className="font-vt323 text-brand-yellow text-xl tracking-widest animate-blink">
          CONFIRM IN WALLET...
        </p>
        <p className="font-vt323 text-brand-grey text-sm">
          check your wallet for a signing prompt
        </p>
      </div>
    );
  }

  if (isConfirming) {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Image
          src="/poku-flamethrower.png"
          alt="poku flamethrower"
          width={80}
          height={80}
          className="animate-bounce"
        />
        <p className="font-vt323 text-brand-yellow text-xl tracking-widest animate-blink">
          TRANSACTION SUBMITTED...
        </p>
        {txHash && (
          <a
            href={`${BERACHAIN_EXPLORER_URL}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-vt323 text-brand-blue text-sm hover:underline"
          >
            [{txHash.slice(0, 10)}...{txHash.slice(-6)}] ↗
          </a>
        )}
      </div>
    );
  }

  if (isError) {
    if (error) console.error('[henlo faucet] claim error:', error);
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <Image
          src="/poku-firehead.png"
          alt="poku firehead"
          width={80}
          height={80}
        />
        <p className="font-vt323 text-brand-red text-lg tracking-wide text-center px-2">
          {brandError(error)}
        </p>
        <button
          onClick={reset}
          className="font-black-han text-xs tracking-widest uppercase px-4 py-2 border-2 border-brand-yellow text-brand-yellow bg-black hover:bg-brand-yellow hover:text-black transition-colors duration-150"
        >
          [ TRY AGAIN ]
        </button>
      </div>
    );
  }

  if (showJackpot) {
    return (
      <>
        <CoinRain />
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 cursor-pointer"
          onClick={() => setShowJackpot(false)}
        >
          <div className="border-4 border-brand-yellow bg-black p-10 text-center shadow-[0_0_60px_#F3C734]">
            <Image
              src="/poku-wave.png"
              alt="poku wave"
              width={120}
              height={120}
              className="mx-auto mb-4 animate-bounce"
            />
            <h2 className="font-sixtyfour text-brand-yellow text-4xl tracking-widest mb-2">
              HENLO SECURED
            </h2>
            <p className="font-vt323 text-brand-green text-2xl tracking-widest">
              TOKENS CLAIMED. ooga booga! 🐾
            </p>
            {txHash && (
              <a
                href={`${BERACHAIN_EXPLORER_URL}/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 font-vt323 text-brand-blue text-sm hover:underline"
              >
                view transaction ↗
              </a>
            )}
            <p className="font-vt323 text-brand-grey text-sm mt-4 animate-blink">
              (click to dismiss)
            </p>
          </div>
        </div>
      </>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <Image
          src="/poku-wave.png"
          alt="poku wave"
          width={80}
          height={80}
        />
        <p className="font-vt323 text-brand-green text-xl tracking-widest">
          HENLO CLAIMED! 🐾
        </p>
        {nextClaimDay !== undefined && (
          <p className="font-vt323 text-brand-grey text-sm">
            come back tomorrow for more
          </p>
        )}
      </div>
    );
  }

  return null;
}
