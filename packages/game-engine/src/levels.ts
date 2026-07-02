/**
 * Level presentation (Faz U1): values are never shown as bare numbers — every
 * gauge and attribute pairs the number with an adjective from an 11-step
 * scale. The adjective strings live in i18n keyed by the index this returns.
 */
import { MAX_STAR } from "./attributes";

/** Adjective index (0..10) for a 0..100 value. */
export function adjectiveIndex(value0to100: number): number {
  return Math.max(0, Math.min(10, Math.round(value0to100 / 10)));
}

/** Display percentage for an attribute star level (0..MAX_STAR → 0..100). */
export function attributePercent(level: number): number {
  return Math.round((Math.max(0, Math.min(MAX_STAR, level)) / MAX_STAR) * 100);
}
