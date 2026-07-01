/**
 * Song composition. A song has a quality score derived from the composer's
 * creative skills and attributes, plus randomness. We only generate an
 * original placeholder TITLE and a numeric quality — never lyrics.
 */

export interface ComposeInput {
  /** Composing skill level 0..MAX_SKILL_LEVEL. */
  composing: number;
  /** Lyrics skill level 0..MAX_SKILL_LEVEL. */
  lyrics: number;
  /** Genre skill level for the chosen genre. */
  genre: number;
  /** Creativity attribute 0..MAX_STAR. */
  creativity: number;
  /** Deterministic randomness source in [0, 1). */
  rng?: () => number;
}

export interface ComposedSong {
  title: string;
  /** Musical quality 0..100. */
  quality: number;
  /** Lyric quality 0..100. */
  lyricsQuality: number;
}

const TITLE_WORDS_A = [
  "Neon",
  "Silent",
  "Golden",
  "Broken",
  "Electric",
  "Midnight",
  "Paper",
  "Velvet",
];
const TITLE_WORDS_B = [
  "Hearts",
  "City",
  "Rain",
  "Machine",
  "Dreams",
  "Echo",
  "Fire",
  "Horizon",
];

/** Generate an original placeholder title (no third-party content). */
export function generateTitle(rng: () => number = Math.random): string {
  const a = TITLE_WORDS_A[Math.floor(rng() * TITLE_WORDS_A.length)]!;
  const b = TITLE_WORDS_B[Math.floor(rng() * TITLE_WORDS_B.length)]!;
  return `${a} ${b}`;
}

function scale(v: number, max: number): number {
  return Math.max(0, Math.min(1, v / max));
}

export function composeSong(input: ComposeInput): ComposedSong {
  const rng = input.rng ?? Math.random;
  // Weighted blend of the relevant creative inputs, 0..1.
  const musical =
    0.45 * scale(input.composing, 20) +
    0.3 * scale(input.genre, 20) +
    0.25 * scale(input.creativity, 25);
  const lyrical = 0.7 * scale(input.lyrics, 20) + 0.3 * scale(input.creativity, 25);

  // +/-15% randomness on top of the skill-driven baseline.
  const jitter = () => 0.85 + rng() * 0.3;

  return {
    title: generateTitle(rng),
    quality: Math.round(Math.min(100, musical * 100 * jitter())),
    lyricsQuality: Math.round(Math.min(100, lyrical * 100 * jitter())),
  };
}
