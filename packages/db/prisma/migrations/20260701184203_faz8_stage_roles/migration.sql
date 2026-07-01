-- CreateEnum
CREATE TYPE "StageRoleSlot" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateTable
CREATE TABLE "CharacterStageRole" (
    "id" TEXT NOT NULL,
    "characterId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "slot" "StageRoleSlot" NOT NULL,

    CONSTRAINT "CharacterStageRole_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CharacterStageRole_characterId_slot_key" ON "CharacterStageRole"("characterId", "slot");

-- AddForeignKey
ALTER TABLE "CharacterStageRole" ADD CONSTRAINT "CharacterStageRole_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
