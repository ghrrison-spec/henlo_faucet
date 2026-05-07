'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { useAccount, useChainId } from 'wagmi';
import { useFaucet } from '@/hooks/useFaucet';
import { useBeraBalance } from '@/hooks/useBeraBalance';
import { useClaim } from '@/hooks/useClaim';
import CountdownTimer from './CountdownTimer';
import TxStatus from './TxStatus';
import { formatTokenAmount } from '@/lib/utils';
import { BERACHAIN_CHAIN_ID } from '@/lib/constants';

type ClaimState =
  | 'DISCONNECTED'
  | 'WRONG_NETWORK'
  | 'LOADING'
  | 'RPC_ERROR'
  | 'PAUSED'
  | 'EMPTY'
  | 'NO_BERA'
  | 'COOLDOWN'
  | 'ELIGIBLE'
  | 'PENDING'
  | 'CONFIRMING'
  | 'SUCCESS'
  | 'ERROR';

const STATE_IMAGE: Record<ClaimState, string> = {
  DISCONNECTED: '/poku-briefcase.png',
  WRONG_NETWORK: '/poku-briefcase.png',
  LOADING: '/poku-briefcase.png',
  RPC_ERROR: '/poku-firehead.png',
  PAUSED: '/poku-matches.png',
  EMPTY: '/poku-fireeyes.png',
  NO_BERA: '/poku-helmet.png',
  COOLDOWN: '/poku-sitting-fire.png',
  ELIGIBLE: '/poku-briefcase.png',
  PENDING: '/poku-flamethrower.png',
  CONFIRMING: '/poku-flamethrower.png',
  SUCCESS: '/poku-wave.png',
  ERROR: '/poku-firehead.png',
};

function Staple({ className }: { className: string }) {
  return (
    <div
      className={`absolute w-3 h-1.5 bg-brand-grey/60 ${className}`}
      aria-hidden="true"
    />
  );
}

function Tape({ className }: { className: string }) {
  return (
    <div
      className={`absolute w-12 h-4 bg-brand-yellow/30 rotate-[-3deg] ${className}`}
      aria-hidden="true"
    />
  );
}

function DisabledClaimButton({ label }: { label: string }) {
  return (
    <button
      disabled
      aria-disabled="true"
      className="mt-2 w-full font-black-han text-xs tracking-widest uppercase py-3 bg-brand-grey/10 text-brand-grey/30 border-2 border-brand-grey/20 cursor-not-allowed"
    >
      {label}
    </button>
  );
}

export default function ClaimCard() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    dripAmount,
    paused,
    faucetBalance,
    canClaim,
    nextClaimDay,
    isLoading: isFaucetLoading,
    isError: isFaucetError,
    refetch,
  } = useFaucet(address);

  const { hasEnoughBera, minBera, isLoading: isBeraLoading } = useBeraBalance(address);

  const claimHook = useClaim();
  const { claim, isPending, isConfirming, isSuccess, isError, reset } = claimHook;

  const isLoading = isFaucetLoading || isBeraLoading;

  // Optimistic: stay in COOLDOWN after a successful claim until canClaim refetch confirms false
  const [justClaimed, setJustClaimed] = useState(false);
  useEffect(() => {
    if (isSuccess) setJustClaimed(true);
  }, [isSuccess]);
  useEffect(() => {
    if (canClaim === false) setJustClaimed(false);
  }, [canClaim]);
  // Clear on address change — different wallet must not inherit prior wallet's claim state
  useEffect(() => {
    setJustClaimed(false);
  }, [address]);

  // Optimistic nextClaimDay: use tomorrow's day number until refetch resolves
  const optimisticNextDay: bigint | undefined =
    justClaimed && canClaim !== false
      ? BigInt(Math.floor(Date.now() / 86_400_000) + 1)
      : nextClaimDay;

  // Focus management: move focus to status region after success
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isSuccess && statusRef.current) {
      statusRef.current.focus();
    }
  }, [isSuccess]);

  // Derive state — tx states always win over data-derived states
  let state: ClaimState = 'DISCONNECTED';
  if (!isConnected) {
    state = 'DISCONNECTED';
  } else if (chainId !== BERACHAIN_CHAIN_ID) {
    state = 'WRONG_NETWORK';
  } else if (isPending) {
    state = 'PENDING';
  } else if (isConfirming) {
    state = 'CONFIRMING';
  } else if (isSuccess) {
    state = 'SUCCESS';
  } else if (isError) {
    state = 'ERROR';
  } else if (isLoading) {
    state = 'LOADING';
  } else if (isFaucetError) {
    state = 'RPC_ERROR';
  } else if (paused) {
    state = 'PAUSED';
  } else if (faucetBalance === 0n) {
    state = 'EMPTY';
  } else if (hasEnoughBera === false) {
    state = 'NO_BERA';
  } else if (canClaim === false || justClaimed) {
    state = 'COOLDOWN';
  } else if (canClaim === true) {
    state = 'ELIGIBLE';
  }

  const dripFormatted = dripAmount !== undefined ? formatTokenAmount(dripAmount) : '???';
  const minBeraFormatted = minBera !== undefined ? formatTokenAmount(minBera, 18) : '???';

  return (
    <div
      className="relative paper-texture border border-brand-ink/20 p-6 max-w-xs w-full mx-auto"
      style={{
        transform: 'rotate(-0.8deg)',
        boxShadow: '8px 8px 0 rgba(0,0,0,0.6)',
        fontFamily: 'var(--font-special-elite)',
      }}
    >
      {/* Staples */}
      <Staple className="top-3 left-6" />
      <Staple className="top-3 right-6" />
      <Staple className="bottom-3 left-6" />
      <Staple className="bottom-3 right-6" />

      {/* Tape pieces */}
      <Tape className="-top-2 left-1/3" />
      <Tape className="-top-2 right-1/4 rotate-[2deg]" />

      {/* Poku image */}
      <div className="flex justify-center mb-3 mt-2">
        <Image
          src={STATE_IMAGE[state]}
          alt="poku"
          width={90}
          height={90}
          className="drop-shadow-sm"
          priority
        />
      </div>

      {/* State content */}
      <div className="text-center min-h-[120px] flex flex-col items-center justify-center gap-3">
        {state === 'DISCONNECTED' && (
          <>
            <p className="font-special-elite text-brand-ink text-lg font-bold uppercase tracking-wide">
              CONNECT WALLET<br />TO CLAIM
            </p>
            <p className="font-vt323 text-brand-ink/60 text-sm">
              free henlo for all 🐾
            </p>
          </>
        )}

        {state === 'WRONG_NETWORK' && (
          <p className="font-special-elite text-brand-ink text-sm uppercase tracking-wide">
            ⚠ SWITCH TO BERACHAIN MAINNET ⚠
          </p>
        )}

        {state === 'LOADING' && (
          <div className="font-vt323 text-brand-ink/60 text-2xl animate-blink tracking-widest">
            LOADING...
          </div>
        )}

        {state === 'RPC_ERROR' && (
          <>
            <p className="font-special-elite text-brand-red text-base uppercase tracking-wide font-bold">
              UNABLE TO LOAD FAUCET
            </p>
            <p className="font-vt323 text-brand-ink/60 text-sm">
              rpc hiccup. poku is on it.
            </p>
            <button
              onClick={refetch}
              className="font-black-han text-xs tracking-widest uppercase px-4 py-2 border-2 border-brand-yellow text-brand-yellow bg-black hover:bg-brand-yellow hover:text-black transition-colors duration-150"
            >
              [ RETRY ]
            </button>
          </>
        )}

        {state === 'PAUSED' && (
          <>
            <div className="construction-stripe w-full py-1" />
            <p className="font-special-elite text-brand-ink text-base uppercase tracking-wide font-bold">
              FAUCET PAUSED
            </p>
            <p className="font-vt323 text-brand-ink/60 text-sm">
              poku is unbothered. check back later.
            </p>
            <div className="construction-stripe w-full py-1" />
            <DisabledClaimButton label="FAUCET PAUSED" />
          </>
        )}

        {state === 'EMPTY' && (
          <>
            <p className="font-special-elite text-brand-ink text-base uppercase tracking-wide font-bold">
              FAUCET TEMPORARILY EMPTY
            </p>
            <p className="font-vt323 text-brand-ink/60 text-sm">
              poku is very hungry
            </p>
            <DisabledClaimButton label="FAUCET EMPTY" />
          </>
        )}

        {state === 'NO_BERA' && (
          <>
            <p className="font-special-elite text-brand-ink text-base uppercase tracking-wide font-bold">
              U NEED BERA FOR GAS
            </p>
            <p className="font-vt323 text-brand-ink/60 text-sm">
              need {minBeraFormatted} BERA minimum<br />
              poku judges u (gently)
            </p>
            <DisabledClaimButton label="NEED BERA FOR GAS" />
          </>
        )}

        {state === 'COOLDOWN' && optimisticNextDay !== undefined && (
          <>
            <p className="font-special-elite text-brand-ink text-sm uppercase tracking-wide mb-1">
              COME BACK TOMORROW
            </p>
            <CountdownTimer
              nextClaimDay={optimisticNextDay}
              onExpired={refetch}
            />
            <DisabledClaimButton label="ON COOLDOWN" />
          </>
        )}

        {state === 'ELIGIBLE' && (
          <>
            <p
              className="font-special-elite text-brand-ink text-lg uppercase tracking-wide font-bold border-2 border-brand-ink px-3 py-1 animate-blink-slow"
            >
              ⚠ CLAIM YOUR HENLO ⚠
            </p>
            <button
              onClick={claim}
              className="mt-2 w-full font-black-han text-sm tracking-widest uppercase py-3 bg-brand-yellow text-black border-2 border-brand-ink hover:bg-brand-yellow/80 transition-colors duration-150"
              aria-label={`Claim ${dripFormatted} HENLO tokens`}
            >
              CLAIM {dripFormatted} HENLO
            </button>
          </>
        )}

        {(state === 'PENDING' || state === 'CONFIRMING' || state === 'SUCCESS' || state === 'ERROR') && (
          <div
            ref={statusRef}
            tabIndex={-1}
            className="w-full outline-none"
            role="status"
            aria-live="polite"
          >
            <TxStatus
              claimState={claimHook}
              nextClaimDay={nextClaimDay}
            />
          </div>
        )}
      </div>

      {/* Reset after success — small link below poster */}
      {state === 'SUCCESS' && (
        <button
          onClick={reset}
          className="mt-3 w-full font-vt323 text-brand-ink/40 text-xs text-center hover:text-brand-ink/70 transition-colors"
        >
          dismiss
        </button>
      )}
    </div>
  );
}
