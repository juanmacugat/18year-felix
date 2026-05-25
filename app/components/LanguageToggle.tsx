'use client';

import { useLanguage } from '@/app/context/language';
import { type Lang } from '@/lib/i18n';
import { SelectDropdown, type SelectOption } from '@/app/components/ui/select-dropdown';

const OPTIONS: SelectOption<Lang>[] = [
  { value: 'en', label: 'EN', sublabel: 'English' },
  { value: 'es', label: 'ES', sublabel: 'Español' },
  { value: 'fr', label: 'FR', sublabel: 'Français' },
  { value: 'de', label: 'DE', sublabel: 'Deutsch' },
];

export default function LanguageToggle() {
  const { lang, setLang } = useLanguage();
  return <SelectDropdown options={OPTIONS} value={lang} onChange={setLang} />;
}
