import type { Trade } from '@/lib/bitpanda';
import { GIFT_START_DATE, GIFT_RECURRING_EUR } from '@/lib/constants';

// ─── Gift scope filters ────────────────────────────────────────────────────
// All asset, date, and amount constraints live here.
// To remove the gift scope, delete this file and the imports that reference it.

export const GIFT_ASSETS:   string[] = ['BTC'];
export const GIFT_START_TS: number   = new Date(GIFT_START_DATE).getTime(); // ms

// Bitpanda's savings-plan fills can drift a few cents either way after fees/rounding
const EUR_TOLERANCE = 0.5;

/** Returns true when a wallet symbol is in scope for this gift. */
export function isGiftAsset(symbol: string): boolean {
  return GIFT_ASSETS.includes(symbol);
}

export interface NormalisedTrade {
  ts:     number;          // Unix ms
  type:   'buy' | 'sell';
  symbol: string;
  crypto: number;
  eur:    number;
}

/**
 * Keeps only finished savings-plan trades for GIFT_ASSETS, on or after
 * GIFT_START_DATE, whose fiat amount matches GIFT_RECURRING_EUR (±tolerance).
 * Flattens each into { ts, type, crypto, eur } sorted oldest-first.
 */
export function filterGiftTrades(trades: Trade[]): NormalisedTrade[] {
  const out: NormalisedTrade[] = [];

  for (const t of trades) {
    const sym = t.attributes.cryptocoin_symbol ?? t.attributes.symbol ?? '';
    if (t.attributes.status !== 'finished' || !isGiftAsset(sym)) continue;
    if (!t.attributes.is_savings) continue;

    const eur = parseFloat(t.attributes.amount_fiat ?? '0');
    if (Math.abs(eur - GIFT_RECURRING_EUR) > EUR_TOLERANCE) continue;

    const iso = t.attributes.time?.date_iso8601;
    const ts  = iso ? new Date(iso).getTime() : Number(t.attributes.time?.unix) * 1_000;
    if (ts < GIFT_START_TS) continue;

    out.push({
      ts,
      type:   t.attributes.type as 'buy' | 'sell',
      symbol: sym,
      crypto: parseFloat(t.attributes.amount_cryptocoin ?? '0'),
      eur,
    });
  }

  return out.sort((a, b) => a.ts - b.ts);
}
