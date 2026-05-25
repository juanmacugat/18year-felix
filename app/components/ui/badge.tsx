import * as React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'muted';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        variant === 'muted'
          ? 'bg-muted/40 text-muted-foreground ring-border/40'
          : 'bg-primary/10 text-primary ring-primary/20',
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
