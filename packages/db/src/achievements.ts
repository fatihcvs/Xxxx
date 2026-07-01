import { prisma } from "./index";

/**
 * Achievement catalogue (Faz 10). Codes are stable identifiers used by the
 * grant hooks across web actions and the worker; names/descriptions are
 * original English strings (DB content language, like skills/books).
 */
export type AchievementDef = {
  code: string;
  name: string;
  description: string;
  category: string;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  // career & economy
  { code: "FIRST_JOB", name: "Hired!", description: "Get your first job.", category: "career" },
  { code: "RICH_10K", name: "Five Figures", description: "Hold §10,000 at once.", category: "economy" },
  { code: "HOMEOWNER", name: "Keys in Hand", description: "Buy your first property.", category: "economy" },
  { code: "TYCOON", name: "Open for Business", description: "Found a business.", category: "economy" },
  // music
  { code: "FIRST_BAND", name: "Garage Days", description: "Found or join a band.", category: "music" },
  { code: "FIRST_SONG", name: "First Notes", description: "Compose your first song.", category: "music" },
  { code: "FIRST_CONCERT", name: "Opening Night", description: "Play your first concert.", category: "music" },
  { code: "FIRST_RELEASE", name: "On the Shelves", description: "Record your first release.", category: "music" },
  { code: "FIRST_VIDEO", name: "Lights, Camera", description: "Shoot a music video.", category: "music" },
  { code: "CHART_TOPPER", name: "Chart Topper", description: "Have the #1 release in the world.", category: "music" },
  // media
  { code: "PRESS_DARLING", name: "Press Darling", description: "Publish your first press release.", category: "media" },
  { code: "AWARD_WINNER", name: "Golden Night", description: "Win an annual music award.", category: "media" },
  // world & life
  { code: "FIRST_FLIGHT", name: "Taking Off", description: "Fly to another city.", category: "world" },
  { code: "JETSETTER", name: "Jetsetter", description: "Take 10 flights.", category: "world" },
  { code: "MAYOR", name: "City Hall", description: "Be elected mayor of a city.", category: "politics" },
  { code: "PARENT", name: "New Generation", description: "Have a child.", category: "life" },
  // learning
  { code: "VIRTUOSO", name: "Virtuoso", description: "Master a skill at five stars.", category: "learning" },
  { code: "SCHOLAR", name: "Bookworm", description: "Complete five studies.", category: "learning" },
];

/**
 * Grant an achievement to a character (idempotent; unknown codes are no-ops
 * so hooks stay safe even before the catalogue is seeded).
 * Returns true when the achievement was newly earned.
 */
export async function grantAchievement(characterId: string, code: string): Promise<boolean> {
  const achievement = await prisma.achievement.findUnique({ where: { code } });
  if (!achievement) return false;
  const existing = await prisma.characterAchievement.findUnique({
    where: { characterId_achievementId: { characterId, achievementId: achievement.id } },
  });
  if (existing) return false;
  await prisma.characterAchievement.create({
    data: { characterId, achievementId: achievement.id },
  });
  return true;
}
