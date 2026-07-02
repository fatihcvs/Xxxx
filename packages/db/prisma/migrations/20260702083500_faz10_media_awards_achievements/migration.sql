-- CreateEnum
CREATE TYPE "NewsKind" AS ENUM ('INTERVIEW', 'GOSSIP', 'AWARD');

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "lastGossipGameAt" TIMESTAMP(3),
ADD COLUMN     "lastInterviewGameAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "kind" "NewsKind" NOT NULL,
    "headline" TEXT NOT NULL,
    "body" TEXT,
    "cityId" TEXT,
    "bandId" TEXT,
    "characterId" TEXT,
    "publishedAtGame" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PrAgent" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "weeklyFee" INTEGER NOT NULL DEFAULT 300,
    "hiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastPaidGameAt" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PrAgent_pkey" PRIMARY KEY ("id")
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
    "awardShowId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "bandId" TEXT,
    "characterId" TEXT,
    "releaseId" TEXT,
    "recipientName" TEXT NOT NULL,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FanClub" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "members" INTEGER NOT NULL DEFAULT 0,
    "foundedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastGrowthGameAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FanClub_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
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

-- CreateIndex
CREATE INDEX "NewsArticle_publishedAtGame_idx" ON "NewsArticle"("publishedAtGame");

-- CreateIndex
CREATE INDEX "NewsArticle_cityId_idx" ON "NewsArticle"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "PrAgent_characterId_key" ON "PrAgent"("characterId");

-- CreateIndex
CREATE INDEX "PrAgent_active_idx" ON "PrAgent"("active");

-- CreateIndex
CREATE UNIQUE INDEX "AwardShow_gameYear_key" ON "AwardShow"("gameYear");

-- CreateIndex
CREATE UNIQUE INDEX "Award_awardShowId_category_key" ON "Award"("awardShowId", "category");

-- CreateIndex
CREATE UNIQUE INDEX "FanClub_bandId_key" ON "FanClub"("bandId");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_code_key" ON "Achievement"("code");

-- CreateIndex
CREATE UNIQUE INDEX "CharacterAchievement_characterId_achievementId_key" ON "CharacterAchievement"("characterId", "achievementId");

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PrAgent" ADD CONSTRAINT "PrAgent_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_awardShowId_fkey" FOREIGN KEY ("awardShowId") REFERENCES "AwardShow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanClub" ADD CONSTRAINT "FanClub_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAchievement" ADD CONSTRAINT "CharacterAchievement_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharacterAchievement" ADD CONSTRAINT "CharacterAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

