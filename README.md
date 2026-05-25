# Felixfolio

A personal Bitcoin DCA tracker built as a gift for Felix (my nephew), unlocking on June 17, 2044, when he turns 18. Deployed on Arbitrum One.

18 years of weekly €25 DCA — tracked, projected, and visualized as a scroll journey from newborn to adult.

---

## What it does

- **Live portfolio dashboard** — pulls real-time BTC balance and EUR value from Bitpanda via API
- **Scroll journey** — an 18-year animated scroll from 2026 to 2044, with milestone images and projected portfolio value at each age
- **Projection chart** — three scenarios (Bear 15%, Base 35%, Bull 60% average annual growth) with interactive explanations
- **Multi-language** — English, Spanish, French, German; preference persisted via cookie
- **Multi-currency** — EUR, USD, CHF; exchange rates derived live from Bitpanda price data

---

## Tech stack

- **Next.js 15** (App Router, server components, `force-dynamic`)
- **TypeScript**
- **Tailwind CSS v3** + shadcn/ui tokens
- **Chart.js** + react-chartjs-2
- **Bitpanda API v1** — portfolio balances and trade history
- **CoinGecko API** — live EUR/USD/CHF prices

---

## Prerequisites

- Node.js 18+
- A Bitpanda account with API access (the gift DCA purchases must be made through Bitpanda)

---

## Setup

```bash
npm install
```

Create a `.env.local` file at the project root:

```env
BITPANDA_API_KEY=your_bitpanda_api_key_here
```

The API key needs read access to wallets and trades. No write permissions required.

---

## Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The page fetches live data on every request (`force-dynamic`). If the Bitpanda API is unavailable, the page renders gracefully with `—` placeholders for all values.

---

## Project structure

```
app/
  components/
    BabyCharacter.tsx      # Milestone character — 9 stages keyed to journey age
    CurrencyToggle.tsx     # Currency dropdown (EUR/USD/CHF)
    Footer.tsx
    LandingHero.tsx        # Portfolio dashboard hero section
    LanguageToggle.tsx     # Language dropdown (EN/ES/FR/DE)
    Navbar.tsx             # Fixed header, transparent → frosted on scroll
    ProjectionTimeline.tsx # 520vh scroll journey + projection chart
    ui/
      select-dropdown.tsx  # Generic <SelectDropdown<T>> component
  context/
    currency.tsx           # CurrencyProvider + useCurrency
    language.tsx           # LanguageProvider + useLanguage (cookie-persisted)
  error.tsx                # Error boundary for API failures
  layout.tsx               # Figtree + JetBrains Mono + Fredoka fonts, lang from cookie
  page.tsx                 # Server component — fetches portfolio + invested total
lib/
  bitpanda.ts              # Bitpanda API client (portfolio, trades)
  coingecko.ts             # CoinGecko price fetcher
  colors.ts                # Brand color constants (C_BTC, C_GOLD, C_BEAR, etc.)
  constants.ts             # GIFT_START_DATE
  filters.ts               # Gift scope filters (GIFT_ASSETS, GIFT_START_TS)
  i18n.ts                  # Translation dictionaries — EN/ES/FR/DE
  utils.ts                 # cn() helper
public/
  milestones/              # 9 WebP milestone images (transparent background)
  hero-image.png           # Unused source — processed version in hero-image.webp
```

---

## Gift scope

All portfolio calculations are scoped to:
- **Asset**: BTC only
- **Start date**: May 12, 2026 (the gift start date)

Both constraints live in `lib/filters.ts`. To track a different asset or different date range, edit `GIFT_ASSETS` and `GIFT_START_DATE` in `lib/constants.ts`.

---

## DCA parameters

The projection model uses €25/week (≈ €108.71/month). To change the contribution amount, update `WEEKLY_DCA` in `app/components/ProjectionTimeline.tsx`.

Scenarios:

| Label | Avg annual growth | Historical reference |
|-------|------------------|----------------------|
| Bear  | 15% | More pessimistic than any long-term BTC window on record |
| Base  | 35% | Matches DCA returns over any rolling 8-year BTC window (2015–2023) |
| Bull  | 60% | Matches 2015–2020 DCA window (~65% CAGR) |

---

## Unlock date

June 17, 2044 — Felix's 18th birthday. The contract on Arbitrum One holds the WBTC until this date.

---

## Fonts

- **Fredoka** — display headlines
- **Figtree** — body text
- **JetBrains Mono** — numbers, data, labels

All loaded via `next/font/google` with subset optimization.
