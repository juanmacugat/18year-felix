'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import BabyCharacter from './BabyCharacter';
import { useCurrency } from '@/app/context/currency';
import { useLanguage } from '@/app/context/language';
import { C_BTC, C_GOLD, C_BEAR, SCENARIO_COLORS } from '@/lib/colors';

type Scenario = 'bear' | 'base' | 'bull';

const MILESTONE_AGES = [0, 0.5, 2, 5, 10, 13, 16, 17.5];

// ── Constants ─────────────────────────────────────────────────────────────────
const GIFT_START  = new Date('2026-05-12');
const UNLOCK_DATE = new Date('2044-06-17');
const WEEKLY_DCA  = 20;
const MONTHLY_DCA = WEEKLY_DCA * (365.25 / 7 / 12);

// ── Helpers ───────────────────────────────────────────────────────────────────
function projectAtMonths(start: number, dca: number, months: number, rate: number): number {
  if (months <= 0) return start;
  const mr = Math.pow(1 + rate, 1 / 12) - 1;
  return Math.round(
    start * Math.pow(1 + rate, months / 12) +
    dca * ((Math.pow(1 + mr, months) - 1) / mr),
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  totalEurValue: number;
  btcPriceEur:  number | null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProjectionTimeline({ totalEurValue, btcPriceEur }: Props) {
  const { fmt } = useCurrency();
  const { t } = useLanguage();
  const containerRef  = useRef<HTMLDivElement>(null);
  const rafRef        = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [countdown, setCountdown] = useState<{ yrs: number; mos: number; days: number } | null>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const [letterVisible, setLetterVisible] = useState(false);

  // Reveal the closing letter once it scrolls into view
  useEffect(() => {
    const el = letterRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLetterVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Live unlock countdown — ticks each minute; days only flip at midnight anyway
  useEffect(() => {
    const tick = () => {
      const diffMs   = UNLOCK_DATE.getTime() - Date.now();
      const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
      setCountdown({
        yrs:  Math.floor(diffDays / 365),
        mos:  Math.floor((diffDays % 365) / 30),
        days: diffDays % 30,
      });
    };
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  function toggleScenario(s: Scenario) {
    setSelectedScenario(prev => prev === s ? null : s);
  }

  // Scroll tracking — rAF-throttled to cap at 60fps and prevent dropped frames
  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const rect  = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        setProgress(Math.min(1, Math.max(0, -rect.top / total)));
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // Derived scroll values
  const scrollAge    = progress * 18;
  const scrollYear   = 2026 + scrollAge;
  const scrollMonths = Math.floor(scrollAge * 12);

  const milestoneKeys = [
    'milestone_0', 'milestone_1', 'milestone_2', 'milestone_3',
    'milestone_4', 'milestone_5', 'milestone_6', 'milestone_7',
  ] as const;

  const currentMilestoneIdx = useMemo(() => {
    let idx = 0;
    for (let i = 0; i < MILESTONE_AGES.length; i++) {
      if (scrollAge >= MILESTONE_AGES[i]) idx = i;
    }
    return idx;
  }, [scrollAge]);

  const currentMilestoneText = t[milestoneKeys[currentMilestoneIdx]];

  function jumpToAge(ageTarget: number) {
    const el = containerRef.current;
    if (!el) return;
    const containerTop = el.getBoundingClientRect().top + window.scrollY;
    const total = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: containerTop + (ageTarget / 18) * total, behavior: 'smooth' });
  }

  const projectedBase = useMemo(
    () => projectAtMonths(totalEurValue, MONTHLY_DCA, scrollMonths, 0.35),
    [totalEurValue, scrollMonths],
  );

  // Final values (at 18 years = 216 months)
  const finalBear = useMemo(() => projectAtMonths(totalEurValue, MONTHLY_DCA, 216, 0.15), [totalEurValue]);
  const finalBase = useMemo(() => projectAtMonths(totalEurValue, MONTHLY_DCA, 216, 0.35), [totalEurValue]);
  const finalBull = useMemo(() => projectAtMonths(totalEurValue, MONTHLY_DCA, 216, 0.60), [totalEurValue]);

  // BTC price predictions at 18 years
  const btcBear = btcPriceEur != null ? Math.round(btcPriceEur * Math.pow(1.15, 18)) : null;
  const btcBase = btcPriceEur != null ? Math.round(btcPriceEur * Math.pow(1.35, 18)) : null;
  const btcBull = btcPriceEur != null ? Math.round(btcPriceEur * Math.pow(1.60, 18)) : null;

  // Fade for final overlay — two-beat reveal
  const showFinal    = progress > 0.91;
  const finalOpacity = Math.min(1, Math.max(0, (progress - 0.92) / 0.05)); // beat 1: title + baby
  const cardsOpacity = Math.min(1, Math.max(0, (progress - 0.96) / 0.04)); // beat 2: scenario cards

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════════
          PART 1 — Scroll-driven journey animation (sticky, 520vh container)
      ════════════════════════════════════════════════════════════════════════ */}
      <div id="journey" ref={containerRef} style={{ minHeight: '520vh' }}>
        <div
          className="sticky overflow-hidden flex flex-col"
          style={{
            top: 'var(--navbar-h)',
            height: 'calc(100vh - var(--navbar-h))',
            background: 'linear-gradient(180deg, #08091A 0%, #0A0B1E 100%)',
          }}
        >
          {/* Milestone dot navigation — right edge, 44px touch targets */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col z-20">
            {MILESTONE_AGES.map((dotAge, i) => (
              <button
                key={dotAge}
                type="button"
                aria-label={`Jump to ${Math.floor(2026 + dotAge)}`}
                onClick={() => jumpToAge(dotAge)}
                className="w-11 h-11 flex items-center justify-center cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-4px] rounded-full"
                style={{ outlineColor: C_BTC }}
              >
                <span
                  className="rounded-full transition-all duration-200 pointer-events-none"
                  style={{
                    width:      i === currentMilestoneIdx ? '8px' : '5px',
                    height:     i === currentMilestoneIdx ? '8px' : '5px',
                    background: i === currentMilestoneIdx ? C_BTC : 'rgba(255,255,255,0.22)',
                  }}
                />
              </button>
            ))}
          </div>

          {/* Header */}
          <div className="pt-4 pb-1 text-center flex-none">
            <p className="text-[10px] text-[#F7931A]/60 uppercase tracking-widest font-mono">
              {t.journey_section}
            </p>
          </div>

          {/* Year counter */}
          <div className="text-center flex-none mt-1">
            <div
              className="font-mono font-bold leading-none text-white"
              style={{ fontSize: 'clamp(3rem, 9vw, 5.5rem)', fontVariantNumeric: 'tabular-nums' }}
            >
              {Math.floor(scrollYear)}
            </div>
            <div className="text-slate-500 text-sm mt-1 font-mono">
              {t.journey_age(Math.floor(scrollAge))}
            </div>
          </div>

          {/* Baby — main stage */}
          <div className="flex-1 flex items-center justify-center min-h-0 py-2">
            <div
              style={{
                width:     scrollAge < 3 ? 'min(290px, 46vw)' : 'min(200px, 30vw)',
                height:    scrollAge < 3 ? 'min(220px, 34vw)' : 'min(310px, 46vw)',
                maxHeight: '44vh',
              }}
            >
              <BabyCharacter age={scrollAge} className="w-full h-full" />
            </div>
          </div>

          {/* Milestone text */}
          <div className="text-center px-6 flex-none">
            <p className="text-slate-300 text-sm font-medium leading-relaxed">
              {currentMilestoneText}
            </p>
          </div>

          {/* Projected value */}
          <div className="text-center flex-none mt-2">
            <p
              className="font-mono font-bold"
              style={{ fontSize: 'clamp(1.25rem, 4vw, 1.75rem)', color: C_BTC }}
            >
              {fmt(projectedBase)}
            </p>
            <p className="text-[10px] text-slate-600 font-mono mt-0.5">
              {t.journey_base_proj}
            </p>
          </div>

          {/* Timeline bar */}
          <div className="px-8 pb-8 flex-none mt-4">
            <div className="flex justify-between text-[10px] text-slate-600 font-mono mb-1.5">
              <span>2026</span>
              <span style={{ color: C_BTC }}>{t.journey_pct(progress)}</span>
              <span>2044</span>
            </div>

            <div className="relative h-1.5 w-full rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }}>
              {/* Fill */}
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width:      `${Math.max(0.5, progress * 100)}%`,
                  background: 'linear-gradient(90deg, #F7931A, #FFD700)',
                  boxShadow:  '0 0 10px rgba(247,147,26,0.5)',
                  transition: 'width 0.05s linear',
                }}
              />
              {/* Glowing dot at current position */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
                style={{
                  left:       `${Math.max(0.5, progress * 100)}%`,
                  background: C_GOLD,
                  boxShadow:  `0 0 8px ${C_GOLD}, 0 0 16px ${C_GOLD}66`,
                  animation:  'pulse-dot 1.5s ease infinite',
                }}
              />
            </div>

            {/* Year markers — alternates hidden on very narrow screens */}
            <div className="flex justify-between mt-2">
              {[2026, 2028, 2030, 2032, 2034, 2036, 2038, 2040, 2042, 2044].map((yr, i) => (
                <span
                  key={yr}
                  className={`text-[9px] font-mono transition-colors duration-200${i % 2 !== 0 ? ' hidden min-[400px]:inline' : ''}`}
                  style={{ color: Math.floor(scrollYear) >= yr ? C_BTC : '#1E293B' }}
                >
                  {yr}
                </span>
              ))}
            </div>
          </div>

          {/* ── Final overlay — fades in as user reaches end of scroll ── */}
          {showFinal && (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center px-6 overflow-auto"
              style={{
                background:    'hsl(var(--hero-bg))',
                opacity:        finalOpacity,
                pointerEvents: finalOpacity > 0.5 ? 'auto' : 'none',
              }}
            >
              <p className="text-[10px] text-[#FFD700]/70 uppercase tracking-widest font-mono mb-2">
                {t.final_date}
              </p>
              <h2
                className="font-display font-bold text-white text-center leading-tight"
                style={{ fontSize: 'clamp(2rem, 7vw, 3.5rem)' }}
              >
                {t.final_title_pre}<span style={{ color: C_GOLD }}>18</span>{t.final_title_post}
              </h2>
              <p className="text-slate-500 text-sm mt-1 mb-4">{t.final_subtitle}</p>

              <div style={{ width: 'min(160px, 24vw)', height: 'min(160px, 24vw)' }} className="mb-4">
                <BabyCharacter age={18} className="w-full h-full" />
              </div>

              {/* Beat 2 — scenario cards, staggered after the emotional reveal */}
              <div style={{ opacity: cardsOpacity, pointerEvents: cardsOpacity > 0.1 ? 'auto' : 'none', width: '100%', maxWidth: '32rem' }}>
                <p className="text-slate-500 text-xs mb-3 uppercase tracking-widest font-mono text-center">
                  {t.final_at18}
                </p>

                <div className="grid grid-cols-1 min-[420px]:grid-cols-3 gap-3">
                  <FinalCard
                    label={t.bear_label} rate="15% avg/yr"
                    portfolioValue={finalBear} btcPrice={btcBear}
                    color={C_BEAR} scenario="bear"
                    isSelected={selectedScenario === 'bear'}
                    onSelect={toggleScenario}
                    fmt={fmt}
                  />
                  <FinalCard
                    label={t.base_label} rate="35% avg/yr"
                    portfolioValue={finalBase} btcPrice={btcBase}
                    color={C_BTC} featured scenario="base"
                    isSelected={selectedScenario === 'base'}
                    onSelect={toggleScenario}
                    fmt={fmt}
                  />
                  <FinalCard
                    label={t.bull_label} rate="60% avg/yr"
                    portfolioValue={finalBull} btcPrice={btcBull}
                    color={C_GOLD} scenario="bull"
                    isSelected={selectedScenario === 'bull'}
                    onSelect={toggleScenario}
                    fmt={fmt}
                  />
                </div>
                {selectedScenario && (() => {
                  const color = SCENARIO_COLORS[selectedScenario];
                  return (
                    <div
                      className="mt-3 rounded-xl border px-4 py-3 text-center"
                      style={{ background: `${color}0E`, borderColor: `${color}30` }}
                    >
                      <p className="font-bold text-xs mb-1" style={{ color }}>{t[`${selectedScenario}_headline`]}</p>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{t[`${selectedScenario}_body`]}</p>
                    </div>
                  );
                })()}

              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PART 2 — Closing letter
      ════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-32 px-6"
        style={{ background: '#08091A' }}
      >
        <div ref={letterRef} className="max-w-sm mx-auto text-center">
          <div
            className={`flex justify-center mb-10 transition-opacity duration-[1200ms] ease-out motion-reduce:transition-none motion-reduce:opacity-100 ${
              letterVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div
              className="w-px h-14"
              style={{ background: 'linear-gradient(to bottom, transparent, rgba(247,147,26,0.25))' }}
            />
          </div>

          <p
            className={`text-slate-300 text-xl leading-relaxed transition-all duration-[1400ms] delay-200 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
              letterVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            {t.closing_body}
          </p>

          <p
            className={`font-mono text-sm text-slate-500 mt-8 transition-all duration-[1400ms] delay-700 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
              letterVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            {t.closing_from}
          </p>

          {/* Unlock countdown */}
          {countdown && (
            <div className="mt-14">
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-3">
                {t.hero_unlocks_in}
              </p>
              <p className="font-mono text-2xl tabular-nums">
                <span style={{ color: C_BTC }}>{countdown.yrs}</span>
                <span className="text-slate-600 text-xs mx-1.5">{t.hero_yrs}</span>
                <span style={{ color: C_BTC }}>{countdown.mos}</span>
                <span className="text-slate-600 text-xs mx-1.5">{t.hero_mo}</span>
                <span style={{ color: C_BTC }}>{countdown.days}</span>
                <span className="text-slate-600 text-xs ml-1.5">{t.hero_d}</span>
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function valueFontSize(value: string): string {
  const len = value.length;
  if (len <= 10) return 'text-lg';
  if (len <= 14) return 'text-base';
  return 'text-sm';
}

function FinalCard({
  label, rate, portfolioValue, btcPrice, color, featured, scenario, isSelected, onSelect, fmt,
}: {
  label: string; rate: string;
  portfolioValue: number; btcPrice: number | null;
  color: string; featured?: boolean;
  scenario: Scenario; isSelected: boolean; onSelect: (s: Scenario) => void;
  fmt: (v: number | null) => string;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(scenario)}
      className="w-full min-w-0 rounded-xl border p-4 text-center cursor-pointer transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background:       isSelected ? `linear-gradient(135deg, ${color}22, ${color}10)` : featured ? `linear-gradient(135deg, ${color}18, ${color}08)` : 'rgba(255,255,255,0.04)',
        borderColor:      isSelected ? `${color}66` : featured ? `${color}44` : 'rgba(255,255,255,0.08)',
        boxShadow:        isSelected ? `0 0 28px ${color}44` : featured ? `0 0 24px ${color}22` : 'none',
        outlineColor:     color,
      }}
    >
      <p className="font-display text-sm font-bold mb-0.5" style={{ color }}>{label}</p>
      <p className="font-mono text-[10px] mb-3" style={{ color: `${color}88` }}>{rate}</p>
      <p className={`font-mono font-bold leading-none mb-1 ${valueFontSize(fmt(portfolioValue))}`} style={{ color }}>
        {fmt(portfolioValue)}
      </p>
      {btcPrice != null && (
        <p className="text-[10px] font-mono mt-2" style={{ color: `${color}70` }}>
          BTC ≈ {fmt(btcPrice)}
        </p>
      )}
    </button>
  );
}
