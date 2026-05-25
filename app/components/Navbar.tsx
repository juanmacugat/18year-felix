'use client';

import { useEffect, useState } from 'react';
import { Bitcoin } from 'lucide-react';
import CurrencyToggle from './CurrencyToggle';
import LanguageToggle from './LanguageToggle';
import { C_BTC } from '@/lib/colors';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 20); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 lg:px-12 py-4 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8,9,26,0.85)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ background: `${C_BTC}22`, boxShadow: `inset 0 0 0 1px ${C_BTC}44` }}
        >
          <Bitcoin className="h-4 w-4" style={{ color: C_BTC }} />
        </div>
        <span className="font-display text-base font-semibold tracking-wide text-white">Felixfolio</span>
      </div>
      <div className="flex items-center gap-2">
        <LanguageToggle />
        <CurrencyToggle />
      </div>
    </nav>
  );
}
