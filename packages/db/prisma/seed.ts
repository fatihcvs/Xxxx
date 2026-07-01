/**
 * Seed the world: 50 real cities across 35 countries (each with a standard
 * set of venues, jobs and university courses), plus the global
 * skill/genre/book catalogue. Venue names and all text are original.
 */
import { PrismaClient, LocaleType } from "@prisma/client";
import { ACHIEVEMENTS } from "../src/achievements";

const prisma = new PrismaClient();

// Skill catalogue across the 19 categories, with basic->advanced prerequisites.
type SkillDef = { name: string; category: string; tier?: number; prereq?: string };
const SKILLS: SkillDef[] = [
  // creative (composing / lyrics)
  { name: "Basic Composing", category: "creative" },
  { name: "Advanced Composing", category: "creative", tier: 2, prereq: "Basic Composing" },
  { name: "Basic Lyrics", category: "creative" },
  { name: "Advanced Lyrics", category: "creative", tier: 2, prereq: "Basic Lyrics" },
  // musical instruments
  { name: "Basic String Instruments", category: "instrument" },
  { name: "Electric Guitar", category: "instrument", tier: 2, prereq: "Basic String Instruments" },
  { name: "Bass Guitar", category: "instrument", tier: 2, prereq: "Basic String Instruments" },
  { name: "Acoustic Guitar", category: "instrument", tier: 2, prereq: "Basic String Instruments" },
  { name: "Basic Percussion", category: "instrument" },
  { name: "Drums", category: "instrument", tier: 2, prereq: "Basic Percussion" },
  { name: "Basic Keys", category: "instrument" },
  { name: "Piano", category: "instrument", tier: 2, prereq: "Basic Keys" },
  { name: "Keyboards", category: "instrument", tier: 2, prereq: "Basic Keys" },
  { name: "Basic Singing", category: "instrument" },
  { name: "Professional Singing", category: "instrument", tier: 2, prereq: "Basic Singing" },
  // stage & performance
  { name: "Basic Showmanship", category: "stage" },
  { name: "Advanced Showmanship", category: "stage", tier: 2, prereq: "Basic Showmanship" },
  { name: "Basic Dancing", category: "stage" },
  { name: "Professional Dancing", category: "stage", tier: 2, prereq: "Basic Dancing" },
  // social / sexual
  { name: "Basic Social Skills", category: "social" },
  { name: "Advanced Social Skills", category: "social", tier: 2, prereq: "Basic Social Skills" },
  { name: "Basic Sex Appeal", category: "sexual" },
  // business / media
  { name: "Basic Business", category: "business" },
  { name: "Advanced Business", category: "business", tier: 2, prereq: "Basic Business" },
  { name: "Basic Media Manipulation", category: "media" },
  // criminal / police
  { name: "Basic Theft", category: "criminal" },
  { name: "Advanced Theft", category: "criminal", tier: 2, prereq: "Basic Theft" },
  { name: "Basic Policing", category: "police" },
  // medicine / sports / science
  { name: "Basic Medicine", category: "medicine" },
  { name: "Advanced Medicine", category: "medicine", tier: 2, prereq: "Basic Medicine" },
  { name: "Basic Fitness", category: "sports" },
  { name: "Basic Science", category: "science" },
  // spiritual / artistic / firemen / nature / paranormal / crafting / misc
  { name: "Basic Faith", category: "spiritual" },
  { name: "Basic Art", category: "artistic" },
  { name: "Basic Firefighting", category: "firemen" },
  { name: "Basic Foraging", category: "nature" },
  { name: "Basic Paranormal", category: "paranormal" },
  { name: "Basic Crafting", category: "crafting" },
  { name: "Cooking", category: "misc" },
  { name: "Driving", category: "misc" },
];

const GENRES = [
  "African", "Blues", "Classical", "Country & Western", "Electronica", "Flamenco",
  "Heavy Metal", "Hip Hop", "Jazz", "Latin", "Modern Rock", "Pop", "Punk Rock",
  "Reggae", "Rhythm & Blues", "Rock", "World",
];

// The world map: 50 real cities. reach ≈ metro population in thousands
// (drives audience/sales); lat/lon drive flight distance, cost and duration.
type CityDef = {
  name: string;
  country: string;
  code: string; // ISO 3166-1 alpha-2
  timezone: string; // IANA zone
  lat: number;
  lon: number;
  reach: number;
};

const CITIES: CityDef[] = [
  // --- Europe ---
  { name: "Amsterdam", country: "Netherlands", code: "NL", timezone: "Europe/Amsterdam", lat: 52.37, lon: 4.9, reach: 2500 },
  { name: "Athens", country: "Greece", code: "GR", timezone: "Europe/Athens", lat: 37.98, lon: 23.73, reach: 3100 },
  { name: "Barcelona", country: "Spain", code: "ES", timezone: "Europe/Madrid", lat: 41.39, lon: 2.17, reach: 5500 },
  { name: "Belgrade", country: "Serbia", code: "RS", timezone: "Europe/Belgrade", lat: 44.81, lon: 20.46, reach: 1700 },
  { name: "Berlin", country: "Germany", code: "DE", timezone: "Europe/Berlin", lat: 52.52, lon: 13.4, reach: 3800 },
  { name: "Brussels", country: "Belgium", code: "BE", timezone: "Europe/Brussels", lat: 50.85, lon: 4.35, reach: 2100 },
  { name: "Bucharest", country: "Romania", code: "RO", timezone: "Europe/Bucharest", lat: 44.43, lon: 26.1, reach: 2100 },
  { name: "Budapest", country: "Hungary", code: "HU", timezone: "Europe/Budapest", lat: 47.5, lon: 19.04, reach: 2500 },
  { name: "Copenhagen", country: "Denmark", code: "DK", timezone: "Europe/Copenhagen", lat: 55.68, lon: 12.57, reach: 1400 },
  { name: "Glasgow", country: "United Kingdom", code: "GB", timezone: "Europe/London", lat: 55.86, lon: -4.25, reach: 1700 },
  { name: "Helsinki", country: "Finland", code: "FI", timezone: "Europe/Helsinki", lat: 60.17, lon: 24.94, reach: 1300 },
  { name: "Kyiv", country: "Ukraine", code: "UA", timezone: "Europe/Kyiv", lat: 50.45, lon: 30.52, reach: 3000 },
  { name: "London", country: "United Kingdom", code: "GB", timezone: "Europe/London", lat: 51.51, lon: -0.13, reach: 14000 },
  { name: "Madrid", country: "Spain", code: "ES", timezone: "Europe/Madrid", lat: 40.42, lon: -3.7, reach: 6700 },
  { name: "Milan", country: "Italy", code: "IT", timezone: "Europe/Rome", lat: 45.46, lon: 9.19, reach: 4300 },
  { name: "Moscow", country: "Russia", code: "RU", timezone: "Europe/Moscow", lat: 55.76, lon: 37.62, reach: 17000 },
  { name: "Paris", country: "France", code: "FR", timezone: "Europe/Paris", lat: 48.86, lon: 2.35, reach: 11000 },
  { name: "Porto", country: "Portugal", code: "PT", timezone: "Europe/Lisbon", lat: 41.15, lon: -8.61, reach: 1700 },
  { name: "Rome", country: "Italy", code: "IT", timezone: "Europe/Rome", lat: 41.9, lon: 12.5, reach: 4300 },
  { name: "Sarajevo", country: "Bosnia and Herzegovina", code: "BA", timezone: "Europe/Sarajevo", lat: 43.86, lon: 18.41, reach: 550 },
  { name: "Sofia", country: "Bulgaria", code: "BG", timezone: "Europe/Sofia", lat: 42.7, lon: 23.32, reach: 1300 },
  { name: "Stockholm", country: "Sweden", code: "SE", timezone: "Europe/Stockholm", lat: 59.33, lon: 18.07, reach: 2400 },
  { name: "Tallinn", country: "Estonia", code: "EE", timezone: "Europe/Tallinn", lat: 59.44, lon: 24.75, reach: 450 },
  { name: "Tromsø", country: "Norway", code: "NO", timezone: "Europe/Oslo", lat: 69.65, lon: 18.96, reach: 80 },
  { name: "Vilnius", country: "Lithuania", code: "LT", timezone: "Europe/Vilnius", lat: 54.69, lon: 25.28, reach: 600 },
  { name: "Warsaw", country: "Poland", code: "PL", timezone: "Europe/Warsaw", lat: 52.23, lon: 21.01, reach: 3100 },
  { name: "Zagreb", country: "Croatia", code: "HR", timezone: "Europe/Zagreb", lat: 45.81, lon: 15.98, reach: 1100 },
  // --- Türkiye ---
  { name: "Istanbul", country: "Türkiye", code: "TR", timezone: "Europe/Istanbul", lat: 41.01, lon: 28.98, reach: 15500 },
  { name: "Ankara", country: "Türkiye", code: "TR", timezone: "Europe/Istanbul", lat: 39.93, lon: 32.86, reach: 5700 },
  { name: "Izmir", country: "Türkiye", code: "TR", timezone: "Europe/Istanbul", lat: 38.42, lon: 27.14, reach: 4400 },
  { name: "Antalya", country: "Türkiye", code: "TR", timezone: "Europe/Istanbul", lat: 36.9, lon: 30.7, reach: 2600 },
  // --- Caucasus ---
  { name: "Baku", country: "Azerbaijan", code: "AZ", timezone: "Asia/Baku", lat: 40.41, lon: 49.87, reach: 2300 },
  // --- Americas ---
  { name: "Buenos Aires", country: "Argentina", code: "AR", timezone: "America/Argentina/Buenos_Aires", lat: -34.6, lon: -58.38, reach: 15000 },
  { name: "Los Angeles", country: "United States", code: "US", timezone: "America/Los_Angeles", lat: 34.05, lon: -118.24, reach: 13000 },
  { name: "Mexico City", country: "Mexico", code: "MX", timezone: "America/Mexico_City", lat: 19.43, lon: -99.13, reach: 21800 },
  { name: "Montreal", country: "Canada", code: "CA", timezone: "America/Toronto", lat: 45.5, lon: -73.57, reach: 4300 },
  { name: "Nashville", country: "United States", code: "US", timezone: "America/Chicago", lat: 36.16, lon: -86.78, reach: 2100 },
  { name: "New York", country: "United States", code: "US", timezone: "America/New_York", lat: 40.71, lon: -74.01, reach: 19500 },
  { name: "Rio de Janeiro", country: "Brazil", code: "BR", timezone: "America/Sao_Paulo", lat: -22.91, lon: -43.17, reach: 12500 },
  { name: "Santiago", country: "Chile", code: "CL", timezone: "America/Santiago", lat: -33.45, lon: -70.67, reach: 6900 },
  { name: "São Paulo", country: "Brazil", code: "BR", timezone: "America/Sao_Paulo", lat: -23.55, lon: -46.63, reach: 22400 },
  { name: "Seattle", country: "United States", code: "US", timezone: "America/Los_Angeles", lat: 47.61, lon: -122.33, reach: 4000 },
  { name: "Toronto", country: "Canada", code: "CA", timezone: "America/Toronto", lat: 43.65, lon: -79.38, reach: 6400 },
  // --- Asia-Pacific & Africa ---
  { name: "Jakarta", country: "Indonesia", code: "ID", timezone: "Asia/Jakarta", lat: -6.21, lon: 106.85, reach: 33000 },
  { name: "Johannesburg", country: "South Africa", code: "ZA", timezone: "Africa/Johannesburg", lat: -26.2, lon: 28.05, reach: 6100 },
  { name: "Manila", country: "Philippines", code: "PH", timezone: "Asia/Manila", lat: 14.6, lon: 120.98, reach: 24000 },
  { name: "Melbourne", country: "Australia", code: "AU", timezone: "Australia/Melbourne", lat: -37.81, lon: 144.96, reach: 5200 },
  { name: "Shanghai", country: "China", code: "CN", timezone: "Asia/Shanghai", lat: 31.23, lon: 121.47, reach: 29900 },
  { name: "Singapore", country: "Singapore", code: "SG", timezone: "Asia/Singapore", lat: 1.35, lon: 103.82, reach: 6000 },
  { name: "Tokyo", country: "Japan", code: "JP", timezone: "Asia/Tokyo", lat: 35.68, lon: 139.69, reach: 37000 },
];

// Legacy fictional cities (pre-Faz 13) are folded into real ones so existing
// characters, venues and bands migrate seamlessly.
const LEGACY_CITY_RENAMES: Record<string, string> = {
  Startown: "London",
  Rivergate: "New York",
  Sunport: "Los Angeles",
  "Old Harbor": "Amsterdam",
};

/** Standard venue template applied to every city (names are generic per city). */
function venueTemplate(city: string): Array<{ name: string; type: LocaleType; capacity: number }> {
  return [
    { name: `${city} Club`, type: LocaleType.CLUB, capacity: 150 },
    { name: `${city} Records`, type: LocaleType.RECORD_LABEL, capacity: 0 },
    { name: `${city} University`, type: LocaleType.UNIVERSITY, capacity: 0 },
    { name: `${city} Hospital`, type: LocaleType.HOSPITAL, capacity: 0 },
    { name: `${city} Bookshop`, type: LocaleType.SHOP, capacity: 0 },
    { name: `${city} Bar`, type: LocaleType.BAR, capacity: 0 },
    { name: `${city} Diner`, type: LocaleType.RESTAURANT, capacity: 0 },
    { name: `${city} Apartments`, type: LocaleType.APARTMENT, capacity: 0 },
    { name: `${city} Arena`, type: LocaleType.STADIUM, capacity: 5000 },
    { name: `${city} Park`, type: LocaleType.PARK, capacity: 0 },
    { name: `${city} Airport`, type: LocaleType.AIRPORT, capacity: 0 },
  ];
}

/**
 * Fold a legacy fictional city into its real replacement: rename the city,
 * re-home it under the right country and rename its templated venues so
 * existing characters/bands/properties keep their foreign keys.
 */
async function migrateLegacyCities(countryIdByCode: Map<string, string>): Promise<void> {
  for (const [oldName, newName] of Object.entries(LEGACY_CITY_RENAMES)) {
    const legacy = await prisma.city.findFirst({ where: { name: oldName } });
    if (!legacy) continue;
    const def = CITIES.find((c) => c.name === newName)!;
    const already = await prisma.city.findFirst({
      where: { name: newName, countryId: countryIdByCode.get(def.code)! },
    });
    if (already) continue; // real city exists; leave the legacy one untouched
    await prisma.city.update({
      where: { id: legacy.id },
      data: {
        name: def.name,
        countryId: countryIdByCode.get(def.code)!,
        timezone: def.timezone,
        lat: def.lat,
        lon: def.lon,
        reach: def.reach,
      },
    });
    const locales = await prisma.locale.findMany({ where: { cityId: legacy.id } });
    for (const l of locales) {
      if (!l.name.startsWith(`${oldName} `)) continue;
      await prisma.locale.update({
        where: { id: l.id },
        data: { name: l.name.replace(`${oldName} `, `${def.name} `) },
      });
    }
    console.log(`Migrated legacy city ${oldName} -> ${def.name}`);
  }
}

async function seedCity(
  countryId: string,
  city: CityDef,
  skillByName: Map<string, string>,
): Promise<number> {
  const geo = { timezone: city.timezone, lat: city.lat, lon: city.lon, reach: city.reach };
  const rec = await prisma.city.upsert({
    where: { name_countryId: { name: city.name, countryId } },
    update: geo,
    create: { name: city.name, countryId, ...geo },
  });

  const localeByName = new Map<string, string>();
  for (const l of venueTemplate(city.name)) {
    const existing = await prisma.locale.findFirst({ where: { name: l.name, cityId: rec.id } });
    const loc =
      existing ??
      (await prisma.locale.create({
        data: { name: l.name, type: l.type, cityId: rec.id, capacity: l.capacity },
      }));
    localeByName.set(l.type, loc.id);
  }

  const jobDefs = [
    { title: "Bartender", type: LocaleType.BAR, salary: 220 },
    { title: "Waiter", type: LocaleType.RESTAURANT, salary: 200 },
    { title: "PR Assistant", type: LocaleType.RECORD_LABEL, salary: 280 },
    { title: "Roadie", type: LocaleType.CLUB, salary: 240 },
  ];
  for (const j of jobDefs) {
    const localeId = localeByName.get(j.type)!;
    const exists = await prisma.job.findFirst({ where: { title: j.title, localeId } });
    if (!exists) await prisma.job.create({ data: { title: j.title, localeId, salary: j.salary } });
  }

  const universityId = localeByName.get(LocaleType.UNIVERSITY)!;
  const courseDefs = [
    { title: "Music Theory 101", skill: "Basic Composing", fee: 300, maxTeachLevel: 10, speedFactor: 0.6 },
    { title: "Songwriting Workshop", skill: "Basic Lyrics", fee: 300, maxTeachLevel: 10, speedFactor: 0.6 },
    { title: "Business Studies", skill: "Basic Business", fee: 350, maxTeachLevel: 10, speedFactor: 0.55 },
  ];
  for (const c of courseDefs) {
    const exists = await prisma.course.findFirst({ where: { title: c.title, localeId: universityId } });
    if (!exists) {
      await prisma.course.create({
        data: {
          title: c.title,
          localeId: universityId,
          skillId: skillByName.get(c.skill)!,
          fee: c.fee,
          maxTeachLevel: c.maxTeachLevel,
          speedFactor: c.speedFactor,
        },
      });
    }
  }
  return localeByName.size;
}

async function main() {
  // Countries (unique by ISO code).
  const countryIdByCode = new Map<string, string>();
  for (const c of CITIES) {
    if (countryIdByCode.has(c.code)) continue;
    const rec = await prisma.country.upsert({
      where: { code: c.code },
      update: { name: c.country },
      create: { name: c.country, code: c.code },
    });
    countryIdByCode.set(c.code, rec.id);
  }

  // Fold pre-Faz-13 fictional cities into their real replacements.
  await migrateLegacyCities(countryIdByCode);

  // The 17 genres double as tier-1 genre skills (drive the jam ceiling).
  const allSkills: SkillDef[] = [
    ...SKILLS,
    ...GENRES.map((g) => ({ name: g, category: "genre", tier: 1 } as SkillDef)),
  ];

  const skillByName = new Map<string, string>();
  // Pass 1: create/update every skill (5-star cap).
  for (const s of allSkills) {
    const rec = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category, tier: s.tier ?? 1, maxLevel: 5 },
      create: { name: s.name, category: s.category, tier: s.tier ?? 1, maxLevel: 5 },
    });
    skillByName.set(s.name, rec.id);
  }
  // Pass 2: wire up prerequisites now that all ids exist.
  for (const s of allSkills) {
    if (!s.prereq) continue;
    await prisma.skill.update({
      where: { id: skillByName.get(s.name)! },
      data: { prereqSkillId: skillByName.get(s.prereq)! },
    });
  }
  for (const g of GENRES) {
    await prisma.genre.upsert({ where: { name: g }, update: {}, create: { name: g } });
  }

  // Global book catalogue (shown at any city's bookshop).
  const bookDefs = [
    { title: "Composing for Beginners", skill: "Basic Composing", price: 120 },
    { title: "Writing Lyrics", skill: "Basic Lyrics", price: 120 },
    { title: "Owning the Stage", skill: "Basic Showmanship", price: 150 },
    { title: "Six Strings", skill: "Basic String Instruments", price: 100 },
    { title: "Keys & Chords", skill: "Basic Keys", price: 100 },
    { title: "Find Your Voice", skill: "Basic Singing", price: 100 },
    { title: "Media Handbook", skill: "Basic Media Manipulation", price: 100 },
  ];
  for (const b of bookDefs) {
    const exists = await prisma.book.findFirst({ where: { title: b.title } });
    if (!exists) {
      await prisma.book.create({
        data: { title: b.title, skillId: skillByName.get(b.skill)!, price: b.price },
      });
    }
  }

  // Achievement catalogue (Faz 10).
  for (const a of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { code: a.code },
      update: { name: a.name, description: a.description, category: a.category },
      create: a,
    });
  }

  let venues = 0;
  for (const city of CITIES) {
    venues += await seedCity(countryIdByCode.get(city.code)!, city, skillByName);
  }

  // Drop the placeholder country if the legacy migration emptied it.
  const legacyCountry = await prisma.country.findUnique({
    where: { code: "FWL" },
    include: { cities: { select: { id: true } } },
  });
  if (legacyCountry && legacyCountry.cities.length === 0) {
    await prisma.country.delete({ where: { id: legacyCountry.id } });
  }

  console.log(
    `Seeded ${CITIES.length} cities in ${countryIdByCode.size} countries, ${venues} venues, ${SKILLS.length} skills, ${bookDefs.length} books.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
