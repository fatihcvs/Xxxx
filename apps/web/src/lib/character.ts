import { prisma, type MeterKind as DbMeterKind } from "@fameworld/db";
import {
  currentMeter,
  needsHospital,
  type MeterState,
  type MeterKind,
} from "@fameworld/game-engine";
import { worldClock } from "./world";

const KIND_MAP: Record<DbMeterKind, MeterKind> = {
  MOOD: "mood",
  HEALTH: "health",
  ENERGY: "energy",
};

export interface CharacterView {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  money: number;
  starValue: number;
  age: number;
  bornCity: string;
  currentCityId: string;
  currentCityName: string;
  currentLocaleId: string | null;
  currentLocaleName: string | null;
  hospitalized: boolean;
  vip: boolean;
  meters: { mood: number; health: number; energy: number };
  /** Set while flying to another city. */
  travelingToCityName: string | null;
  travelArrivesAt: Date | null;
}

function toMeterState(row: {
  value: number;
  anchorAt: Date;
  ratePerHour: number;
}): MeterState {
  return { value: row.value, anchorAt: row.anchorAt, ratePerHour: row.ratePerHour };
}

const CHARACTER_VIEW_INCLUDE = {
  meters: true,
  cityBorn: true,
  currentCity: true,
  currentLocale: true,
  travelingTo: true,
  user: { select: { vipUntil: true } },
} as const;

/** Load the account's (single) living character as a display view model. */
export async function getCharacterForUser(userId: string): Promise<CharacterView | null> {
  let c = await prisma.character.findFirst({
    where: { userId, isAlive: true },
    include: CHARACTER_VIEW_INCLUDE,
  });
  if (!c) return null;

  const now = new Date();

  // Landed while the player was away: finalise the arrival on read.
  if (c.travelingToCityId && c.travelArrivesAt && c.travelArrivesAt.getTime() <= now.getTime()) {
    c = await prisma.character.update({
      where: { id: c.id },
      data: {
        currentCityId: c.travelingToCityId,
        currentLocaleId: null,
        travelingToCityId: null,
        travelArrivesAt: null,
      },
      include: CHARACTER_VIEW_INCLUDE,
    });
  }
  const byKind = new Map(c.meters.map((m) => [KIND_MAP[m.kind], toMeterState(m)]));
  const mood = byKind.get("mood");
  const health = byKind.get("health");
  const energy = byKind.get("energy");

  const hospitalized =
    !!c.hospitalizedAt ||
    (!!mood && !!health && needsHospital(mood, health, now));

  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    gender: c.gender,
    money: c.money,
    starValue: c.starValue,
    age: worldClock.gameYearsBetween(c.bornAtGame),
    bornCity: c.cityBorn.name,
    currentCityId: c.currentCityId,
    currentCityName: c.currentCity.name,
    currentLocaleId: c.currentLocaleId,
    currentLocaleName: c.currentLocale?.name ?? null,
    hospitalized,
    vip: !!c.user?.vipUntil && c.user.vipUntil.getTime() > now.getTime(),
    travelingToCityName: c.travelingTo?.name ?? null,
    travelArrivesAt: c.travelArrivesAt,
    meters: {
      mood: mood ? Math.round(currentMeter(mood, now)) : 0,
      health: health ? Math.round(currentMeter(health, now)) : 0,
      energy: energy ? Math.round(currentMeter(energy, now)) : 0,
    },
  };
}
