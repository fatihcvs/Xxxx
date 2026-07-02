/** Choice keys for focuses and demeanour; display labels live in i18n. */

export const FREE_TIME_FOCUSES = ["sports", "reading", "socializing", "meditation"] as const;
export type FreeTimeFocus = (typeof FREE_TIME_FOCUSES)[number];

export const CAREER_FOCUSES = ["music", "business", "study"] as const;
export type CareerFocus = (typeof CAREER_FOCUSES)[number];

export const ATTITUDES = ["friendly", "professional", "flirty", "mysterious", "rude"] as const;
export type Attitude = (typeof ATTITUDES)[number];
