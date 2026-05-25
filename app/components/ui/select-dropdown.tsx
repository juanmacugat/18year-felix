'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SelectOption<T extends string> {
  value: T;
  label: string;
  sublabel?: string;
}

interface Props<T extends string> {
  options: SelectOption<T>[];
  value: T;
  onChange: (v: T) => void;
  triggerClassName?: string;
}

export function SelectDropdown<T extends string>({
  options,
  value,
  onChange,
  triggerClassName,
}: Props<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = options.find(o => o.value === value)!;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 min-h-[36px] text-xs font-medium text-foreground/80 transition-colors hover:bg-muted/40 hover:text-foreground cursor-pointer select-none',
          open && 'bg-muted/40 text-foreground',
          triggerClassName,
        )}
      >
        <span>{current.label}</span>
        <ChevronDown
          className={cn('h-3 w-3 text-muted-foreground transition-transform duration-150', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1.5 min-w-[8rem] overflow-hidden rounded-xl border border-white/10 py-1 shadow-2xl"
          style={{ background: 'hsl(var(--overlay-bg))' }}
        >
          {options.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                'flex w-full items-center justify-between gap-3 px-3 py-2.5 min-h-[40px] text-left text-xs transition-colors cursor-pointer',
                opt.value === value
                  ? 'text-foreground bg-white/5'
                  : 'text-muted-foreground hover:bg-white/5 hover:text-foreground',
              )}
            >
              <span className="flex flex-col gap-0.5">
                <span className="font-medium">{opt.label}</span>
                {opt.sublabel && (
                  <span className="text-[10px] text-muted-foreground/60">{opt.sublabel}</span>
                )}
              </span>
              {opt.value === value && <Check className="h-3 w-3 shrink-0 text-[#F7931A]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
