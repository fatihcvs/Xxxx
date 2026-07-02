-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LocaleType" ADD VALUE 'CITY_HALL';
ALTER TYPE "LocaleType" ADD VALUE 'COURTHOUSE';
ALTER TYPE "LocaleType" ADD VALUE 'PRISON';
ALTER TYPE "LocaleType" ADD VALUE 'TEMPLE';
ALTER TYPE "LocaleType" ADD VALUE 'AIRPORT';
ALTER TYPE "LocaleType" ADD VALUE 'HIGHWAY';
ALTER TYPE "LocaleType" ADD VALUE 'HOTEL';
ALTER TYPE "LocaleType" ADD VALUE 'GYM';
ALTER TYPE "LocaleType" ADD VALUE 'LOST_AND_FOUND';
ALTER TYPE "LocaleType" ADD VALUE 'BANK';
ALTER TYPE "LocaleType" ADD VALUE 'STUDIO';

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "mayorNote" TEXT;

-- AlterTable
ALTER TABLE "Locale" ADD COLUMN     "cash" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "districtId" TEXT,
ADD COLUMN     "managerNote" TEXT,
ADD COLUMN     "quality" INTEGER NOT NULL DEFAULT 50;

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lottery" (
    "id" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "numbers" TEXT NOT NULL,

    CONSTRAINT "Lottery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotteryTicket" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "weekIndex" INTEGER NOT NULL,
    "numbers" TEXT NOT NULL,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "prize" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "LotteryTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "District_cityId_name_key" ON "District"("cityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Lottery_cityId_weekIndex_key" ON "Lottery"("cityId", "weekIndex");

-- CreateIndex
CREATE INDEX "LotteryTicket_resolved_weekIndex_idx" ON "LotteryTicket"("resolved", "weekIndex");

-- CreateIndex
CREATE UNIQUE INDEX "LotteryTicket_characterId_cityId_weekIndex_key" ON "LotteryTicket"("characterId", "cityId", "weekIndex");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Locale" ADD CONSTRAINT "Locale_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lottery" ADD CONSTRAINT "Lottery_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryTicket" ADD CONSTRAINT "LotteryTicket_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotteryTicket" ADD CONSTRAINT "LotteryTicket_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

