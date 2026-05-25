'use client';

import { useCurrency } from '@/app/context/currency';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/ui/card';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  eurAmount: number | null;
  showSign?: boolean;
  sub?: string;
  trend?: 'up' | 'down';
}

export default function StatCard({ label, eurAmount, showSign, sub, trend }: Props) {
  const { fmt } = useCurrency();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className={cn(
          'font-mono text-2xl font-medium tracking-tight',
          trend === 'up'   && 'text-emerald-400',
          trend === 'down' && 'text-red-400',
          !trend           && 'text-foreground',
        )}>
          {fmt(eurAmount, showSign)}
        </p>
        {sub && (
          <p className={cn(
            'font-mono text-sm mt-1',
            trend === 'up'   && 'text-emerald-400/60',
            trend === 'down' && 'text-red-400/60',
            !trend           && 'text-muted-foreground',
          )}>
            {sub}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
