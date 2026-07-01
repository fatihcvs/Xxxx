/**
 * Aging & inheritance. Death risk is negligible for young characters and rises
 * steeply with age (a Gompertz-style curve). When a character dies, the player
 * continues through an heir who inherits a share of each attribute.
 */

/** Annual probability of death at a given age, in [0, 0.98]. */
export function annualDeathProbability(age: number): number {
  const p = 0.001 * Math.exp(Math.max(0, age - 30) / 10);
  return Math.min(0.98, p);
}

/** Probability of death over a span of in-game weeks. */
export function deathProbabilityOverWeeks(age: number, weeks: number): number {
  if (weeks <= 0) return 0;
  const survivalPerYear = 1 - annualDeathProbability(age);
  return 1 - Math.pow(survivalPerYear, weeks / 52);
}

/**
 * A child's starting level for an attribute: 40–70% of the parent's level,
 * always at least 1.
 */
export function inheritedAttributeLevel(
  parentLevel: number,
  rng: () => number = Math.random,
): number {
  return Math.max(1, Math.round(parentLevel * (0.4 + rng() * 0.3)));
}
