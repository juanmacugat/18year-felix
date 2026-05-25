'use client';

import { memo } from 'react';
import Image from 'next/image';

interface BabyProps {
  age: number;
  className?: string;
}

const STAGES = [
  { maxAge: 0.5,      src: '/milestones/newborn-onesie-excited.webp',    alt: 'Félix as a newborn, excited and floating',               anim: 'baby-bounce',  dur: '1.8s' },
  { maxAge: 2,        src: '/milestones/sitting-suit-curious.webp',       alt: 'Félix as a baby, sitting in a suit with curious eyes',   anim: 'baby-bounce',  dur: '1.8s' },
  { maxAge: 5,        src: '/milestones/sitting-pointing-down.webp',      alt: 'Félix as a toddler, sitting and pointing down sternly',  anim: 'baby-crawl',   dur: '2.4s' },
  { maxAge: 10,       src: '/milestones/briefcase-coffee-walk.webp',      alt: 'Félix as a child, walking fast with briefcase and coffee', anim: 'baby-float', dur: '3.5s' },
  { maxAge: 13,       src: '/milestones/on-the-phone.webp',               alt: 'Félix as a preteen, on a brick phone and pointing',      anim: 'baby-float',   dur: '3.5s' },
  { maxAge: 16,       src: '/milestones/scheming-steepled.webp',          alt: 'Félix as a teenager, fingertips pressed together scheming', anim: 'baby-breathe', dur: '4s' },
  { maxAge: 17.5,     src: '/milestones/pacifier-arms-front.webp',        alt: 'Félix nearly 18, standing with pacifier and arms crossed', anim: 'baby-breathe', dur: '4s' },
  { maxAge: 18,       src: '/milestones/standing-pointing-forward.webp',  alt: 'Félix at 18, standing and pointing forward assertively', anim: 'baby-breathe', dur: '4s'   },
  { maxAge: Infinity, src: '/milestones/conductor-baton.webp',            alt: "Félix at 18, holding a conductor's baton, in command",  anim: 'baby-breathe', dur: '4s'   },
] as const;

const FIRST_STAGE_SRC = STAGES[0].src;

function getStageIdx(age: number): number {
  const idx = STAGES.findIndex(s => age < s.maxAge);
  return idx === -1 ? STAGES.length - 1 : idx;
}

function BabyCharacter({ age, className = '' }: BabyProps) {
  const stage = STAGES[getStageIdx(age)];

  return (
    <div className={`relative select-none ${className}`}>
      <div
        key={stage.src}
        className="relative w-full h-full"
        style={{
          animation: `stage-enter 0.45s cubic-bezier(0.16,1,0.3,1) both, ${stage.anim} ${stage.dur} ease-in-out 0.45s infinite`,
          willChange: 'transform',
        }}
      >
        <Image
          src={stage.src}
          alt={stage.alt}
          fill
          sizes="(max-width: 640px) 290px, (max-width: 1024px) 320px, 416px"
          className="object-contain drop-shadow-2xl"
          priority={stage.src === FIRST_STAGE_SRC}
        />
      </div>
    </div>
  );
}

// Only re-renders when the visible stage changes, not on every scroll tick
export default memo(BabyCharacter, (prev, next) =>
  getStageIdx(prev.age) === getStageIdx(next.age) && prev.className === next.className
);
