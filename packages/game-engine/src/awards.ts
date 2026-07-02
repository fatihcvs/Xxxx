/**
 * Annual music awards (Faz 10): once per in-game year the world holds an award
 * show and crowns the top band, release and artist. Winning pays out fame and
 * star value.
 */

export const AWARD_CATEGORIES = [
  "BAND_OF_THE_YEAR",
  "RELEASE_OF_THE_YEAR",
  "ARTIST_OF_THE_YEAR",
] as const;

export type AwardCategory = (typeof AWARD_CATEGORIES)[number];

/** Band fame awarded to the winning band (band & release categories). */
export const AWARD_BAND_FAME_BONUS = 10;
/** Star value awarded to winning characters (artist category / band members). */
export const AWARD_STAR_BONUS = 8;
