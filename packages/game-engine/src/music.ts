/**
 * Music-career helpers: stage roles and the performance-quality formula used to
 * turn a band's rehearsed repertoire into a concert-ready quality score.
 * Songs are represented only by numeric quality + rehearsal — never lyrics.
 */

export const STAGE_ROLES = [
  "Vocalist",
  "Guitarist",
  "Bassist",
  "Drummer",
  "Keyboardist",
] as const;

export type StageRole = (typeof STAGE_ROLES)[number];

export interface RepertoireSong {
  /** Song musical quality 0..100. */
  quality: number;
  /** How well the band has rehearsed the song, 0..100. */
  rehearsal: number;
}

/**
 * Average set quality (0..100). A song contributes half its quality unrehearsed
 * and full quality when fully rehearsed; showmanship (0..20) adds up to +30%.
 */
export function performanceQuality(
  songs: RepertoireSong[],
  showmanship: number,
): number {
  if (songs.length === 0) return 0;
  const avg =
    songs.reduce((sum, s) => sum + s.quality * (0.5 + 0.5 * (s.rehearsal / 100)), 0) /
    songs.length;
  const showBoost = 1 + Math.max(0, Math.min(20, showmanship)) / 20 * 0.3;
  return Math.min(100, avg * showBoost);
}

/** Rehearsal gained per rehearsal session (capped at 100 by the caller). */
export const REHEARSAL_PER_SESSION = 20;
