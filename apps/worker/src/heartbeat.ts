import { prisma, MeterKind, TxnType, LearningState, ReleaseType, PropertyKind, NewsKind } from "@fameworld/db";
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
  businessProfitForWeek,
  RELEASE_FRESHNESS_DAYS,
  STALE_FAME_DECAY_PER_WEEK,
  PAYDAY_XP,
  STUDY_XP,
  gossipHits,
  pickHeadline,
  GOSSIP_HEADLINES,
  GOSSIP_MIN_STAR,
  GOSSIP_STAR_LOSS,
  fanClubWeeklyGrowth,
  AWARD_CATEGORIES,
  AWARD_BAND_FAME_BONUS,
  AWARD_STAR_BONUS,
  ACHIEVEMENTS,
  earnedAchievements,
  type AchievementStats,
  type MeterState,
} from "@fameworld/game-engine";

const ELECTION_WINDOW_WEEKS = 2;

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
  rentalIncome: number;
  businessProfits: number;
  electionsResolved: number;
  electionsOpened: number;
  fameDecayed: number;
  prFeesCharged: number;
  gossipStories: number;
  fanClubsGrown: number;
  awardShowsHeld: number;
  achievementsEarned: number;
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

    // A music video lifts sales by up to +50% (videoQuality 0..100).
    const videoBoost = 1 + r.videoQuality / 200;

    let periodSales = 0;
    let score = r.chartScore;
    for (let w = 0; w < weeks; w++) {
      const weekSales = Math.round(
        releaseSalesForWeek({
          fame: r.band.fame,
          avgQuality,
          reach: r.band.city.reach,
          weeksSinceRelease: startAge + w,
          isAlbum,
        }) * videoBoost,
      );
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

/** Pay weekly rental income from RENTAL properties to their owners. */
async function sweepProperties(nowGame: Date): Promise<number> {
  const rentals = await prisma.property.findMany({ where: { kind: PropertyKind.RENTAL } });
  let paidCount = 0;
  for (const p of rentals) {
    const weeks = gameWeeksBetween(p.lastPaidGameAt, nowGame);
    if (weeks <= 0 || p.weeklyIncome <= 0) continue;
    const amount = p.weeklyIncome * weeks;
    await prisma.$transaction([
      prisma.character.update({ where: { id: p.ownerId }, data: { money: { increment: amount } } }),
      prisma.transaction.create({
        data: { characterId: p.ownerId, amount, type: TxnType.OTHER, memo: `Rental income: ${p.name}` },
      }),
      prisma.property.update({ where: { id: p.id }, data: { lastPaidGameAt: nowGame } }),
    ]);
    paidCount += 1;
  }
  return paidCount;
}

/** Pay weekly business profit (minus the city tax rate) to owners. */
async function sweepBusinesses(nowGame: Date): Promise<number> {
  const businesses = await prisma.business.findMany({
    where: { active: true },
    include: { city: true },
  });
  let paidCount = 0;
  for (const b of businesses) {
    const weeks = gameWeeksBetween(b.lastPaidGameAt, nowGame);
    if (weeks <= 0) continue;
    let profit = 0;
    for (let w = 0; w < weeks; w++) {
      profit += businessProfitForWeek({ base: b.baseWeeklyProfit, taxRate: b.city.taxRate });
    }
    await prisma.$transaction([
      prisma.character.update({ where: { id: b.ownerId }, data: { money: { increment: profit } } }),
      prisma.transaction.create({
        data: { characterId: b.ownerId, amount: profit, type: TxnType.OTHER, memo: `Business: ${b.name}` },
      }),
      prisma.business.update({ where: { id: b.id }, data: { lastPaidGameAt: nowGame } }),
    ]);
    if (profit > 0) paidCount += 1;
  }
  return paidCount;
}

/** Resolve closed elections (elect the mayor) and open a new one where none is running. */
async function sweepElections(nowGame: Date): Promise<{ resolved: number; opened: number }> {
  let resolved = 0;
  let opened = 0;

  const due = await prisma.election.findMany({
    where: { resolved: false, closesAtGame: { lte: nowGame } },
    include: { candidacies: { orderBy: { votes: "desc" } } },
  });
  for (const e of due) {
    const winner = e.candidacies[0];
    await prisma.$transaction(async (tx) => {
      await tx.election.update({
        where: { id: e.id },
        data: { resolved: true, winnerId: winner?.characterId ?? null },
      });
      if (winner) {
        await tx.city.update({ where: { id: e.cityId }, data: { mayorId: winner.characterId } });
      }
    });
    resolved += 1;
  }

  // Open an election in any city that has none running.
  const cities = await prisma.city.findMany({ select: { id: true } });
  for (const city of cities) {
    const open = await prisma.election.count({
      where: { cityId: city.id, resolved: false },
    });
    if (open === 0) {
      const closesAtGame = new Date(nowGame.getTime() + ELECTION_WINDOW_WEEKS * 7 * 24 * 3_600_000);
      await prisma.election.create({
        data: { cityId: city.id, opensAtGame: nowGame, closesAtGame },
      });
      opened += 1;
    }
  }
  return { resolved, opened };
}

const MS_PER_DAY = 24 * 3_600_000;

/** Decay a band's fame when it has not released anything recently. */
async function sweepBandFame(nowGame: Date): Promise<number> {
  const bands = await prisma.band.findMany({
    include: { releases: { orderBy: { releasedAt: "desc" }, take: 1 } },
  });
  let decayed = 0;
  for (const band of bands) {
    const anchor = band.lastFameDecayGameAt ?? clock.toGameTime(band.createdAt);
    const weeks = gameWeeksBetween(anchor, nowGame);
    if (weeks <= 0) continue;

    const lastReleaseGame = band.releases[0]
      ? clock.toGameTime(band.releases[0].releasedAt)
      : clock.toGameTime(band.createdAt);
    const staleDays = (nowGame.getTime() - lastReleaseGame.getTime()) / MS_PER_DAY;

    if (staleDays > RELEASE_FRESHNESS_DAYS && band.fame > 0) {
      const newFame = Math.max(0, band.fame - STALE_FAME_DECAY_PER_WEEK * weeks);
      await prisma.band.update({
        where: { id: band.id },
        data: { fame: newFame, lastFameDecayGameAt: nowGame },
      });
      decayed += 1;
    } else {
      await prisma.band.update({
        where: { id: band.id },
        data: { lastFameDecayGameAt: nowGame },
      });
    }
  }
  return decayed;
}

/** Charge the weekly PR-agent fee; an agent who cannot be paid walks out. */
async function sweepPrAgents(nowGame: Date): Promise<number> {
  const agents = await prisma.prAgent.findMany({
    where: { active: true },
    include: { character: true },
  });
  let charged = 0;
  for (const agent of agents) {
    const weeks = gameWeeksBetween(agent.lastPaidGameAt, nowGame);
    if (weeks <= 0) continue;
    const due = agent.weeklyFee * weeks;
    if (agent.character.money < due || !agent.character.isAlive) {
      await prisma.prAgent.update({ where: { id: agent.id }, data: { active: false } });
      continue;
    }
    await prisma.$transaction([
      prisma.character.update({
        where: { id: agent.characterId },
        data: { money: { decrement: due } },
      }),
      prisma.transaction.create({
        data: { characterId: agent.characterId, amount: -due, type: TxnType.OTHER, memo: "PR agent fee" },
      }),
      prisma.prAgent.update({ where: { id: agent.id }, data: { lastPaidGameAt: nowGame } }),
    ]);
    charged += 1;
  }
  return charged;
}

/**
 * Weekly gossip roll for famous characters: a tabloid story costs star value.
 * A PR agent and Media Manipulation skill shield against it.
 */
async function sweepGossip(nowGame: Date): Promise<number> {
  const stars = await prisma.character.findMany({
    where: { isAlive: true, userId: { not: null }, starValue: { gte: GOSSIP_MIN_STAR } },
    include: { prAgent: true, currentCity: true },
  });
  const mediaSkill = await prisma.skill.findUnique({ where: { name: "Basic Media Manipulation" } });
  let stories = 0;
  for (const c of stars) {
    if (!c.lastGossipGameAt) {
      await prisma.character.update({ where: { id: c.id }, data: { lastGossipGameAt: nowGame } });
      continue;
    }
    const weeks = gameWeeksBetween(c.lastGossipGameAt, nowGame);
    if (weeks <= 0) continue;

    const skillLevel = mediaSkill
      ? (
          await prisma.characterSkill.findUnique({
            where: { characterId_skillId: { characterId: c.id, skillId: mediaSkill.id } },
          })
        )?.level ?? 0
      : 0;
    const hasAgent = !!c.prAgent?.active;

    let hits = 0;
    for (let w = 0; w < weeks; w++) {
      if (gossipHits(c.starValue, hasAgent, skillLevel)) hits += 1;
    }
    if (hits > 0) {
      const name = `${c.firstName} ${c.lastName}`;
      await prisma.$transaction([
        prisma.character.update({
          where: { id: c.id },
          data: {
            starValue: Math.max(0, c.starValue - GOSSIP_STAR_LOSS * hits),
            lastGossipGameAt: nowGame,
          },
        }),
        prisma.newsArticle.create({
          data: {
            kind: NewsKind.GOSSIP,
            headline: pickHeadline(GOSSIP_HEADLINES, name),
            characterId: c.id,
            cityId: c.currentCityId,
            publishedAtGame: nowGame,
          },
        }),
      ]);
      stories += hits;
    } else {
      await prisma.character.update({ where: { id: c.id }, data: { lastGossipGameAt: nowGame } });
    }
  }
  return stories;
}

/** Grow fan-club membership weekly with the band's fame. */
async function sweepFanClubs(nowGame: Date): Promise<number> {
  const clubs = await prisma.fanClub.findMany({ include: { band: true } });
  let grown = 0;
  for (const club of clubs) {
    const weeks = gameWeeksBetween(club.lastGrowthGameAt, nowGame);
    if (weeks <= 0) continue;
    let members = club.members;
    for (let w = 0; w < weeks; w++) {
      members += fanClubWeeklyGrowth(club.band.fame, members);
    }
    await prisma.fanClub.update({
      where: { id: club.id },
      data: { members, lastGrowthGameAt: nowGame },
    });
    if (members > club.members) grown += 1;
  }
  return grown;
}

/**
 * Hold the annual award show once per completed in-game year: crown the top
 * band (fame), release (sales that year) and artist (star value), pay fame and
 * star bonuses, and publish the coverage.
 */
async function sweepAwardShow(nowGame: Date): Promise<number> {
  const prevYear = nowGame.getUTCFullYear() - 1;
  const already = await prisma.awardShow.findUnique({ where: { gameYear: prevYear } });
  if (already) return 0;

  const [topBand, releases, topArtist] = await Promise.all([
    prisma.band.findFirst({ where: { fame: { gt: 0 } }, orderBy: { fame: "desc" } }),
    prisma.release.findMany({
      where: { totalSales: { gt: 0 } },
      orderBy: { totalSales: "desc" },
      include: { band: true },
      take: 50,
    }),
    prisma.character.findFirst({
      where: { isAlive: true, starValue: { gt: 0 } },
      orderBy: { starValue: "desc" },
    }),
  ]);
  const topRelease = releases.find(
    (r) => clock.toGameTime(r.releasedAt).getUTCFullYear() === prevYear,
  );

  await prisma.$transaction(async (tx) => {
    const show = await tx.awardShow.create({
      data: { gameYear: prevYear, heldAtGame: nowGame },
    });
    const publish = (headline: string, extra: { bandId?: string; characterId?: string }) =>
      tx.newsArticle.create({
        data: { kind: NewsKind.AWARD, headline, publishedAtGame: nowGame, ...extra },
      });

    if (topBand) {
      await tx.award.create({
        data: {
          awardShowId: show.id,
          category: AWARD_CATEGORIES[0],
          bandId: topBand.id,
          recipientName: topBand.name,
        },
      });
      await tx.band.update({
        where: { id: topBand.id },
        data: { fame: Math.min(100, topBand.fame + AWARD_BAND_FAME_BONUS) },
      });
      await publish(`${topBand.name} named Band of the Year ${prevYear}`, { bandId: topBand.id });
    }
    if (topRelease) {
      await tx.award.create({
        data: {
          awardShowId: show.id,
          category: AWARD_CATEGORIES[1],
          bandId: topRelease.bandId,
          releaseId: topRelease.id,
          recipientName: `${topRelease.title} — ${topRelease.band.name}`,
        },
      });
      await tx.band.update({
        where: { id: topRelease.bandId },
        data: { fame: { increment: AWARD_BAND_FAME_BONUS / 2 } },
      });
      await publish(
        `${topRelease.title} wins Release of the Year ${prevYear}`,
        { bandId: topRelease.bandId },
      );
    }
    if (topArtist) {
      await tx.award.create({
        data: {
          awardShowId: show.id,
          category: AWARD_CATEGORIES[2],
          characterId: topArtist.id,
          recipientName: `${topArtist.firstName} ${topArtist.lastName}`,
        },
      });
      await tx.character.update({
        where: { id: topArtist.id },
        data: { starValue: { increment: AWARD_STAR_BONUS } },
      });
      await publish(
        `${topArtist.firstName} ${topArtist.lastName} crowned Artist of the Year ${prevYear}`,
        { characterId: topArtist.id },
      );
    }
  });
  return 1;
}

/** Evaluate the achievement catalogue for player characters and grant new trophies. */
async function sweepAchievements(): Promise<number> {
  // Ensure the catalogue rows exist (codes come from the engine).
  const achievementIdByCode = new Map<string, string>();
  for (const a of ACHIEVEMENTS) {
    const rec = await prisma.achievement.upsert({
      where: { code: a.code },
      update: { category: a.category },
      create: { code: a.code, category: a.category },
    });
    achievementIdByCode.set(a.code, rec.id);
  }

  const players = await prisma.character.findMany({
    where: { isAlive: true, userId: { not: null } },
    include: {
      memberships: {
        include: {
          band: {
            include: {
              _count: { select: { songs: true, releases: true } },
              releases: { select: { totalSales: true } },
              fanBases: { select: { fans: true } },
              awards: { select: { id: true } },
            },
          },
        },
      },
      skills: { select: { level: true } },
      awards: { select: { id: true } },
      mayoralCities: { select: { id: true } },
      _count: { select: { children: true, properties: true, businesses: true } },
      achievements: { select: { achievementId: true } },
    },
  });

  let earnedCount = 0;
  for (const c of players) {
    const bands = c.memberships.map((m) => m.band);
    const concerts = await prisma.concert.count({
      where: { played: true, bandId: { in: bands.map((b) => b.id) } },
    });
    const stats: AchievementStats = {
      songs: bands.reduce((s, b) => s + b._count.songs, 0),
      concerts,
      releases: bands.reduce((s, b) => s + b._count.releases, 0),
      totalSales: bands.reduce(
        (s, b) => s + b.releases.reduce((x, r) => x + r.totalSales, 0),
        0,
      ),
      bandFans: bands.reduce((s, b) => s + b.fanBases.reduce((x, f) => x + f.fans, 0), 0),
      bandFame: bands.reduce((s, b) => Math.max(s, b.fame), 0),
      starValue: c.starValue,
      awards: c.awards.length + bands.reduce((s, b) => s + b.awards.length, 0),
      money: c.money,
      properties: c._count.properties,
      businesses: c._count.businesses,
      isMayor: c.mayoralCities.length > 0,
      maxSkillLevel: c.skills.reduce((s, k) => Math.max(s, k.level), 0),
      children: c._count.children,
    };

    const have = new Set(c.achievements.map((a) => a.achievementId));
    for (const code of earnedAchievements(stats)) {
      const achievementId = achievementIdByCode.get(code)!;
      if (have.has(achievementId)) continue;
      await prisma.characterAchievement.create({
        data: { characterId: c.id, achievementId },
      });
      earnedCount += 1;
    }
  }
  return earnedCount;
}

/**
 * Global sweep over the living world. Meters derive from anchors on read, so
 * the heartbeat flips hospitalisation, completes timed learning, pays weekly
 * salaries on in-game Fridays, charges apartment rent, accrues record sales,
 * ages characters (death → heir), pays rental/business income, runs elections
 * and decays the fame of bands that stop releasing. Faz 10 adds PR fees,
 * gossip, fan-club growth, the annual award show and achievement grants.
 */
export async function runHeartbeat(now: Date = new Date()): Promise<HeartbeatResult> {
  const nowGame = clock.toGameTime(now);
  const hospital = await sweepHospital(now);
  const learningCompleted = await sweepLearning(now);
  const paydays = await sweepPayday(nowGame);
  const rent = await sweepRent(nowGame);
  const releases = await sweepReleases(nowGame);
  const aging = await sweepAging(nowGame);
  const rentalIncome = await sweepProperties(nowGame);
  const businessProfits = await sweepBusinesses(nowGame);
  const elections = await sweepElections(nowGame);
  const fameDecayed = await sweepBandFame(nowGame);
  const prFeesCharged = await sweepPrAgents(nowGame);
  const gossipStories = await sweepGossip(nowGame);
  const fanClubsGrown = await sweepFanClubs(nowGame);
  const awardShowsHeld = await sweepAwardShow(nowGame);
  const achievementsEarned = await sweepAchievements();
  return {
    fameDecayed,
    prFeesCharged,
    gossipStories,
    fanClubsGrown,
    awardShowsHeld,
    achievementsEarned,
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
    rentalIncome,
    businessProfits,
    electionsResolved: elections.resolved,
    electionsOpened: elections.opened,
  };
}
