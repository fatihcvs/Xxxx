/**
 * Concert outcome. Attendance is driven by the band's fame, the city
 * population reach, the venue capacity and the ticket price. Revenue, review
 * score and the resulting mood/health/fame deltas follow from attendance and
 * the performance quality (repertoire + showmanship + rehearsal).
 */

export interface ConcertInput {
  /** Band fame / star value, 0..100. */
  fame: number;
  /** Venue capacity (hard cap on attendance). */
  venueCapacity: number;
  /** Local audience reach (potential fans in the city). */
  cityReach: number;
  /** Ticket price in game currency. */
  ticketPrice: number;
  /** Average performance quality of the set, 0..100. */
  performanceQuality: number;
  rng?: () => number;
}

export interface ConcertOutcome {
  attendance: number;
  revenue: number;
  /** Critic review 0..100. */
  reviewScore: number;
  fameDelta: number;
  moodDelta: number;
  healthDelta: number;
}

/** Demand falls as price rises; a simple elasticity curve in [0,1]. */
function priceAppetite(price: number): number {
  return 1 / (1 + Math.pow(price / 25, 1.4));
}

export function runConcert(input: ConcertInput): ConcertOutcome {
  const rng = input.rng ?? Math.random;
  const fame01 = Math.max(0, Math.min(1, input.fame / 100));

  const potential = input.cityReach * (0.15 + 0.85 * fame01);
  const demand = potential * priceAppetite(input.ticketPrice);
  const noisy = demand * (0.85 + rng() * 0.3);
  const attendance = Math.max(0, Math.min(input.venueCapacity, Math.round(noisy)));

  const revenue = Math.round(attendance * input.ticketPrice);

  const reviewScore = Math.round(
    Math.max(0, Math.min(100, input.performanceQuality * (0.9 + rng() * 0.2))),
  );

  const fillRate = input.venueCapacity > 0 ? attendance / input.venueCapacity : 0;
  const fameDelta = Number((fillRate * (reviewScore / 100) * 2).toFixed(2));
  const moodDelta = Number(((reviewScore - 50) / 10 + fillRate * 4).toFixed(2));
  const healthDelta = Number((-3 - fillRate * 2).toFixed(2)); // performing is tiring

  return { attendance, revenue, reviewScore, fameDelta, moodDelta, healthDelta };
}
