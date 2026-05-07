import { formatUnits } from 'viem';

export function truncateAddress(address: string): string {
  if (address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTokenAmount(amount: bigint, decimals = 18): string {
  const formatted = formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/** UTC day number → Date at start of that UTC day */
export function dayToTimestamp(day: bigint): Date {
  return new Date(Number(day) * 86_400 * 1_000);
}

/** Milliseconds until the start of nextClaimDay (0 if already past) */
export function msUntilNextClaim(nextDay: bigint): number {
  const target = dayToTimestamp(nextDay).getTime();
  return Math.max(0, target - Date.now());
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}
