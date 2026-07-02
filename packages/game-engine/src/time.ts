/**
 * World clock: a pure mapping between real time and in-game time.
 *
 * The world advances continuously; the character keeps living while the player
 * is offline. We never "tick every game day" in the DB. Instead we store a
 * fixed real->game anchor and derive game time on read, and schedule discrete
 * events at the real timestamp computed from a target game time.
 */

export interface WorldClockConfig {
  /** Real-world instant that maps to `gameEpoch`. */
  realEpoch: Date;
  /** In-game instant shown at `realEpoch`. */
  gameEpoch: Date;
  /** Real days that elapse for one in-game year. Popmundo-style default: 56. */
  realDaysPerGameYear: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DAYS_PER_GAME_YEAR = 365; // in-game calendar year length

export class WorldClock {
  private readonly realEpochMs: number;
  private readonly gameEpochMs: number;
  /** How much faster game time runs than real time. */
  readonly speedFactor: number;

  constructor(config: WorldClockConfig) {
    this.realEpochMs = config.realEpoch.getTime();
    this.gameEpochMs = config.gameEpoch.getTime();
    // 1 game year (365 game days) passes every `realDaysPerGameYear` real days.
    this.speedFactor = DAYS_PER_GAME_YEAR / config.realDaysPerGameYear;
  }

  /** In-game instant for a given real instant (default: now). */
  toGameTime(real: Date = new Date()): Date {
    const elapsedReal = real.getTime() - this.realEpochMs;
    return new Date(this.gameEpochMs + elapsedReal * this.speedFactor);
  }

  /** Real instant at which the game clock reaches `game`. */
  toRealTime(game: Date): Date {
    const elapsedGame = game.getTime() - this.gameEpochMs;
    return new Date(this.realEpochMs + elapsedGame / this.speedFactor);
  }

  /** Whole in-game years between two game instants (e.g. character age). */
  gameYearsBetween(fromGame: Date, toGame: Date = this.toGameTime()): number {
    const gameDays = (toGame.getTime() - fromGame.getTime()) / MS_PER_DAY;
    return Math.floor(gameDays / DAYS_PER_GAME_YEAR);
  }
}

export function worldClockFromEnv(env: NodeJS.ProcessEnv = process.env): WorldClock {
  return new WorldClock({
    realEpoch: new Date(env.WORLD_EPOCH_REAL ?? "2024-01-01T00:00:00.000Z"),
    gameEpoch: new Date(env.WORLD_EPOCH_GAME ?? "2000-01-01T00:00:00.000Z"),
    realDaysPerGameYear: Number(env.REAL_DAYS_PER_GAME_YEAR ?? 56),
  });
}

// --- In-game calendar helpers (operate on game-time Date values) ---

function gameDayNumber(gameTime: Date): number {
  return Math.floor(gameTime.getTime() / MS_PER_DAY);
}

/** Whole in-game weeks (7 game days) between two game instants. */
export function gameWeeksBetween(fromGame: Date, toGame: Date): number {
  return Math.floor((toGame.getTime() - fromGame.getTime()) / (7 * MS_PER_DAY));
}

/**
 * Number of in-game Fridays strictly after `sinceGame` and up to (including)
 * `toGame`. Day 0 of the epoch (1970-01-01) is a Thursday, so Fridays are the
 * day numbers d with d % 7 === 1. Used to drive weekly salary paydays.
 */
export function gameFridaysPassed(sinceGame: Date, toGame: Date): number {
  const a = gameDayNumber(sinceGame);
  const b = gameDayNumber(toGame);
  if (b <= a) return 0;
  const countLE = (n: number) => Math.floor((n - 1) / 7) + 1; // # of Fridays in [0..n]
  return countLE(b) - countLE(a);
}

/**
 * Number of in-game Sundays strictly after `sinceGame` and up to (including)
 * `toGame`. With day 0 a Thursday, Sundays are day numbers d with d % 7 === 3.
 * Drives the weekly development-point grant.
 */
export function gameSundaysPassed(sinceGame: Date, toGame: Date): number {
  const a = gameDayNumber(sinceGame);
  const b = gameDayNumber(toGame);
  if (b <= a) return 0;
  const countLE = (n: number) => Math.floor((n - 3) / 7) + 1; // # of Sundays in [0..n]
  return countLE(b) - countLE(a);
}
