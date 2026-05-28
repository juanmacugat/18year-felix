import { getPortfolio, getTotalInvested, type Portfolio } from '@/lib/bitpanda';
import { type ExchangeRates, CurrencyProvider } from '@/app/context/currency';
import Navbar from '@/app/components/Navbar';
import LandingHero from '@/app/components/LandingHero';
import ProjectionTimeline from '@/app/components/ProjectionTimeline';
import Footer from '@/app/components/Footer';

export const dynamic = 'force-dynamic';

const FALLBACK_RATES: ExchangeRates = { EUR: 1, USD: 1.08, CHF: 0.97 };

export default async function Page() {
  let portfolio: Portfolio | null = null;
  let totalInvested: number | null = null;

  try {
    [portfolio, totalInvested] = await Promise.all([
      getPortfolio(),
      getTotalInvested(),
    ]);
  } catch {
    // API unavailable — render with null values, error.tsx handles catastrophic failures
  }

  const rates        = portfolio?.exchangeRates ?? FALLBACK_RATES;
  const assets       = portfolio?.assets ?? [];
  const totalEurValue = portfolio?.totalEurValue ?? null;

  const btcAsset    = assets.find(a => a.symbol === 'BTC');
  const btcBalance  = btcAsset?.balance ?? null;
  const btcPriceEur = btcAsset && btcAsset.balance > 0 && btcAsset.eurValue != null
    ? btcAsset.eurValue / btcAsset.balance
    : null;

  return (
    <CurrencyProvider rates={rates}>
      <Navbar />
      <main>

      {/* ── Landing hero ── */}
      <LandingHero
        totalEurValue={totalEurValue}
        totalInvested={totalInvested}
        btcBalance={btcBalance}
      />

      {/* ── 18-year projection timeline ── */}
      <ProjectionTimeline
        totalEurValue={totalEurValue ?? 0}
        btcPriceEur={btcPriceEur}
      />

      <Footer />
      </main>
    </CurrencyProvider>
  );
}
