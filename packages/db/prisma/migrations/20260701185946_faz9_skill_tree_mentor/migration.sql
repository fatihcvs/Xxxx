-- AlterTable
ALTER TABLE "LearningTask" ADD COLUMN     "masterId" TEXT;

-- AlterTable
ALTER TABLE "Skill" ADD COLUMN     "prereqSkillId" TEXT,
ADD COLUMN     "tier" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "Skill_category_tier_idx" ON "Skill"("category", "tier");

-- AddForeignKey
ALTER TABLE "Skill" ADD CONSTRAINT "Skill_prereqSkillId_fkey" FOREIGN KEY ("prereqSkillId") REFERENCES "Skill"("id") ON DELETE SET NULL ON UPDATE CASCADE;
