'use client';

import { type AssetRow } from '@/lib/bitpanda';
import { useCurrency } from '@/app/context/currency';
import { Card } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';

interface Props { assets: AssetRow[] }

const TYPE_LABEL: Record<AssetRow['type'], string> = {
  crypto: 'Crypto',
  fiat: 'Fiat',
  commodity: 'Commodity',
};

export default function Holdings({ assets }: Props) {
  const { fmt } = useCurrency();

  if (!assets.length) {
    return (
      <Card className="p-6 text-center text-muted-foreground text-sm">
        No holdings found.
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Asset</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Balance</TableHead>
            <TableHead className="text-right">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.map(asset => (
            <TableRow key={asset.symbol}>
              <TableCell className="font-medium">{asset.symbol}</TableCell>
              <TableCell>
                <Badge variant="muted">{TYPE_LABEL[asset.type]}</Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-muted-foreground">
                {asset.balance.toFixed(8)}
              </TableCell>
              <TableCell className="text-right font-mono">
                {asset.eurValue != null
                  ? fmt(asset.eurValue)
                  : <span className="text-muted-foreground/40">—</span>
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
