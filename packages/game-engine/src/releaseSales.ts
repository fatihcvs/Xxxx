/**
 * Recorded-release economics: how many copies a single/album sells each week
 * and how its rolling chart score evolves. Sales fall off as the release ages.
 * A release is represented only by numeric quality/sales — never by lyrics.
 */

export interface WeeklySalesInput {
  /** Band fame / star value, 0..100. */
  fame: number;
  /** Average musical quality of the release's tracks, 0..100. */
  avgQuality: number;
  /** Local/base audience reach. */
  reach: number;
  /** Whole in-game weeks since the release date. */
  weeksSinceRelease: number;
  /** Album releases sell more per week than singles. */
  isAlbum?: boolean;
  rng?: () => number;
}

/** Copies sold in one week. Peaks early, then decays exponentially. */
export function releaseSalesForWeek(input: WeeklySalesInput): number {
  const rng = input.rng ?? Math.random;
  const fame01 = Math.max(0, Math.min(1, input.fame / 100));
  const quality01 = Math.max(0, Math.min(1, input.avgQuality / 100));

  // Base weekly demand from reach, driven by fame and quality.
  const base = input.reach * (0.05 + 0.6 * fame01) * (0.3 + 0.7 * quality01);
  const format = input.isAlbum ? 1.6 : 1;
  // Age decay: ~15% drop-off per week.
  const decay = Math.pow(0.85, Math.max(0, input.weeksSinceRelease));
  const noisy = base * format * decay * (0.85 + rng() * 0.3);
  return Math.max(0, Math.round(noisy));
}

/** Rolling chart score: recent momentum with a heavy weight on the last week. */
export function updateChartScore(prevScore: number, weekSales: number): number {
  return Number((prevScore * 0.55 + weekSales).toFixed(2));
}

/** A release stops charting once weekly momentum falls below this. */
export const RELEASE_RETIRE_SCORE = 5;
