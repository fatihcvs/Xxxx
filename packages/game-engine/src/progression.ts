/**
 * Progression helpers: which attribute a job trains, and how much XP actions
 * award. Kept pure so both the web app and the worker can share the rules.
 */
import type { Attribute } from "./attributes";

/** Primary attribute trained by working a given job title. */
const JOB_ATTRIBUTE: Record<string, Attribute> = {
  Bartender: "charm",
  Waiter: "charm",
  "PR Assistant": "intelligence",
  Roadie: "constitution",
};

export function jobPrimaryAttribute(jobTitle: string): Attribute {
  return JOB_ATTRIBUTE[jobTitle] ?? "charm";
}

/** XP awarded to the job's primary attribute on each weekly payday. */
export const PAYDAY_XP = 15;

/** XP awarded to intelligence when a study/learning task completes. */
export const STUDY_XP = 10;

/** Convert a learn duration in real hours to a finish timestamp. */
export function learningFinishesAt(
  realHours: number,
  now: Date = new Date(),
): Date {
  return new Date(now.getTime() + realHours * 3_600_000);
}
