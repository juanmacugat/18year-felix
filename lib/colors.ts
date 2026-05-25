/** Brand color constants — single source of truth for inline style usage.
 *  CSS variables (--btc, --gold, --bear, --invested) mirror these values. */

export const C_BTC      = '#F7931A' as const; // Bitcoin orange
export const C_GOLD     = '#FFD700' as const; // Gold / milestone accent
export const C_BEAR     = '#64748B' as const; // Bear scenario (slate-500)
export const C_INVESTED = '#3B82F6' as const; // Invested line (blue-500)
export const C_UP       = '#22C55E' as const; // Positive P&L (green-500)
export const C_DOWN     = '#EF4444' as const; // Negative P&L (red-500)

export const C_SURFACE   = '#0F1629' as const; // chart tooltip / deep surface
export const C_TICK      = '#334155' as const; // chart axis ticks (slate-700)

export const SCENARIO_COLORS = {
  bear: C_BEAR,
  base: C_BTC,
  bull: C_GOLD,
} as const;
