"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma, Gender, MeterKind, TxnType } from "@fameworld/db";
import {
  ATTRIBUTES,
  DEFAULT_METER_RATES,
  METER_MAX,
  clampMeter,
  currentMeter,
  needsHospital,
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

/** MVP simplification: buying a book immediately raises the taught skill by one level.
 *  Faz 2 replaces this with a timed LearningTask completed by the worker. */
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

  await prisma.$transaction([
    prisma.character.update({
      where: { id: c.id },
      data: { money: { decrement: book.price } },
    }),
    prisma.transaction.create({
      data: {
        characterId: c.id,
        amount: -book.price,
        type: TxnType.PURCHASE,
        memo: `Book: ${book.title}`,
      },
    }),
    prisma.characterSkill.upsert({
      where: { characterId_skillId: { characterId: c.id, skillId: book.skillId } },
      update: { level: { increment: 1 } },
      create: { characterId: c.id, skillId: book.skillId, level: 1 },
    }),
  ]);
  revalidatePath(`/${locale}/locale/${book.id}`, "page");
  revalidatePath(`/${locale}`, "layout");
}
