/**
 * Seed the starter world: one country + city, a set of venues, the skill and
 * genre catalogue, a few books and jobs. All content is original.
 */
import { PrismaClient, LocaleType } from "@prisma/client";

const prisma = new PrismaClient();

const SKILLS: Array<{ name: string; category: string }> = [
  // creative
  { name: "Basic Composing", category: "creative" },
  { name: "Basic Lyrics", category: "creative" },
  { name: "Basic Showmanship", category: "creative" },
  { name: "Dancing", category: "creative" },
  // instruments
  { name: "Guitar", category: "instrument" },
  { name: "Bass", category: "instrument" },
  { name: "Drums", category: "instrument" },
  { name: "Keyboards", category: "instrument" },
  { name: "Singing", category: "instrument" },
  // genres
  { name: "Rock", category: "genre" },
  { name: "Pop", category: "genre" },
  { name: "Electronic", category: "genre" },
  { name: "Jazz", category: "genre" },
  // other
  { name: "Basic Media Manipulation", category: "media" },
  { name: "Basic Business", category: "business" },
];

const GENRES = ["Rock", "Pop", "Electronic", "Jazz"];

async function main() {
  const country = await prisma.country.upsert({
    where: { code: "FWL" },
    update: {},
    create: { name: "Fameworld", code: "FWL" },
  });

  const city = await prisma.city.upsert({
    where: { name_countryId: { name: "Startown", countryId: country.id } },
    update: {},
    create: { name: "Startown", countryId: country.id, reach: 8000, timezone: "UTC" },
  });

  const locales: Array<{ name: string; type: LocaleType; capacity: number }> = [
    { name: "The Basement Club", type: LocaleType.CLUB, capacity: 150 },
    { name: "Startown Records", type: LocaleType.RECORD_LABEL, capacity: 0 },
    { name: "Startown University", type: LocaleType.UNIVERSITY, capacity: 0 },
    { name: "Central Hospital", type: LocaleType.HOSPITAL, capacity: 0 },
    { name: "Corner Bookshop", type: LocaleType.SHOP, capacity: 0 },
    { name: "Rusty Anchor Bar", type: LocaleType.BAR, capacity: 0 },
    { name: "Mama Rosa's", type: LocaleType.RESTAURANT, capacity: 0 },
    { name: "Riverside Apartments", type: LocaleType.APARTMENT, capacity: 0 },
    { name: "Startown Arena", type: LocaleType.STADIUM, capacity: 5000 },
    { name: "City Park", type: LocaleType.PARK, capacity: 0 },
  ];

  const localeByName = new Map<string, string>();
  for (const l of locales) {
    const existing = await prisma.locale.findFirst({
      where: { name: l.name, cityId: city.id },
    });
    const rec =
      existing ??
      (await prisma.locale.create({
        data: { name: l.name, type: l.type, cityId: city.id, capacity: l.capacity },
      }));
    localeByName.set(l.name, rec.id);
  }

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

  // Books available at the bookshop (idempotent by title).
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

  // Entry-level jobs at a few venues.
  const jobDefs = [
    { title: "Bartender", locale: "Rusty Anchor Bar", salary: 220 },
    { title: "Waiter", locale: "Mama Rosa's", salary: 200 },
    { title: "PR Assistant", locale: "Startown Records", salary: 280 },
    { title: "Roadie", locale: "The Basement Club", salary: 240 },
  ];
  for (const j of jobDefs) {
    const localeId = localeByName.get(j.locale)!;
    const exists = await prisma.job.findFirst({ where: { title: j.title, localeId } });
    if (!exists) {
      await prisma.job.create({ data: { title: j.title, localeId, salary: j.salary } });
    }
  }

  // University courses (faster/pricier than self-study from books).
  const universityId = localeByName.get("Startown University")!;
  const courseDefs = [
    { title: "Music Theory 101", skill: "Basic Composing", fee: 300, maxTeachLevel: 10, speedFactor: 0.6 },
    { title: "Songwriting Workshop", skill: "Basic Lyrics", fee: 300, maxTeachLevel: 10, speedFactor: 0.6 },
    { title: "Business Studies", skill: "Basic Business", fee: 350, maxTeachLevel: 10, speedFactor: 0.55 },
  ];
  for (const c of courseDefs) {
    const exists = await prisma.course.findFirst({
      where: { title: c.title, localeId: universityId },
    });
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

  console.log(
    `Seeded ${country.name} / ${city.name} with ${locales.length} venues, ${SKILLS.length} skills, ${courseDefs.length} courses.`,
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
