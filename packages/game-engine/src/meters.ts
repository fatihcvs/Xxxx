/**
 * Character meters: Mood, Health, Energy.
 *
 * Meters change in REAL time (the character keeps living offline), so we store
 * an anchor value at a real timestamp plus a per-hour rate, and derive the
 * current value on read. Actions re-anchor the meter with a new value.
 *
 * If Mood or Health drops below HOSPITAL_THRESHOLD_PCT of max, the character is
 * hospitalised until it recovers.
 */

export const METER_MAX = 100;
export const HOSPITAL_THRESHOLD_PCT = 15;

export type MeterKind = "mood" | "health" | "energy";

export interface MeterState {
  /** Value at `anchorAt`, in [0, METER_MAX]. */
  value: number;
  /** Real instant the value was recorded. */
  anchorAt: Date;
  /** Change per real hour (negative = decay, positive = passive regen). */
  ratePerHour: number;
}

/** Baseline passive rates per real hour (tunable). */
export const DEFAULT_METER_RATES: Record<MeterKind, number> = {
  mood: -0.9,
  health: -0.4,
  // Energy passively regenerates while not spending it.
  energy: 1.2,
};

export function clampMeter(value: number): number {
  return Math.max(0, Math.min(METER_MAX, value));
}

/** Current derived value at `now`, clamped to [0, METER_MAX]. */
export function currentMeter(state: MeterState, now: Date = new Date()): number {
  const hours = (now.getTime() - state.anchorAt.getTime()) / 3_600_000;
  return clampMeter(state.value + state.ratePerHour * hours);
}

/** Re-anchor a meter to a new value at `now` (e.g. after an action). */
export function reanchorMeter(
  state: MeterState,
  now: Date = new Date(),
  ratePerHour: number = state.ratePerHour,
): MeterState {
  return { value: currentMeter(state, now), anchorAt: now, ratePerHour };
}

/** Apply a delta to the current value and re-anchor. */
export function applyMeterDelta(
  state: MeterState,
  delta: number,
  now: Date = new Date(),
): MeterState {
  const next = clampMeter(currentMeter(state, now) + delta);
  return { value: next, anchorAt: now, ratePerHour: state.ratePerHour };
}

export function isBelowHospitalThreshold(value: number): boolean {
  return value < (HOSPITAL_THRESHOLD_PCT / 100) * METER_MAX;
}

/**
 * Should the character be hospitalised right now?
 * True when mood or health is below the threshold.
 */
export function needsHospital(
  mood: MeterState,
  health: MeterState,
  now: Date = new Date(),
): boolean {
  return (
    isBelowHospitalThreshold(currentMeter(mood, now)) ||
    isBelowHospitalThreshold(currentMeter(health, now))
  );
}

/** A fresh meter starting at a value with default passive rate. */
export function newMeter(
  kind: MeterKind,
  value: number = METER_MAX,
  now: Date = new Date(),
): MeterState {
  return { value: clampMeter(value), anchorAt: now, ratePerHour: DEFAULT_METER_RATES[kind] };
}
