import { cache } from 'react';
import { getCurrentPrices, getGeckoId } from '@/lib/coingecko';
import { GIFT_ASSETS, filterGiftTrades } from '@/lib/filters';

const BASE = 'https://api.bitpanda.com/v1';

function authHeaders() {
  if (!process.env.BITPANDA_API_KEY) throw new Error('BITPANDA_API_KEY is not set');
  return { 'X-Api-Key': process.env.BITPANDA_API_KEY };
}

export interface AssetRow {
  symbol: string;
  type: 'crypto' | 'fiat' | 'commodity';
  balance: number;
  eurValue: number | null;
}

export interface Portfolio {
  assets: AssetRow[];
  totalEurValue: number;
  exchangeRates: { EUR: 1; USD: number; CHF: number };
}

export interface Trade {
  id: string;
  attributes: {
    status: string;
    type: string;
    cryptocoin_symbol?: string;
    symbol?: string;
    amount_cryptocoin: string;
    amount_fiat: string;
    price: string;
    is_savings?: boolean;
    time: { date_iso8601?: string; unix?: string };
  };
}

// Request-memoised so getPortfolio() and getTotalInvested() share one trades fetch per render
export const getAllTrades = cache(async (): Promise<Trade[]> => {
  const trades: Trade[] = [];
  let cursor: string | null = null;
  do {
    const qs: string = `page_size=100${cursor ? `&cursor=${cursor}` : ''}`;
    const res = await fetch(`${BASE}/trades?${qs}`, {
      headers: authHeaders(),
      next: { revalidate: 0 },
    });
    if (res.status === 401) break;
    if (!res.ok) throw new Error(`Bitpanda ${res.status}: /trades`);
    const { data, meta }: { data: Trade[]; meta?: { next_cursor?: string } } = await res.json();
    trades.push(...(data ?? []));
    cursor = meta?.next_cursor ?? null;
  } while (cursor);
  return trades;
});

export async function getPortfolio(): Promise<Portfolio> {
  // Build symbol → CoinGecko ID map for all tracked assets
  const symbolToId: Record<string, string> = {};
  for (const sym of GIFT_ASSETS) {
    const id = getGeckoId(sym);
    if (id) symbolToId[sym] = id;
  }
  const geckoIds = Object.values(symbolToId);

  const [prices, allTrades] = await Promise.all([
    getCurrentPrices(geckoIds),
    getAllTrades(),
  ]);

  // Derive the gift-scoped balance from filtered trades, not /wallets,
  // so it stays in sync with the same filter used for totalInvested.
  const filtered = filterGiftTrades(allTrades);
  const balanceBySymbol: Record<string, number> = {};
  for (const tr of filtered) {
    const delta = tr.type === 'buy' ? tr.crypto : -tr.crypto;
    balanceBySymbol[tr.symbol] = (balanceBySymbol[tr.symbol] ?? 0) + delta;
  }

  const assets: AssetRow[] = [];
  let total = 0;
  for (const sym of GIFT_ASSETS) {
    const bal = balanceBySymbol[sym] ?? 0;
    if (bal === 0) continue;

    const id       = symbolToId[sym];
    const eurPrice = id ? (prices[id]?.eur ?? null) : null;
    const eurValue = eurPrice != null ? bal * eurPrice : null;
    if (eurValue != null) total += eurValue;
    assets.push({ symbol: sym, type: 'crypto', balance: bal, eurValue });
  }

  // Derive fiat exchange rates from first tracked asset with prices
  const refPrices = geckoIds.map(id => prices[id]).find(p => p?.eur > 0);
  const exchangeRates = {
    EUR: 1 as const,
    USD: refPrices ? refPrices.usd / refPrices.eur : 1,
    CHF: refPrices ? refPrices.chf / refPrices.eur : 1,
  };

  return { assets, totalEurValue: total, exchangeRates };
}

export async function getTotalInvested(): Promise<number | null> {
  const trades   = await getAllTrades();
  const filtered = filterGiftTrades(trades);
  if (!filtered.length) return null;
  return filtered.reduce((sum, t) => t.type === 'buy' ? sum + t.eur : sum - t.eur, 0);
}
