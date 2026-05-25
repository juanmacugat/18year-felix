'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { type Lang, type Translations, TRANSLATIONS } from '@/lib/i18n';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({
  children,
  initialLang = 'en',
}: {
  children: ReactNode;
  initialLang?: Lang;
}) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  function setLang(l: Lang) {
    setLangState(l);
    document.documentElement.lang = l;
    document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`;
  }

  // Keep html[lang] in sync after client-side hydration
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: TRANSLATIONS[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
