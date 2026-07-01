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
