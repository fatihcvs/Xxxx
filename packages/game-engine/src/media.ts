/**
 * Press & PR helpers (Faz 10): interviews raise fame/star value, gossip chips
 * away at unprotected stars, and a hired PR agent boosts the former while
 * shielding against the latter. All headline text is original and generic.
 */

/** Weekly fee charged for a hired PR agent. */
export const PR_AGENT_WEEKLY_FEE = 300;

/** In-game days a character must wait between press interviews. */
export const INTERVIEW_COOLDOWN_GAME_DAYS = 7;

/** Minimum star value before the tabloids bother writing gossip. */
export const GOSSIP_MIN_STAR = 10;
/** Weekly probability of a gossip story for an unprotected star. */
export const GOSSIP_WEEKLY_CHANCE = 0.2;
/** Star value lost when a gossip story lands. */
export const GOSSIP_STAR_LOSS = 2;

export interface InterviewInput {
  /** Media Manipulation skill, 0..5 stars. */
  mediaSkill: number;
  /** Whether the character has an active PR agent. */
  hasPrAgent: boolean;
}

export interface InterviewOutcome {
  /** Band fame gained (0..100 scale). */
  fameGain: number;
  /** Character star value gained. */
  starGain: number;
}

/**
 * Outcome of giving a press interview: a base 1–3 fame gain, up to +2.5 from
 * Media Manipulation, multiplied 1.5x by a PR agent placing the story well.
 */
export function interviewOutcome(input: InterviewInput, roll = Math.random()): InterviewOutcome {
  const base = 1 + roll * 2;
  const skillBoost = Math.max(0, Math.min(5, input.mediaSkill)) * 0.5;
  const agentFactor = input.hasPrAgent ? 1.5 : 1;
  const fameGain = Math.round((base + skillBoost) * agentFactor * 10) / 10;
  return { fameGain, starGain: Math.round(fameGain * 0.8 * 10) / 10 };
}

/**
 * Whether a weekly gossip story hits the character. A PR agent kills 75% of
 * stories and each Media Manipulation star dampens the rest by 10%.
 */
export function gossipHits(
  starValue: number,
  hasPrAgent: boolean,
  mediaSkill: number,
  roll = Math.random(),
): boolean {
  if (starValue < GOSSIP_MIN_STAR) return false;
  const agentShield = hasPrAgent ? 0.25 : 1;
  const skillShield = 1 - Math.max(0, Math.min(5, mediaSkill)) * 0.1;
  return roll < GOSSIP_WEEKLY_CHANCE * agentShield * skillShield;
}

/** Original, generic headline pools ({name} is replaced with the subject). */
export const INTERVIEW_HEADLINES = [
  "{name} opens up about life on the road",
  "In the studio with {name}",
  "{name}: 'The next record is our best yet'",
  "A day in the life of {name}",
  "{name} talks fame, family and the future",
] as const;

export const GOSSIP_HEADLINES = [
  "Sources spill backstage secrets about {name}",
  "What is really going on with {name}?",
  "{name} spotted leaving the club at dawn",
  "Insiders question {name}'s latest choices",
  "The rumour mill turns on {name}",
] as const;

/** Pick a headline from a pool and substitute the subject's name. */
export function pickHeadline(
  pool: readonly string[],
  name: string,
  roll = Math.random(),
): string {
  const idx = Math.min(pool.length - 1, Math.floor(roll * pool.length));
  return (pool[idx] ?? "{name}").replace("{name}", name);
}

// --- Fan clubs ---

/** One-off cost of founding a band's fan club. */
export const FAN_CLUB_FOUNDING_FEE = 400;

/** Weekly fan-club member growth from band fame plus light word-of-mouth. */
export function fanClubWeeklyGrowth(fame: number, members: number): number {
  const base = Math.round(Math.max(0, fame) * 2 + members * 0.05);
  return Math.max(fame > 0 ? 1 : 0, base);
}

/** Extra audience reach fan-club members add to the band's concerts. */
export function fanClubReachBoost(members: number): number {
  return Math.max(0, members) * 2;
}
