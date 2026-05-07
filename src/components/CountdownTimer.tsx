'use client';

import { useEffect, useRef, useState } from 'react';
import { msUntilNextClaim, formatCountdown } from '@/lib/utils';

interface CountdownTimerProps {
  nextClaimDay: bigint;
  onExpired?: () => void;
}

export default function CountdownTimer({ nextClaimDay, onExpired }: CountdownTimerProps) {
  const [ms, setMs] = useState(() => msUntilNextClaim(nextClaimDay));
  // Stable ref so the interval closure never captures a stale callback
  const onExpiredRef = useRef(onExpired);
  useEffect(() => { onExpiredRef.current = onExpired; });

  // Resync when nextClaimDay changes (e.g. after refetch resolves a new day)
  useEffect(() => {
    setMs(msUntilNextClaim(nextClaimDay));
  }, [nextClaimDay]);

  // Interval — restarts only when ms changes (including when nextClaimDay sync above fires)
  useEffect(() => {
    if (ms <= 0) {
      onExpiredRef.current?.();
      return;
    }

    const id = setInterval(() => {
      // Use functional update — no stale closure on ms
      setMs((prev) => Math.max(0, prev - 1000));
    }, 1000);

    return () => clearInterval(id);
  }, [ms]); // dep on ms is intentional: re-evaluates on each tick to detect expiry

  if (ms <= 0) {
    return (
      <span className="font-vt323 text-brand-green text-3xl animate-blink">
        ELIGIBLE NOW
      </span>
    );
  }

  return (
    <span
      className="font-vt323 text-brand-yellow text-4xl tracking-widest tabular-nums"
      aria-live="polite"
      aria-label={`Time until next claim: ${formatCountdown(ms)}`}
    >
      {formatCountdown(ms)}
    </span>
  );
}
