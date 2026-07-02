import { describe, it, expect } from "vitest";
import {
  gameSundaysPassed,
  gameFridaysPassed,
  bankInterestForWeek,
  BANK_WEEKLY_INTEREST_CAP,
  adjectiveIndex,
  attributePercent,
  MAX_STAR,
  WEEKLY_DP,
  DP_ATTRIBUTE_COST,
  DP_SKILL_COST,
} from "../index";

const day = (n: number) => new Date(n * 24 * 3_600_000);

describe("gameSundaysPassed", () => {
  it("counts a single Sunday in one week", () => {
    // Day 0 is a Thursday, so day 3 is the first Sunday.
    expect(gameSundaysPassed(day(0), day(7))).toBe(1);
    expect(gameSundaysPassed(day(0), day(2))).toBe(0);
    expect(gameSundaysPassed(day(0), day(3))).toBe(1);
  });

  it("counts several weeks and ignores reversed ranges", () => {
    expect(gameSundaysPassed(day(0), day(28))).toBe(4);
    expect(gameSundaysPassed(day(10), day(3))).toBe(0);
  });

  it("does not double-count with Fridays", () => {
    // Fridays and Sundays over one week are one each.
    expect(gameFridaysPassed(day(0), day(7))).toBe(1);
    expect(gameSundaysPassed(day(0), day(7))).toBe(1);
  });
});

describe("bankInterestForWeek", () => {
  it("pays 1% weekly", () => {
    expect(bankInterestForWeek(10_000)).toBe(100);
    expect(bankInterestForWeek(0)).toBe(0);
    expect(bankInterestForWeek(-50)).toBe(0);
  });

  it("caps the weekly payout", () => {
    expect(bankInterestForWeek(10_000_000)).toBe(BANK_WEEKLY_INTEREST_CAP);
  });
});

describe("level adjectives", () => {
  it("maps 0..100 to 11 steps", () => {
    expect(adjectiveIndex(0)).toBe(0);
    expect(adjectiveIndex(35)).toBe(4);
    expect(adjectiveIndex(93)).toBe(9);
    expect(adjectiveIndex(100)).toBe(10);
    expect(adjectiveIndex(140)).toBe(10);
  });

  it("converts attribute stars to percent", () => {
    expect(attributePercent(0)).toBe(0);
    expect(attributePercent(MAX_STAR)).toBe(100);
    expect(attributePercent(MAX_STAR / 5)).toBe(20);
  });
});

describe("dp constants", () => {
  it("keeps costs affordable against the weekly grant", () => {
    expect(DP_ATTRIBUTE_COST).toBeLessThanOrEqual(WEEKLY_DP);
    expect(DP_SKILL_COST).toBeLessThanOrEqual(WEEKLY_DP);
  });
});
