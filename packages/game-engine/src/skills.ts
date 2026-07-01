/**
 * Skills are learned over (real) time from a book, a master/mentor, or a
 * university course. Learning a level takes a duration that grows with the
 * target level and shrinks with the character's intelligence.
 */

export type SkillCategory =
  | "instrument"
  | "genre"
  | "creative" // composing, lyrics, showmanship, dancing
  | "media"
  | "business"
  | "social"
  | "physical";

export const MAX_SKILL_LEVEL = 20;

/**
 * Real hours to learn from `level` to `level + 1`.
 * Higher intelligence (0..MAX_STAR) reduces the time, down to a floor.
 */
export function learnHours(level: number, intelligence: number): number {
  const base = 2 + level * 1.5; // grows with level
  const speedup = 1 + intelligence / 25; // up to ~2x faster
  return Math.max(0.5, base / speedup);
}

export interface SkillLearningPlan {
  fromLevel: number;
  toLevel: number;
  hours: number;
}

export function planLearning(
  currentLevel: number,
  intelligence: number,
): SkillLearningPlan | null {
  if (currentLevel >= MAX_SKILL_LEVEL) return null;
  return {
    fromLevel: currentLevel,
    toLevel: currentLevel + 1,
    hours: learnHours(currentLevel, intelligence),
  };
}
