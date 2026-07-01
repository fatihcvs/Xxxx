/**
 * Inter-city travel (Faz 13). Flights between cities cost money, take real
 * time and drain energy — all derived from the great-circle distance between
 * the two cities' coordinates.
 */

export interface GeoPoint {
  lat: number;
  lon: number;
}

const EARTH_RADIUS_KM = 6371;

/** Great-circle distance between two points, in kilometres (haversine). */
export function haversineKm(a: GeoPoint, b: GeoPoint): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const sinLat = Math.sin(dLat / 2);
  const sinLon = Math.sin(dLon / 2);
  const h =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLon * sinLon;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Ticket price: base fee plus a per-km rate (short hops stay affordable). */
export const FLIGHT_BASE_COST = 40;
export const FLIGHT_COST_PER_KM = 0.05;

export function flightCost(distanceKm: number): number {
  return Math.round(FLIGHT_BASE_COST + distanceKm * FLIGHT_COST_PER_KM);
}

/**
 * Real-world flight duration in minutes: check-in overhead plus cruise time.
 * Kept shorter than a literal flight so long hauls stay playable, but long
 * enough that travelling across the world is a commitment.
 */
export const FLIGHT_OVERHEAD_MIN = 15;
export const FLIGHT_KM_PER_MIN = 90;

export function flightMinutes(distanceKm: number): number {
  return Math.max(
    FLIGHT_OVERHEAD_MIN,
    Math.round(FLIGHT_OVERHEAD_MIN + distanceKm / FLIGHT_KM_PER_MIN),
  );
}

/** Energy drained by the trip (jet lag scales with distance, capped). */
export const FLIGHT_ENERGY_MIN = 8;
export const FLIGHT_ENERGY_MAX = 35;

export function flightEnergyCost(distanceKm: number): number {
  return Math.min(
    FLIGHT_ENERGY_MAX,
    Math.round(FLIGHT_ENERGY_MIN + distanceKm / 750),
  );
}

/** Arrival timestamp for a flight starting at `departAt`. */
export function flightArrivesAt(distanceKm: number, departAt: Date): Date {
  return new Date(departAt.getTime() + flightMinutes(distanceKm) * 60_000);
}
