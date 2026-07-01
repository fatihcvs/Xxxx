-- AlterTable
ALTER TABLE "Band" ADD COLUMN     "lastFameDecayGameAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "hasVideo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "videoQuality" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "FanBase" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "fans" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FanBase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FanBase_cityId_idx" ON "FanBase"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "FanBase_bandId_cityId_key" ON "FanBase"("bandId", "cityId");

-- AddForeignKey
ALTER TABLE "FanBase" ADD CONSTRAINT "FanBase_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FanBase" ADD CONSTRAINT "FanBase_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
