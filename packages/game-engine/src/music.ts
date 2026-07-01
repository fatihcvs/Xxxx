/**
 * Music-career helpers: stage roles, genre-driven jam ceiling and the
 * performance-quality formula that turns a band's rehearsed repertoire into a
 * concert-ready quality score. Songs are represented only by numeric quality +
 * rehearsal — never lyrics.
 */
import type { Attribute } from "./attributes";
import { MAX_STAR } from "./attributes";

export const STAGE_ROLES = [
  "Vocalist",
  "Guitarist",
  "Bassist",
  "Drummer",
  "Keyboardist",
  "Dancer",
  "Percussionist",
  "Producer",
] as const;

export type StageRole = (typeof STAGE_ROLES)[number];

/** The 17 music genres of the world. */
export const GENRES = [
  "African",
  "Blues",
  "Classical",
  "Country & Western",
  "Electronica",
  "Flamenco",
  "Heavy Metal",
  "Hip Hop",
  "Jazz",
  "Latin",
  "Modern Rock",
  "Pop",
  "Punk Rock",
  "Reggae",
  "Rhythm & Blues",
  "Rock",
  "World",
] as const;

/** Which character attribute a stage role draws on for performance. */
export function roleAttribute(role: StageRole): Attribute {
  switch (role) {
    case "Vocalist":
      return "vocals";
    case "Dancer":
      return "sexAppeal";
    case "Producer":
      return "creativity";
    default:
      return "dexterity"; // instrumentalists
  }
}

/**
 * How well a character performs their two stage roles, primary weighted 80% and
 * secondary 20%. Returns a 0.6–1.0 multiplier applied to concert quality.
 */
export function stageRoleFactor(primaryStars: number, secondaryStars: number): number {
  const norm =
    (0.8 * Math.min(primaryStars, MAX_STAR) + 0.2 * Math.min(secondaryStars, MAX_STAR)) /
    MAX_STAR;
  return 0.6 + 0.4 * Math.max(0, Math.min(1, norm));
}

/**
 * Highest jam/rehearsal level a band can reach for a song given the composer's
 * genre-skill level (0..5 stars): no skill caps at 50%, 5 stars unlocks 100%.
 */
export function jamCeiling(genreSkillLevel: number): number {
  return 50 + Math.max(0, Math.min(5, genreSkillLevel)) * 10;
}

export interface RepertoireSong {
  /** Song musical quality 0..100. */
  quality: number;
  /** How well the band has rehearsed the song, 0..100. */
  rehearsal: number;
}

/**
 * Average set quality (0..100). A song contributes half its quality unrehearsed
 * and full quality when fully rehearsed; showmanship (0..20) adds up to +30%;
 * the stage-role factor (0.6..1.0) scales the whole set.
 */
export function performanceQuality(
  songs: RepertoireSong[],
  showmanship: number,
  roleFactor = 1,
): number {
  if (songs.length === 0) return 0;
  const avg =
    songs.reduce((sum, s) => sum + s.quality * (0.5 + 0.5 * (s.rehearsal / 100)), 0) /
    songs.length;
  const showBoost = 1 + (Math.max(0, Math.min(20, showmanship)) / 20) * 0.3;
  return Math.min(100, avg * showBoost * Math.max(0, Math.min(1, roleFactor)));
}

/** Rehearsal gained per rehearsal session (capped by jamCeiling by the caller). */
export const REHEARSAL_PER_SESSION = 20;

/** In-game days after which a band with no new release starts losing fame. */
export const RELEASE_FRESHNESS_DAYS = 28;
/** Fame lost per in-game week once a band's last release is stale. */
export const STALE_FAME_DECAY_PER_WEEK = 1.5;
