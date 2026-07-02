/**
 * Achievement engine (Faz 10): a declarative catalogue of trophy codes with a
 * pure predicate over a character's aggregated stats. The worker computes the
 * stats, calls `earnedAchievements` and persists whatever is newly earned.
 * Display names/descriptions live in i18n keyed by code.
 */

export const ACHIEVEMENTS = [
  { code: "FIRST_SONG", category: "music" },
  { code: "FIRST_CONCERT", category: "music" },
  { code: "FIRST_RELEASE", category: "music" },
  { code: "SALES_1K", category: "music" },
  { code: "SALES_10K", category: "music" },
  { code: "FANS_1K", category: "fame" },
  { code: "FAME_50", category: "fame" },
  { code: "STAR_25", category: "fame" },
  { code: "AWARD_WINNER", category: "fame" },
  { code: "MONEY_10K", category: "money" },
  { code: "MONEY_100K", category: "money" },
  { code: "PROPERTY_OWNER", category: "money" },
  { code: "BUSINESS_OWNER", category: "money" },
  { code: "MAYOR", category: "life" },
  { code: "SKILL_MASTER", category: "life" },
  { code: "PARENT", category: "life" },
] as const;

export type AchievementCode = (typeof ACHIEVEMENTS)[number]["code"];

/** Aggregated character stats the achievement predicates read. */
export interface AchievementStats {
  songs: number;
  concerts: number;
  releases: number;
  totalSales: number;
  bandFans: number;
  bandFame: number;
  starValue: number;
  awards: number;
  money: number;
  properties: number;
  businesses: number;
  isMayor: boolean;
  maxSkillLevel: number;
  children: number;
}

/** All achievement codes the given stats qualify for (idempotent). */
export function earnedAchievements(s: AchievementStats): AchievementCode[] {
  const out: AchievementCode[] = [];
  if (s.songs >= 1) out.push("FIRST_SONG");
  if (s.concerts >= 1) out.push("FIRST_CONCERT");
  if (s.releases >= 1) out.push("FIRST_RELEASE");
  if (s.totalSales >= 1_000) out.push("SALES_1K");
  if (s.totalSales >= 10_000) out.push("SALES_10K");
  if (s.bandFans >= 1_000) out.push("FANS_1K");
  if (s.bandFame >= 50) out.push("FAME_50");
  if (s.starValue >= 25) out.push("STAR_25");
  if (s.awards >= 1) out.push("AWARD_WINNER");
  if (s.money >= 10_000) out.push("MONEY_10K");
  if (s.money >= 100_000) out.push("MONEY_100K");
  if (s.properties >= 1) out.push("PROPERTY_OWNER");
  if (s.businesses >= 1) out.push("BUSINESS_OWNER");
  if (s.isMayor) out.push("MAYOR");
  if (s.maxSkillLevel >= 5) out.push("SKILL_MASTER");
  if (s.children >= 1) out.push("PARENT");
  return out;
}
