import { describe, it, expect } from "vitest";
import {
  interviewOutcome,
  gossipHits,
  pickHeadline,
  INTERVIEW_HEADLINES,
  GOSSIP_HEADLINES,
  GOSSIP_MIN_STAR,
  fanClubWeeklyGrowth,
  fanClubReachBoost,
  AWARD_CATEGORIES,
  ACHIEVEMENTS,
  earnedAchievements,
  type AchievementStats,
} from "../index";

describe("interviewOutcome", () => {
  it("gives a base fame gain between 1 and 3 with no skill or agent", () => {
    expect(interviewOutcome({ mediaSkill: 0, hasPrAgent: false }, 0).fameGain).toBeCloseTo(1);
    expect(interviewOutcome({ mediaSkill: 0, hasPrAgent: false }, 0.999).fameGain).toBeCloseTo(3, 1);
  });

  it("adds up to +2.5 fame from media skill", () => {
    const none = interviewOutcome({ mediaSkill: 0, hasPrAgent: false }, 0.5);
    const five = interviewOutcome({ mediaSkill: 5, hasPrAgent: false }, 0.5);
    expect(five.fameGain - none.fameGain).toBeCloseTo(2.5, 1);
  });

  it("multiplies the gain 1.5x with a PR agent", () => {
    const solo = interviewOutcome({ mediaSkill: 2, hasPrAgent: false }, 0.5);
    const repped = interviewOutcome({ mediaSkill: 2, hasPrAgent: true }, 0.5);
    expect(repped.fameGain).toBeCloseTo(solo.fameGain * 1.5, 1);
  });

  it("derives star gain from fame gain", () => {
    const o = interviewOutcome({ mediaSkill: 3, hasPrAgent: true }, 0.5);
    expect(o.starGain).toBeCloseTo(o.fameGain * 0.8, 1);
  });
});

describe("gossipHits", () => {
  it("never hits characters below the star threshold", () => {
    expect(gossipHits(GOSSIP_MIN_STAR - 1, false, 0, 0)).toBe(false);
  });

  it("hits an unprotected star on a low roll", () => {
    expect(gossipHits(50, false, 0, 0.1)).toBe(true);
    expect(gossipHits(50, false, 0, 0.99)).toBe(false);
  });

  it("is shielded by a PR agent and media skill", () => {
    // Unprotected threshold is 0.2; an agent cuts it to 0.05.
    expect(gossipHits(50, true, 0, 0.1)).toBe(false);
    expect(gossipHits(50, true, 0, 0.04)).toBe(true);
    // 5 media stars halve the remaining chance.
    expect(gossipHits(50, false, 5, 0.15)).toBe(false);
  });
});

describe("pickHeadline", () => {
  it("substitutes the subject name and stays in the pool", () => {
    const h = pickHeadline(INTERVIEW_HEADLINES, "The Test Band", 0);
    expect(h).toContain("The Test Band");
    expect(h).not.toContain("{name}");
    const g = pickHeadline(GOSSIP_HEADLINES, "X", 0.999);
    expect(g).toContain("X");
  });
});

describe("fan clubs", () => {
  it("grows with fame and never shrinks", () => {
    expect(fanClubWeeklyGrowth(0, 0)).toBe(0);
    expect(fanClubWeeklyGrowth(10, 0)).toBe(20);
    expect(fanClubWeeklyGrowth(10, 1000)).toBe(70);
    expect(fanClubWeeklyGrowth(0.4, 0)).toBeGreaterThanOrEqual(1);
  });

  it("boosts concert reach per member", () => {
    expect(fanClubReachBoost(250)).toBe(500);
    expect(fanClubReachBoost(-5)).toBe(0);
  });
});

describe("awards & achievements", () => {
  const baseStats: AchievementStats = {
    songs: 0,
    concerts: 0,
    releases: 0,
    totalSales: 0,
    bandFans: 0,
    bandFame: 0,
    starValue: 0,
    awards: 0,
    money: 0,
    properties: 0,
    businesses: 0,
    isMayor: false,
    maxSkillLevel: 0,
    children: 0,
  };

  it("has three award categories", () => {
    expect(AWARD_CATEGORIES).toHaveLength(3);
  });

  it("earns nothing on a fresh character", () => {
    expect(earnedAchievements(baseStats)).toHaveLength(0);
  });

  it("earns thresholds cumulatively", () => {
    const codes = earnedAchievements({
      ...baseStats,
      songs: 3,
      totalSales: 12_000,
      money: 15_000,
      isMayor: true,
    });
    expect(codes).toContain("FIRST_SONG");
    expect(codes).toContain("SALES_1K");
    expect(codes).toContain("SALES_10K");
    expect(codes).toContain("MONEY_10K");
    expect(codes).not.toContain("MONEY_100K");
    expect(codes).toContain("MAYOR");
  });

  it("every earned code exists in the catalogue", () => {
    const all = earnedAchievements({
      ...baseStats,
      songs: 1,
      concerts: 1,
      releases: 1,
      totalSales: 10_000,
      bandFans: 1_000,
      bandFame: 50,
      starValue: 25,
      awards: 1,
      money: 100_000,
      properties: 1,
      businesses: 1,
      isMayor: true,
      maxSkillLevel: 5,
      children: 1,
    });
    const catalogue = new Set(ACHIEVEMENTS.map((a) => a.code));
    expect(all).toHaveLength(ACHIEVEMENTS.length);
    for (const code of all) expect(catalogue.has(code)).toBe(true);
  });
});
