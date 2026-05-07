'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const BUBBLES = [
  { text: 'henlo...', delay: 600, size: 'text-base', yellow: false },
  { text: 'henlo!', delay: 1000, size: 'text-lg', yellow: false },
  { text: 'HENLO!! 🐾', delay: 1400, size: 'text-xl', yellow: true },
];

export default function PokuGreeter() {
  const [visible, setVisible] = useState<boolean[]>([false, false, false]);

  useEffect(() => {
    const timers = BUBBLES.map((b, i) =>
      setTimeout(() => {
        setVisible((prev) => {
          const next = [...prev];
          next[i] = true;
          return next;
        });
      }, b.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="hidden sm:flex fixed bottom-6 left-6 z-[998] flex-row items-end gap-3 pointer-events-none select-none">
      {/* Poku image — gentle float */}
      <div
        style={{
          animation: 'pokuFloat 3s ease-in-out infinite',
        }}
      >
        <Image
          src="/poku-wave.png"
          alt="poku"
          width={80}
          height={80}
          priority
        />
      </div>

      {/* Speech bubbles */}
      <div className="flex flex-col gap-1 mb-2">
        {BUBBLES.map((b, i) => (
          <div
            key={i}
            className={`
              font-marker ${b.size} px-3 py-1 rounded-sm border-2
              transition-all duration-300
              ${visible[i] ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
              ${b.yellow
                ? 'bg-brand-yellow text-black border-brand-yellow'
                : 'bg-white text-black border-brand-grey'}
            `}
          >
            {b.text}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pokuFloat {
          0%, 100% { transform: rotate(-2deg) translateY(0px); }
          50% { transform: rotate(2deg) translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
