import { prisma, MeterKind } from "@fameworld/db";
import { needsHospital, type MeterState } from "@fameworld/game-engine";

function toState(row: { value: number; anchorAt: Date; ratePerHour: number }): MeterState {
  return { value: row.value, anchorAt: row.anchorAt, ratePerHour: row.ratePerHour };
}

export interface HeartbeatResult {
  scanned: number;
  hospitalized: number;
  discharged: number;
}

/**
 * Global sweep over living characters. Meters are derived from anchors on read,
 * so the heartbeat's job is to flip the hospitalisation flag: admit characters
 * whose mood/health fell below the threshold, and discharge those who recovered.
 *
 * Future phases hang more work off this sweep (weekly paydays, rent, chart
 * recalculation, NPC world simulation).
 */
export async function runHeartbeat(now: Date = new Date()): Promise<HeartbeatResult> {
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
      await prisma.character.update({
        where: { id: c.id },
        data: { hospitalizedAt: now },
      });
      hospitalized += 1;
    } else if (!critical && c.hospitalizedAt) {
      // Discharge and re-anchor mood/health at a safe recovery baseline.
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
