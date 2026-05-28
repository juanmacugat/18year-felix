'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import BabyCharacter from './BabyCharacter';
import { useCurrency } from '@/app/context/currency';
import { useLanguage } from '@/app/context/language';
import { C_BTC, C_GOLD, C_BEAR, C_INVESTED, C_SURFACE, C_TICK, SCENARIO_COLORS } from '@/lib/colors';

type Scenario = 'bear' | 'base' | 'bull';

const MILESTONE_AGES = [0, 0.5, 2, 5, 10, 13, 16, 17.5];

ChartJS.register(LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// ── Constants ─────────────────────────────────────────────────────────────────
const GIFT_START  = new Date('2026-05-12');
const UNLOCK_DATE = new Date('2044-06-17');
const TOTAL_MS    = UNLOCK_DATE.getTime() - GIFT_START.getTime();
const WEEKLY_DCA  = 20;
const MONTHLY_DCA = WEEKLY_DCA * (365.25 / 7 / 12); // ≈ €108.71

// ── Helpers ───────────────────────────────────────────────────────────────────
function toDecimalYear(d: Date): number {
  return d.getFullYear() + d.getMonth() / 12 + d.getDate() / 365;
}

function projectAtMonths(start: number, dca: number, months: number, rate: number): number {
  if (months <= 0) return start;
  const mr = Math.pow(1 + rate, 1 / 12) - 1;
  return Math.round(
    start * Math.pow(1 + rate, months / 12) +
    dca * ((Math.pow(1 + mr, months) - 1) / mr),
  );
}

function buildScenario(start: number, dca: number, rate: number): { x: number; y: number }[] {
  const mr     = Math.pow(1 + rate, 1 / 12) - 1;
  const cursor = new Date();
  cursor.setDate(1);
  const pts: { x: number; y: number }[] = [];
  let value = start;
  while (cursor <= UNLOCK_DATE) {
    pts.push({ x: toDecimalYear(cursor), y: Math.round(value) });
    value = value * (1 + mr) + dca;
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return pts;
}

function buildInvested(total: number): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const cursor = new Date(GIFT_START);
  const today  = new Date();
  let invested = 0;
  while (cursor <= today) {
    pts.push({ x: toDecimalYear(cursor), y: Math.round(invested) });
    invested += MONTHLY_DCA;
    cursor.setMonth(cursor.getMonth() + 1);
  }
  if (pts.length) pts[pts.length - 1].y = Math.round(total);
  return pts;
}

// Custom Chart.js plugin — "Today" vertical line
const todayLinePlugin = {
  id: 'todayLine',
  afterDatasetsDraw(chart: ChartJS) {
    const { ctx, scales } = chart;
    const x = scales['x'].getPixelForValue(toDecimalYear(new Date()));
    ctx.save();
    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([5, 6]);
    ctx.beginPath();
    ctx.moveTo(x, scales['y'].top);
    ctx.lineTo(x, scales['y'].bottom);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font      = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('Today', x, scales['y'].top - 8);
    ctx.restore();
  },
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  totalEurValue: number;
  totalInvested: number | null;
  btcPriceEur:  number | null;
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProjectionTimeline({ totalEurValue, totalInvested, btcPriceEur }: Props) {
  const { fmt, convert, symbol } = useCurrency();
  const { t } = useLanguage();
  const containerRef  = useRef<HTMLDivElement>(null);
  const rafRef        = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);

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

  // Raw data — only recomputes when portfolio value or invested amount changes
  const rawData = useMemo(() => ({
    bull:     buildScenario(totalEurValue, MONTHLY_DCA, 0.60),
    base:     buildScenario(totalEurValue, MONTHLY_DCA, 0.35),
    bear:     buildScenario(totalEurValue, MONTHLY_DCA, 0.15),
    invested: buildInvested(totalInvested ?? 0),
  }), [totalEurValue, totalInvested]);

  // Chart datasets — only recomputes line styles when selected scenario changes
  const datasets = useMemo(() => {
    function lineStyle(scenario: Scenario, baseColor: string, baseWidth: number) {
      if (!selectedScenario) return { borderColor: baseColor, borderWidth: baseWidth };
      if (selectedScenario === scenario) return { borderColor: baseColor, borderWidth: baseWidth + 1.5 };
      return { borderColor: `${baseColor}28`, borderWidth: baseWidth * 0.5 };
    }
    const bull = lineStyle('bull', C_GOLD,     1.5);
    const base = lineStyle('base', C_BTC,      2.5);
    const bear = lineStyle('bear', C_BEAR,     1.5);
    return [
      {
        label: '▲ Bull (60%)',
        data:  rawData.bull,
        ...bull,
        borderDash: [6, 3], pointRadius: 0, tension: 0.4, fill: false, backgroundColor: 'transparent',
      },
      {
        label: '◆ Base (35%)',
        data:  rawData.base,
        ...base,
        borderDash: [], pointRadius: 0, tension: 0.4, fill: 'origin',
        backgroundColor: selectedScenario && selectedScenario !== 'base' ? 'transparent' : `${C_BTC}12`,
      },
      {
        label: '▼ Bear (15%)',
        data:  rawData.bear,
        ...bear,
        borderDash: [5, 4], pointRadius: 0, tension: 0.4, fill: false, backgroundColor: 'transparent',
      },
      {
        label: '— Invested',
        data:  rawData.invested,
        borderColor: C_INVESTED, borderWidth: 1.5,
        borderDash: [3, 4], pointRadius: 0, tension: 0.1, fill: false, backgroundColor: 'transparent',
      },
    ];
  }, [rawData, selectedScenario]);

  const chartOptions = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 900, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        labels: {
          color: C_BEAR, usePointStyle: true, pointStyleWidth: 10, padding: 20,
          font: { size: 11, family: 'var(--font-mono)' },
        },
      },
      tooltip: {
        backgroundColor: C_SURFACE, borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
        titleColor: C_BEAR, bodyColor: '#F1F5F9', padding: 12,
        bodyFont: { family: 'var(--font-mono)', size: 12 },
        callbacks: {
          title: (items) => {
            const yr = items[0]?.parsed.x;
            if (yr == null) return '';
            const y = Math.floor(yr); const m = Math.round((yr - y) * 12);
            return new Date(y, m, 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          },
          label: (ctx) => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y ?? 0)}`,
        },
      },
    },
    scales: {
      x: {
        type: 'linear',
        min: toDecimalYear(GIFT_START),
        max: toDecimalYear(UNLOCK_DATE) + 0.1,
        ticks: {
          stepSize: 2, color: C_TICK, maxRotation: 0, font: { size: 11 },
          callback: (v) => Number.isInteger(Number(v)) && Number(v) % 2 === 0 ? String(v) : '',
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'transparent' },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: C_TICK, font: { family: 'var(--font-mono)', size: 11 }, maxTicksLimit: 7,
          callback: (v) => {
            const c = convert(Number(v));
            if (c >= 1_000_000) return `${symbol}${(c / 1_000_000).toFixed(1)}M`;
            if (c >= 1_000)     return `${symbol}${(c / 1_000).toFixed(0)}K`;
            return `${symbol}${c.toFixed(0)}`;
          },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        border: { color: 'transparent' },
      },
    },
  }), [fmt, convert, symbol]);

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

                <p className="text-[10px] text-slate-700 font-mono mt-3 text-center">
                  {t.final_disclaimer}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          PART 2 — Static projection chart + scenario detail
      ════════════════════════════════════════════════════════════════════════ */}
      <section
        className="py-20 px-6 lg:px-12"
        style={{ background: 'linear-gradient(180deg, #08091A 0%, #0A0B1E 50%, #08091A 100%)' }}
      >
        <div className="max-w-7xl mx-auto">

          <div className="mb-10 text-center">
            <p className="text-xs text-[#F7931A]/70 uppercase tracking-widest mb-2 font-mono">{t.chart_label}</p>
            <h2 className="font-display text-4xl font-bold text-white mb-2">
              {t.chart_title}
            </h2>
            <p className="text-slate-500 text-sm">
              {t.chart_subtitle(fmt(totalEurValue))}
            </p>
          </div>

          {/* Chart */}
          <div
            className="rounded-2xl border p-6 mb-10"
            style={{ background: 'rgba(255,255,255,0.025)', borderColor: 'rgba(255,255,255,0.07)' }}
          >
            <div className="h-72 lg:h-96">
              <Line data={{ datasets }} options={chartOptions} plugins={[todayLinePlugin]}/>
            </div>
          </div>

          {/* Scenario cards with BTC price */}
          <p className="text-xs text-slate-500 uppercase tracking-widest text-center mb-6 font-mono">
            {t.chart_at18}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <ScenarioCard
              label={t.bear_label} rate="15% avg/yr"
              portfolioValue={finalBear} btcPrice={btcBear}
              color={C_BEAR} scenario="bear"
              isSelected={selectedScenario === 'bear'}
              onSelect={toggleScenario}
              fmt={fmt}
            />
            <ScenarioCard
              label={t.base_label} rate="35% avg/yr"
              portfolioValue={finalBase} btcPrice={btcBase}
              color={C_BTC} featured scenario="base"
              isSelected={selectedScenario === 'base'}
              onSelect={toggleScenario}
              fmt={fmt}
            />
            <ScenarioCard
              label={t.bull_label} rate="60% avg/yr"
              portfolioValue={finalBull} btcPrice={btcBull}
              color={C_GOLD} scenario="bull"
              isSelected={selectedScenario === 'bull'}
              onSelect={toggleScenario}
              fmt={fmt}
            />
          </div>

          {/* Scenario explanation panel */}
          {selectedScenario && (() => {
            const color = SCENARIO_COLORS[selectedScenario];
            return (
              <div
                className="rounded-2xl border px-6 py-5 mb-4 transition-all duration-300"
                style={{
                  background:   `linear-gradient(135deg, ${color}10, ${color}06)`,
                  borderColor:  `${color}33`,
                  boxShadow:    `0 0 32px ${color}14`,
                }}
              >
                <p
                  className="font-display font-bold text-sm mb-2"
                  style={{ color }}
                >
                  {t[`${selectedScenario}_headline`]}
                </p>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {t[`${selectedScenario}_body`]}
                </p>
              </div>
            );
          })()}

          <p className="text-center text-[11px] text-slate-600 font-mono">
            {t.chart_disclaimer}
          </p>
        </div>
      </section>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function valueFontSize(value: string, variant: 'card' | 'overlay'): string {
  const len = value.length;
  if (variant === 'overlay') {
    if (len <= 10) return 'text-lg';
    if (len <= 14) return 'text-base';
    return 'text-sm';
  }
  if (len <= 10) return 'text-2xl';
  if (len <= 14) return 'text-xl';
  return 'text-lg';
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
      <p className={`font-mono font-bold leading-none mb-1 ${valueFontSize(fmt(portfolioValue), 'overlay')}`} style={{ color }}>
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

function ScenarioCard({
  label, rate, portfolioValue, btcPrice, color, featured, scenario, isSelected, onSelect, fmt,
}: {
  label: string; rate: string;
  portfolioValue: number; btcPrice: number | null;
  color: string; featured?: boolean;
  scenario: Scenario; isSelected: boolean; onSelect: (s: Scenario) => void;
  fmt: (v: number | null) => string;
}) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      onClick={() => onSelect(scenario)}
      className="relative w-full min-w-0 rounded-2xl border p-6 text-center cursor-pointer transition-all duration-200 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        background:   isSelected ? `linear-gradient(135deg, ${color}22, ${color}0C)` : featured ? `linear-gradient(135deg, ${color}18, ${color}08)` : 'rgba(255,255,255,0.03)',
        borderColor:  isSelected ? `${color}66` : featured ? `${color}44` : 'rgba(255,255,255,0.07)',
        boxShadow:    isSelected ? `0 0 36px ${color}44` : featured ? `0 0 30px ${color}22` : 'none',
        outlineColor: color,
      }}
    >
      {featured && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-mono font-bold"
          style={{ background: color, color: '#000' }}
        >
          {t.scenario_base_badge}
        </div>
      )}
      <p className="font-display text-lg font-bold mb-1" style={{ color }}>{label}</p>
      <p className="font-mono text-xs mb-4" style={{ color: `${color}88` }}>{rate}</p>

      {/* Portfolio value */}
      <p className={`font-mono font-bold mb-1 ${valueFontSize(fmt(portfolioValue), 'card')}`} style={{ color }}>
        {fmt(portfolioValue)}
      </p>
      <p className="text-[10px] font-mono mb-4" style={{ color: isSelected ? `${color}88` : C_TICK }}>
        {isSelected ? t.scenario_tap_dismiss : t.scenario_tap_hint}
      </p>

      {/* BTC price prediction */}
      {btcPrice != null && (
        <div
          className="rounded-lg px-3 py-2 border"
          style={{ background: `${color}0C`, borderColor: `${color}22` }}
        >
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">
            {t.scenario_btc_label}
          </p>
          <p className="font-mono font-bold text-lg" style={{ color }}>
            {fmt(btcPrice)}
          </p>
        </div>
      )}
    </button>
  );
}
