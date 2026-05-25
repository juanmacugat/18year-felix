'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Tooltip, Legend, Filler,
  type ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { useCurrency } from '@/app/context/currency';
import { cn } from '@/lib/utils';
import type { ChartWindow } from '@/app/api/chart/route';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

interface ChartPayload {
  timestamps:     number[];
  investedSeries: number[];
  valueSeries:    number[];
}

const WINDOWS: { key: ChartWindow; label: string }[] = [
  { key: '15m', label: '15m' },
  { key: '1d',  label: '1D'  },
  { key: '1w',  label: '1W'  },
];

function formatLabel(ts: number, window: ChartWindow): string {
  const d = new Date(ts);
  if (window === '1w') {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

export default function PortfolioChart() {
  const [window, setWindow] = useState<ChartWindow>('1d');
  const [data,   setData]   = useState<ChartPayload | null>(null);
  const [error,  setError]  = useState<string | null>(null);
  const { fmt, convert, symbol } = useCurrency();

  useEffect(() => {
    setData(null);
    setError(null);

    const load = () =>
      fetch(`/api/chart?window=${window}`)
        .then(r => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then(setData)
        .catch(e => setError(e.message));

    load();
    const id = setInterval(load, 15 * 60 * 1_000);
    return () => clearInterval(id);
  }, [window]);

  const options = useMemo<ChartOptions<'line'>>(() => ({
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        labels: {
          color: 'hsl(215 14% 50%)',
          usePointStyle: true,
          pointStyleWidth: 8,
          padding: 20,
          font: { size: 12, family: 'var(--font-mono)' },
        },
      },
      tooltip: {
        backgroundColor: 'hsl(229 23% 11%)',
        borderColor: 'hsl(230 16% 16%)',
        borderWidth: 1,
        titleColor: 'hsl(215 14% 50%)',
        bodyColor: 'hsl(210 20% 96%)',
        padding: 12,
        bodyFont: { family: 'var(--font-mono)', size: 13 },
        callbacks: {
          label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'hsl(215 14% 36%)', maxTicksLimit: 8, maxRotation: 0, font: { size: 11 } },
        grid:  { color: 'hsl(230 16% 14%)' },
        border: { color: 'transparent' },
      },
      y: {
        ticks: {
          color: 'hsl(215 14% 36%)',
          font: { family: 'var(--font-mono)', size: 11 },
          callback: v => symbol + Number(convert(Number(v))).toLocaleString('de-DE', { maximumFractionDigits: 0 }),
        },
        grid:  { color: 'hsl(230 16% 14%)' },
        border: { color: 'transparent' },
      },
    },
  }), [fmt, convert, symbol]);

  const pnl    = data ? (data.valueSeries.at(-1) ?? 0) - (data.investedSeries.at(-1) ?? 0) : null;
  const pnlPct = data && (data.investedSeries.at(-1) ?? 0) > 0
    ? (pnl! / data.investedSeries.at(-1)!) * 100
    : null;

  const chartData = data ? {
    labels: data.timestamps.map(ts => formatLabel(ts, window)),
    datasets: [
      {
        label: 'Portfolio Value',
        data: data.valueSeries,
        borderColor: 'hsl(142 76% 56%)',
        backgroundColor: 'hsl(142 76% 56% / 0.06)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Invested',
        data: data.investedSeries,
        borderColor: 'hsl(221 83% 65%)',
        backgroundColor: 'hsl(221 83% 65% / 0.06)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
        fill: false,
      },
    ],
  } : null;

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <CardTitle>Performance</CardTitle>
          </div>
          {/* Window selector */}
          <div className="flex items-center rounded-md border border-border/60 bg-muted/20 p-0.5">
            {WINDOWS.map(w => (
              <button
                key={w.key}
                onClick={() => setWindow(w.key)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded transition-all cursor-pointer',
                  w.key === window
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground/80',
                )}
              >
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-right">
          {pnl != null ? (
            <>
              <p className={`font-mono text-sm font-medium ${pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmt(pnl, true)}
              </p>
              {pnlPct != null && (
                <p className={`font-mono text-xs ${pnl >= 0 ? 'text-emerald-400/60' : 'text-red-400/60'}`}>
                  {pnlPct >= 0 ? '+' : ''}{pnlPct.toFixed(1)}%
                </p>
              )}
            </>
          ) : (
            <div className="h-9" /> /* reserve space while loading */
          )}
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="flex items-center gap-3 py-8 text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm">Failed to load chart: {error}</span>
          </div>
        ) : !chartData ? (
          <div className="flex h-64 items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </CardContent>
    </Card>
  );
}
