'use client';

import { useCallback, useEffect, useState } from 'react';
import { Lock, Delete } from 'lucide-react';
import { useLanguage } from '@/app/context/language';

const PASSCODE = '290526';
const LENGTH   = PASSCODE.length;
const STORAGE_KEY = 'felixfolio-unlocked';

export default function PasscodeGate({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
  const [unlocked, setUnlocked]   = useState(false);
  const [closing, setClosing]     = useState(false);
  const [entered, setEntered]     = useState('');
  const [wrong, setWrong]         = useState(false);

  // Restore unlock state from this session (lockscreen re-arms on each new tab)
  useEffect(() => {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') setUnlocked(true);
  }, []);

  // Lock the page scroll while the gate is up
  useEffect(() => {
    if (unlocked && !closing) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [unlocked, closing]);

  const handleDigit = useCallback((digit: string) => {
    setEntered(prev => {
      if (prev.length >= LENGTH || wrong) return prev;
      const next = prev + digit;
      if (next.length === LENGTH) {
        if (next === PASSCODE) {
          sessionStorage.setItem(STORAGE_KEY, '1');
          setClosing(true);
          setTimeout(() => setUnlocked(true), 600);
        } else {
          setWrong(true);
          setTimeout(() => {
            setWrong(false);
            setEntered('');
          }, 550);
        }
      }
      return next;
    });
  }, [wrong]);

  const handleBackspace = useCallback(() => {
    setEntered(prev => prev.slice(0, -1));
  }, []);

  // Hardware keyboard support
  useEffect(() => {
    if (unlocked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
      else if (e.key === 'Backspace') handleBackspace();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [unlocked, handleDigit, handleBackspace]);

  return (
    <>
      {children}
      {!unlocked && (
        <div
          className={`fixed inset-0 z-[200] flex items-center justify-center ${closing ? 'animate-passcode-unlock' : ''}`}
          style={{
            background: 'rgba(8, 9, 26, 0.72)',
            backdropFilter:        'blur(48px) saturate(140%)',
            WebkitBackdropFilter:  'blur(48px) saturate(140%)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={t.lock_title}
        >
          <div className={`flex flex-col items-center ${wrong ? 'animate-passcode-shake' : ''}`}>
            <Lock className="w-7 h-7 text-white/90 mb-6" strokeWidth={2.5} aria-hidden="true" />
            <p className="text-white/95 text-xl font-medium mb-8 tracking-tight">
              {t.lock_title}
            </p>

            {/* Dots */}
            <div className="flex gap-5 mb-16">
              {Array.from({ length: LENGTH }).map((_, i) => {
                const filled = i < entered.length;
                return (
                  <span
                    key={i}
                    className="w-3 h-3 rounded-full border border-white/80 transition-colors duration-150"
                    style={{ background: filled ? 'rgba(255,255,255,0.95)' : 'transparent' }}
                  />
                );
              })}
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-x-6 gap-y-4">
              {['1','2','3','4','5','6','7','8','9'].map(d => (
                <KeypadButton key={d} onClick={() => handleDigit(d)}>{d}</KeypadButton>
              ))}
              <span />
              <KeypadButton onClick={() => handleDigit('0')}>0</KeypadButton>
              <button
                type="button"
                onClick={handleBackspace}
                aria-label="Delete"
                className="w-[72px] h-[72px] flex items-center justify-center text-white/85 rounded-full transition active:scale-95 active:bg-white/10 cursor-pointer disabled:opacity-30"
                disabled={entered.length === 0}
              >
                <Delete className="w-7 h-7" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function KeypadButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[72px] h-[72px] rounded-full flex items-center justify-center font-light text-[34px] text-white/95 transition active:scale-95 cursor-pointer select-none"
      style={{
        background:    'rgba(255, 255, 255, 0.18)',
        backdropFilter:       'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow:     'inset 0 0 0 0.5px rgba(255,255,255,0.18)',
      }}
    >
      {children}
    </button>
  );
}
