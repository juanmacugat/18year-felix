'use client';

import { useCurrency, type Currency } from '@/app/context/currency';
import { SelectDropdown, type SelectOption } from '@/app/components/ui/select-dropdown';

const OPTIONS: SelectOption<Currency>[] = [
  { value: 'EUR', label: 'EUR', sublabel: 'Euro' },
  { value: 'USD', label: 'USD', sublabel: 'US Dollar' },
  { value: 'CHF', label: 'CHF', sublabel: 'Swiss Franc' },
];

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  return <SelectDropdown options={OPTIONS} value={currency} onChange={setCurrency} />;
}
