import { prisma, MeterKind, TxnType, LearningState, ReleaseType } from "@fameworld/db";
import {
  needsHospital,
  worldClockFromEnv,
  gameFridaysPassed,
  gameWeeksBetween,
  addAttributeXp,
  jobPrimaryAttribute,
  releaseSalesForWeek,
  updateChartScore,
  RELEASE_RETIRE_SCORE,
  deathProbabilityOverWeeks,
  PAYDAY_XP,
  STUDY_XP,
  type MeterState,
} from "@fameworld/game-engine";

const ROYALTY_PER_SALE = 2;

const clock = worldClockFromEnv();

function toState(row: { value: number; anchorAt: Date; ratePerHour: number }): MeterState {
  return { value: row.value, anchorAt: row.anchorAt, ratePerHour: row.ratePerHour };
}

export interface HeartbeatResult {
  scanned: number;
  hospitalized: number;
  discharged: number;
  learningCompleted: number;
  paydays: number;
  rentCharged: number;
  evictions: number;
  releasesSold: number;
  releasesRetired: number;
  deaths: number;
  heirsPromoted: number;
}

/** Admit/discharge characters based on Mood/Health thresholds. */
async function sweepHospital(now: Date): Promise<{ scanned: number; hospitalized: number; discharged: number }> {
  const characters = await prisma.character.findMany({
    where: { isAlive: true },
    include: { meters: true },
  });
  let hospitalized = 0;
  let discharged = 0;
  for (const c of characters) {
    const mood = c.meters.find((m) => m.kind === MeterKind.MOOD);
    const health = c.meters.find((m) => m.kind === MeterKind.HEALTH);
    if (!mood || !health) continue;
    const critical = needsHospital(toState(mood), toState(health), now);
    if (critical && !c.hospitalizedAt) {
      await prisma.character.update({ where: { id: c.id }, data: { hospitalizedAt: now } });
      hospitalized += 1;
    } else if (!critical && c.hospitalizedAt) {
      await prisma.$transaction([
        prisma.character.update({ where: { id: c.id }, data: { hospitalizedAt: null } }),
        prisma.characterMeter.updateMany({
          where: { characterId: c.id, kind: { in: [MeterKind.MOOD, MeterKind.HEALTH] } },
          data: { value: 40, anchorAt: now },
        }),
      ]);
      discharged += 1;
    }
  }
  return { scanned: characters.length, hospitalized, discharged };
}

/** Complete due learning tasks: raise the skill level and award intelligence XP. */
async function sweepLearning(now: Date): Promise<number> {
  const due = await prisma.learningTask.findMany({
    where: { state: LearningState.IN_PROGRESS, finishesAt: { lte: now } },
  });
  for (const task of due) {
    await prisma.$transaction(async (tx) => {
      await tx.characterSkill.upsert({
        where: { characterId_skillId: { characterId: task.characterId, skillId: task.skillId } },
        update: { level: task.toLevel },
        create: { characterId: task.characterId, skillId: task.skillId, level: task.toLevel },
      });
      await tx.learningTask.update({ where: { id: task.id }, data: { state: LearningState.COMPLETED } });
      const intel = await tx.characterAttribute.findUnique({
        where: { characterId_attribute: { characterId: task.characterId, attribute: "intelligence" } },
      });
      if (intel) {
        const next = addAttributeXp({ level: intel.level, xp: intel.xp }, STUDY_XP);
        await tx.characterAttribute.update({ where: { id: intel.id }, data: next });
      }
    });
  }
  return due.length;
}

/** Pay weekly salaries for each in-game Friday that has elapsed. */
async function sweepPayday(nowGame: Date): Promise<number> {
  const employments = await prisma.employment.findMany({
    where: { active: true, character: { isAlive: true } },
    include: { job: true },
  });
  let paid = 0;
  for (const e of employments) {
    if (!e.lastPaidGameAt) {
      // First anchor; pay from next Friday onward.
      await prisma.employment.update({ where: { id: e.id }, data: { lastPaidGameAt: nowGame } });
      continue;
    }
    const fridays = gameFridaysPassed(e.lastPaidGameAt, nowGame);
    if (fridays <= 0) continue;
    const amount = e.job.salary * fridays;
    await prisma.$transaction(async (tx) => {
      await tx.character.update({ where: { id: e.characterId }, data: { money: { increment: amount } } });
      await tx.transaction.create({
        data: { characterId: e.characterId, amount, type: TxnType.SALARY, memo: `Salary: ${e.job.title}` },
      });
      await tx.employment.update({ where: { id: e.id }, data: { lastPaidGameAt: nowGame } });
      const attrName = jobPrimaryAttribute(e.job.title);
      const attr = await tx.characterAttribute.findUnique({
        where: { characterId_attribute: { characterId: e.characterId, attribute: attrName } },
      });
      if (attr) {
        const next = addAttributeXp({ level: attr.level, xp: attr.xp }, PAYDAY_XP * fridays);
        await tx.characterAttribute.update({ where: { id: attr.id }, data: next });
      }
    });
    paid += 1;
  }
  return paid;
}

/** Charge weekly rent; evict after 4 consecutive unpaid weeks. */
async function sweepRent(nowGame: Date): Promise<{ rentCharged: number; evictions: number }> {
  const contracts = await prisma.rentContract.findMany({
    where: { active: true },
    include: { character: true },
  });
  let rentCharged = 0;
  let evictions = 0;
  for (const rc of contracts) {
    const weeks = gameWeeksBetween(rc.lastPaidGameAt, nowGame);
    if (weeks <= 0) continue;

    let money = rc.character.money;
    let missed = rc.missedWeeks;
    let chargedThis = 0;
    for (let w = 0; w < weeks; w++) {
      if (money >= rc.weeklyRent) {
        money -= rc.weeklyRent;
        chargedThis += rc.weeklyRent;
        missed = 0;
      } else {
        missed += 1;
      }
    }
    const evict = missed >= 4;
    await prisma.$transaction(async (tx) => {
      if (chargedThis > 0) {
        await tx.character.update({ where: { id: rc.characterId }, data: { money: { decrement: chargedThis } } });
        await tx.transaction.create({
          data: { characterId: rc.characterId, amount: -chargedThis, type: TxnType.RENT, memo: "Rent" },
        });
      }
      await tx.rentContract.update({
        where: { id: rc.id },
        data: { lastPaidGameAt: nowGame, missedWeeks: missed, active: !evict },
      });
    });
    if (chargedThis > 0) rentCharged += 1;
    if (evict) evictions += 1;
  }
  return { rentCharged, evictions };
}

/** Accrue weekly record sales, update chart scores and pay royalties. */
async function sweepReleases(nowGame: Date): Promise<{ releasesSold: number; releasesRetired: number }> {
  const releases = await prisma.release.findMany({
    where: { active: true },
    include: {
      band: { include: { city: true, members: true } },
      tracks: { include: { song: true } },
    },
  });
  let releasesSold = 0;
  let releasesRetired = 0;

  for (const r of releases) {
    const weeks = gameWeeksBetween(r.lastSalesGameAt, nowGame);
    if (weeks <= 0) continue;

    const gameReleaseTime = clock.toGameTime(r.releasedAt);
    const startAge = Math.max(0, gameWeeksBetween(gameReleaseTime, r.lastSalesGameAt));
    const avgQuality =
      r.tracks.length > 0
        ? r.tracks.reduce((s, t) => s + t.song.quality, 0) / r.tracks.length
        : 0;
    const isAlbum = r.type === ReleaseType.ALBUM;

    let periodSales = 0;
    let score = r.chartScore;
    for (let w = 0; w < weeks; w++) {
      const weekSales = releaseSalesForWeek({
        fame: r.band.fame,
        avgQuality,
        reach: r.band.city.reach,
        weeksSinceRelease: startAge + w,
        isAlbum,
      });
      periodSales += weekSales;
      score = updateChartScore(score, weekSales);
    }

    const retire = score < RELEASE_RETIRE_SCORE && startAge + weeks > 2;
    const royalties = periodSales * ROYALTY_PER_SALE;

    await prisma.$transaction(async (tx) => {
      await tx.release.update({
        where: { id: r.id },
        data: {
          totalSales: { increment: periodSales },
          chartScore: score,
          lastSalesGameAt: nowGame,
          active: !retire,
        },
      });
      if (royalties > 0) {
        for (const m of r.band.members) {
          const cut = Math.round(royalties * m.share);
          if (cut <= 0) continue;
          await tx.character.update({ where: { id: m.characterId }, data: { money: { increment: cut } } });
          await tx.transaction.create({
            data: { characterId: m.characterId, amount: cut, type: TxnType.OTHER, memo: `Royalties: ${r.title}` },
          });
        }
      }
    });

    if (periodSales > 0) releasesSold += 1;
    if (retire) releasesRetired += 1;
  }
  return { releasesSold, releasesRetired };
}

/**
 * Age player characters and roll for death. On death the account continues
 * through the eldest living child (heir); if there is no heir the account is
 * left without a character and must create a new one.
 */
async function sweepAging(nowGame: Date): Promise<{ deaths: number; heirsPromoted: number }> {
  // Only player-controlled characters age/die; NPC children are safe until they inherit.
  const characters = await prisma.character.findMany({
    where: { isAlive: true, userId: { not: null } },
    select: { id: true, userId: true, bornAtGame: true, lastAgedGameAt: true },
  });
  let deaths = 0;
  let heirsPromoted = 0;

  for (const c of characters) {
    if (!c.lastAgedGameAt) {
      await prisma.character.update({ where: { id: c.id }, data: { lastAgedGameAt: nowGame } });
      continue;
    }
    const weeks = gameWeeksBetween(c.lastAgedGameAt, nowGame);
    if (weeks <= 0) continue;

    const age = clock.gameYearsBetween(c.bornAtGame, nowGame);
    const died = Math.random() < deathProbabilityOverWeeks(age, weeks);
    if (!died) {
      await prisma.character.update({ where: { id: c.id }, data: { lastAgedGameAt: nowGame } });
      continue;
    }

    const heir = await prisma.character.findFirst({
      where: { parentId: c.id, isAlive: true },
      orderBy: { bornAtGame: "asc" },
    });
    await prisma.$transaction(async (tx) => {
      await tx.character.update({
        where: { id: c.id },
        data: {
          isAlive: false,
          diedAtGame: nowGame,
          hospitalizedAt: null,
          currentLocaleId: null,
          userId: null,
          lastAgedGameAt: nowGame,
        },
      });
      if (heir && c.userId) {
        await tx.character.update({
          where: { id: heir.id },
          data: { userId: c.userId, lastAgedGameAt: nowGame },
        });
      }
    });
    deaths += 1;
    if (heir && c.userId) heirsPromoted += 1;
  }
  return { deaths, heirsPromoted };
}

/**
 * Global sweep over the living world. Meters derive from anchors on read, so
 * the heartbeat flips hospitalisation, completes timed learning, pays weekly
 * salaries on in-game Fridays, charges apartment rent, accrues record sales and
 * ages characters (death → heir).
 */
export async function runHeartbeat(now: Date = new Date()): Promise<HeartbeatResult> {
  const nowGame = clock.toGameTime(now);
  const hospital = await sweepHospital(now);
  const learningCompleted = await sweepLearning(now);
  const paydays = await sweepPayday(nowGame);
  const rent = await sweepRent(nowGame);
  const releases = await sweepReleases(nowGame);
  const aging = await sweepAging(nowGame);
  return {
    scanned: hospital.scanned,
    hospitalized: hospital.hospitalized,
    discharged: hospital.discharged,
    learningCompleted,
    paydays,
    rentCharged: rent.rentCharged,
    evictions: rent.evictions,
    releasesSold: releases.releasesSold,
    releasesRetired: releases.releasesRetired,
    deaths: aging.deaths,
    heirsPromoted: aging.heirsPromoted,
  };
}
