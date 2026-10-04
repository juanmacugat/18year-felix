import type { Metadata } from 'next';
import { getAllTrades } from '@/lib/bitpanda';
import { filterGiftTrades } from '@/lib/filters';
import { getCurrentPrices, getGeckoId } from '@/lib/coingecko';
import { Card } from '@/app/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { C_UP, C_DOWN } from '@/lib/colors';

export const dynamic = 'force-dynamic';

// Not linked from anywhere in the UI — reachable only by knowing the URL.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const EUR_FMT = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const DATE_FMT = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export default async function OrdersPage() {
  let orders: ReturnType<typeof filterGiftTrades> = [];
  let btcPriceEur: number | null = null;

  try {
    const geckoId = getGeckoId('BTC')!;
    const [trades, prices] = await Promise.all([
      getAllTrades(),
      getCurrentPrices([geckoId]),
    ]);
    orders = filterGiftTrades(trades);
    btcPriceEur = prices[geckoId]?.eur ?? null;
  } catch {
    // API unavailable — render empty state below
  }

  const totalEur    = orders.reduce((sum, o) => sum + (o.type === 'buy' ? o.eur : -o.eur), 0);
  const totalCrypto  = orders.reduce((sum, o) => sum + (o.type === 'buy' ? o.crypto : -o.crypto), 0);
  const totalPnl     = btcPriceEur != null ? totalCrypto * btcPriceEur - totalEur : null;

  return (
    <main className="min-h-screen px-6 py-12 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <h1 className="font-display text-xl font-semibold text-white">Orders</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} order{orders.length === 1 ? '' : 's'} · {totalCrypto.toFixed(8)} BTC · {EUR_FMT.format(totalEur)} invested
          {totalPnl != null && (
            <>
              {' · '}
              <span style={{ color: totalPnl >= 0 ? C_UP : C_DOWN }}>
                {totalPnl >= 0 ? '+' : ''}{EUR_FMT.format(totalPnl)} P&L
              </span>
            </>
          )}
        </p>

        <Card className="mt-6">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No orders found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">BTC</TableHead>
                  <TableHead className="text-right">EUR</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">P&L</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order, i) => {
                  const delta = order.type === 'buy' ? order.crypto : -order.crypto;
                  const cost  = order.type === 'buy' ? order.eur : -order.eur;
                  const pnl   = btcPriceEur != null ? delta * btcPriceEur - cost : null;

                  return (
                    <TableRow key={i}>
                      <TableCell className="text-muted-foreground">{DATE_FMT.format(order.ts)}</TableCell>
                      <TableCell>
                        <Badge variant={order.type === 'buy' ? 'default' : 'muted'}>
                          {order.type === 'buy' ? 'Buy' : 'Sell'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {order.crypto.toFixed(8)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {EUR_FMT.format(order.eur)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-muted-foreground">
                        {EUR_FMT.format(order.eur / order.crypto)}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {pnl != null
                          ? <span style={{ color: pnl >= 0 ? C_UP : C_DOWN }}>{pnl >= 0 ? '+' : ''}{EUR_FMT.format(pnl)}</span>
                          : <span className="text-muted-foreground/40">—</span>
                        }
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </main>
  );
}
