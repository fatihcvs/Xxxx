/**
 * Procedural NPC world generator. Populates each city with NPC characters and a
 * few NPC bands (with songs and an active release) so the charts, elections and
 * social spaces feel alive. All names/content are original and generated from
 * generic word lists; releases carry only a title and numeric quality.
 */
import { prisma, ReleaseType } from "@fameworld/db";
import { ATTRIBUTES, composeSong, worldClockFromEnv } from "@fameworld/game-engine";

const clock = worldClockFromEnv();

const FIRST_NAMES = [
  "Ada", "Milo", "Nova", "Ravi", "Lena", "Theo", "Iris", "Kian", "Suki", "Omar",
  "Vera", "Dario", "Elin", "Pax", "Rosa", "Nils", "Yara", "Bo", "Mira", "Idris",
];
const LAST_NAMES = [
  "Vale", "Cross", "Nyx", "Bloom", "Frost", "Reed", "Hale", "Sol", "Marsh", "Quill",
  "Ash", "Lark", "Vance", "Orr", "Pike", "Wren", "Stone", "Fox", "Rye", "Dune",
];
const BAND_A = ["Neon", "Velvet", "Iron", "Midnight", "Paper", "Silver", "Wild", "Echo"];
const BAND_B = ["Foxes", "Tides", "Circuit", "Choir", "Vultures", "Static", "Bloom", "Kids"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

const MS_PER_GAME_YEAR = 365 * 24 * 60 * 60 * 1000;
const MS_PER_GAME_WEEK = 7 * 24 * 60 * 60 * 1000;

export interface NpcWorldResult {
  charactersCreated: number;
  bandsCreated: number;
  releasesCreated: number;
}

/** Ensure each city has at least `perCity` NPCs and `bandsPerCity` NPC bands. */
export async function ensureNpcWorld(
  opts: { perCity?: number; bandsPerCity?: number } = {},
): Promise<NpcWorldResult> {
  const perCity = opts.perCity ?? 12;
  const bandsPerCity = opts.bandsPerCity ?? 3;
  const nowGame = clock.toGameTime();

  const cities = await prisma.city.findMany({ select: { id: true } });
  const genres = await prisma.genre.findMany();

  let charactersCreated = 0;
  let bandsCreated = 0;
  let releasesCreated = 0;

  for (const city of cities) {
    // NPCs are user-less, parent-less characters.
    const npcCount = await prisma.character.count({
      where: { currentCityId: city.id, userId: null, parentId: null, isAlive: true },
    });
    for (let i = npcCount; i < perCity; i++) {
      const bornAtGame = new Date(nowGame.getTime() - randInt(18, 55) * MS_PER_GAME_YEAR);
      await prisma.character.create({
        data: {
          firstName: pick(FIRST_NAMES),
          lastName: pick(LAST_NAMES),
          gender: pick(["MALE", "FEMALE", "OTHER"] as const),
          bornAtGame,
          cityBornId: city.id,
          currentCityId: city.id,
          money: randInt(200, 3000),
          starValue: randInt(0, 40),
          attributes: { create: ATTRIBUTES.map((a) => ({ attribute: a, level: randInt(2, 9) })) },
        },
      });
      charactersCreated += 1;
    }

    const bandCount = await prisma.band.count({ where: { cityId: city.id } });
    for (let b = bandCount; b < bandsPerCity; b++) {
      const members = await prisma.character.findMany({
        where: { currentCityId: city.id, userId: null, parentId: null, isAlive: true },
        take: randInt(1, 3),
        orderBy: { createdAt: "desc" },
      });
      if (members.length === 0) break;
      const genre = genres.length > 0 ? pick(genres) : null;

      const band = await prisma.band.create({
        data: {
          name: `${pick(BAND_A)} ${pick(BAND_B)}`,
          cityId: city.id,
          genreId: genre?.id ?? null,
          fame: randInt(10, 70),
          members: {
            create: members.map((m, idx) => ({
              characterId: m.id,
              role: idx === 0 ? "Vocalist" : "Instrumentalist",
              share: 1 / members.length,
              isLeader: idx === 0,
            })),
          },
        },
      });
      bandsCreated += 1;

      const songCount = randInt(2, 4);
      const songIds: string[] = [];
      for (let s = 0; s < songCount; s++) {
        const song = composeSong({
          composing: randInt(4, 12),
          lyrics: randInt(4, 10),
          genre: randInt(4, 10),
          creativity: randInt(4, 12),
        });
        const rec = await prisma.song.create({
          data: {
            title: song.title,
            bandId: band.id,
            quality: Math.max(40, song.quality),
            lyricsQuality: song.lyricsQuality,
            rehearsal: randInt(40, 90),
          },
        });
        songIds.push(rec.id);
      }

      // One active release, dated a couple of game weeks ago so sales start flowing.
      const isAlbum = songIds.length >= 4;
      const released = new Date(Date.now() - 2 * (MS_PER_GAME_WEEK / clock.speedFactor));
      await prisma.release.create({
        data: {
          bandId: band.id,
          title: `${pick(BAND_A)} ${pick(BAND_B)}`,
          type: isAlbum ? ReleaseType.ALBUM : ReleaseType.SINGLE,
          releasedAt: released,
          lastSalesGameAt: new Date(nowGame.getTime() - 2 * MS_PER_GAME_WEEK),
          tracks: { create: songIds.map((songId, idx) => ({ songId, position: idx + 1 })) },
        },
      });
      releasesCreated += 1;
    }
  }

  return { charactersCreated, bandsCreated, releasesCreated };
}
