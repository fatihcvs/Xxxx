import { worldClockFromEnv } from "@fameworld/game-engine";

/** Shared world clock instance derived from env. */
export const worldClock = worldClockFromEnv();

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/** Human-readable in-game date for display in the status bar. */
export function formatGameDate(gameTime: Date = worldClock.toGameTime()): string {
  const d = gameTime.getUTCDate();
  const m = MONTHS[gameTime.getUTCMonth()];
  const y = gameTime.getUTCFullYear();
  return `${d} ${m} ${y}`;
}
