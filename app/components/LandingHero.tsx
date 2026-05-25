'use client';

import { useMemo } from 'react';
import BabyCharacter from './BabyCharacter';
import { ChevronDown } from 'lucide-react';
import { useCurrency } from '@/app/context/currency';
import { useLanguage } from '@/app/context/language';
import { C_BTC, C_GOLD, C_UP, C_DOWN } from '@/lib/colors';

interface Props {
  totalEurValue: number | null;
  totalInvested: number | null;
  btcBalance:    number | null;
}

const GIFT_START  = new Date('2026-05-12');
const UNLOCK_DATE = new Date('2044-06-17');
const TOTAL_MS    = UNLOCK_DATE.getTime() - GIFT_START.getTime();
const TOTAL_YEARS = 18;

// Pre-computed star positions (deterministic — avoids SSR/hydration mismatch)
const STARS = [
  { top: '8%',  left: '5%',  size: 2,   delay: 0,    dur: 3.2 },
  { top: '15%', left: '18%', size: 1.5, delay: 0.8,  dur: 2.8 },
  { top: '6%',  left: '35%', size: 2.5, delay: 1.6,  dur: 4.1 },
  { top: '22%', left: '52%', size: 1,   delay: 0.3,  dur: 2.5 },
  { top: '4%',  left: '72%', size: 2,   delay: 2.1,  dur: 3.6 },
  { top: '18%', left: '85%', size: 1.5, delay: 1.0,  dur: 2.9 },
  { top: '35%', left: '3%',  size: 1,   delay: 1.8,  dur: 3.8 },
  { top: '42%', left: '92%', size: 2,   delay: 0.5,  dur: 4.4 },
  { top: '55%', left: '8%',  size: 1.5, delay: 2.6,  dur: 2.7 },
  { top: '62%', left: '95%', size: 1,   delay: 1.3,  dur: 3.1 },
  { top: '78%', left: '12%', size: 2,   delay: 0.7,  dur: 2.6 },
  { top: '85%', left: '88%', size: 1.5, delay: 2.0,  dur: 3.9 },
  { top: '72%', left: '45%', size: 1,   delay: 3.2,  dur: 2.4 },
  { top: '30%', left: '25%', size: 1.5, delay: 0.4,  dur: 4.8 },
  { top: '48%', left: '68%', size: 2,   delay: 1.9,  dur: 3.3 },
  { top: '12%', left: '60%', size: 1,   delay: 2.8,  dur: 2.2 },
  { top: '90%', left: '55%', size: 2,   delay: 1.5,  dur: 3.7 },
  { top: '68%', left: '30%', size: 1.5, delay: 0.9,  dur: 4.2 },
  { top: '25%', left: '78%', size: 1,   delay: 3.5,  dur: 2.8 },
  { top: '82%', left: '20%', size: 2,   delay: 2.4,  dur: 3.0 },
] as const;

function formatBtc(btc: number | null): string {
  if (btc == null) return '—';
  if (btc >= 1) return btc.toFixed(4) + ' BTC';
  return (btc * 1000).toFixed(4) + ' mBTC';
}

export default function LandingHero({ totalEurValue, totalInvested, btcBalance }: Props) {
  const { fmt } = useCurrency();
  const { t } = useLanguage();

  const { progress, journeyAge, remaining } = useMemo(() => {
    const now  = Date.now();
    const prog = Math.max(0, Math.min(1, (now - GIFT_START.getTime()) / TOTAL_MS));
    const age  = prog * TOTAL_YEARS;

    const diffMs    = UNLOCK_DATE.getTime() - now;
    const diffDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const yrs       = Math.floor(diffDays / 365);
    const mos       = Math.floor((diffDays % 365) / 30);
    const days      = diffDays % 30;

    return { progress: prog, journeyAge: age, remaining: { yrs, mos, days } };
  }, []);

  const progressPct = (progress * 100).toFixed(2);
  const pnl         = totalInvested != null && totalEurValue != null ? totalEurValue - totalInvested : null;
  const pnlPct      = pnl != null && totalInvested! > 0 ? (pnl / totalInvested!) * 100 : null;

  return (
    <section
      className="relative overflow-hidden min-h-screen flex flex-col"
      style={{
        background: 'radial-gradient(ellipse 80% 60% at 50% -10%, hsl(30 60% 20% / 0.35), transparent), linear-gradient(180deg, #08091A 0%, #0C0A1F 50%, #08091A 100%)',
      }}
    >
      {/* ── Starfield ── */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {STARS.map((s, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              top: s.top,
              left: s.left,
              width:  `${s.size}px`,
              height: `${s.size}px`,
              animation: `star-twinkle ${s.dur}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
        {/* BTC ambient glow */}
        <div
          className="absolute top-[-20%] left-[40%] w-[600px] h-[600px] rounded-full blur-3xl opacity-[0.07]"
          style={{
            background: 'radial-gradient(circle, #F7931A, transparent 70%)',
            animation: 'orbit-glow 12s ease-in-out infinite',
          }}
        />
      </div>

      {/* ── Main hero content ── */}
      <div className="relative z-10 flex-1 flex items-center">
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 pt-24 pb-12 lg:py-0">

          {/* Left: text & stats */}
          <div className="flex flex-col justify-center animate-slide-up">
            {/* Badge */}
            <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-[#F7931A]/30 bg-[#F7931A]/10 px-4 py-2 text-xs font-medium text-[#F7931A] tracking-widest uppercase">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#F7931A] animate-pulse" />
              {t.hero_badge}
            </div>

            {/* Title */}
            <h1 className="font-display text-7xl lg:text-8xl font-bold leading-none mb-4">
              <span style={{ color: C_BTC }}>For Felix</span>
            </h1>
            <p className="text-slate-400 text-lg lg:text-xl mb-2">
              {t.hero_subtitle}
            </p>
            <p className="text-slate-500 text-sm mb-10">
              {t.hero_unlocking}{' '}
              <span className="text-slate-300 font-medium">June 17, 2044</span>
              {' '}· {t.hero_started}{' '}
              <span className="text-slate-300 font-medium">May 12, 2026</span>
            </p>

            {/* ── Primary metric ── */}
            <div className="mb-6">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1.5">
                {t.hero_stat_portfolio}
              </p>
              <p className="font-mono text-5xl lg:text-6xl font-bold leading-none" style={{ color: C_BTC }}>
                {fmt(totalEurValue)}
              </p>
            </div>

            {/* ── Supporting metrics — inline, no cards ── */}
            <div className="flex flex-wrap items-start gap-x-6 gap-y-3 mb-10">
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-0.5">{t.hero_stat_invested}</p>
                <p className="font-mono text-sm text-slate-300">{fmt(totalInvested)}</p>
              </div>
              <div className="hidden sm:block w-px self-stretch bg-white/[0.08] mt-1" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-0.5">{t.hero_stat_pnl}</p>
                <p className="font-mono text-sm" style={{ color: pnl != null ? (pnl >= 0 ? C_UP : C_DOWN) : '#F1F5F9' }}>
                  {fmt(pnl, true)}
                  {pnlPct != null && (
                    <span className="ml-1.5 text-xs opacity-60">{pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%</span>
                  )}
                </p>
              </div>
              <div className="hidden sm:block w-px self-stretch bg-white/[0.08] mt-1" />
              <div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-0.5">{t.hero_stat_btc}</p>
                <p className="font-mono text-sm text-slate-300">
                  <span className="mr-0.5" style={{ color: C_BTC }}>₿</span>{formatBtc(btcBalance)}
                </p>
              </div>
            </div>

            {/* ── Timeline progress bar ── */}
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-2 font-mono">
                <span>2026</span>
                <span style={{ color: C_BTC }}>{t.hero_journey_pct(progressPct)}</span>
                <span>2044</span>
              </div>
              <div className="relative h-2.5 w-full rounded-full bg-white/5 border border-white/8 overflow-hidden">
                <div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{
                    width: `${Math.max(progress * 100, 0.5)}%`,
                    background: `linear-gradient(90deg, ${C_BTC}, ${C_GOLD})`,
                    boxShadow: `0 0 12px ${C_BTC}88`,
                  }}
                />
              </div>
              {/* Year labels */}
              <div className="mt-4 flex items-center justify-between text-xs text-slate-600 font-mono select-none">
                {[2026, 2028, 2030, 2032, 2034, 2036, 2038, 2040, 2042, 2044].map(yr => (
                  <span key={yr} className={yr <= new Date().getFullYear() ? 'text-slate-400' : ''}>
                    {yr}
                  </span>
                ))}
              </div>
            </div>

            {/* Countdown — compact inline */}
            <div className="mt-8">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1.5">{t.hero_unlocks_in}</p>
              <p className="font-mono text-base">
                <span style={{ color: C_BTC }}>{remaining.yrs}</span>
                <span className="text-slate-600 text-xs mx-1">{t.hero_yrs}</span>
                <span style={{ color: C_BTC }}>{remaining.mos}</span>
                <span className="text-slate-600 text-xs mx-1">{t.hero_mo}</span>
                <span style={{ color: C_BTC }}>{remaining.days}</span>
                <span className="text-slate-600 text-xs ml-1">{t.hero_d}</span>
              </p>
            </div>
          </div>

          {/* Right: baby character */}
          <div className="flex items-center justify-center lg:justify-end">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 lg:w-[26rem] lg:h-[26rem]">
              {/* Glowing ring behind baby */}
              <div
                className="absolute inset-[-12%] rounded-full"
                style={{
                  background: 'radial-gradient(circle, hsl(30 97% 54% / 0.12) 0%, transparent 70%)',
                  animation: 'orbit-glow 8s ease-in-out infinite',
                }}
              />
              <BabyCharacter age={journeyAge} className="relative z-10 w-full h-full" />

              {/* Floating badge: current journey year */}
              <div
                className="absolute -bottom-3 -right-3 flex flex-col items-center justify-center w-20 h-20 rounded-full text-center"
                style={{
                  background: 'linear-gradient(135deg, #1A0D00 0%, #120900 100%)',
                  boxShadow: `0 0 20px ${C_BTC}33`,
                  border: `1px solid ${C_BTC}40`,
                }}
              >
                <span className="font-mono text-[10px] leading-none" style={{ color: `${C_BTC}B0` }}>{t.hero_year_label}</span>
                <span className="font-display text-2xl font-bold leading-tight" style={{ color: C_BTC }}>
                  {Math.floor(journeyAge) + 1}
                </span>
                <span className="font-mono text-[9px]" style={{ color: `${C_BTC}80` }}>{t.hero_year_of}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#08091A] to-transparent" />

      {/* Scroll button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2">
        <span className="text-[10px] text-slate-600 uppercase tracking-widest font-mono">{t.hero_explore}</span>
        <button
          onClick={() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' })}
          aria-label="Scroll to journey"
          className="group w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-[#F7931A]/40 transition-all duration-300 cursor-pointer"
        >
          <ChevronDown className="h-5 w-5 text-slate-500 group-hover:text-[#F7931A] transition-colors animate-bounce" />
        </button>
      </div>
    </section>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

