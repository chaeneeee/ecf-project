/*
  Warnings:

  - You are about to drop the `keywordRanking` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "keywordRanking";

-- CreateTable
CREATE TABLE "KeywordRanking" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeywordRanking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KeywordRanking_keyword_key" ON "KeywordRanking"("keyword");
