import { describe, it, expect } from "vitest";
import {
  WorldClock,
  currentMeter,
  applyMeterDelta,
  needsHospital,
  newMeter,
  addAttributeXp,
  xpForNextLevel,
  learnHours,
  composeSong,
  runConcert,
} from "../index";

describe("WorldClock", () => {
  const clock = new WorldClock({
    realEpoch: new Date("2024-01-01T00:00:00Z"),
    gameEpoch: new Date("2000-01-01T00:00:00Z"),
    realDaysPerGameYear: 56,
  });

  it("runs game time faster than real time by 365/56", () => {
    expect(clock.speedFactor).toBeCloseTo(365 / 56, 6);
  });

  it("advances ~1 game year per 56 real days", () => {
    const real = new Date("2024-02-26T00:00:00Z"); // +56 real days
    const game = clock.toGameTime(real);
    expect(clock.gameYearsBetween(new Date("2000-01-01T00:00:00Z"), game)).toBe(1);
  });

  it("round-trips real<->game", () => {
    const game = new Date("2005-06-15T12:00:00Z");
    const real = clock.toRealTime(game);
    expect(clock.toGameTime(real).getTime()).toBeCloseTo(game.getTime(), -2);
  });
});

describe("meters", () => {
  it("decays over real time and clamps at 0", () => {
    const anchor = new Date("2024-01-01T00:00:00Z");
    const health = newMeter("health", 100, anchor);
    const later = new Date(anchor.getTime() + 10 * 3_600_000); // +10h
    expect(currentMeter(health, later)).toBeLessThan(100);
    const wayLater = new Date(anchor.getTime() + 10_000 * 3_600_000);
    expect(currentMeter(health, wayLater)).toBe(0);
  });

  it("hospitalises when mood or health below 15%", () => {
    const now = new Date();
    const mood = applyMeterDelta(newMeter("mood", 100, now), -90, now); // 10
    const health = newMeter("health", 100, now);
    expect(needsHospital(mood, health, now)).toBe(true);
  });
});

describe("attributes xp", () => {
  it("levels up when xp exceeds threshold", () => {
    const start = { level: 0, xp: 0 };
    const after = addAttributeXp(start, xpForNextLevel(0) + 5);
    expect(after.level).toBe(1);
    expect(after.xp).toBe(5);
  });
});

describe("skills", () => {
  it("higher intelligence learns faster", () => {
    expect(learnHours(3, 20)).toBeLessThan(learnHours(3, 0));
  });
});

describe("song + concert are deterministic under a seeded rng", () => {
  const seq = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
  const makeRng = () => {
    let i = 0;
    return () => seq[i++ % seq.length]!;
  };

  it("composes a titled song with bounded quality", () => {
    const s = composeSong({ composing: 10, lyrics: 8, genre: 6, creativity: 12, rng: makeRng() });
    expect(s.title).toMatch(/\w+ \w+/);
    expect(s.quality).toBeGreaterThanOrEqual(0);
    expect(s.quality).toBeLessThanOrEqual(100);
  });

  it("runs a concert with attendance capped by venue", () => {
    const o = runConcert({
      fame: 40,
      venueCapacity: 200,
      cityReach: 5000,
      ticketPrice: 20,
      performanceQuality: 60,
      rng: makeRng(),
    });
    expect(o.attendance).toBeLessThanOrEqual(200);
    expect(o.revenue).toBe(o.attendance * 20);
  });
});
