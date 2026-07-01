/**
 * Attributes are star-rated character stats raised by spending experience
 * points (XP). Each attribute has an integer star level; reaching the next
 * level costs progressively more XP.
 */

export const ATTRIBUTES = [
  "vocals",
  "charm",
  "looks",
  "intelligence",
  "constitution",
  "creativity",
  "dexterity",
  "sexAppeal",
] as const;

export type Attribute = (typeof ATTRIBUTES)[number];

/** Star levels go 0..MAX_STAR (rendered as up to 5 full stars w/ tiers). */
export const MAX_STAR = 25;

/** XP required to go from `level` to `level + 1`. Quadratic growth. */
export function xpForNextLevel(level: number): number {
  return 100 + level * level * 20;
}

/** Total XP required to reach `level` from 0. */
export function totalXpForLevel(level: number): number {
  let total = 0;
  for (let l = 0; l < level; l++) total += xpForNextLevel(l);
  return total;
}

export interface AttributeProgress {
  level: number;
  /** XP accumulated toward the next level. */
  xp: number;
}

/** Add XP, rolling over into levels. Caps at MAX_STAR. */
export function addAttributeXp(
  progress: AttributeProgress,
  gainedXp: number,
): AttributeProgress {
  let { level, xp } = progress;
  xp += Math.max(0, gainedXp);
  while (level < MAX_STAR && xp >= xpForNextLevel(level)) {
    xp -= xpForNextLevel(level);
    level += 1;
  }
  if (level >= MAX_STAR) return { level: MAX_STAR, xp: 0 };
  return { level, xp };
}
