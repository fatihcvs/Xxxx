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

const CITIES: Array<{ name: string; reach: number }> = [
  { name: "Startown", reach: 8000 },
  { name: "Rivergate", reach: 12000 },
  { name: "Sunport", reach: 16000 },
  { name: "Old Harbor", reach: 6000 },
];

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
  ];
}

async function seedCity(
  countryId: string,
  city: { name: string; reach: number },
  skillByName: Map<string, string>,
): Promise<number> {
  const rec = await prisma.city.upsert({
    where: { name_countryId: { name: city.name, countryId } },
    update: {},
    create: { name: city.name, countryId, reach: city.reach, timezone: "UTC" },
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

  console.log(
    `Seeded ${country.name}: ${CITIES.length} cities, ${venues} venues, ${SKILLS.length} skills, ${bookDefs.length} books.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
