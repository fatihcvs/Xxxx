-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "maxTeachLevel" INTEGER NOT NULL DEFAULT 5;

-- AlterTable
ALTER TABLE "Employment" ADD COLUMN     "lastPaidGameAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OwnedBook" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "acquiredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OwnedBook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "localeId" TEXT NOT NULL,
    "skillId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fee" INTEGER NOT NULL DEFAULT 300,
    "maxTeachLevel" INTEGER NOT NULL DEFAULT 10,
    "speedFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.6,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RentContract" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "localeId" TEXT NOT NULL,
    "weeklyRent" INTEGER NOT NULL,
    "lastPaidGameAt" TIMESTAMP(3) NOT NULL,
    "missedWeeks" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RentContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OwnedBook_characterId_bookId_key" ON "OwnedBook"("characterId", "bookId");

-- CreateIndex
CREATE INDEX "RentContract_active_idx" ON "RentContract"("active");

-- AddForeignKey
ALTER TABLE "OwnedBook" ADD CONSTRAINT "OwnedBook_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OwnedBook" ADD CONSTRAINT "OwnedBook_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_localeId_fkey" FOREIGN KEY ("localeId") REFERENCES "Locale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentContract" ADD CONSTRAINT "RentContract_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentContract" ADD CONSTRAINT "RentContract_localeId_fkey" FOREIGN KEY ("localeId") REFERENCES "Locale"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
