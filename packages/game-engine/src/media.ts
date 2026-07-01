/**
 * Fame & media (Faz 10): press releases and annual awards.
 */

/** Publishing a press release costs a flat PR fee. */
export const PRESS_RELEASE_COST = 150;

/** A band can publish at most one press release per 14 in-game days. */
export const PRESS_RELEASE_COOLDOWN_GAME_DAYS = 14;

/** Characters at or above this star value make the news when they die. */
export const STAR_OBITUARY_THRESHOLD = 20;

/** Prize effects for annual award winners. */
export const AWARD_BAND_FAME_BONUS = 10;
export const AWARD_STAR_BONUS = 5;

/**
 * Fame gained by a press release, driven by the publisher's Media
 * Manipulation skill (0..5 stars): 1.0 fame with no skill up to 5.0 at five
 * stars.
 */
export function pressReleaseFameBoost(mediaSkill: number): number {
  const s = Math.max(0, Math.min(5, mediaSkill));
  return Number((1 + s * 0.8).toFixed(2));
}
