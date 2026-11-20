'use client';

import { useState } from 'react';

const COLORS = ['#FF6A2B', '#C9A15A', '#4ADE80', '#F4F1EA', '#FF8551'];

/** Lightweight CSS confetti burst. Hidden entirely for reduced-motion users. */
export function Confetti({ pieces = 60 }: { pieces?: number }) {
  const [bits] = useState(() =>
    Array.from({ length: pieces }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 2.2 + Math.random() * 1.6,
      size: 6 + Math.random() * 6,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 160,
      color: COLORS[i % COLORS.length],
      round: Math.random() > 0.6,
    }))
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[70] overflow-hidden motion-reduce:hidden">
      {bits.map((b) => (
        <span
          key={b.id}
          className="absolute top-[-20px] block animate-confetti"
          style={
            {
              left: `${b.left}%`,
              width: b.size,
              height: b.round ? b.size : b.size * 0.45,
              background: b.color,
              borderRadius: b.round ? '999px' : '2px',
              animationDelay: `${b.delay}s`,
              animationDuration: `${b.duration}s`,
              '--confetti-drift': `${b.drift}px`,
              '--confetti-rotate': `${b.rotate + 540}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
