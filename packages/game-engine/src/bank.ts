/**
 * Personal banking (Faz U1): a single account per character. Money in the
 * account earns modest weekly interest; cash in the pocket earns nothing.
 */

/** Weekly interest rate on the account balance. */
export const BANK_WEEKLY_INTEREST = 0.01;
/** Interest is capped per week so parked fortunes do not explode. */
export const BANK_WEEKLY_INTEREST_CAP = 500;

/** Interest earned on `balance` over one in-game week. */
export function bankInterestForWeek(balance: number): number {
  if (balance <= 0) return 0;
  return Math.min(BANK_WEEKLY_INTEREST_CAP, Math.floor(balance * BANK_WEEKLY_INTEREST));
}
