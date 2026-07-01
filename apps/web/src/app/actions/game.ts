"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, Gender, MeterKind, TxnType, LearningState, LocaleType, ReleaseType, RelationType, PropertyKind, StageRoleSlot } from "@fameworld/db";
import {
  ATTRIBUTES,
  DEFAULT_METER_RATES,
  METER_MAX,
  clampMeter,
  currentMeter,
  needsHospital,
  learnHours,
  learningFinishesAt,
  composeSong,
  runConcert,
  performanceQuality,
  REHEARSAL_PER_SESSION,
  STAGE_ROLES,
  jamCeiling,
  stageRoleFactor,
  roleAttribute,
  type StageRole,
  inheritedAttributeLevel,
  vipLearningMultiplier,
  MAX_TAX_RATE,
  type MeterState,
} from "@fameworld/game-engine";
import { worldClock } from "@/lib/world";
import { requireUserId } from "@/lib/session";
import { ALL_FIRST_NAMES, LAST_NAMES } from "@/lib/names";

const MS_PER_GAME_YEAR = 365 * 24 * 60 * 60 * 1000;

const createSchema = z.object({
  firstName: z.string().min(1).max(40),
  lastName: z.string().min(1).max(40),
  gender: z.nativeEnum(Gender),
  cityId: z.string().min(1),
  locale: z.string().default("en"),
});

/** Create the account's character (starts as an 18-year-old adult so play can begin). */
export async function createCharacterAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = createSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    gender: formData.get("gender"),
    cityId: formData.get("cityId"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) throw new Error("Invalid character data");

  // Names must be chosen from the curated pools (guards against tampering).
  if (
    !ALL_FIRST_NAMES.includes(parsed.data.firstName) ||
    !LAST_NAMES.includes(parsed.data.lastName)
  ) {
    throw new Error("Invalid name selection");
  }

  const existing = await prisma.character.findFirst({
    where: { userId, isAlive: true },
  });
  if (existing) redirect(`/${parsed.data.locale}/home`);

  const city = await prisma.city.findUnique({ where: { id: parsed.data.cityId } });
  if (!city) throw new Error("Unknown city");

  const nowGame = worldClock.toGameTime();
  const bornAtGame = new Date(nowGame.getTime() - 18 * MS_PER_GAME_YEAR);
  const now = new Date();

  await prisma.character.create({
    data: {
      userId,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      gender: parsed.data.gender,
      bornAtGame,
      cityBornId: city.id,
      currentCityId: city.id,
      attributes: {
        create: ATTRIBUTES.map((attribute) => ({
          attribute,
          level: 1 + Math.floor(Math.random() * 3),
          xp: 0,
        })),
      },
      meters: {
        create: (["MOOD", "HEALTH", "ENERGY"] as const).map((kind) => ({
          kind: MeterKind[kind],
          value: METER_MAX,
          anchorAt: now,
          ratePerHour:
            DEFAULT_METER_RATES[
              kind.toLowerCase() as "mood" | "health" | "energy"
            ],
        })),
      },
    },
  });

  redirect(`/${parsed.data.locale}/home`);
}

async function loadLivingCharacter(userId: string) {
  const c = await prisma.character.findFirst({
    where: { userId, isAlive: true },
    include: { meters: true },
  });
  if (!c) throw new Error("No character");
  return c;
}

function meterRow(
  c: Awaited<ReturnType<typeof loadLivingCharacter>>,
  kind: MeterKind,
): MeterState {
  const row = c.meters.find((m) => m.kind === kind)!;
  return { value: row.value, anchorAt: row.anchorAt, ratePerHour: row.ratePerHour };
}

/** Apply deltas to mood/health/energy and re-anchor at now. Blocks if hospitalised. */
async function applyDeltas(
  userId: string,
  deltas: Partial<Record<"MOOD" | "HEALTH" | "ENERGY", number>>,
): Promise<void> {
  const c = await loadLivingCharacter(userId);
  const now = new Date();
  const mood = meterRow(c, MeterKind.MOOD);
  const health = meterRow(c, MeterKind.HEALTH);
  if (c.hospitalizedAt || needsHospital(mood, health, now)) return;

  for (const kind of ["MOOD", "HEALTH", "ENERGY"] as const) {
    const state = meterRow(c, MeterKind[kind]);
    const next = clampMeter(currentMeter(state, now) + (deltas[kind] ?? 0));
    await prisma.characterMeter.update({
      where: { characterId_kind: { characterId: c.id, kind: MeterKind[kind] } },
      data: { value: next, anchorAt: now },
    });
  }
}

const travelSchema = z.object({ localeId: z.string(), locale: z.string() });

export async function travelAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { localeId, locale } = travelSchema.parse({
    localeId: formData.get("localeId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  const dest = await prisma.locale.findUnique({ where: { id: localeId } });
  if (!dest || dest.cityId !== c.currentCityId) throw new Error("Cannot travel there");
  await prisma.character.update({
    where: { id: c.id },
    data: { currentLocaleId: localeId },
  });
  revalidatePath(`/${locale}/locale/${localeId}`);
  revalidatePath(`/${locale}/city`);
}

export async function restAction(locale: string): Promise<void> {
  const userId = await requireUserId();
  await applyDeltas(userId, { ENERGY: +25, MOOD: +4 });
  revalidatePath(`/${locale}`, "layout");
}

export async function eatAction(locale: string): Promise<void> {
  const userId = await requireUserId();
  const c = await loadLivingCharacter(userId);
  const price = 20;
  if (c.money < price) return;
  await prisma.character.update({ where: { id: c.id }, data: { money: { decrement: price } } });
  await prisma.transaction.create({
    data: { characterId: c.id, amount: -price, type: TxnType.PURCHASE, memo: "Meal" },
  });
  await applyDeltas(userId, { HEALTH: +10, MOOD: +6, ENERGY: +8 });
  revalidatePath(`/${locale}`, "layout");
}

const applyJobSchema = z.object({ jobId: z.string(), locale: z.string() });

export async function applyJobAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { jobId, locale } = applyJobSchema.parse({
    jobId: formData.get("jobId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) throw new Error("Unknown job");
  await prisma.employment.upsert({
    where: { characterId_jobId: { characterId: c.id, jobId } },
    update: { active: true },
    create: { characterId: c.id, jobId },
  });
  revalidatePath(`/${locale}/locale/${job.localeId}`);
}

const buyBookSchema = z.object({ bookId: z.string(), locale: z.string() });

/** Buy a book: it enters the character's owned books and can be studied repeatedly. */
export async function buyBookAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { bookId, locale } = buyBookSchema.parse({
    bookId: formData.get("bookId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) throw new Error("Unknown book");
  if (c.money < book.price) return;

  const already = await prisma.ownedBook.findUnique({
    where: { characterId_bookId: { characterId: c.id, bookId } },
  });
  if (already) return;

  await prisma.$transaction([
    prisma.character.update({ where: { id: c.id }, data: { money: { decrement: book.price } } }),
    prisma.transaction.create({
      data: { characterId: c.id, amount: -book.price, type: TxnType.PURCHASE, memo: `Book: ${book.title}` },
    }),
    prisma.ownedBook.create({ data: { characterId: c.id, bookId } }),
  ]);
  revalidatePath(`/${locale}`, "layout");
}

async function intelligenceLevel(characterId: string): Promise<number> {
  const intel = await prisma.characterAttribute.findUnique({
    where: { characterId_attribute: { characterId, attribute: "intelligence" } },
  });
  return intel?.level ?? 0;
}

/** Guard: only one active learning task at a time. */
async function hasActiveLearning(characterId: string): Promise<boolean> {
  const active = await prisma.learningTask.findFirst({
    where: { characterId, state: LearningState.IN_PROGRESS },
  });
  return !!active;
}

const studySchema = z.object({ bookId: z.string(), locale: z.string() });

/** Start a timed study session from an owned book (one level), completed by the worker. */
export async function studyBookAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { bookId, locale } = studySchema.parse({
    bookId: formData.get("bookId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  if (c.hospitalizedAt || (await hasActiveLearning(c.id))) return;

  const owned = await prisma.ownedBook.findUnique({
    where: { characterId_bookId: { characterId: c.id, bookId } },
    include: { book: true },
  });
  if (!owned) return;

  const current = await prisma.characterSkill.findUnique({
    where: { characterId_skillId: { characterId: c.id, skillId: owned.book.skillId } },
  });
  const fromLevel = current?.level ?? 0;
  if (fromLevel >= owned.book.maxTeachLevel) return;

  const intel = await intelligenceLevel(c.id);
  const hours = learnHours(fromLevel, intel) * vipLearningMultiplier(await isVip(userId));
  await prisma.learningTask.create({
    data: {
      characterId: c.id,
      skillId: owned.book.skillId,
      fromLevel,
      toLevel: fromLevel + 1,
      finishesAt: learningFinishesAt(hours),
    },
  });
  revalidatePath(`/${locale}/attributes`);
  revalidatePath(`/${locale}`, "layout");
}

/** Whether the account currently has active VIP. */
async function isVip(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { vipUntil: true } });
  return !!user?.vipUntil && user.vipUntil.getTime() > Date.now();
}

const enrollSchema = z.object({ courseId: z.string(), locale: z.string() });

/** Enrol in a university course: pay a fee and start a faster timed study. */
export async function enrollCourseAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { courseId, locale } = enrollSchema.parse({
    courseId: formData.get("courseId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  if (c.hospitalizedAt || (await hasActiveLearning(c.id))) return;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course || c.money < course.fee) return;

  const current = await prisma.characterSkill.findUnique({
    where: { characterId_skillId: { characterId: c.id, skillId: course.skillId } },
  });
  const fromLevel = current?.level ?? 0;
  if (fromLevel >= course.maxTeachLevel) return;

  const intel = await intelligenceLevel(c.id);
  const hours = learnHours(fromLevel, intel) * course.speedFactor;
  await prisma.$transaction([
    prisma.character.update({ where: { id: c.id }, data: { money: { decrement: course.fee } } }),
    prisma.transaction.create({
      data: { characterId: c.id, amount: -course.fee, type: TxnType.PURCHASE, memo: `Course: ${course.title}` },
    }),
    prisma.learningTask.create({
      data: {
        characterId: c.id,
        skillId: course.skillId,
        fromLevel,
        toLevel: fromLevel + 1,
        finishesAt: learningFinishesAt(hours),
      },
    }),
  ]);
  revalidatePath(`/${locale}/attributes`);
  revalidatePath(`/${locale}`, "layout");
}

const DEFAULT_WEEKLY_RENT = 150;
const rentSchema = z.object({ localeId: z.string(), locale: z.string() });

/** Rent an apartment (one active contract at a time). Rent is charged weekly by the worker. */
export async function rentApartmentAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { localeId, locale } = rentSchema.parse({
    localeId: formData.get("localeId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  const apt = await prisma.locale.findUnique({ where: { id: localeId } });
  if (!apt || apt.type !== LocaleType.APARTMENT || apt.cityId !== c.currentCityId) return;

  const existing = await prisma.rentContract.findFirst({
    where: { characterId: c.id, active: true },
  });
  if (existing) return;

  await prisma.rentContract.create({
    data: {
      characterId: c.id,
      localeId,
      weeklyRent: DEFAULT_WEEKLY_RENT,
      lastPaidGameAt: worldClock.toGameTime(),
    },
  });
  revalidatePath(`/${locale}/locale/${localeId}`);
  revalidatePath(`/${locale}`, "layout");
}

// ---------------------------------------------------------------------------
// Music career (bands, songs, concerts)
// ---------------------------------------------------------------------------

/** Fetch a character's level for a named skill (0 if not learned). */
async function skillLevelByName(characterId: string, skillName: string): Promise<number> {
  const skill = await prisma.skill.findUnique({ where: { name: skillName } });
  if (!skill) return 0;
  const cs = await prisma.characterSkill.findUnique({
    where: { characterId_skillId: { characterId, skillId: skill.id } },
  });
  return cs?.level ?? 0;
}

async function attributeLevelByName(characterId: string, attribute: string): Promise<number> {
  const a = await prisma.characterAttribute.findUnique({
    where: { characterId_attribute: { characterId, attribute } },
  });
  return a?.level ?? 0;
}

/** The character's active band membership (with band), or null. */
async function activeBandMembership(characterId: string) {
  return prisma.bandMembership.findFirst({
    where: { characterId },
    include: { band: { include: { genre: true } } },
  });
}

const createBandSchema = z.object({
  name: z.string().min(1).max(60),
  genreId: z.string().min(1),
  locale: z.string().default("en"),
});

/** Create a band; the founder becomes leader with a 100% revenue share. */
export async function createBandAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { name, genreId, locale } = createBandSchema.parse({
    name: formData.get("name"),
    genreId: formData.get("genreId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  const existing = await activeBandMembership(c.id);
  if (existing) return;

  const genre = await prisma.genre.findUnique({ where: { id: genreId } });
  if (!genre) throw new Error("Unknown genre");

  await prisma.band.create({
    data: {
      name,
      cityId: c.currentCityId,
      genreId,
      members: {
        create: { characterId: c.id, role: STAGE_ROLES[0], share: 1, isLeader: true },
      },
    },
  });
  revalidatePath(`/${locale}/band`);
}

export async function leaveBandAction(locale: string): Promise<void> {
  const userId = await requireUserId();
  const c = await loadLivingCharacter(userId);
  const membership = await activeBandMembership(c.id);
  if (!membership) return;
  await prisma.bandMembership.delete({ where: { id: membership.id } });
  revalidatePath(`/${locale}/band`);
}

/** Compose a new song for the character's band from their creative skills. */
export async function composeSongAction(locale: string): Promise<void> {
  const userId = await requireUserId();
  const c = await loadLivingCharacter(userId);
  if (c.hospitalizedAt) return;
  const membership = await activeBandMembership(c.id);
  if (!membership) return;

  const genreName = membership.band.genre?.name ?? "Rock";
  const [composing, lyrics, genre, creativity] = await Promise.all([
    skillLevelByName(c.id, "Basic Composing"),
    skillLevelByName(c.id, "Basic Lyrics"),
    skillLevelByName(c.id, genreName),
    attributeLevelByName(c.id, "creativity"),
  ]);

  const song = composeSong({ composing, lyrics, genre, creativity });
  await prisma.$transaction([
    prisma.song.create({
      data: {
        title: song.title,
        bandId: membership.bandId,
        quality: song.quality,
        lyricsQuality: song.lyricsQuality,
      },
    }),
    prisma.characterMeter.update({
      where: { characterId_kind: { characterId: c.id, kind: MeterKind.ENERGY } },
      data: { value: { decrement: 8 }, anchorAt: new Date() },
    }),
  ]);
  revalidatePath(`/${locale}/band`);
}

const rehearseSchema = z.object({ songId: z.string(), locale: z.string() });

/** Rehearse a song: raise its rehearsal level, spend energy. */
export async function rehearseSongAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { songId, locale } = rehearseSchema.parse({
    songId: formData.get("songId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  if (c.hospitalizedAt) return;
  const membership = await activeBandMembership(c.id);
  if (!membership) return;
  const song = await prisma.song.findUnique({ where: { id: songId } });
  if (!song || song.bandId !== membership.bandId) return;

  // The band's genre skill sets the jam ceiling (no skill caps at 50%, 5 stars = 100%).
  const band = await prisma.band.findUnique({
    where: { id: membership.bandId },
    include: { genre: true },
  });
  const genreLevel = band?.genre ? await skillLevelByName(c.id, band.genre.name) : 0;
  const ceiling = jamCeiling(genreLevel);
  const next = Math.min(ceiling, song.rehearsal + REHEARSAL_PER_SESSION);
  await prisma.$transaction([
    prisma.song.update({ where: { id: songId }, data: { rehearsal: next } }),
    prisma.characterMeter.update({
      where: { characterId_kind: { characterId: c.id, kind: MeterKind.ENERGY } },
      data: { value: { decrement: 10 }, anchorAt: new Date() },
    }),
  ]);
  revalidatePath(`/${locale}/band`);
}

const performSchema = z.object({
  venueId: z.string(),
  ticketPrice: z.coerce.number().int().min(0).max(1000),
  locale: z.string().default("en"),
});

/**
 * Perform a concert now at a venue in the current city. Attendance/revenue/
 * review come from the engine; fame and star value rise, revenue is split by
 * member share, and performing costs the character energy/health.
 */
export async function performConcertAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { venueId, ticketPrice, locale } = performSchema.parse({
    venueId: formData.get("venueId"),
    ticketPrice: formData.get("ticketPrice"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  if (c.hospitalizedAt) return;

  const membership = await prisma.bandMembership.findFirst({
    where: { characterId: c.id },
    include: { band: { include: { members: true, songs: true } } },
  });
  if (!membership) return;
  const band = membership.band;
  if (band.songs.length === 0) return;

  const venue = await prisma.locale.findUnique({ where: { id: venueId } });
  if (!venue || venue.cityId !== c.currentCityId || venue.capacity <= 0) return;
  const city = await prisma.city.findUnique({ where: { id: venue.cityId } });
  if (!city) return;

  const showmanship = await skillLevelByName(c.id, "Basic Showmanship");
  const roleFactor = await stageRoleFactorForCharacter(c.id);
  const quality = performanceQuality(
    band.songs.map((s) => ({ quality: s.quality, rehearsal: s.rehearsal })),
    showmanship,
    roleFactor,
  );

  const outcome = runConcert({
    fame: band.fame,
    venueCapacity: venue.capacity,
    cityReach: city.reach,
    ticketPrice,
    performanceQuality: quality,
  });

  const now = new Date();
  await prisma.$transaction(async (tx) => {
    await tx.concert.create({
      data: {
        bandId: band.id,
        localeId: venue.id,
        scheduledAt: now,
        ticketPrice,
        attendance: outcome.attendance,
        revenue: outcome.revenue,
        reviewScore: outcome.reviewScore,
        played: true,
      },
    });
    await tx.band.update({
      where: { id: band.id },
      data: { fame: Math.min(100, band.fame + outcome.fameDelta) },
    });
    // Split revenue by member share and raise each member's star value.
    for (const m of band.members) {
      const cut = Math.round(outcome.revenue * m.share);
      await tx.character.update({
        where: { id: m.characterId },
        data: { money: { increment: cut }, starValue: { increment: outcome.fameDelta } },
      });
      if (cut > 0) {
        await tx.transaction.create({
          data: { characterId: m.characterId, amount: cut, type: TxnType.CONCERT, memo: `Concert @ ${venue.name}` },
        });
      }
    }
    // Performing is tiring for the acting character.
    const meters = await tx.characterMeter.findMany({ where: { characterId: c.id } });
    for (const kind of [MeterKind.MOOD, MeterKind.HEALTH, MeterKind.ENERGY] as const) {
      const row = meters.find((m) => m.kind === kind);
      if (!row) continue;
      const delta =
        kind === MeterKind.MOOD ? outcome.moodDelta : kind === MeterKind.HEALTH ? outcome.healthDelta : -20;
      const value = clampMeter(currentMeter(row, now) + delta);
      await tx.characterMeter.update({
        where: { characterId_kind: { characterId: c.id, kind } },
        data: { value, anchorAt: now },
      });
    }
  });
  revalidatePath(`/${locale}/band`);
  revalidatePath(`/${locale}`, "layout");
}

// ---------------------------------------------------------------------------
// Recording (Faz 4): releases, sales & charts
// ---------------------------------------------------------------------------

const STUDIO_FEE = { SINGLE: 200, ALBUM: 800 } as const;
// Track-count bounds per format (album min relaxed for early play).
const TRACK_BOUNDS = { SINGLE: { min: 1, max: 2 }, ALBUM: { min: 6, max: 12 } } as const;

const recordSchema = z.object({
  title: z.string().min(1).max(80),
  type: z.nativeEnum(ReleaseType),
  songIds: z.array(z.string()).min(1),
  locale: z.string().default("en"),
});

/**
 * Record a single/album from the band's songs. Charges a studio fee; the worker
 * accrues weekly sales, updates chart score and pays royalties over time.
 */
export async function recordReleaseAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = recordSchema.safeParse({
    title: formData.get("title"),
    type: formData.get("type"),
    songIds: formData.getAll("songIds").map(String),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) return;
  const { title, type, songIds, locale } = parsed.data;

  const c = await loadLivingCharacter(userId);
  const membership = await activeBandMembership(c.id);
  if (!membership) return;

  const bounds = TRACK_BOUNDS[type];
  const uniqueIds = [...new Set(songIds)];
  if (uniqueIds.length < bounds.min || uniqueIds.length > bounds.max) return;

  // All chosen songs must belong to this band.
  const songs = await prisma.song.findMany({
    where: { id: { in: uniqueIds }, bandId: membership.bandId },
  });
  if (songs.length !== uniqueIds.length) return;

  const fee = STUDIO_FEE[type];
  if (c.money < fee) return;

  await prisma.$transaction([
    prisma.character.update({ where: { id: c.id }, data: { money: { decrement: fee } } }),
    prisma.transaction.create({
      data: { characterId: c.id, amount: -fee, type: TxnType.PURCHASE, memo: `Studio: ${title}` },
    }),
    prisma.release.create({
      data: {
        bandId: membership.bandId,
        title,
        type,
        lastSalesGameAt: worldClock.toGameTime(),
        tracks: {
          create: uniqueIds.map((songId, i) => ({ songId, position: i + 1 })),
        },
      },
    }),
  ]);
  revalidatePath(`/${locale}/band`);
}

// ---------------------------------------------------------------------------
// Social & Family (Faz 5)
// ---------------------------------------------------------------------------

const socializeSchema = z.object({ targetId: z.string(), locale: z.string() });

/** Socialize with another character in the same city: raise friendship, small mood gain. */
export async function socializeAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { targetId, locale } = socializeSchema.parse({
    targetId: formData.get("targetId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  if (c.hospitalizedAt || targetId === c.id) return;

  const target = await prisma.character.findUnique({ where: { id: targetId } });
  if (!target || !target.isAlive || target.currentCityId !== c.currentCityId) return;

  await prisma.relationship.upsert({
    where: { fromId_toId: { fromId: c.id, toId: targetId } },
    update: { level: { increment: 8 } },
    create: { fromId: c.id, toId: targetId, type: RelationType.FRIEND, level: 8 },
  });
  await applyDeltas(userId, { MOOD: 3, ENERGY: -4 });
  revalidatePath(`/${locale}/relationships`);
}

const messageSchema = z.object({
  toId: z.string(),
  body: z.string().min(1).max(1000),
  locale: z.string().default("en"),
});

/** Send an in-game message to another character. */
export async function sendMessageAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = messageSchema.safeParse({
    toId: formData.get("toId"),
    body: formData.get("body"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) return;
  const c = await loadLivingCharacter(userId);
  const target = await prisma.character.findUnique({ where: { id: parsed.data.toId } });
  if (!target || !target.isAlive || target.id === c.id) return;

  await prisma.message.create({
    data: { fromId: c.id, toId: parsed.data.toId, body: parsed.data.body },
  });
  revalidatePath(`/${parsed.data.locale}/messages`);
}

const MAX_CHILDREN = 4;

/** Have a child: creates an heir with attributes inherited from the parent. */
export async function haveChildAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const firstName = String(formData.get("firstName") ?? "").trim();
  const locale = String(formData.get("locale") ?? "en");
  if (!firstName || firstName.length > 40) return;

  const parent = await prisma.character.findFirst({
    where: { userId, isAlive: true },
    include: { attributes: true, _count: { select: { children: true } } },
  });
  if (!parent) return;
  if (parent._count.children >= MAX_CHILDREN) return;

  const now = new Date();
  await prisma.character.create({
    data: {
      firstName,
      lastName: parent.lastName,
      gender: Gender.OTHER,
      bornAtGame: worldClock.toGameTime(),
      cityBornId: parent.currentCityId,
      currentCityId: parent.currentCityId,
      parentId: parent.id,
      money: 0,
      attributes: {
        create: ATTRIBUTES.map((attribute) => {
          const parentLevel = parent.attributes.find((a) => a.attribute === attribute)?.level ?? 1;
          return { attribute, level: inheritedAttributeLevel(parentLevel), xp: 0 };
        }),
      },
      meters: {
        create: (["MOOD", "HEALTH", "ENERGY"] as const).map((kind) => ({
          kind: MeterKind[kind],
          value: METER_MAX,
          anchorAt: now,
          ratePerHour: DEFAULT_METER_RATES[kind.toLowerCase() as "mood" | "health" | "energy"],
        })),
      },
    },
  });
  revalidatePath(`/${locale}/relationships`);
}

// ---------------------------------------------------------------------------
// Real estate, business & politics (Faz 6)
// ---------------------------------------------------------------------------

const PROPERTY_CATALOG = {
  HOME: { name: "Own apartment", price: 5000, weeklyIncome: 0 },
  RENTAL: { name: "Rental apartment", price: 8000, weeklyIncome: 200 },
} as const;

const buyPropertySchema = z.object({
  kind: z.nativeEnum(PropertyKind),
  locale: z.string().default("en"),
});

/** Buy a HOME (cancels weekly rent) or a RENTAL (weekly income). */
export async function buyPropertyAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = buyPropertySchema.safeParse({
    kind: formData.get("kind"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) return;
  const { kind, locale } = parsed.data;
  const spec = PROPERTY_CATALOG[kind];

  const c = await loadLivingCharacter(userId);
  if (c.money < spec.price) return;

  await prisma.$transaction(async (tx) => {
    await tx.character.update({ where: { id: c.id }, data: { money: { decrement: spec.price } } });
    await tx.transaction.create({
      data: { characterId: c.id, amount: -spec.price, type: TxnType.PURCHASE, memo: `Property: ${spec.name}` },
    });
    await tx.property.create({
      data: {
        ownerId: c.id,
        cityId: c.currentCityId,
        name: spec.name,
        kind,
        purchasePrice: spec.price,
        weeklyIncome: spec.weeklyIncome,
        lastPaidGameAt: worldClock.toGameTime(),
      },
    });
    // Owning a home ends any active apartment rental.
    if (kind === PropertyKind.HOME) {
      await tx.rentContract.updateMany({
        where: { characterId: c.id, active: true },
        data: { active: false },
      });
    }
  });
  revalidatePath(`/${locale}/estate`);
  revalidatePath(`/${locale}`, "layout");
}

const BUSINESS_CATALOG: Record<string, { price: number; base: number }> = {
  Cafe: { price: 2000, base: 250 },
  Studio: { price: 5000, base: 500 },
  Club: { price: 10000, base: 900 },
};

const foundBusinessSchema = z.object({
  type: z.string(),
  name: z.string().min(1).max(60),
  locale: z.string().default("en"),
});

/** Found a business that pays weekly profit (minus city tax) via the worker. */
export async function foundBusinessAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = foundBusinessSchema.safeParse({
    type: formData.get("type"),
    name: formData.get("name"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) return;
  const spec = BUSINESS_CATALOG[parsed.data.type];
  if (!spec) return;

  const c = await loadLivingCharacter(userId);
  if (c.money < spec.price) return;

  await prisma.$transaction([
    prisma.character.update({ where: { id: c.id }, data: { money: { decrement: spec.price } } }),
    prisma.transaction.create({
      data: { characterId: c.id, amount: -spec.price, type: TxnType.PURCHASE, memo: `Business: ${parsed.data.name}` },
    }),
    prisma.business.create({
      data: {
        ownerId: c.id,
        cityId: c.currentCityId,
        name: parsed.data.name,
        type: parsed.data.type,
        value: spec.price,
        baseWeeklyProfit: spec.base,
        lastPaidGameAt: worldClock.toGameTime(),
      },
    }),
  ]);
  revalidatePath(`/${parsed.data.locale}/estate`);
  revalidatePath(`/${parsed.data.locale}`, "layout");
}

async function openElectionForCity(cityId: string) {
  return prisma.election.findFirst({
    where: { cityId, resolved: false },
    orderBy: { closesAtGame: "desc" },
  });
}

/** Stand as a candidate in the character's city election. */
export async function runForMayorAction(locale: string): Promise<void> {
  const userId = await requireUserId();
  const c = await loadLivingCharacter(userId);
  const election = await openElectionForCity(c.currentCityId);
  if (!election) return;
  await prisma.candidacy.upsert({
    where: { electionId_characterId: { electionId: election.id, characterId: c.id } },
    update: {},
    create: { electionId: election.id, characterId: c.id },
  });
  revalidatePath(`/${locale}/politics`);
}

const voteSchema = z.object({ candidacyId: z.string(), locale: z.string() });

/** Cast one vote in the current city election. */
export async function voteAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const { candidacyId, locale } = voteSchema.parse({
    candidacyId: formData.get("candidacyId"),
    locale: formData.get("locale") ?? "en",
  });
  const c = await loadLivingCharacter(userId);
  const candidacy = await prisma.candidacy.findUnique({ where: { id: candidacyId } });
  if (!candidacy) return;
  const election = await prisma.election.findUnique({ where: { id: candidacy.electionId } });
  if (!election || election.resolved || election.cityId !== c.currentCityId) return;

  const already = await prisma.vote.findUnique({
    where: { electionId_voterId: { electionId: election.id, voterId: c.id } },
  });
  if (already) return;

  await prisma.$transaction([
    prisma.vote.create({ data: { electionId: election.id, voterId: c.id, candidacyId } }),
    prisma.candidacy.update({ where: { id: candidacyId }, data: { votes: { increment: 1 } } }),
  ]);
  revalidatePath(`/${locale}/politics`);
}

const taxSchema = z.object({ rate: z.coerce.number().min(0).max(MAX_TAX_RATE), locale: z.string() });

/** Mayor sets the city tax rate (applied to business profit). */
export async function setTaxRateAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = taxSchema.safeParse({
    rate: formData.get("rate"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success) return;
  const c = await loadLivingCharacter(userId);
  const city = await prisma.city.findUnique({ where: { id: c.currentCityId } });
  if (!city || city.mayorId !== c.id) return;
  await prisma.city.update({ where: { id: city.id }, data: { taxRate: parsed.data.rate } });
  revalidatePath(`/${parsed.data.locale}/politics`);
}

const VIP_PRICE = 3000;
const VIP_DAYS = 30;

/** Buy VIP for in-game money: faster learning and a status badge for 30 real days. */
export async function goVipAction(locale: string): Promise<void> {
  const userId = await requireUserId();
  const c = await loadLivingCharacter(userId);
  if (c.money < VIP_PRICE) return;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { vipUntil: true } });
  const base = user?.vipUntil && user.vipUntil.getTime() > Date.now() ? user.vipUntil.getTime() : Date.now();
  const vipUntil = new Date(base + VIP_DAYS * 24 * 3_600_000);
  await prisma.$transaction([
    prisma.character.update({ where: { id: c.id }, data: { money: { decrement: VIP_PRICE } } }),
    prisma.transaction.create({
      data: { characterId: c.id, amount: -VIP_PRICE, type: TxnType.PURCHASE, memo: "VIP membership" },
    }),
    prisma.user.update({ where: { id: userId }, data: { vipUntil } }),
  ]);
  revalidatePath(`/${locale}`, "layout");
}

// ---------------------------------------------------------------------------
// Music deepening (Faz 8): stage roles
// ---------------------------------------------------------------------------

async function attributeLevel(characterId: string, attribute: string): Promise<number> {
  const a = await prisma.characterAttribute.findUnique({
    where: { characterId_attribute: { characterId, attribute } },
  });
  return a?.level ?? 0;
}

/** Concert role multiplier from the character's chosen stage roles (0.6..1.0). */
async function stageRoleFactorForCharacter(characterId: string): Promise<number> {
  const roles = await prisma.characterStageRole.findMany({ where: { characterId } });
  if (roles.length === 0) return 0.85; // neutral default until roles are chosen
  const primary = roles.find((r) => r.slot === StageRoleSlot.PRIMARY);
  const secondary = roles.find((r) => r.slot === StageRoleSlot.SECONDARY);
  const pStars = primary
    ? await attributeLevel(characterId, roleAttribute(primary.role as StageRole))
    : 0;
  const sStars = secondary
    ? await attributeLevel(characterId, roleAttribute(secondary.role as StageRole))
    : 0;
  return stageRoleFactor(pStars, sStars);
}

const stageRolesSchema = z.object({
  primary: z.enum(STAGE_ROLES),
  secondary: z.enum(STAGE_ROLES),
  locale: z.string().default("en"),
});

/** Choose a primary and secondary stage role (must differ). */
export async function setStageRolesAction(formData: FormData): Promise<void> {
  const userId = await requireUserId();
  const parsed = stageRolesSchema.safeParse({
    primary: formData.get("primary"),
    secondary: formData.get("secondary"),
    locale: formData.get("locale") ?? "en",
  });
  if (!parsed.success || parsed.data.primary === parsed.data.secondary) return;
  const c = await loadLivingCharacter(userId);

  await prisma.$transaction([
    prisma.characterStageRole.upsert({
      where: { characterId_slot: { characterId: c.id, slot: StageRoleSlot.PRIMARY } },
      update: { role: parsed.data.primary },
      create: { characterId: c.id, slot: StageRoleSlot.PRIMARY, role: parsed.data.primary },
    }),
    prisma.characterStageRole.upsert({
      where: { characterId_slot: { characterId: c.id, slot: StageRoleSlot.SECONDARY } },
      update: { role: parsed.data.secondary },
      create: { characterId: c.id, slot: StageRoleSlot.SECONDARY, role: parsed.data.secondary },
    }),
  ]);
  revalidatePath(`/${parsed.data.locale}/band`);
}
