"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, Gender, MeterKind, TxnType, LearningState, LocaleType } from "@fameworld/db";
import {
  ATTRIBUTES,
  DEFAULT_METER_RATES,
  METER_MAX,
  clampMeter,
  currentMeter,
  needsHospital,
  learnHours,
  learningFinishesAt,
  type MeterState,
} from "@fameworld/game-engine";
import { worldClock } from "@/lib/world";
import { requireUserId } from "@/lib/session";

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
  const hours = learnHours(fromLevel, intel);
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
