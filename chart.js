import 'dotenv/config';
import { writeFileSync } from 'fs';
import { execSync } from 'child_process';

const BASE_URL = 'https://api.bitpanda.com/v1';
const GECKO_BASE = 'https://api.coingecko.com/api/v3';
const API_KEY = process.env.BITPANDA_API_KEY;

if (!API_KEY) {
  console.error('Missing BITPANDA_API_KEY in .env');
  process.exit(1);
}

// Bitpanda symbol → CoinGecko ID
const GECKO_IDS = {
  BTC: 'bitcoin', ETH: 'ethereum', ADA: 'cardano', SOL: 'solana',
  XRP: 'ripple', DOT: 'polkadot', LTC: 'litecoin', LINK: 'chainlink',
  MATIC: 'matic-network', POL: 'matic-network', DOGE: 'dogecoin',
  USDT: 'tether', USDC: 'usd-coin', UNI: 'uniswap', AAVE: 'aave',
  ATOM: 'cosmos', AVAX: 'avalanche-2', ALGO: 'algorand', XLM: 'stellar',
  NEAR: 'near', OP: 'optimism', ARB: 'arbitrum', SHIB: 'shiba-inu',
  VET: 'vechain', TRX: 'tron', XTZ: 'tezos', FTM: 'fantom',
  BEST: 'bitpanda-ecosystem-token',
};

async function apiGet(path) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'X-Api-Key': API_KEY },
  });
  if (!res.ok) throw new Error(`Bitpanda ${res.status}: ${path}`);
  return res.json();
}

async function geckoGet(path) {
  const res = await fetch(`${GECKO_BASE}${path}`);
  if (res.status === 429) throw new Error('CoinGecko rate limit — wait 60s and retry');
  if (!res.ok) throw new Error(`CoinGecko ${res.status}: ${path}`);
  return res.json();
}

async function fetchAllTrades() {
  const trades = [];
  let cursor = null;
  do {
    const qs = `page_size=100${cursor ? `&cursor=${cursor}` : ''}`;
    const { data, meta } = await apiGet(`/trades?${qs}`);
    trades.push(...(data ?? []));
    cursor = meta?.next_cursor ?? null;
  } while (cursor);
  return trades;
}

// Returns { "YYYY-MM-DD": price, ... }
async function fetchDailyPrices(geckoId) {
  const { prices } = await geckoGet(
    `/coins/${geckoId}/market_chart?vs_currency=eur&days=max&interval=daily`
  );
  const map = {};
  for (const [ts, price] of prices) {
    map[new Date(ts).toISOString().slice(0, 10)] = price;
  }
  return map;
}

function eachDay(from, to) {
  const days = [];
  const cur = new Date(from);
  const end = new Date(to);
  while (cur <= end) {
    days.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }
  return days;
}

async function buildSeries(trades) {
  const finished = trades.filter(t => t.attributes.status === 'finished');

  if (!finished.length) {
    console.log('No finished trades found.');
    return null;
  }

  // Normalise each trade into a flat object
  const normalised = finished.map(t => {
    const a = t.attributes;
    const date = (a.time?.date_iso8601 ?? new Date(a.time?.unix * 1000).toISOString()).slice(0, 10);
    return {
      date,
      type: a.type,                                     // 'buy' | 'sell'
      symbol: a.cryptocoin_symbol ?? a.symbol ?? null,
      crypto: parseFloat(a.amount_cryptocoin ?? a.amount ?? 0),
      eur: parseFloat(a.amount_fiat ?? a.fiat_amount ?? 0),
    };
  }).filter(t => t.symbol && t.date).sort((a, b) => a.date.localeCompare(b.date));

  const symbols = [...new Set(normalised.map(t => t.symbol))];
  const firstDate = normalised[0].date;
  const today = new Date().toISOString().slice(0, 10);
  const days = eachDay(firstDate, today);

  // Fetch historical EUR prices for each symbol
  console.log(`\nFetching price history for: ${symbols.join(', ')}`);
  const prices = {};
  for (const sym of symbols) {
    const id = GECKO_IDS[sym];
    if (!id) { console.warn(`  ${sym} — no CoinGecko ID, skipping`); continue; }
    try {
      prices[sym] = await fetchDailyPrices(id);
      console.log(`  ${sym} ✓  (${Object.keys(prices[sym]).length} days)`);
    } catch (e) {
      console.warn(`  ${sym} ✗  ${e.message}`);
    }
    // CoinGecko free tier: ~10-15 req/min — stay safe
    await new Promise(r => setTimeout(r, 1500));
  }

  // Index trades by date
  const byDate = {};
  for (const t of normalised) {
    (byDate[t.date] ??= []).push(t);
  }

  // Walk each day, accumulate holdings and compute EUR value
  const holdings = {};
  let invested = 0;
  const investedSeries = [];
  const valueSeries = [];

  for (const day of days) {
    for (const t of (byDate[day] ?? [])) {
      holdings[t.symbol] ??= 0;
      if (t.type === 'buy') {
        holdings[t.symbol] += t.crypto;
        invested += t.eur;
      } else if (t.type === 'sell') {
        holdings[t.symbol] -= t.crypto;
        invested -= t.eur;
      }
    }

    let dayValue = 0;
    let priceFound = false;
    for (const [sym, amount] of Object.entries(holdings)) {
      if (amount <= 0 || !prices[sym]) continue;
      // Use the exact day, or fall back to the most recent available price
      const price = prices[sym][day] ?? findLatestPrice(prices[sym], day);
      if (price) { dayValue += amount * price; priceFound = true; }
    }

    investedSeries.push(+invested.toFixed(2));
    valueSeries.push(priceFound ? +dayValue.toFixed(2) : null);
  }

  return { days, investedSeries, valueSeries };
}

// Returns the most recent known price on or before `date`
function findLatestPrice(priceMap, date) {
  let latest = null;
  for (const d of Object.keys(priceMap).sort()) {
    if (d <= date) latest = priceMap[d];
    else break;
  }
  return latest;
}

function generateHTML(days, investedSeries, valueSeries) {
  const lastValue = [...valueSeries].reverse().find(v => v != null) ?? 0;
  const lastInvested = investedSeries.at(-1) ?? 0;
  const pnl = lastValue - lastInvested;
  const pnlPct = lastInvested > 0 ? ((pnl / lastInvested) * 100).toFixed(1) : '—';
  const pnlColor = pnl >= 0 ? '#3ecf8e' : '#f87171';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Portfolio Performance — Felix BTC Gift</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0f1117; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px 48px; }
    h1 { font-size: 1.3rem; font-weight: 600; color: #fff; margin-bottom: 4px; }
    .subtitle { font-size: 0.8rem; color: #666; margin-bottom: 32px; }
    .stats { display: flex; gap: 32px; margin-bottom: 32px; }
    .stat { background: #1a1d27; border-radius: 10px; padding: 16px 20px; min-width: 160px; }
    .stat-label { font-size: 0.72rem; color: #666; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 6px; }
    .stat-value { font-size: 1.4rem; font-weight: 600; color: #fff; }
    .stat-value.pos { color: #3ecf8e; }
    .stat-value.neg { color: #f87171; }
    .chart-wrap { background: #1a1d27; border-radius: 12px; padding: 28px 24px; }
    canvas { max-height: 420px; }
  </style>
</head>
<body>
  <h1>Portfolio Performance — Felix BTC Gift</h1>
  <p class="subtitle">Invested vs. market value · data from Bitpanda + CoinGecko</p>

  <div class="stats">
    <div class="stat">
      <div class="stat-label">Invested</div>
      <div class="stat-value">€${lastInvested.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    <div class="stat">
      <div class="stat-label">Current Value</div>
      <div class="stat-value">€${lastValue.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
    </div>
    <div class="stat">
      <div class="stat-label">P&L</div>
      <div class="stat-value ${pnl >= 0 ? 'pos' : 'neg'}">${pnl >= 0 ? '+' : ''}€${pnl.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${pnlPct}%)</div>
    </div>
  </div>

  <div class="chart-wrap">
    <canvas id="chart"></canvas>
  </div>

  <script>
    const labels = ${JSON.stringify(days)};
    const invested = ${JSON.stringify(investedSeries)};
    const value = ${JSON.stringify(valueSeries)};

    new Chart(document.getElementById('chart'), {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Portfolio Value (EUR)',
            data: value,
            borderColor: '#3ecf8e',
            backgroundColor: 'rgba(62,207,142,0.06)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.3,
            spanGaps: true,
          },
          {
            label: 'Invested (EUR)',
            data: invested,
            borderColor: '#5b8dee',
            backgroundColor: 'rgba(91,141,238,0.06)',
            borderWidth: 2,
            pointRadius: 0,
            fill: false,
            tension: 0.1,
          },
        ],
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            labels: { color: '#888', usePointStyle: true, pointStyleWidth: 10 },
          },
          tooltip: {
            backgroundColor: '#1a1d27',
            borderColor: '#2a2d3a',
            borderWidth: 1,
            titleColor: '#aaa',
            bodyColor: '#ddd',
            callbacks: {
              label: ctx => {
                const v = ctx.parsed.y;
                if (v == null) return \` \${ctx.dataset.label}: —\`;
                return \` \${ctx.dataset.label}: €\${v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\`;
              },
            },
          },
        },
        scales: {
          x: {
            ticks: { color: '#555', maxTicksLimit: 10, maxRotation: 0 },
            grid: { color: '#1f2232' },
          },
          y: {
            ticks: {
              color: '#555',
              callback: v => '€' + v.toLocaleString('de-DE'),
            },
            grid: { color: '#1f2232' },
          },
        },
      },
    });
  </script>
</body>
</html>`;
}

async function main() {
  process.stdout.write('Fetching all trades...');
  const trades = await fetchAllTrades();
  console.log(` ${trades.length} found`);

  const result = await buildSeries(trades);
  if (!result) return;

  const { days, investedSeries, valueSeries } = result;
  const html = generateHTML(days, investedSeries, valueSeries);

  writeFileSync('portfolio-chart.html', html);
  console.log('\nSaved → portfolio-chart.html');

  try { execSync('open portfolio-chart.html'); } catch { /* non-mac */ }
}

main().catch(err => {
  console.error('\nError:', err.message);
  process.exit(1);
});
