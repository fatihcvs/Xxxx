import { prisma } from "@fameworld/db";
import { worldClock } from "./world";

const KEEP_ENTRIES = 50;

/**
 * Append an automatic diary line for a character. Entries store an i18n key +
 * params and are rendered in the reader's language; the newest KEEP_ENTRIES
 * are retained.
 */
export async function writeDiary(
  characterId: string,
  key: string,
  params?: Record<string, string | number>,
): Promise<void> {
  await prisma.diaryEntry.create({
    data: {
      characterId,
      key,
      params: params ?? undefined,
      createdAtGame: worldClock.toGameTime(),
    },
  });
  // Trim anything beyond the newest KEEP_ENTRIES.
  const stale = await prisma.diaryEntry.findMany({
    where: { characterId },
    orderBy: { createdAtGame: "desc" },
    skip: KEEP_ENTRIES,
    select: { id: true },
  });
  if (stale.length > 0) {
    await prisma.diaryEntry.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
  }
}

const KEEP_VISITS = 5;

/** Record a place visit (private "recent places" list, newest five kept). */
export async function recordVisit(characterId: string, localeId: string): Promise<void> {
  await prisma.localeVisit.create({
    data: { characterId, localeId, visitedAtGame: worldClock.toGameTime() },
  });
  const stale = await prisma.localeVisit.findMany({
    where: { characterId },
    orderBy: { visitedAtGame: "desc" },
    skip: KEEP_VISITS,
    select: { id: true },
  });
  if (stale.length > 0) {
    await prisma.localeVisit.deleteMany({ where: { id: { in: stale.map((s) => s.id) } } });
  }
}
