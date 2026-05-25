import 'dotenv/config';

const BASE_URL = 'https://api.bitpanda.com/v1';
const API_KEY = process.env.BITPANDA_API_KEY;

if (!API_KEY) {
  console.error('Missing BITPANDA_API_KEY in .env');
  process.exit(1);
}

const headers = { 'X-Api-Key': API_KEY, 'Content-Type': 'application/json' };

async function get(path, authenticated = true) {
  const res = await fetch(`${BASE_URL}${path}`, { headers: authenticated ? headers : {} });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} — ${path}`);
  return res.json();
}

async function fetchTicker() {
  const data = await get('/ticker', false);
  // Response: { "BTC": { "EUR": "...", "USD": "..." }, ... }
  return data;
}

function eurValue(ticker, symbol, balance) {
  const price = parseFloat(ticker[symbol]?.EUR);
  if (!price || isNaN(price)) return null;
  return parseFloat(balance) * price;
}

function fmtEur(value) {
  return `€${value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function row(symbol, balance, eurVal) {
  const bal = parseFloat(balance);
  if (bal === 0) return 0;
  const symCol = symbol.padEnd(8);
  const balCol = bal.toFixed(8).padStart(18);
  const eurCol = eurVal != null ? `  ${fmtEur(eurVal).padStart(14)}` : '';
  console.log(`  ${symCol} ${balCol}${eurCol}`);
  return eurVal ?? 0;
}

async function main() {
  const [ticker] = await Promise.all([fetchTicker()]);

  let total = 0;
  console.log('\n=== Bitpanda Portfolio ===\n');
  console.log(`  ${'Asset'.padEnd(8)} ${'Balance'.padStart(18)}  ${'EUR Value'.padStart(14)}`);
  console.log(`  ${'-'.repeat(46)}`);

  // Crypto wallets
  const { data: cryptoWallets } = await get('/wallets');
  const nonZeroCrypto = cryptoWallets.filter(w => parseFloat(w.attributes.balance) > 0);

  if (nonZeroCrypto.length > 0) {
    console.log('\n  Crypto');
    for (const w of nonZeroCrypto) {
      const { cryptocoin_symbol, balance } = w.attributes;
      const eur = eurValue(ticker, cryptocoin_symbol, balance);
      total += row(cryptocoin_symbol, balance, eur);
    }
  }

  // Fiat wallets
  const { data: fiatWallets } = await get('/fiatwallets');
  const nonZeroFiat = fiatWallets.filter(w => parseFloat(w.attributes.balance) > 0);

  if (nonZeroFiat.length > 0) {
    console.log('\n  Fiat');
    for (const w of nonZeroFiat) {
      const { fiat_symbol, balance } = w.attributes;
      const eur = fiat_symbol === 'EUR' ? parseFloat(balance) : eurValue(ticker, fiat_symbol, balance);
      total += row(fiat_symbol, balance, eur);
    }
  }

  // Asset wallets (metals, stocks, ETFs, commodities)
  const { data: assetWallets } = await get('/asset-wallets');
  const assetTypes = Object.entries(assetWallets.attributes ?? {});

  for (const [type, group] of assetTypes) {
    const wallets = group?.attributes?.wallets ?? [];
    const nonZero = wallets.filter(w => parseFloat(w.attributes.balance) > 0);
    if (nonZero.length === 0) continue;

    const label = type.replace(/_/g, ' ');
    console.log(`\n  ${label.charAt(0).toUpperCase() + label.slice(1)}`);
    for (const w of nonZero) {
      const { symbol, balance } = w.attributes;
      const eur = eurValue(ticker, symbol, balance);
      total += row(symbol, balance, eur);
    }
  }

  console.log(`\n  ${'-'.repeat(46)}`);
  console.log(`  ${'TOTAL'.padEnd(8)} ${' '.repeat(18)}  ${fmtEur(total).padStart(14)}`);
  console.log('\n=========================\n');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
