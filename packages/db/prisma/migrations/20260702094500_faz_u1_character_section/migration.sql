-- AlterTable
ALTER TABLE "Character" ADD COLUMN     "attitude" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "careerFocus" TEXT,
ADD COLUMN     "dp" INTEGER NOT NULL DEFAULT 10,
ADD COLUMN     "freeTimeFocus" TEXT,
ADD COLUMN     "lastDpGrantGameAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "params" JSONB,
    "createdAtGame" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LocaleVisit" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "localeId" TEXT NOT NULL,
    "visitedAtGame" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LocaleVisit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "lastInterestGameAt" TIMESTAMP(3) NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiaryEntry_characterId_createdAtGame_idx" ON "DiaryEntry"("characterId", "createdAtGame");

-- CreateIndex
CREATE INDEX "LocaleVisit_characterId_visitedAtGame_idx" ON "LocaleVisit"("characterId", "visitedAtGame");

-- CreateIndex
CREATE UNIQUE INDEX "BankAccount_characterId_key" ON "BankAccount"("characterId");

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LocaleVisit" ADD CONSTRAINT "LocaleVisit_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;

