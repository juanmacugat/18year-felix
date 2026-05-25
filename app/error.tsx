'use client';

import { useEffect } from 'react';
import { Bitcoin, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(180deg, #08091A 0%, #0C0A1F 100%)' }}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl mb-6"
        style={{ background: 'rgba(247,147,26,0.12)', boxShadow: 'inset 0 0 0 1px rgba(247,147,26,0.25)' }}
      >
        <Bitcoin className="h-7 w-7" style={{ color: '#F7931A' }} />
      </div>
      <h1 className="font-display text-3xl font-bold text-white mb-2">Felixfolio</h1>
      <p className="text-slate-400 text-sm mb-1">Unable to load portfolio data.</p>
      <p className="text-slate-600 text-xs mb-8 font-mono">
        {error.digest ? `ref: ${error.digest}` : 'Check your connection and try again.'}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-80 cursor-pointer"
        style={{ background: '#F7931A' }}
      >
        <RefreshCw className="h-4 w-4" />
        Try again
      </button>
    </div>
  );
}
