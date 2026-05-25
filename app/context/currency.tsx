'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

export type Currency = 'EUR' | 'USD' | 'CHF';

const SYMBOL: Record<Currency, string> = { EUR: '€', USD: '$', CHF: 'Fr.' };
const LOCALE: Record<Currency, string> = { EUR: 'de-DE', USD: 'en-US', CHF: 'de-CH' };

export type ExchangeRates = Record<Currency, number>;

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  fmt: (eurAmount: number | null, showSign?: boolean) => string;
  symbol: string;
  convert: (eurAmount: number) => number;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ rates, children }: { rates: ExchangeRates; children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('EUR');

  const convert = (eurAmount: number) => eurAmount * rates[currency];

  const fmt = (eurAmount: number | null, showSign = false): string => {
    if (eurAmount == null) return '—';
    const converted = convert(eurAmount);
    const abs = Math.abs(converted).toLocaleString(LOCALE[currency], {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    const sign = showSign && converted >= 0 ? '+' : converted < 0 ? '-' : '';
    return `${sign}${SYMBOL[currency]}${abs}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, fmt, symbol: SYMBOL[currency], convert }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
