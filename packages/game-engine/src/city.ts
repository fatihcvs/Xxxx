/**
 * City life helpers (Faz U2): the fixed holiday calendar shown in the
 * "upcoming days" table, and the weekly city lottery. All content original.
 */

/** Fixed in-game holidays (month is 1-based). Labels live in i18n by key. */
export const HOLIDAYS: ReadonlyArray<{ month: number; day: number; key: string }> = [
  { month: 1, day: 1, key: "newYear" },
  { month: 2, day: 14, key: "loversDay" },
  { month: 4, day: 1, key: "pranksDay" },
  { month: 5, day: 1, key: "workersDay" },
  { month: 6, day: 21, key: "midsummer" },
  { month: 9, day: 1, key: "harvestFest" },
  { month: 10, day: 31, key: "spookNight" },
  { month: 12, day: 31, key: "yearsEnd" },
];

/** Holiday i18n key for a game date, or null. */
export function holidayKeyForDate(gameDate: Date): string | null {
  const m = gameDate.getUTCMonth() + 1;
  const d = gameDate.getUTCDate();
  return HOLIDAYS.find((h) => h.month === m && h.day === d)?.key ?? null;
}

// --- City lottery ---

/** Numbers drawn per week and the pool they come from. */
export const LOTTERY_PICKS = 5;
export const LOTTERY_POOL = 20;
/** Ticket price and fixed prizes by match count. */
export const LOTTERY_TICKET_PRICE = 25;
export const LOTTERY_PRIZES: Record<number, number> = { 3: 100, 4: 1_000, 5: 20_000 };

/** Draw LOTTERY_PICKS unique numbers from 1..LOTTERY_POOL, ascending. */
export function lotteryDraw(rand: () => number = Math.random): number[] {
  const pool = Array.from({ length: LOTTERY_POOL }, (_, i) => i + 1);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j]!, pool[i]!];
  }
  return pool.slice(0, LOTTERY_PICKS).sort((a, b) => a - b);
}

/** Prize for a ticket given the drawn numbers (0 if fewer than 3 match). */
export function lotteryPrize(ticket: number[], drawn: number[]): number {
  const set = new Set(drawn);
  const matches = ticket.filter((n) => set.has(n)).length;
  return LOTTERY_PRIZES[matches] ?? 0;
}

const MS_PER_DAY = 24 * 3_600_000;

/** Game-week index (whole weeks since the game epoch) used as the draw key. */
export function gameWeekIndex(gameTime: Date): number {
  return Math.floor(gameTime.getTime() / (7 * MS_PER_DAY));
}
