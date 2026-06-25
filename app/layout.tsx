import type { Metadata } from 'next';
import { Figtree, JetBrains_Mono, Fredoka } from 'next/font/google';
import { cookies } from 'next/headers';
import { type Lang } from '@/lib/i18n';
import { LanguageProvider } from '@/app/context/language';
import PasscodeGate from '@/app/components/PasscodeGate';
import './globals.css';

const figtree  = Figtree({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700'] });
const mono     = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500'] });
const fredoka  = Fredoka({ subsets: ['latin'], variable: '--font-fredoka', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  title: 'Hey Félix!',
  description: "18 years of Bitcoin DCA — a gift for Félix, unlocking June 17, 2044",
};

const VALID_LANGS: Lang[] = ['en', 'es', 'fr', 'de'];

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const raw = cookieStore.get('lang')?.value;
  const lang: Lang = VALID_LANGS.includes(raw as Lang) ? (raw as Lang) : 'en';

  return (
    <html lang={lang}>
      <body className={`${figtree.variable} ${mono.variable} ${fredoka.variable} font-sans min-h-screen`}>
        <a
          href="#journey"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-[#F7931A] focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-black"
        >
          Skip to content
        </a>
        <LanguageProvider initialLang={lang}>
          <PasscodeGate>
            {children}
          </PasscodeGate>
        </LanguageProvider>
      </body>
    </html>
  );
}
