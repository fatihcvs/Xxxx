-- CreateEnum
CREATE TYPE "ReleaseType" AS ENUM ('SINGLE', 'ALBUM');

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "bandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ReleaseType" NOT NULL,
    "releasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSalesGameAt" TIMESTAMP(3) NOT NULL,
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "chartScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseTrack" (
    "id" TEXT NOT NULL,
    "releaseId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "ReleaseTrack_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Release_active_idx" ON "Release"("active");

-- CreateIndex
CREATE INDEX "Release_chartScore_idx" ON "Release"("chartScore");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseTrack_releaseId_songId_key" ON "ReleaseTrack"("releaseId", "songId");

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_bandId_fkey" FOREIGN KEY ("bandId") REFERENCES "Band"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseTrack" ADD CONSTRAINT "ReleaseTrack_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
