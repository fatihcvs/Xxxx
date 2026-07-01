/**
 * Curated name pools for character creation. Players pick a first and last name
 * from these lists (they are not free-typed), mirroring the classic flow.
 * These are common international personal names (facts, not copyrightable) and
 * are our own curated selection.
 */

export const FIRST_NAMES_MALE = [
  "Adem", "Alp", "Arda", "Aron", "Bruno", "Can", "Carlos", "Daniel", "David", "Deniz",
  "Diego", "Emir", "Enzo", "Ethan", "Felix", "Hugo", "Ivan", "Jack", "James", "Kai",
  "Kerem", "Leo", "Liam", "Lucas", "Marco", "Mateo", "Mert", "Milan", "Noah", "Oliver",
  "Omar", "Oscar", "Pablo", "Ravi", "Samuel", "Theo", "Tomas", "Umut", "Victor", "Yusuf",
];

export const FIRST_NAMES_FEMALE = [
  "Ada", "Alba", "Amara", "Ana", "Aylin", "Bella", "Chloe", "Clara", "Defne", "Ece",
  "Elif", "Ella", "Emma", "Eva", "Freya", "Hana", "Ines", "Iris", "Isla", "Ivy",
  "Julia", "Lara", "Leyla", "Lina", "Luna", "Maya", "Mila", "Mira", "Nina", "Nora",
  "Olivia", "Rosa", "Ruya", "Sara", "Sofia", "Suki", "Vera", "Yara", "Zara", "Zoe",
];

export const FIRST_NAMES_NEUTRAL = [
  "Alex", "Arin", "Bo", "Charlie", "Dilan", "Ezra", "Jamie", "Kim", "Lou", "Mika",
  "Noa", "Pax", "Remy", "Robin", "Sam", "Sky", "Toni", "Val", "Wren", "Yael",
];

export const LAST_NAMES = [
  "Adler", "Aydin", "Barnes", "Blanco", "Bloom", "Brandt", "Bright", "Carter", "Cohen", "Costa",
  "Cross", "Demir", "Dune", "Ericsson", "Falk", "Fischer", "Fox", "Frost", "Garcia", "Grey",
  "Hale", "Hart", "Ito", "Jansen", "Kaya", "Keller", "Lang", "Lark", "Leroy", "Marsh",
  "Meyer", "Moreau", "Nakamura", "Novak", "Orr", "Pike", "Quinn", "Reed", "Rossi", "Ryan",
  "Silva", "Sol", "Stone", "Tanaka", "Vale", "Vance", "Vega", "Wolf", "Wren", "Yilmaz",
];

export function firstNamesForGender(gender: string): string[] {
  if (gender === "MALE") return FIRST_NAMES_MALE;
  if (gender === "FEMALE") return FIRST_NAMES_FEMALE;
  return FIRST_NAMES_NEUTRAL;
}

/** All valid first names (for server-side validation). */
export const ALL_FIRST_NAMES = [
  ...FIRST_NAMES_MALE,
  ...FIRST_NAMES_FEMALE,
  ...FIRST_NAMES_NEUTRAL,
];
