import Y2KBackground from '@/components/Y2KBackground';
import WalletButton from '@/components/WalletButton';
import NetworkGuard from '@/components/NetworkGuard';
import FaucetStatsWrapper from '@/components/FaucetStatsWrapper';
import ClaimCard from '@/components/ClaimCard';
import PokuGreeter from '@/components/PokuGreeter';
import { FAUCET_ADDRESS, BERACHAIN_EXPLORER_URL } from '@/lib/constants';
import { truncateAddress } from '@/lib/utils';

const MARQUEE_TEXT =
  '🐾 HENLO FAUCET ★ CLAIM YOUR DAILY HENLO ★ CONNECT WALLET ★ OOGA BOOGA ★ DRIP DRIP ★ SAY HENLO BACK ★ POWERED BY BERACHAIN ★ POKU APPROVES ★ ';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-black">
      <Y2KBackground />

      {/* Marquee */}
      <div className="relative z-10 w-full bg-black border-b-4 border-brand-yellow overflow-hidden py-1.5">
        <div
          className="whitespace-nowrap font-black-han text-black text-sm tracking-widest uppercase"
          style={{ animation: 'marquee 30s linear infinite', display: 'inline-block' }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="bg-brand-yellow px-1">
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* Sticky nav */}
      <nav className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-3 bg-black border-b-4 border-brand-yellow/40">
        <span className="font-sixtyfour text-brand-yellow text-xl sm:text-2xl tracking-widest">
          ★ HENLO FAUCET ★
        </span>
        <NetworkGuard>
          <WalletButton />
        </NetworkGuard>
      </nav>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-10 gap-8">
        {/* Stats row */}
        <FaucetStatsWrapper />

        {/* Claim poster */}
        <div className="w-full flex justify-center">
          <ClaimCard />
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t-2 border-brand-yellow/20 bg-black py-4 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="font-vt323 text-brand-yellow text-lg tracking-widest">
          🌐 HENLO FAUCET
        </span>
        <a
          href={`${BERACHAIN_EXPLORER_URL}/address/${FAUCET_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-vt323 text-brand-grey text-sm hover:text-brand-yellow transition-colors border border-brand-grey/30 px-2 py-0.5 hover:border-brand-yellow"
        >
          {truncateAddress(FAUCET_ADDRESS)} ↗
        </a>
        <span className="font-vt323 text-brand-grey text-sm tracking-wide">
          Built on Berachain 🐻
        </span>
      </footer>

      {/* Fixed greeter */}
      <PokuGreeter />
    </div>
  );
}
