export const GECKO_IDS: Record<string, string> = {
  BTC: 'bitcoin',     ETH: 'ethereum',    ADA: 'cardano',     SOL: 'solana',
  XRP: 'ripple',      DOT: 'polkadot',    LTC: 'litecoin',    LINK: 'chainlink',
  MATIC: 'matic-network', POL: 'matic-network', DOGE: 'dogecoin',
  USDT: 'tether',     USDC: 'usd-coin',   UNI: 'uniswap',     AAVE: 'aave',
  ATOM: 'cosmos',     AVAX: 'avalanche-2', ALGO: 'algorand',  XLM: 'stellar',
  NEAR: 'near',       OP: 'optimism',     ARB: 'arbitrum',    SHIB: 'shiba-inu',
  VET: 'vechain',     TRX: 'tron',        XTZ: 'tezos',       FTM: 'fantom',
  BEST: 'bitpanda-ecosystem-token',
};

export function getGeckoId(symbol: string): string | undefined {
  return GECKO_IDS[symbol];
}

export interface AssetPrices { eur: number; usd: number; chf: number }

/** Fetch current EUR/USD/CHF spot prices for any list of CoinGecko IDs. */
export async function getCurrentPrices(geckoIds: string[]): Promise<Record<string, AssetPrices>> {
  if (!geckoIds.length) return {};
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds.join(',')}&vs_currencies=eur,usd,chf`,
    { next: { revalidate: 60 } },
  );
  if (res.status === 429) throw new Error('CoinGecko rate limit');
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  return res.json() as Promise<Record<string, AssetPrices>>;
}

// Returns raw [timestamp_ms, price_eur] pairs — granularity is automatic:
//   days=1  → ~5-min intervals   (288 pts/day)
//   days≤90 → hourly intervals
//   days>90 → daily intervals
export async function fetchPriceHistory(geckoId: string, days: number): Promise<[number, number][]> {
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/${geckoId}/market_chart?vs_currency=eur&days=${days}`,
    { next: { revalidate: 60 } },
  );
  if (res.status === 429) throw new Error('CoinGecko rate limit');
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
  const { prices } = await res.json() as { prices: [number, number][] };
  return prices;
}
