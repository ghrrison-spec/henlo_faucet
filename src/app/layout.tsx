import type { Metadata } from 'next';
import {
  VT323,
  Black_Han_Sans,
  Sixtyfour,
  Special_Elite,
  Permanent_Marker,
} from 'next/font/google';
import Providers from '@/components/Providers';
import './globals.css';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
  display: 'swap',
});

const blackHanSans = Black_Han_Sans({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-black-han',
  display: 'swap',
});

const sixtyfour = Sixtyfour({
  subsets: ['latin'],
  variable: '--font-sixtyfour',
  display: 'swap',
});

const specialElite = Special_Elite({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-special-elite',
  display: 'swap',
});

const permanentMarker = Permanent_Marker({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-permanent-marker',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'henlo faucet',
  description: 'claim your daily HENLO tokens on Berachain',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${vt323.variable} ${blackHanSans.variable} ${sixtyfour.variable} ${specialElite.variable} ${permanentMarker.variable}`}
    >
      <body className="scanlines bg-black min-h-screen">
        <div className="corner-glow corner-glow-tl" />
        <div className="corner-glow corner-glow-tr" />
        <div className="corner-glow corner-glow-bl" />
        <div className="corner-glow corner-glow-br" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
