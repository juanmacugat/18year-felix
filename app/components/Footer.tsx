'use client';

import { useLanguage } from '@/app/context/language';

export default function Footer() {
  const { t } = useLanguage();
  return (
    <footer className="py-8 text-center text-xs text-muted-foreground/30 font-mono">
      {t.footer}
    </footer>
  );
}
