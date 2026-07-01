-- CreateEnum
CREATE TYPE "NewsCategory" AS ENUM ('ELECTION', 'CHARTS', 'CONCERT', 'OBITUARY', 'PRESS_RELEASE', 'AWARDS');

-- CreateEnum
CREATE TYPE "AwardCategory" AS ENUM ('BAND_OF_THE_YEAR', 'ALBUM_OF_THE_YEAR', 'SONG_OF_THE_YEAR', 'ARTIST_OF_THE_YEAR');

-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "lastPressGameAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharacterAchievement" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "achievementId" TEXT NOT NULL,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CharacterAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "cityId" TEXT,
    "category" "NewsCategory" NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "refId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AwardShow" (
    "id" TEXT NOT NULL,
    "gameYear" INTEGER NOT NULL,
    "heldAtGame" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AwardShow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "showId" TEXT NOT NULL,
    "category" "AwardCategory" NOT NULL,
    "bandId" TEXT,
    "characterId" TEXT,
    "detail" TEXT,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE INDEX "CharacterAchievement_characterId_idx" ON "CharacterAchievement"("characterId");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAchievement_characterId_achievementId_key" ON "CharacterAchievement"("characterId", "achievementId");

-- CreateIndex
CREATE INDEX "NewsArticle_createdAt_idx" ON "NewsArticle"("createdAt");

-- CreateIndex
CREATE INDEX "NewsArticle_cityId_createdAt_idx" ON "NewsArticle"("cityId", "createdAt");

-- CreateIndex
CREATE INDEX "NewsArticle_category_createdAt_idx" ON "NewsArticle"("category", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AwardShow_gameYear_key" ON "AwardShow"("gameYear");

-- CreateIndex
CREATE UNIQUE INDEX "Award_showId_category_key" ON "Award"("showId", "category");

-- AddForeignKey
ALTER TABLE "CharacterAchievement" ADD CONSTRAINT "CharacterAchievement_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAchievement" ADD CONSTRAINT "CharacterAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_showId_fkey" FOREIGN KEY ("showId") REFERENCES "AwardShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;
