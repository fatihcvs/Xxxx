import { describe, it, expect } from "vitest";
import {
  holidayKeyForDate,
  lotteryDraw,
  lotteryPrize,
  gameWeekIndex,
  LOTTERY_PICKS,
  LOTTERY_POOL,
  LOTTERY_PRIZES,
} from "../index";

describe("holidayKeyForDate", () => {
  it("matches fixed holidays regardless of year", () => {
    expect(holidayKeyForDate(new Date(Date.UTC(2000, 0, 1)))).toBe("newYear");
    expect(holidayKeyForDate(new Date(Date.UTC(2033, 11, 31)))).toBe("yearsEnd");
    expect(holidayKeyForDate(new Date(Date.UTC(2000, 4, 1)))).toBe("workersDay");
  });

  it("returns null on ordinary days", () => {
    expect(holidayKeyForDate(new Date(Date.UTC(2000, 2, 15)))).toBeNull();
  });
});

describe("lotteryDraw", () => {
  it("draws unique, sorted numbers within the pool", () => {
    for (let i = 0; i < 50; i++) {
      const d = lotteryDraw();
      expect(d).toHaveLength(LOTTERY_PICKS);
      expect(new Set(d).size).toBe(LOTTERY_PICKS);
      for (const n of d) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(LOTTERY_POOL);
      }
      const sorted = [...d].sort((a, b) => a - b);
      expect(d).toEqual(sorted);
    }
  });

  it("is deterministic with a seeded rng", () => {
    let seed = 0.5;
    const rng = () => {
      seed = (seed * 9301 + 0.49297) % 1;
      return seed;
    };
    const a = lotteryDraw(rng);
    seed = 0.5;
    const b = lotteryDraw(rng);
    expect(a).toEqual(b);
  });
});

describe("lotteryPrize", () => {
  const drawn = [1, 2, 3, 4, 5];
  it("pays nothing for fewer than three matches", () => {
    expect(lotteryPrize([1, 2, 10, 11, 12], drawn)).toBe(0);
    expect(lotteryPrize([10, 11, 12, 13, 14], drawn)).toBe(0);
  });
  it("pays the tiered prize by match count", () => {
    expect(lotteryPrize([1, 2, 3, 10, 11], drawn)).toBe(LOTTERY_PRIZES[3]);
    expect(lotteryPrize([1, 2, 3, 4, 11], drawn)).toBe(LOTTERY_PRIZES[4]);
    expect(lotteryPrize([1, 2, 3, 4, 5], drawn)).toBe(LOTTERY_PRIZES[5]);
  });
});

describe("gameWeekIndex", () => {
  it("advances by one every seven game days", () => {
    const day = 24 * 3_600_000;
    const base = gameWeekIndex(new Date(0));
    expect(gameWeekIndex(new Date(6 * day))).toBe(base);
    expect(gameWeekIndex(new Date(7 * day))).toBe(base + 1);
  });
});
