import { NextResponse } from 'next/server';
import { getAllTrades } from '@/lib/bitpanda';
import { fetchPriceHistory, getCurrentPrices, getGeckoId } from '@/lib/coingecko';
import { filterGiftTrades, GIFT_ASSETS, GIFT_START_TS } from '@/lib/filters';

export const dynamic     = 'force-dynamic';
export const maxDuration = 30;

export type ChartWindow = '15m' | '1d' | '1w';
const VALID_WINDOWS: ChartWindow[] = ['15m', '1d', '1w'];

const GECKO_DAYS: Record<ChartWindow, number> = { '15m': 1, '1d': 1, '1w': 7 };
const WINDOW_MS:  Record<ChartWindow, number> = {
  '15m': 15 * 60 * 1_000,
  '1d':  24 * 60 * 60 * 1_000,
  '1w':   7 * 24 * 60 * 60 * 1_000,
};

/** Latest price at or before `ts` in a sorted [timestamp, price][] array. */
function priceAt(history: [number, number][], ts: number): number | null {
  let last: number | null = null;
  for (const [t, p] of history) {
    if (t <= ts) last = p; else break;
  }
  return last;
}

/** Flat fallback price history spanning [from, to] at the given step interval. */
function flatHistory(from: number, to: number, step: number, price: number): [number, number][] {
  const pts: [number, number][] = [];
  for (let t = from; t <= to; t += step) pts.push([t, price]);
  return pts;
}

export async function GET(request: Request) {
  try {
    const param  = new URL(request.url).searchParams.get('window') ?? '1d';
    const window: ChartWindow = VALID_WINDOWS.includes(param as ChartWindow)
      ? (param as ChartWindow) : '1d';

    const now      = Date.now();
    const cutoffTs = Math.max(now - WINDOW_MS[window], GIFT_START_TS);
    const step     = window === '15m' ? 60_000 : window === '1d' ? 5 * 60_000 : 60 * 60_000;

    // Resolve CoinGecko IDs for every tracked asset
    const assetIds: Record<string, string> = {};
    for (const sym of GIFT_ASSETS) {
      const id = getGeckoId(sym);
      if (id) assetIds[sym] = id;
    }

    // Fetch trades + price histories in parallel
    const [trades, ...histories] = await Promise.all([
      getAllTrades(),
      ...GIFT_ASSETS.map(async sym => {
        const id = assetIds[sym];
        if (!id) return { sym, history: [] as [number, number][] };
        const history = await fetchPriceHistory(id, GECKO_DAYS[window]).catch(async () => {
          // Fallback: flat line from current spot price
          const spot = await getCurrentPrices([id]).then(p => p[id]?.eur ?? 0).catch(() => 0);
          return flatHistory(cutoffTs, now, step, spot);
        });
        return { sym, history };
      }),
    ]);

    // Build per-symbol price history map (filtered to window)
    const priceHistories: Record<string, [number, number][]> = {};
    for (const { sym, history } of histories as { sym: string; history: [number, number][] }[]) {
      priceHistories[sym] = (history as [number, number][]).filter(([ts]) => ts >= cutoffTs);
    }

    // Use the first asset with data as the timestamp spine
    const refSym = GIFT_ASSETS.find(sym => priceHistories[sym]?.length > 0);
    if (!refSym) {
      return NextResponse.json({ timestamps: [], investedSeries: [], valueSeries: [] });
    }
    const refHistory = priceHistories[refSym];

    const giftTrades = filterGiftTrades(trades);

    const timestamps:     number[] = [];
    const investedSeries: number[] = [];
    const valueSeries:    number[] = [];

    for (const [ts] of refHistory) {
      const prior = giftTrades.filter(t => t.ts <= ts);

      const invested = prior.reduce(
        (sum, t) => t.type === 'buy' ? sum + t.eur : sum - t.eur, 0,
      );

      let totalValue = 0;
      for (const sym of GIFT_ASSETS) {
        const symTrades = prior.filter(t => t.symbol === sym);
        const balance   = symTrades.reduce(
          (sum, t) => t.type === 'buy' ? sum + t.crypto : sum - t.crypto, 0,
        );
        if (balance <= 0) continue;
        const price = priceAt(priceHistories[sym] ?? refHistory, ts);
        if (price != null) totalValue += balance * price;
      }

      timestamps.push(ts);
      investedSeries.push(+invested.toFixed(2));
      valueSeries.push(+totalValue.toFixed(2));
    }

    return NextResponse.json({ timestamps, investedSeries, valueSeries });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
