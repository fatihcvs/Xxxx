/**
 * Seed the starter world: a country with several cities, each with a standard
 * set of venues, jobs and university courses, plus the global skill/genre/book
 * catalogue. All content is original and generic.
 */
import { PrismaClient, LocaleType } from "@prisma/client";

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

// Legacy fictional starter cities (kept: existing characters live here).
const CITIES: Array<{ name: string; reach: number }> = [
  { name: "Startown", reach: 8000 },
  { name: "Rivergate", reach: 12000 },
  { name: "Sunport", reach: 16000 },
  { name: "Old Harbor", reach: 6000 },
];

// Real-world cities (Faz U2). City/country names and timezones are plain facts.
const WORLD_CITIES: Array<{
  name: string;
  country: string;
  code: string;
  tz: string;
  reach: number;
}> = [
  { name: "Istanbul", country: "Turkey", code: "TR", tz: "Europe/Istanbul", reach: 30000 },
  { name: "Izmir", country: "Turkey", code: "TR", tz: "Europe/Istanbul", reach: 18000 },
  { name: "Ankara", country: "Turkey", code: "TR", tz: "Europe/Istanbul", reach: 20000 },
  { name: "Antalya", country: "Turkey", code: "TR", tz: "Europe/Istanbul", reach: 12000 },
  { name: "London", country: "United Kingdom", code: "GB", tz: "Europe/London", reach: 32000 },
  { name: "Glasgow", country: "United Kingdom", code: "GB", tz: "Europe/London", reach: 12000 },
  { name: "Paris", country: "France", code: "FR", tz: "Europe/Paris", reach: 28000 },
  { name: "Berlin", country: "Germany", code: "DE", tz: "Europe/Berlin", reach: 26000 },
  { name: "Munich", country: "Germany", code: "DE", tz: "Europe/Berlin", reach: 16000 },
  { name: "Amsterdam", country: "Netherlands", code: "NL", tz: "Europe/Amsterdam", reach: 18000 },
  { name: "Brussels", country: "Belgium", code: "BE", tz: "Europe/Brussels", reach: 14000 },
  { name: "Madrid", country: "Spain", code: "ES", tz: "Europe/Madrid", reach: 24000 },
  { name: "Barcelona", country: "Spain", code: "ES", tz: "Europe/Madrid", reach: 22000 },
  { name: "Rome", country: "Italy", code: "IT", tz: "Europe/Rome", reach: 22000 },
  { name: "Stockholm", country: "Sweden", code: "SE", tz: "Europe/Stockholm", reach: 14000 },
  { name: "Helsinki", country: "Finland", code: "FI", tz: "Europe/Helsinki", reach: 12000 },
  { name: "Copenhagen", country: "Denmark", code: "DK", tz: "Europe/Copenhagen", reach: 13000 },
  { name: "Warsaw", country: "Poland", code: "PL", tz: "Europe/Warsaw", reach: 16000 },
  { name: "Budapest", country: "Hungary", code: "HU", tz: "Europe/Budapest", reach: 14000 },
  { name: "Bucharest", country: "Romania", code: "RO", tz: "Europe/Bucharest", reach: 14000 },
  { name: "Belgrade", country: "Serbia", code: "RS", tz: "Europe/Belgrade", reach: 12000 },
  { name: "Kyiv", country: "Ukraine", code: "UA", tz: "Europe/Kyiv", reach: 16000 },
  { name: "Moscow", country: "Russia", code: "RU", tz: "Europe/Moscow", reach: 26000 },
  { name: "New York", country: "United States", code: "US", tz: "America/New_York", reach: 34000 },
  { name: "Los Angeles", country: "United States", code: "US", tz: "America/Los_Angeles", reach: 30000 },
  { name: "Chicago", country: "United States", code: "US", tz: "America/Chicago", reach: 22000 },
  { name: "Buenos Aires", country: "Argentina", code: "AR", tz: "America/Argentina/Buenos_Aires", reach: 20000 },
  { name: "Mexico City", country: "Mexico", code: "MX", tz: "America/Mexico_City", reach: 24000 },
  { name: "Tokyo", country: "Japan", code: "JP", tz: "Asia/Tokyo", reach: 30000 },
  { name: "Jakarta", country: "Indonesia", code: "ID", tz: "Asia/Jakarta", reach: 20000 },
  { name: "Manila", country: "Philippines", code: "PH", tz: "Asia/Manila", reach: 18000 },
  { name: "Johannesburg", country: "South Africa", code: "ZA", tz: "Africa/Johannesburg", reach: 16000 },
  { name: "Sydney", country: "Australia", code: "AU", tz: "Australia/Sydney", reach: 20000 },
];

// Generic, original district names applied to every city.
const DISTRICTS = ["City Centre", "Old Town", "Harbourside", "Uptown"] as const;

/** Standard venue template applied to every city (names are generic per city). */
function venueTemplate(city: string): Array<{ name: string; type: LocaleType; capacity: number; quality?: number }> {
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
    // Faz U2 civic & travel set
    { name: `${city} City Hall`, type: LocaleType.CITY_HALL, capacity: 0, quality: 60 },
    { name: `${city} Courthouse`, type: LocaleType.COURTHOUSE, capacity: 0, quality: 55 },
    { name: `${city} Penitentiary`, type: LocaleType.PRISON, capacity: 0, quality: 30 },
    { name: `${city} Sanctuary`, type: LocaleType.TEMPLE, capacity: 0, quality: 65 },
    { name: `${city} International Airport`, type: LocaleType.AIRPORT, capacity: 0, quality: 60 },
    { name: `${city} Ring Road`, type: LocaleType.HIGHWAY, capacity: 0, quality: 40 },
    { name: `${city} Grand Hotel`, type: LocaleType.HOTEL, capacity: 0, quality: 70 },
    { name: `${city} Gym`, type: LocaleType.GYM, capacity: 0, quality: 55 },
    { name: `${city} Lost & Found`, type: LocaleType.LOST_AND_FOUND, capacity: 0, quality: 45 },
    { name: `${city} Savings Bank`, type: LocaleType.BANK, capacity: 0, quality: 65 },
    { name: `${city} Sound Studio`, type: LocaleType.STUDIO, capacity: 0, quality: 60 },
  ];
}

async function seedCity(
  countryId: string,
  city: { name: string; reach: number; tz?: string },
  skillByName: Map<string, string>,
): Promise<number> {
  const rec = await prisma.city.upsert({
    where: { name_countryId: { name: city.name, countryId } },
    update: { timezone: city.tz ?? "UTC" },
    create: { name: city.name, countryId, reach: city.reach, timezone: city.tz ?? "UTC" },
  });

  // Districts (generic names, shared template).
  const districtIds: string[] = [];
  for (const d of DISTRICTS) {
    const dist = await prisma.district.upsert({
      where: { cityId_name: { cityId: rec.id, name: d } },
      update: {},
      create: { cityId: rec.id, name: d },
    });
    districtIds.push(dist.id);
  }

  const localeByName = new Map<string, string>();
  const venues = venueTemplate(city.name);
  for (let i = 0; i < venues.length; i++) {
    const l = venues[i];
    const districtId = districtIds[i % districtIds.length];
    const existing = await prisma.locale.findFirst({ where: { name: l.name, cityId: rec.id } });
    const loc = existing
      ? await prisma.locale.update({
          where: { id: existing.id },
          data: { districtId, quality: l.quality ?? 50 },
        })
      : await prisma.locale.create({
          data: {
            name: l.name,
            type: l.type,
            cityId: rec.id,
            capacity: l.capacity,
            districtId,
            quality: l.quality ?? 50,
          },
        });
    localeByName.set(l.type, loc.id);
  }

  const jobDefs = [
    { title: "Bartender", type: LocaleType.BAR, salary: 220 },
    { title: "Waiter", type: LocaleType.RESTAURANT, salary: 200 },
    { title: "PR Assistant", type: LocaleType.RECORD_LABEL, salary: 280 },
    { title: "Roadie", type: LocaleType.CLUB, salary: 240 },
    { title: "Receptionist", type: LocaleType.HOTEL, salary: 230 },
    { title: "Trainer", type: LocaleType.GYM, salary: 250 },
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
  const country = await prisma.country.upsert({
    where: { code: "FWL" },
    update: {},
    create: { name: "Fameworld", code: "FWL" },
  });

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

  let venues = 0;
  for (const city of CITIES) {
    venues += await seedCity(country.id, city, skillByName);
  }

  // Real-world cities, grouped under their own countries (Faz U2).
  const countryIdByCode = new Map<string, string>();
  for (const wc of WORLD_CITIES) {
    let countryId = countryIdByCode.get(wc.code);
    if (!countryId) {
      const c = await prisma.country.upsert({
        where: { code: wc.code },
        update: {},
        create: { name: wc.country, code: wc.code },
      });
      countryId = c.id;
      countryIdByCode.set(wc.code, countryId);
    }
    venues += await seedCity(countryId, { name: wc.name, reach: wc.reach, tz: wc.tz }, skillByName);
  }

  console.log(
    `Seeded ${CITIES.length + WORLD_CITIES.length} cities, ${venues} venues, ${SKILLS.length} skills, ${bookDefs.length} books.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
