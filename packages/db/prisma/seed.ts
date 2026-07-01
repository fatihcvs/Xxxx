/**
 * Seed the starter world: a country with several cities, each with a standard
 * set of venues, jobs and university courses, plus the global skill/genre/book
 * catalogue. All content is original and generic.
 */
import { PrismaClient, LocaleType } from "@prisma/client";

const prisma = new PrismaClient();

const SKILLS: Array<{ name: string; category: string }> = [
  { name: "Basic Composing", category: "creative" },
  { name: "Basic Lyrics", category: "creative" },
  { name: "Basic Showmanship", category: "creative" },
  { name: "Dancing", category: "creative" },
  { name: "Guitar", category: "instrument" },
  { name: "Bass", category: "instrument" },
  { name: "Drums", category: "instrument" },
  { name: "Keyboards", category: "instrument" },
  { name: "Singing", category: "instrument" },
  { name: "Rock", category: "genre" },
  { name: "Pop", category: "genre" },
  { name: "Electronic", category: "genre" },
  { name: "Jazz", category: "genre" },
  { name: "Basic Media Manipulation", category: "media" },
  { name: "Basic Business", category: "business" },
];

const GENRES = ["Rock", "Pop", "Electronic", "Jazz"];

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

  const skillByName = new Map<string, string>();
  for (const s of SKILLS) {
    const rec = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category },
      create: { name: s.name, category: s.category },
    });
    skillByName.set(s.name, rec.id);
  }
  for (const g of GENRES) {
    await prisma.genre.upsert({ where: { name: g }, update: {}, create: { name: g } });
  }

  // Global book catalogue (shown at any city's bookshop).
  const bookDefs = [
    { title: "Composing for Beginners", skill: "Basic Composing", price: 120 },
    { title: "Writing Lyrics", skill: "Basic Lyrics", price: 120 },
    { title: "Owning the Stage", skill: "Basic Showmanship", price: 150 },
    { title: "Six Strings", skill: "Guitar", price: 100 },
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
