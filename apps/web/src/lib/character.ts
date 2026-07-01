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
  meters: { mood: number; health: number; energy: number };
}

function toMeterState(row: {
  value: number;
  anchorAt: Date;
  ratePerHour: number;
}): MeterState {
  return { value: row.value, anchorAt: row.anchorAt, ratePerHour: row.ratePerHour };
}

/** Load the account's (single) living character as a display view model. */
export async function getCharacterForUser(userId: string): Promise<CharacterView | null> {
  const c = await prisma.character.findFirst({
    where: { userId, isAlive: true },
    include: {
      meters: true,
      cityBorn: true,
      currentCity: true,
      currentLocale: true,
    },
  });
  if (!c) return null;

  const now = new Date();
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
    meters: {
      mood: mood ? Math.round(currentMeter(mood, now)) : 0,
      health: health ? Math.round(currentMeter(health, now)) : 0,
      energy: energy ? Math.round(currentMeter(energy, now)) : 0,
    },
  };
}
