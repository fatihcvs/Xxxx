/**
 * Business & premium economics. Weekly business profit varies around a base and
 * is reduced by the city's tax rate. VIP members learn skills faster.
 */

export interface BusinessProfitInput {
  /** Base weekly profit before variance and tax. */
  base: number;
  /** City tax rate, 0..1. */
  taxRate: number;
  rng?: () => number;
}

/** Net profit for one week (60%–140% of base, minus tax), never below 0. */
export function businessProfitForWeek(input: BusinessProfitInput): number {
  const rng = input.rng ?? Math.random;
  const gross = input.base * (0.6 + rng() * 0.8);
  const net = gross * (1 - Math.max(0, Math.min(1, input.taxRate)));
  return Math.max(0, Math.round(net));
}

/** Learning-time multiplier applied for VIP members (<1 = faster). */
export const VIP_LEARNING_FACTOR = 0.6;

export function vipLearningMultiplier(isVip: boolean): number {
  return isVip ? VIP_LEARNING_FACTOR : 1;
}

/** Highest tax rate a mayor may set. */
export const MAX_TAX_RATE = 0.25;
