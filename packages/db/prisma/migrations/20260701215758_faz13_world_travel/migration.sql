-- AlterEnum
ALTER TYPE "LocaleType" ADD VALUE 'AIRPORT';

-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "travelArrivesAt" TIMESTAMP(3),
ADD COLUMN     "travelingToCityId" TEXT;

-- AlterTable
ALTER TABLE "City" ADD COLUMN     "lat" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "lon" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Character" ADD CONSTRAINT "Character_travelingToCityId_fkey" FOREIGN KEY ("travelingToCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
