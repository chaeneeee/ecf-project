/*
  Warnings:

  - You are about to drop the `searchQuery` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "searchQuery";

-- CreateTable
CREATE TABLE "GuestSearchQuery" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GuestSearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" SERIAL NOT NULL,
    "keyword" TEXT NOT NULL,
    "userId" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "region" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);
