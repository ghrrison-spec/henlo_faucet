'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { truncateAddress } from '@/lib/utils';

export default function WalletButton() {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
        const connected = mounted && account && chain;

        return (
          <div
            {...(!mounted && {
              'aria-hidden': true,
              style: { opacity: 0, pointerEvents: 'none', userSelect: 'none' },
            })}
          >
            {!connected ? (
              <button
                onClick={openConnectModal}
                className="font-black-han text-sm tracking-widest uppercase px-6 py-3 border-2 border-brand-yellow text-brand-yellow bg-black hover:bg-brand-yellow hover:text-black transition-colors duration-150"
              >
                [ CONNECT WALLET ]
              </button>
            ) : chain.unsupported ? (
              <button
                onClick={openChainModal}
                className="font-black-han text-sm tracking-widest uppercase px-6 py-3 border-2 border-brand-red text-brand-red bg-black hover:bg-brand-red hover:text-black transition-colors duration-150 animate-blink-slow"
              >
                [ WRONG NETWORK ]
              </button>
            ) : (
              <button
                onClick={openAccountModal}
                className="font-black-han text-sm tracking-widest uppercase px-6 py-3 border-2 border-brand-yellow text-brand-yellow bg-black hover:bg-brand-yellow hover:text-black transition-colors duration-150"
              >
                [ {truncateAddress(account.address)} ]
              </button>
            )}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
